// Vérifie mécaniquement que src/env.ts et .env.example déclarent exactement les mêmes variables.
import { readFileSync } from "node:fs";

const IMPLICIT = new Set(["NODE_ENV"]);

const envTs = readFileSync("src/env.ts", "utf8");
const runtimeBlock = /runtimeEnv:\s*\{([\s\S]*?)\}/.exec(envTs)?.[1];
if (!runtimeBlock) {
  console.error("✗ Bloc `runtimeEnv` introuvable dans src/env.ts");
  process.exit(1);
}
const declared = new Set(
  [...runtimeBlock.matchAll(/^\s*([A-Z][A-Z0-9_]*)\s*:/gm)].map((m) => m[1]),
);

const example = new Set(
  readFileSync(".env.example", "utf8")
    .split(/\r?\n/)
    .map((line) => /^\s*([A-Z][A-Z0-9_]*)\s*=/.exec(line)?.[1])
    .filter(Boolean),
);

const missingInExample = [...declared].filter(
  (k) => !IMPLICIT.has(k) && !example.has(k),
);
const missingInEnvTs = [...example].filter((k) => !declared.has(k));

if (missingInExample.length || missingInEnvTs.length) {
  if (missingInExample.length) {
    console.error(
      `✗ Déclarées dans src/env.ts mais absentes de .env.example : ${missingInExample.join(", ")}`,
    );
  }
  if (missingInEnvTs.length) {
    console.error(
      `✗ Présentes dans .env.example mais non déclarées dans src/env.ts : ${missingInEnvTs.join(", ")}`,
    );
  }
  process.exit(1);
}

console.log(`✓ Variables d'environnement cohérentes (${declared.size}).`);
