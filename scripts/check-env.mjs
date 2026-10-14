// Vérifie mécaniquement que src/env.ts et .env.example déclarent exactement les mêmes variables.
import { readFileSync } from "node:fs";

// Variables fournies par Node ou par Vercel : pas de ligne dans .env.example.
const IMPLICIT = new Set(["NODE_ENV", "VERCEL_GIT_COMMIT_SHA"]);

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

// Une variable NEXT_PUBLIC_* est embarquée dans le code envoyé au
// navigateur : si son NOM ressemble à un secret, c'est une fuite par
// construction — on la refuse avant même de regarder sa valeur.
const PUBLIC_SECRET = /^NEXT_PUBLIC_.*(SECRET|TOKEN|PASSWORD|PRIVATE_KEY)/i;
const publicSecrets = [...declared].filter((k) => PUBLIC_SECRET.test(k));
if (publicSecrets.length > 0) {
  console.error(
    `✗ Variables publiques à nom de secret (embarquées dans le navigateur = fuite) : ${publicSecrets.join(", ")}`,
  );
  console.error(
    "→ Un secret côté client n'existe pas : retire le préfixe NEXT_PUBLIC_ et garde la variable côté serveur, ou renomme-la si elle est vraiment publique.",
  );
  process.exit(1);
}

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
  console.error(
    "→ Répare via le skill /env-vars : il aligne src/env.ts, .env.example et .env.local (jamais de valeur réelle dans .env.example).",
  );
  process.exit(1);
}

console.log(`✓ Variables d'environnement cohérentes (${declared.size}).`);
