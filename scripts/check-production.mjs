// Vérification de la mise en production (étape 7) : attend que la production
// Vercel serve EXACTEMENT le dernier commit de `main` (route /api/health),
// puis vérifie que la page d'accueil répond en 2xx. Lève le verrou
// « production à vérifier » posé à chaque fusion.
// Usage : `pnpm prod:check [https://<projet>.vercel.app]`
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";

import { prodPendingMarker } from "./lib/readiness.mjs";

const git = (args) => spawnSync("git", args, { encoding: "utf8" });

const projectUrl = () => {
  const arg = process.argv[2];
  if (arg) return arg.replace(/\/$/, "");
  if (!existsSync(".vercel/project.json")) return null;
  const project = JSON.parse(readFileSync(".vercel/project.json", "utf8"));
  const name =
    project.projectName ??
    JSON.parse(readFileSync("package.json", "utf8")).name;
  return `https://${name}.vercel.app`;
};

const url = projectUrl();
if (!url) {
  console.error(
    "✗ Projet Vercel non lié (.vercel/project.json absent) : lance /bootstrap, ou indique l'URL : pnpm prod:check https://<projet>.vercel.app",
  );
  process.exit(1);
}

git(["fetch", "--quiet", "origin", "main"]);
const expected = String(git(["rev-parse", "origin/main"]).stdout).trim();
if (!expected) {
  console.error("✗ Impossible de lire le dernier commit de origin/main.");
  process.exit(1);
}

const TIMEOUT_MS = 10 * 60_000;
const start = Date.now();
let served = null;
console.log(
  `⏳ Attente de la production ${url} sur le commit ${expected.slice(0, 7)}…`,
);
while (Date.now() - start < TIMEOUT_MS) {
  try {
    const r = await fetch(`${url}/api/health`, { cache: "no-store" });
    if (r.ok) {
      const body = /** @type {{ commit?: string | null }} */ (await r.json());
      served = body.commit ?? null;
      if (served === expected) break;
    }
  } catch {
    // Production pas encore joignable : on réessaie.
  }
  await new Promise((resolve) => setTimeout(resolve, 10_000));
}

if (served !== expected) {
  console.error(
    `✗ La production ne sert pas le dernier commit après 10 minutes (servi : ${served?.slice(0, 7) ?? "aucun"}, attendu : ${expected.slice(0, 7)}). Regarde le déploiement : vercel ls --prod puis vercel inspect <url>.`,
  );
  process.exit(1);
}

const home = await fetch(url);
if (!home.ok) {
  console.error(`✗ La page d'accueil répond ${home.status} : ${url}`);
  process.exit(1);
}

rmSync(prodPendingMarker(), { force: true });
console.log(
  `✓ Production à jour et en ligne : ${url} (commit ${expected.slice(0, 7)}, HTTP ${home.status}).`,
);
