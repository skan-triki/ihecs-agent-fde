// Hook Devin Stop — si des fichiers sources ont été modifiés pendant la session,
// vérifie lint et types AVANT d'arrêter l'agent. Bloque une seule fois (stop_hook_active)
// pour éviter toute boucle infinie.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { prodPendingMarker } from "../lib/readiness.mjs";

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

if (payload.stop_hook_active) process.exit(0);

// LIVRAISON (étape 7) : une PR a été fusionnée pendant la session mais la
// production n'a pas été vérifiée → on ne conclut pas.
if (existsSync(prodPendingMarker())) {
  console.log(
    JSON.stringify({
      decision: "block",
      reason:
        "Une PR a été fusionnée mais la mise en production n'a pas été vérifiée. Lance `pnpm prod:check` (il attend que Vercel serve le dernier commit puis teste la page) et donne le résultat à l'étudiant avant de conclure.",
    }),
  );
  process.exit(2);
}

const git = (args) => {
  const r = spawnSync("git", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return r.status === 0 ? String(r.stdout ?? "") : "";
};

const changed = git(["status", "--porcelain"])
  .split(/\r?\n/)
  .filter((l) => l)
  .map((l) => l.slice(3).trim())
  .filter((p) => /\.(ts|tsx|mts|cts|jsx)$/.test(p));

if (changed.length === 0) process.exit(0);

// CONCEPT AVANT CODE (défense en profondeur) : du code applicatif a été
// modifié (y compris via exec, ex. shadcn add) alors que le concept MVP
// n'est pas validé → on bloque avec la consigne /concept.
const srcChanged = changed.some((p) => /^src\//.test(p.replaceAll("\\", "/")));
if (srcChanged) {
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
          "Verrou « concept avant code » : du code applicatif a été modifié alors que .concept/MVP.md n'est pas validé. Lance le skill /concept avec l'étudiant (interview guidée, français simple, une question à la fois) pour définir le concept MVP. Ne conclus pas tant que ce n'est pas fait.",
      }),
    );
    process.exit(2);
  }
}

// HYGIÈNE + TESTS (défense en fin de tour) : si des fichiers de src/ ont
// changé, les règles de src:check (fichiers vides, server-only, tests exigés)
// et les tests vitest liés aux fichiers touchés doivent passer maintenant —
// pas seulement au push.
const srcChangedFiles = changed.filter((p) =>
  /^src\//.test(p.replaceAll("\\", "/")),
);
const hygiene = srcChangedFiles.length
  ? spawnSync(process.execPath, ["scripts/check-src.mjs"], {
      encoding: "utf8",
      timeout: 30_000,
    })
  : { status: 0, stdout: "", stderr: "" };
const vitest = srcChangedFiles.length
  ? spawnSync(
      "pnpm",
      ["exec", "vitest", "run", "--related", ...srcChangedFiles],
      {
        encoding: "utf8",
        shell: process.platform === "win32",
        timeout: 120_000,
      },
    )
  : { status: 0, stdout: "", stderr: "" };

const eslint = spawnSync(
  "pnpm",
  ["exec", "eslint", "--max-warnings=0", ...changed],
  { encoding: "utf8", shell: process.platform === "win32", timeout: 120_000 },
);

const tsc = spawnSync(
  "pnpm",
  [
    "exec",
    "tsc",
    "--noEmit",
    "--incremental",
    "--tsBuildInfoFile",
    ".next/cache/stop-gate.tsbuildinfo",
  ],
  { encoding: "utf8", shell: process.platform === "win32", timeout: 180_000 },
);

const failed =
  eslint.status !== 0 ||
  tsc.status !== 0 ||
  hygiene.status !== 0 ||
  vitest.status !== 0;
if (!failed) process.exit(0);

const out = [
  String(hygiene.stdout ?? ""),
  String(hygiene.stderr ?? ""),
  String(vitest.stdout ?? ""),
  String(vitest.stderr ?? ""),
  String(eslint.stdout ?? ""),
  String(eslint.stderr ?? ""),
  String(tsc.stdout ?? ""),
  String(tsc.stderr ?? ""),
]
  .filter(Boolean)
  .join("\n")
  .slice(0, 3000);

console.log(
  JSON.stringify({
    decision: "block",
    reason: `Des fichiers sources ont été modifiés mais un contrôle échoue (hygiène src/, tests, lint ou types). Corrige TOUTES les erreurs ci-dessous (zéro tolérance), puis conclus :\n${out}\nSi tu ne sais pas corriger, explique précisément le problème à l'étudiant au lieu de conclure.`,
  }),
);
process.exit(2);
