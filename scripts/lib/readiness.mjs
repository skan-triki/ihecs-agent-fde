// État du poste et du projet, vérifiable RAPIDEMENT (sans lancer d'outil) :
// utilisé par les garde-fous pour imposer l'ordre des étapes du cours.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Étapes 2-3 : outils installés et projet préparé, sinon pas de développement.
export const devMissing = () => {
  const missing = [];
  if (Number(process.versions.node.split(".")[0]) < 24) {
    missing.push("Node.js ≥ 24");
  }
  let pnpmMajor = 0;
  try {
    const m = /"packageManager":\s*"pnpm@(\d+)/.exec(
      readFileSync("node_modules/.modules.yaml", "utf8"),
    );
    pnpmMajor = Number(m?.[1] ?? 0);
  } catch {
    missing.push("dépendances du projet (`pnpm install`)");
  }
  if (pnpmMajor > 0 && pnpmMajor < 10) missing.push("pnpm ≥ 10");
  if (!existsSync(".env.local")) missing.push("`.env.local` (`pnpm env:init`)");
  return missing;
};

// Étape 5 : le projet est lié à GitHub ET à Vercel (bootstrap terminé).
export const bootstrapMissing = () => {
  const missing = [];
  const origin = spawnSync("git", ["remote", "get-url", "origin"], {
    encoding: "utf8",
  });
  if (origin.status !== 0) missing.push("dépôt GitHub (remote `origin`)");
  if (!existsSync(".vercel/project.json")) missing.push("projet Vercel lié");
  return missing;
};

// Étape 7 : marqueur posé à chaque fusion, retiré quand la production a été
// vérifiée (`pnpm prod:check`). Tant qu'il existe, aucune nouvelle livraison.
export const prodPendingMarker = () => {
  const r = spawnSync("git", ["rev-parse", "--git-dir"], { encoding: "utf8" });
  const dir = r.status === 0 ? String(r.stdout).trim() : ".git";
  return join(dir, "ihecs-prod-pending");
};
