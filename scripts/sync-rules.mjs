// Remet les fichiers de règles du cours dans leur version OFFICIELLE (template).
// Sert à réparer un échec de `pnpm rules:check` ou à recevoir une mise à jour
// des règles publiée par l'enseignant. N'écrit que des versions officielles.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

import {
  isTemplateRepo,
  PACKAGE_RULE_KEYS,
  RULE_DIRS,
  RULE_FILES,
  TEMPLATE_URL,
} from "./lib/template.mjs";

if (isTemplateRepo()) {
  console.log("Dépôt modèle : rien à synchroniser.");
  process.exit(0);
}

const git = (args) =>
  spawnSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

if (
  git(["fetch", "--depth=1", "--no-tags", TEMPLATE_URL, "main"]).status !== 0
) {
  console.error(
    "✗ Impossible de récupérer le template officiel (connexion internet ?).",
  );
  process.exit(1);
}

const paths = [...RULE_DIRS, ...RULE_FILES].filter(
  (p) => git(["cat-file", "-e", `FETCH_HEAD:${p}`]).status === 0,
);
// Les dossiers de règles sont remplacés entièrement (fichiers ajoutés
// supprimés) ; .husky/_ (généré par husky) est conservé.
for (const dir of RULE_DIRS) {
  if (dir !== ".husky" && existsSync(dir))
    rmSync(dir, { recursive: true, force: true });
}
const co = git(["checkout", "FETCH_HEAD", "--", ...paths]);
if (co.status !== 0) {
  console.error(`✗ Échec de la synchronisation :\n${co.stderr}`);
  process.exit(1);
}

// package.json : seules les clés de règles sont reprises, le reste est conservé.
const official = JSON.parse(
  String(git(["show", "FETCH_HEAD:package.json"]).stdout),
);
const mine = JSON.parse(readFileSync("package.json", "utf8"));
for (const k of PACKAGE_RULE_KEYS) mine[k] = official[k];
writeFileSync("package.json", `${JSON.stringify(mine, null, 2)}\n`);

console.log("✓ Règles du cours synchronisées avec le template officiel.");
console.log(
  '  Vérifie avec `pnpm rules:check`, puis enregistre : `git add -A` et `git commit -m "chore: synchronise les règles du cours"`.',
);
