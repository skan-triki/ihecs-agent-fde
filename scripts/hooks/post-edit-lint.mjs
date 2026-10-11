// Hook Devin PostToolUse(write|edit) — reformate le fichier édité (ESLint --fix + Prettier)
// et remonte les problèmes restants au contexte de l'agent.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

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

const ti = payload.tool_input ?? {};
const filePath = String(ti.file_path ?? ti.path ?? "");
if (!filePath || !existsSync(filePath)) process.exit(0);

if (!/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|json|css)$/.test(filePath)) {
  process.exit(0);
}

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    timeout: 25_000,
  });
  return {
    status: r.status ?? 1,
    stdout: String(r.stdout ?? ""),
    stderr: String(r.stderr ?? ""),
  };
};

if (/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(filePath)) {
  const eslint = run("pnpm", [
    "exec",
    "eslint",
    "--fix",
    "--no-warn-ignored",
    filePath,
  ]);
  if (eslint.status !== 0) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: `Le fichier vient d'être reformaté (ESLint --fix). ERREURS RESTANTES à corriger avant de continuer :\n${eslint.stdout || eslint.stderr}`,
        },
      }),
    );
    process.exit(0);
  }
}

run("pnpm", ["exec", "prettier", "--write", filePath]);

let remaining = "";
try {
  remaining = readFileSync(filePath, "utf8");
} catch {
  process.exit(0);
}

const size = existsSync(filePath)
  ? `${remaining.split("\n").length} lignes`
  : "";
console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: `PostToolUse: "${filePath}" a été auto-formaté (ESLint --fix + Prettier) : ${size}. Relisez le fichier avant de le rééditer (son contenu a pu changer).`,
    },
  }),
);
process.exit(0);
