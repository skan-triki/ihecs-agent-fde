// État du poste et du projet, vérifiable RAPIDEMENT (sans lancer d'outil) :
// utilisé par les garde-fous pour imposer l'ordre des étapes du cours.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { isTemplateRepo } from "./template.mjs";

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

// Dossier git courant (« .git » en secours si git échoue : build sans dépôt).
const gitDir = () => {
  const r = spawnSync("git", ["rev-parse", "--git-dir"], { encoding: "utf8" });
  return r.status === 0 ? String(r.stdout).trim() : ".git";
};

// Étape 7 : marqueur posé à chaque fusion, retiré quand la production a été
// vérifiée (`pnpm prod:check`). Tant qu'il existe, aucune nouvelle livraison.
export const prodPendingMarker = () => join(gitDir(), "ihecs-prod-pending");

// Étapes 3→4 : connexions GitHub et Vercel avant l'idéation. La sonde réelle
// (`gh auth status`, `vercel whoami`) est lente (jusqu'à ~15 s) : le résultat
// est mis en cache — 30 minutes quand tout est connecté, 60 secondes sinon,
// pour reprendre vite après le login de l'étudiant.
export const loginsCachePath = () => join(gitDir(), "ihecs-logins-cache");

// shell:true uniquement sous Windows et uniquement ici : les commandes
// sondées sont des CONSTANTES (gh/vercel sont des .cmd que Node ne lance
// pas sans shell) — aucune entrée utilisateur n'entre dans la chaîne.
const probeOk = (cmd, args, timeout) =>
  (process.platform === "win32"
    ? spawnSync(`${cmd} ${args.join(" ")}`, {
        shell: true,
        encoding: "utf8",
        timeout,
        windowsHide: true,
      })
    : spawnSync(cmd, args, { encoding: "utf8", timeout })
  ).status === 0;

export const loginsMissing = () => {
  // Le dépôt modèle n'est pas un poste étudiant : verrou non applicable.
  if (isTemplateRepo()) return [];
  let cached = null;
  try {
    cached = JSON.parse(readFileSync(loginsCachePath(), "utf8"));
  } catch {
    // Cache absent ou illisible : on re-sonde.
  }
  if (
    Array.isArray(cached?.missing) &&
    Date.now() - cached.ts < (cached.missing.length > 0 ? 60_000 : 30 * 60_000)
  ) {
    return cached.missing;
  }
  const missing = [];
  if (!probeOk("gh", ["auth", "status"], 10_000))
    missing.push("GitHub (`gh auth login`)");
  if (!probeOk("vercel", ["whoami"], 15_000))
    missing.push("Vercel (`vercel login`)");
  try {
    writeFileSync(
      loginsCachePath(),
      JSON.stringify({ ts: Date.now(), missing }),
    );
  } catch {
    // Dossier git non inscriptible : la sonde repassera au prochain passage.
  }
  return missing;
};
