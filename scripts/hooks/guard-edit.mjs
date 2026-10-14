// Hook Devin PreToolUse(write|edit|apply_patch) — protège les secrets, les
// garde-fous et l'obligation « concept avant code ».
// Sortie code 2 = action bloquée, `reason` remontée à l'agent.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative } from "node:path";

import {
  conceptTextErrors,
  ETAPE_CHECKS,
  etapeErrors,
  isEtapeChecked,
  journalFileErrors,
  parseSections,
  reviewFileErrors,
} from "../lib/concept.mjs";
import { planPendingPath } from "../lib/diff.mjs";
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
  ti.file_path ??
    ti.path ??
    ti.notebook_path ??
    ti.target_file ??
    tinfo.file_path ??
    tinfo.path ??
    tinfo.notebook_path ??
    tinfo.target_file ??
    "",
);
const content = [
  ti.new_string,
  ti.new_str,
  ti.content,
  ti.new_source,
  ti.edits?.map((e) => e.new_text ?? e.new_string ?? e.new_str),
  tinfo.edits?.map((e) => e.new_string ?? e.new_text ?? e.new_str),
]
  .filter(Boolean)
  .join("\n");
const addedText = content || "";

const norm = target.replaceAll("\\", "/");
const base = norm.split("/").pop();
const baseLower = base.toLowerCase();

