// Hook Devin PreToolUse(write|edit|apply_patch) — protège les secrets, les
// garde-fous et l'obligation « concept avant code ».
// Sortie code 2 = action bloquée, `reason` remontée à l'agent.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

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

const ti = payload.tool_input ?? {};
const target = String(ti.file_path ?? ti.path ?? ti.notebook_path ?? "");
const content = [
  ti.new_string,
  ti.content,
  ti.new_source,
  ti.edits?.map((e) => e.new_text),
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
]);

const normNoDrive = norm.replace(/^[A-Za-z]:\//, "");
const isProtected =
  protectedFiles.has(base) ||
  protectedFiles.has(normNoDrive) ||
  /^scripts\//.test(normNoDrive) ||
  /\.github\/workflows\/[^/]+$/.test(normNoDrive) ||
  /^\.devin\/(agents|skills|mcp_config\.json|config\.json)\//.test(
    normNoDrive,
  ) ||
  /^\.devin\/(config\.json|mcp_config\.json|hooks\.v1\.json)$/.test(
    normNoDrive,
  );

if (isProtected) {
  console.log(
    JSON.stringify({
      decision: "block",
      reason:
        "Ce fichier fait partie des garde-fous du cours (qualité, hooks, CI, agents) : sa modification est réservée à l'enseignant. Si une règle bloque un besoin légitime, expliquez-le dans votre réponse et proposez le changement souhaité.",
    }),
  );
  process.exit(2);
}

// Fichiers de secrets : jamais écrits par l'agent (l'étudiant les édite lui-même).
if (/^\.env(\.|$)/.test(base) && base !== ".env.example") {
  console.log(
    JSON.stringify({
      decision: "block",
      reason:
        "Interdit : l'agent ne peut pas écrire les fichiers `.env*` de secrets. Demandez à l'étudiant de créer/éditer `.env.local` lui-même, ou utilisez `vercel env add`.",
    }),
  );
  process.exit(2);
}

// CONCEPT AVANT CODE : aucune écriture dans src/** tant que le concept MVP
// n'est pas validé dans .concept/MVP.md. L'agent est mécaniquement renvoyé
// vers le skill /concept (interview guidée avec l'étudiant).
if (/^src\//.test(normNoDrive)) {
  const concept = spawnSync(
    process.execPath,
    ["scripts/check-concept.mjs", "--quiet"],
    { encoding: "utf8", timeout: 10_000 },
  );
  if (concept.status !== 0) {
    console.log(
      JSON.stringify({
        decision: "block",
        reason:
          "Verrou « concept avant code » : le concept MVP n'est pas encore validé dans .concept/MVP.md, donc l'écriture de code applicatif (src/) est bloquée. Lance immédiatement le skill /concept avec l'étudiant : une interview guidée en français simple, UNE question à la fois, qui remplit .concept/MVP.md (pitch, problème, utilisateurs, parcours, périmètre, écrans, données & IA, critères de succès, risques). Ne code rien avant qu'il soit validé. Vérifie ensuite avec `pnpm concept:check`.",
      }),
    );
    process.exit(2);
  }
}

// Suppressions de diagnostics interdites.
const suppression =
  /\/\/\s*eslint-disable|\/\*\s*eslint-disable|\/\/\s*@ts-ignore|\/\/\s*@ts-nocheck|\/\/\s*@ts-expect-error\b/;
if (suppression.test(addedText)) {
  console.log(
    JSON.stringify({
      decision: "block",
      reason:
        "Désactiver un diagnostic (eslint-disable, @ts-ignore, @ts-expect-error) est interdit : corrigez la cause. Une exception validée doit être documentée (`-- justification`) et validée par l'enseignant.",
    }),
  );
  process.exit(2);
}

process.exit(0);
