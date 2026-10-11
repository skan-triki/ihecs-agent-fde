// Intégrité des règles du cours : dans un dépôt étudiant, les fichiers de
// garde-fous (hooks, CI, agents, skills, configs de qualité…) doivent être
// IDENTIQUES à ceux du template officiel. Toute modification, suppression ou
// ajout est refusé. Utilisé par le pre-push, la CI et le build Vercel (sans git).
// Réparation : `pnpm rules:sync` (récupère les versions officielles).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  fetchTemplateFiles,
  isTemplateRepo,
  PACKAGE_RULE_KEYS,
  RULE_DIRS,
  RULE_FILES,
} from "./lib/template.mjs";

if (isTemplateRepo()) {
  console.log(
    "✓ Intégrité des règles : dépôt modèle (contrôle non applicable).",
  );
  process.exit(0);
}

const templateFiles = await fetchTemplateFiles();
if (!templateFiles) {
  console.error(
    "✗ Intégrité des règles : impossible de récupérer le template officiel (connexion internet ?). Contrôle refusé par sécurité.",
  );
  process.exit(1);
}

const norm = (s) => s.replaceAll("\r\n", "\n");
const official = (path) => {
  const c = templateFiles.get(path);
  return c === undefined ? null : norm(c);
};
const local = (path) =>
  existsSync(path) ? norm(readFileSync(path, "utf8")) : null;

// Fichiers locaux d'un dossier (hors fichiers générés et non versionnés).
const IGNORED = /(^|\/)(\.DS_Store|Thumbs\.db)$|^\.husky\/_\//;
const walk = (dir) => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name).replaceAll("\\", "/");
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
};

const errors = [];

for (const dir of RULE_DIRS) {
  const expected = new Set(
    [...templateFiles.keys()].filter((p) => p.startsWith(`${dir}/`)),
  );
  const present = new Set(walk(dir).filter((p) => !IGNORED.test(p)));
  for (const p of expected) {
    if (!present.has(p)) errors.push(`supprimé : ${p}`);
    else if (official(p) !== local(p)) errors.push(`modifié : ${p}`);
  }
  for (const p of present) {
    if (!expected.has(p)) errors.push(`ajouté (non officiel) : ${p}`);
  }
}

// .gitignore : `vercel link` y ajoute ses propres lignes. Toutes les lignes
// officielles doivent rester présentes ; ignorer davantage de fichiers ne
// contourne aucune règle, c'est donc toléré.
const lines = (s) =>
  new Set(
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean),
  );

for (const p of RULE_FILES) {
  const o = official(p);
  const l = local(p);
  if (o === null && l === null) continue;
  if (p === ".gitignore" && o !== null && l !== null) {
    const mine = lines(l);
    const removed = [...lines(o)].filter((x) => !mine.has(x));
    if (removed.length > 0) {
      errors.push(
        `modifié : .gitignore (lignes retirées : ${removed.join(", ")})`,
      );
    }
    continue;
  }
  if (o !== l) errors.push(`${l === null ? "supprimé" : "modifié"} : ${p}`);
}

const pick = (json) => {
  const obj = JSON.parse(json);
  return JSON.stringify(PACKAGE_RULE_KEYS.map((k) => obj[k] ?? null));
};
const oPkg = official("package.json");
const lPkg = local("package.json");
if (!oPkg || !lPkg || pick(oPkg) !== pick(lPkg)) {
  errors.push(`modifié : package.json (${PACKAGE_RULE_KEYS.join(", ")})`);
}

if (errors.length > 0) {
  console.error(
    "✗ Intégrité des règles du cours : fichiers non conformes au template officiel :",
  );
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    "\nLes règles du cours ne se modifient pas. Pour revenir aux versions officielles : `pnpm rules:sync`.",
  );
  process.exit(1);
}

console.log("✓ Intégrité des règles : conforme au template officiel.");
