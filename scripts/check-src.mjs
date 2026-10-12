// Hygiène mécanique de src/ — `pnpm src:check`, inclus dans `pnpm check`,
// donc vérifié au commit, au push, en CI et au build Vercel.
//
//  1. Fichier vide ou quasi-vide (commentaires seuls, `export {}`) interdit.
//  2. Tout module de src/server/ doit porter `import "server-only"` : un
//     import depuis un composant client casse alors le build (frontière
//     serveur/client verrouillée par Next.js, pas par convention).
//  3. Tout module de logique pure src/lib/**/*.ts exige son test voisin
//     X.test.ts — une fonction sans test est une fonction non prouvée.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const CODE_EXT = /\.(ts|tsx|mts|cts|js|jsx|css)$/;
const TEST_FILE = /\.test\.(ts|tsx)$/;
const EMPTY_STUB = /^(export\s*\{\s*\}|export\s+default\s*\{\s*\})\s*;?$/;

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/[^\n]*$/gm, "");

const errors = [];
for (const file of walk("src")) {
  const rel = relative(".", file).replaceAll("\\", "/");
  if (!CODE_EXT.test(rel) || TEST_FILE.test(rel)) continue;
  const body = stripComments(readFileSync(file, "utf8")).trim();

  if (body === "" || EMPTY_STUB.test(body)) {
    errors.push(
      `${rel} : fichier vide ou sans contenu réel — supprime-le ou remplis-le.`,
    );
    continue;
  }

  if (
    rel.startsWith("src/server/") &&
    !/import\s+["']server-only["']/.test(body)
  ) {
    errors.push(
      `${rel} : module serveur sans \`import "server-only"\` en tête — la frontière client/serveur n'est pas verrouillée.`,
    );
  }

  if (
    rel.startsWith("src/lib/") &&
    rel.endsWith(".ts") &&
    !existsSync(file.replace(/\.ts$/, ".test.ts"))
  ) {
    errors.push(
      `${rel} : module de logique sans test — crée ${rel.replace(/\.ts$/, ".test.ts")} à côté (vitest, convention du skill /nextjs-react-patterns).`,
    );
  }
}

if (errors.length > 0) {
  console.error(
    `✗ Hygiène src/ incomplète :\n${errors.map((e) => `  - ${e}`).join("\n")}`,
  );
  process.exit(1);
}
console.log(
  "✓ Hygiène src/ : aucun fichier vide, serveur borné, logique sous tests.",
);
