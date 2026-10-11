// Remet les fichiers de règles du cours dans leur version OFFICIELLE (template).
// Sert à réparer un échec de `pnpm rules:check` ou à recevoir une mise à jour
// des règles publiée par l'enseignant. N'écrit que des versions officielles.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

import {
  fetchTemplateFiles,
  isTemplateRepo,
  PACKAGE_RULE_KEYS,
  RULE_DIRS,
  RULE_FILES,
} from "./lib/template.mjs";

if (isTemplateRepo()) {
  console.log("Dépôt modèle : rien à synchroniser.");
  process.exit(0);
}

const templateFiles = await fetchTemplateFiles();
if (!templateFiles) {
  console.error(
    "✗ Impossible de récupérer le template officiel (connexion internet ?).",
  );
  process.exit(1);
}

// Les dossiers de règles sont remplacés entièrement (fichiers ajoutés
// supprimés) ; .husky/_ (généré par husky) est conservé.
for (const dir of RULE_DIRS) {
  if (dir !== ".husky" && existsSync(dir))
    rmSync(dir, { recursive: true, force: true });
}
const official = [...templateFiles.entries()].filter(
  ([p]) =>
    RULE_DIRS.some((d) => p.startsWith(`${d}/`)) || RULE_FILES.includes(p),
);
for (const [p, content] of official) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

// package.json : seules les clés de règles sont reprises, le reste est conservé.
const officialPkg = JSON.parse(templateFiles.get("package.json") ?? "{}");
const mine = JSON.parse(readFileSync("package.json", "utf8"));
for (const k of PACKAGE_RULE_KEYS) mine[k] = officialPkg[k];
writeFileSync("package.json", `${JSON.stringify(mine, null, 2)}\n`);

console.log(
  `✓ Règles du cours synchronisées avec le template officiel (${official.length} fichiers).`,
);
console.log(
  '  Vérifie avec `pnpm rules:check`, puis enregistre : `git add -A` et `git commit -m "chore: synchronise les règles du cours"`.',
);