// Comparaison en minuscules : NTFS/APFS sont insensibles à la casse, donc
// « SRC/… », « .ENV.local » ou « Agents.md » doivent être bloqués aussi.
const protectedFiles = new Set([
  "agents.md",
  "agent.md",
  "claude.md",
  "global_rules.md",
  "eslint.config.mjs",
  "prettier.config.mjs",
  ".prettierrc",
  ".prettierignore",
  "tsconfig.json",
  "vitest.config.mts",
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
const relPath = (inProject ? relFromCwd : normNoDrive).toLowerCase();

// Zéro tolérance : l'agent n'écrit QUE dans le dossier du projet (pas dans le
// dossier utilisateur, la config de l'IDE, un dossier temporaire…).
// Un outil d'écriture reconnu sans fichier cible identifiable = payload non
// compris → on refuse par prudence (fail-closed) plutôt que laisser passer.
if (!target) {
  block(
    "Outil d'écriture sans fichier cible identifiable : action refusée par prudence. Utilise l'outil d'édition du projet avec un chemin de fichier.",
  );
}
if (!inProject) {
  block(
    "L'agent n'écrit que dans le dossier du projet : écrire ailleurs (dossier utilisateur, réglages de l'IDE, fichiers temporaires…) est interdit.",
  );
}

const isProtected =
  protectedFiles.has(baseLower) ||
  protectedFiles.has(relPath) ||
  /^(package|vercel)\.json$/.test(relPath) ||
  /^\.vercelignore$/.test(relPath) ||
  /^(scripts|\.check|\.github|\.devin|\.husky|\.git|node_modules)\//.test(
    relPath,
  );

if (isProtected) {
  block(
    "Ce fichier fait partie des garde-fous du cours (qualité, hooks, CI, agents) : sa modification est réservée à l'enseignant. Si une règle bloque un besoin légitime, explique-le dans ta réponse et propose le changement souhaité.",
  );
}

// Fichiers de secrets : jamais écrits par l'agent (l'étudiant les édite lui-même).
if (/^\.env(\.|$)/.test(baseLower) && baseLower !== ".env.example") {
  block(
    "Interdit : l'agent ne peut pas écrire les fichiers `.env*` de secrets. Demande à l'étudiant de créer/éditer `.env.local` lui-même (`pnpm env:init` pour la création), ou utilise `vercel env add` pour la production.",
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

// CONCEPT — verrou À L'ÉCRITURE : on simule MVP.md APRÈS la modification.
//   - une case « Étape N » (1-11) ne peut être cochée que si sa section est
//     remplie ET challengée (« > Challenge : » présent) ;
//   - « Statut : validé » n'entre que si TOUT est complet : sections,
//     challenges, étapes cochées, compteur 12/12 et revues « validé ».
if (/^\.concept\/MVP\.md$/i.test(relPath)) {
  // Reconstitue le texte du fichier après l'écriture demandée (write = contenu
  // complet ; edit = remplacements old→new). null = reconstitution impossible
  // → on laisse passer (les autres verrous restent actifs).
  const resultingText = (before) => {
    if (typeof ti.content === "string") return ti.content;
    const ops = [];
    const oi = ti.old_string ?? ti.old_str;
    const ni = ti.new_string ?? ti.new_str;
    if (typeof oi === "string" && typeof ni === "string") {
      ops.push([oi, ni]);
    }
    for (const e of [
      ...(Array.isArray(ti.edits) ? ti.edits : []),
      ...(Array.isArray(tinfo.edits) ? tinfo.edits : []),
    ]) {
      const o = e?.old_string ?? e?.old_text ?? e?.old_str;
      const n = e?.new_string ?? e?.new_text ?? e?.new_str;
      if (typeof o === "string" && typeof n === "string") ops.push([o, n]);
    }
    if (ops.length === 0) return null;
    let text = before;
    for (const [o, n] of ops) {
      if (!text.includes(o)) return null;
      text = text.replace(o, () => n);
    }
    return text;
  };

  const before = existsSync(target) ? readFileSync(target, "utf8") : "";
  const after = resultingText(before);
  // Reconstitution impossible (forme d'édition non reconnue) : on refuse
  // quand même tout contenu qui cocherait une étape ou poserait le statut —
  // sinon une forme exotique contournerait le verrou.
  if (
    after === null &&
    (/statut\s*:\s*validé/i.test(addedText) ||
      /-\s*\[[xX]\]\s*Étape\s+\d/i.test(addedText))
  ) {
    block(
      "Écriture de .concept/MVP.md sous une forme non vérifiable : refusée par prudence. Utilise l'outil d'édition standard.",
    );
  }
  if (after !== null) {
    const errors = [];
    const sections = parseSections(after);

    // « Statut : validé » = porte finale : TOUT doit être complet.
    if (/^\s*>?\s*statut\s*:\s*validé/im.test(after)) {
      const full = conceptTextErrors(after, { skipStatut: true }).concat(
        reviewFileErrors(),
        journalFileErrors(),
      );
      if (full.length > 0) {
        errors.push(
          `« Statut : validé » refusé — le concept est incomplet :\n${full
            .map((e) => `  - ${e}`)
            .join("\n")}`,
        );
      }
    }

    // Chaque case cochée doit être adossée à sa section remplie (y compris
    // l'étape 12, qui exige la reformulation de l'étudiant — test Feynman).
    for (const etape of ETAPE_CHECKS) {
      if (isEtapeChecked(sections, etape.etape)) {
        const errs = etapeErrors(sections, etape);
        if (errs.length > 0) {
          errors.push(
            `Case « ${etape.etape} » cochée sans contenu suffisant : ${errs.join(
              " ; ",
            )}. Remplis la section avec l'étudiant AVANT de cocher.`,
          );
        }
      }
    }

    if (errors.length > 0) block(errors.join("\n"));
  }
}

// LIVRAISON (7) : une fusion a eu lieu mais la production n'a pas été
// vérifiée → on ne reprend pas le développement avant `pnpm prod:check`.
if (/^(src|public)\//.test(relPath) && existsSync(prodPendingMarker())) {
  block(
    "La dernière livraison n'a pas été vérifiée en production. Lance `pnpm prod:check` avant de reprendre le développement.",
  );
}

// PORTE DU PLAN : à chaque message de l'étudiant, un marqueur est armé par le
// hook UserPromptSubmit. Tant qu'il existe, aucune écriture dans src/ ni
// public/ — l'agent doit d'abord énoncer ce qu'il va faire (ou les questions
// à poser) via `pnpm plan:ack "…"`. Discipline « réfléchir avant de coder »,
// vérifiée mécaniquement plutôt que laissée à la bonne volonté.
if (/^(src|public)\//.test(relPath) && existsSync(planPendingPath())) {
  block(
    'Porte du plan : avant de toucher au code, énonce en une phrase ce que tu vas faire — ou les questions à poser à l\'étudiant — via `pnpm plan:ack "<plan, ≥20 caractères>"`. Écrire sans plan ni question est refusé.',
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
      "Verrou « concept avant code » : le concept MVP n'est pas encore validé dans .concept/MVP.md, donc l'écriture de code applicatif (src/ et public/) est bloquée. Lance immédiatement le skill /concept avec l'étudiant : une interview guidée en français simple, UNE question à la fois, qui remplit .concept/MVP.md (pitch, problème, utilisateurs, parcours, périmètre, écrans, données & IA, critères de succès, risques). Ne code rien avant qu'il soit validé. Vérifie ensuite avec `pnpm concept:check`.",
    );
  }
}

// Suppressions de diagnostics interdites.
const suppression =
  /\/\/\s*eslint-disable|\/\*\s*eslint-disable|\/\/\s*@ts-(ignore|nocheck|expect-error)\b|\/\*\s*@ts-(ignore|nocheck|expect-error)/;
// Options qui désactivent un contrôle (build sans types/lint, env non validé).
// La regex est écrite en groupes non capturants : écrire les noms des options
// en toutes lettres ici déclencherait ce même hook sur le contenu.
if (
  /ignore(?:BuildErrors|DuringBuilds)|skip(?:Validation)|SKIP_ENV(?:_VALIDATION)/.test(
    addedText,
  )
) {
  block(
    `Désactiver un contrôle (ignoreBuild${"Errors"}, ignoreDuring${"Builds"}, skip${"Validation"}, SKIP_ENV_${"VALIDATION"}) est interdit : corrige la cause de l'erreur.`,
  );
}

if (suppression.test(addedText)) {
  block(
    "Désactiver un diagnostic (eslint-disable, @ts-ignore, @ts-expect-error) est interdit : corrige la cause. Si une exception est vraiment justifiée, explique-la à l'étudiant et laisse l'enseignant décider.",
  );
}

process.exit(0);
