// Hook Devin PreToolUse(write|edit|apply_patch) — protège les secrets, les
// garde-fous et l'obligation « concept avant code ».
// Sortie code 2 = action bloquée, `reason` remontée à l'agent.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative } from "node:path";

import {
  devMissing,
  loginsMissing,
  prodPendingMarker,
} from "../lib/readiness.mjs";

let input = "";
try {
  input = readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let payload = {};
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

// Bypass enseignant uniquement.
if (process.env.IHECS_TEACHER_BYPASS === "true") process.exit(0);

// Deux runtimes servis : Devin CLI (payload `tool_input`, blocage JSON) et
// Cascade/Windsurf (payload `tool_info`, blocage via stderr + exit 2).
const isCascade = typeof payload.agent_action_name === "string";

const block = (reason) => {
  if (isCascade) console.error(reason);
  else console.log(JSON.stringify({ decision: "block", reason }));
  process.exit(2);
};

const ti = payload.tool_input ?? {};
const tinfo = payload.tool_info ?? {};
const target = String(
  ti.file_path ?? ti.path ?? ti.notebook_path ?? tinfo.file_path ?? "",
);
const content = [
  ti.new_string,
  ti.content,
  ti.new_source,
  ti.edits?.map((e) => e.new_text),
  tinfo.edits?.map((e) => e.new_string),
]
  .filter(Boolean)
  .join("\n");
const addedText = content || "";

const norm = target.replaceAll("\\", "/");
const base = norm.split("/").pop();

const protectedFiles = new Set([
  "AGENTS.md",
  "AGENT.md",
  "CLAUDE.md",
  "global_rules.md",
  "eslint.config.mjs",
  "prettier.config.mjs",
  ".prettierrc",
  ".prettierignore",
  "tsconfig.json",
  "knip.json",
  "lint-staged.config.mjs",
  "commitlint.config.mjs",
  "pnpm-workspace.yaml",
  "pnpm-lock.yaml",
  ".npmrc",
  ".nvmrc",
  ".editorconfig",
  ".gitignore",
  ".gitattributes",
  ".husky/commit-msg",
  ".husky/pre-commit",
  ".husky/pre-push",
  "guard-edit.mjs",
  "guard-exec.mjs",
  "hooks.v1.json",
  "hooks.json",
]);

// Les outils envoient des chemins ABSOLUS : les règles portant sur des
// dossiers (scripts/, .check/, .devin/, src/…) s'appliquent au chemin RELATIF
// à la racine du projet (les hooks s'exécutent depuis cette racine).
const relFromCwd = relative(process.cwd(), target).replaceAll("\\", "/");
const inProject =
  relFromCwd !== "" && !relFromCwd.startsWith("..") && !isAbsolute(relFromCwd);
const normNoDrive = norm.replace(/^[A-Za-z]:\//, "");
const relPath = inProject ? relFromCwd : normNoDrive;

// Zéro tolérance : l'agent n'écrit QUE dans le projet (pas dans le dossier
// utilisateur, la config de l'IDE, un dossier temporaire…).
if (target && !inProject) {
  block(
    "L'agent n'écrit que dans le dossier du projet : écrire ailleurs (dossier utilisateur, réglages de l'IDE, fichiers temporaires…) est interdit.",
  );
}

const isProtected =
  protectedFiles.has(base) ||
  protectedFiles.has(relPath) ||
  /^(package|vercel)\.json$/.test(relPath) ||
  /^\.vercelignore$/.test(relPath) ||
  /^(scripts|\.check|\.github|\.devin|\.husky|\.git|node_modules)\//.test(
    relPath,
  );

if (isProtected) {
  block(
    "Ce fichier fait partie des garde-fous du cours (qualité, hooks, CI, agents) : sa modification est réservée à l'enseignant. Si une règle bloque un besoin légitime, expliquez-le dans votre réponse et proposez le changement souhaité.",
  );
}

// Fichiers de secrets : jamais écrits par l'agent (l'étudiant les édite lui-même).
if (/^\.env(\.|$)/.test(base) && base !== ".env.example") {
  block(
    "Interdit : l'agent ne peut pas écrire les fichiers `.env*` de secrets. Demandez à l'étudiant de créer/éditer `.env.local` lui-même, ou utilisez `vercel env add`.",
  );
}

// ORDRE DES ÉTAPES (2-3) : pas de concept ni de code tant que le poste n'est
// pas prêt (Node ≥ 24, dépendances installées, .env.local).
if (/^(src|public|\.concept)\//.test(relPath)) {
  const missing = devMissing();
  if (missing.length > 0) {
    block(
      `Étape d'installation pas terminée : il manque ${missing.join(", ")}. Lance d'abord le skill /install-tools, puis vérifie avec \`pnpm diagnostic\`.`,
    );
  }
}

// ORDRE DES ÉTAPES (3→4) : comptes GitHub et Vercel connectés avant
// l'idéation — l'installation ne s'arrête pas aux dépendances, elle inclut
// les deux logins (personnels : lancés par l'étudiant lui-même).
if (/^\.concept\//.test(relPath)) {
  const missing = loginsMissing();
  if (missing.length > 0) {
    block(
      `Idéation du MVP verrouillée : il manque ${missing.join(" et ")}. Ce sont des connexions personnelles : c'est l'étudiant qui les lance dans son terminal. Revérifie ensuite avec \`pnpm diagnostic\`, puis lance le skill /concept.`,
    );
  }
}

// LIVRAISON (7) : une fusion a eu lieu mais la production n'a pas été
// vérifiée → on ne reprend pas le développement avant `pnpm prod:check`.
if (/^(src|public)\//.test(relPath) && existsSync(prodPendingMarker())) {
  block(
    "La dernière livraison n'a pas été vérifiée en production. Lance `pnpm prod:check` avant de reprendre le développement.",
  );
}

// CONCEPT AVANT CODE : aucune écriture dans src/** tant que le concept MVP
// n'est pas validé dans .concept/MVP.md. L'agent est mécaniquement renvoyé
// vers le skill /concept (interview guidée avec l'étudiant).
if (/^(src|public)\//.test(relPath)) {
  const concept = spawnSync(
    process.execPath,
    ["scripts/check-concept.mjs", "--quiet"],
    { encoding: "utf8", timeout: 10_000 },
  );
  if (concept.status !== 0) {
    block(
      "Verrou « concept avant code » : le concept MVP n'est pas encore validé dans .concept/MVP.md, donc l'écriture de code applicatif (src/) est bloquée. Lance immédiatement le skill /concept avec l'étudiant : une interview guidée en français simple, UNE question à la fois, qui remplit .concept/MVP.md (pitch, problème, utilisateurs, parcours, périmètre, écrans, données & IA, critères de succès, risques). Ne code rien avant qu'il soit validé. Vérifie ensuite avec `pnpm concept:check`.",
    );
  }
}

// Suppressions de diagnostics interdites.
const suppression =
  /\/\/\s*eslint-disable|\/\*\s*eslint-disable|\/\/\s*@ts-ignore|\/\/\s*@ts-nocheck|\/\/\s*@ts-expect-error\b/;
// Options qui désactivent un contrôle (build sans types/lint, env non validé).
if (
  /ignoreBuildErrors|ignoreDuringBuilds|skipValidation|SKIP_ENV_VALIDATION/.test(
    addedText,
  )
) {
  block(
    "Désactiver un contrôle (ignoreBuildErrors, ignoreDuringBuilds, skipValidation) est interdit : corrige la cause de l'erreur.",
  );
}

if (suppression.test(addedText)) {
  block(
    "Désactiver un diagnostic (eslint-disable, @ts-ignore, @ts-expect-error) est interdit : corrigez la cause. Une exception validée doit être documentée (`-- justification`) et validée par l'enseignant.",
  );
}

process.exit(0);
