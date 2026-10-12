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

// Devin CLI : payload `tool_input`, retour via `additionalContext`.
// Cascade : payload `tool_info`, retour via stdout (visible si show_output).
const isCascade = typeof payload.agent_action_name === "string";
const ti = payload.tool_input ?? {};
const filePath = String(
  ti.file_path ?? ti.path ?? payload.tool_info?.file_path ?? "",
);
if (!filePath || !existsSync(filePath)) process.exit(0);

if (!/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|json|css)$/.test(filePath)) {
  process.exit(0);
}

// Pas de shell : chaque argument part tel quel (un nom de fichier contenant
// « & » n'exécute rien). Et jamais de « pnpm » : sous Windows c'est un .cmd
// que Node refuse de lancer sans shell. On invoque donc les outils du projet
// par leur vrai binaire JS — portable Windows/macOS/Linux.
const TOOL_BIN = {
  eslint: "node_modules/eslint/bin/eslint.js",
  prettier: "node_modules/prettier/bin/prettier.cjs",
};
const run = (tool, args) => {
  const r = spawnSync(process.execPath, [TOOL_BIN[tool], ...args], {
    encoding: "utf8",
    timeout: 25_000,
  });
  return {
    status: r.status ?? 1,
    stdout: String(r.stdout ?? ""),
    stderr: String(r.stderr ?? ""),
  };
};

if (/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(filePath)) {
  const eslint = run("eslint", ["--fix", "--no-warn-ignored", filePath]);
  if (eslint.status !== 0) {
    const msg = `Le fichier vient d'être reformaté (ESLint --fix). ERREURS RESTANTES à corriger avant de continuer :\n${eslint.stdout || eslint.stderr}`;
    if (isCascade) console.log(msg);
    else
      console.log(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PostToolUse",
            additionalContext: msg,
          },
        }),
      );
    process.exit(0);
  }
}

run("prettier", ["--write", filePath]);

let remaining = "";
try {
  remaining = readFileSync(filePath, "utf8");
} catch {
  process.exit(0);
}

const size = existsSync(filePath)
  ? `${remaining.split("\n").length} lignes`
  : "";
const doneMsg = `"${filePath}" a été auto-formaté (ESLint --fix + Prettier) : ${size}. Relisez le fichier avant de le rééditer (son contenu a pu changer).`;
if (isCascade) console.log(doneMsg);
else
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `PostToolUse: ${doneMsg}`,
      },
    }),
  );
process.exit(0);
