// Build Vercel — les contrôles du cours s'exécutent en CODE OFFICIEL.
// Le dépôt étudiant contient les mêmes scripts, mais rien n'empêche de les
// modifier localement : exécuter la copie du dépôt pour vérifier le dépôt
// serait du contrôle par soi-même. On télécharge donc le tarball officiel
// (comme check-integrity), on extrait son scripts/ en temporaire et on
// lance les contrôles depuis là — intégrité, secrets, concept — puis le
// `pnpm verify` local, dont les fichiers de règles viennent d'être prouvés
// identiques à l'officiel. Échec du téléchargement → build refusé (fermé).
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { fetchTemplateFiles } from "./lib/template.mjs";

const ROOT = process.cwd();
// Sous Windows, `pnpm` est un .cmd : il faut un shell (et le shell sait le
// résoudre via PATH). `node` vient de process.execPath — un chemin avec
// espaces (« C:\Program Files\… ») : jamais de shell pour lui.
const run = (bin, args, shell = false) =>
  spawnSync(bin, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: shell && process.platform === "win32",
  }).status ?? 1;

const templateFiles = await fetchTemplateFiles();
if (!templateFiles) {
  console.error(
    "✗ Build Vercel : impossible de récupérer le template officiel (connexion ?) — build refusé par sécurité.",
  );
  process.exit(1);
}

// Tout scripts/ officiel dans un dossier temporaire : les contrôles et leurs
// librairies partagées viennent de la source de confiance, pas du checkout.
const officialDir = mkdtempSync(join(tmpdir(), "ihecs-official-"));
for (const [path, content] of templateFiles) {
  if (!path.startsWith("scripts/")) continue;
  const dest = join(officialDir, ...path.split("/"));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, content);
}
const official = (name) => join(officialDir, "scripts", name);

// Les contrôles lisent les fichiers du dépôt relatifs au cwd (la racine du
// projet chez Vercel). Même ordre que l'ancien `build:vercel` : concept,
// intégrité des règles, secrets.
for (const [script, ...args] of [
  ["check-concept.mjs", "--skip-template"],
  ["check-integrity.mjs"],
  ["secrets-check.mjs"],
]) {
  const status = run(process.execPath, [official(script), ...args]);
  if (status !== 0) process.exit(status);
}

// Les règles locales viennent d'être prouvées identiques à l'officiel : le
// reste de la chaîne (env, hygiène, design, format, lint, types, tests,
// code mort, build) peut s'exécuter avec la copie du dépôt.
process.exit(run("pnpm", ["verify"], true));
