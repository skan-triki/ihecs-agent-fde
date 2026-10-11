// Hook Devin Stop — si des fichiers sources ont été modifiés pendant la session,
// vérifie lint et types AVANT d'arrêter l'agent. Bloque une seule fois (stop_hook_active)
// pour éviter toute boucle infinie.
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

if (payload.stop_hook_active) process.exit(0);

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

const failed = eslint.status !== 0 || tsc.status !== 0;
if (!failed) process.exit(0);

const out = [
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
    reason: `Des fichiers sources ont été modifiés mais lint/typecheck échoue. Corrige TOUTES les erreurs ci-dessous (zéro tolérance), puis conclus :\n${out}\nSi tu ne sais pas corriger, explique précisément le problème à l'étudiant au lieu de conclure.`,
  }),
);
process.exit(2);
