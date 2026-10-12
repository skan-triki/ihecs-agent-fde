// Hygiène mécanique de src/ — `pnpm src:check`, inclus dans `pnpm check`,
// donc vérifié au commit, au push, en CI et au build Vercel.
//
//  1. Fichier vide ou quasi-vide (commentaires seuls, `export {}`) interdit.
//  2. Tout module de src/server/ doit porter `import "server-only"` : un
//     import depuis un composant client casse alors le build (frontière
//     serveur/client verrouillée par Next.js, pas par convention).
//  3. Tout module de logique pure src/lib/**/*.ts exige son test voisin
//     X.test.ts — une fonction sans test est une fonction non prouvée.
//     Exemptés : les fichiers de types (*.d.ts) et les barils (index.ts)
//     qui ne contiennent pas de logique propre.
import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { join, relative } from "node:path";

const CODE_EXT = /\.(ts|tsx|mts|cts|js|jsx|css)$/;
const TEST_FILE = /\.test\.(ts|tsx)$/;
const EMPTY_STUB = /^(export\s*\{\s*\}|export\s+default\s*\{\s*\})\s*;?$/;

// Garde anti-boucle : un lien symbolique qui boucle ne doit pas faire
// tourner le parcours à l'infini.
const walk = (dir, out = [], seen = new Set()) => {
  if (!existsSync(dir)) return out;
  const real = realpathSync(dir);
  if (seen.has(real)) return out;
  seen.add(real);
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out, seen);
    else out.push(p);
  }
  return out;
};

const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/[^\n]*$/gm, "");

const errors = [];
for (const file of walk("src")) {
  const rel = relative(".", file).replaceAll("\\", "/");
  if (!CODE_EXT.test(rel)) continue;
  const body = stripComments(readFileSync(file, "utf8")).trim();

  if (body === "" || EMPTY_STUB.test(body)) {
    errors.push(
      `${rel} : fichier vide ou sans contenu réel — supprime-le ou remplis-le.`,
    );
    continue;
  }
  // Les fichiers de test ne sont pas soumis aux règles serveur/lib.
  if (TEST_FILE.test(rel)) continue;

  if (
    rel.startsWith("src/server/") &&
    !/import\s+["']server-only["']/.test(body)
  ) {
    errors.push(
      `${rel} : module serveur sans \`import "server-only"\` en tête — la frontière client/serveur n'est pas verrouillée.`,
    );
  }

  // Logique pure : tout module de src/lib/ (toutes extensions) exige un
  // test voisin NON VIDE — un fichier .test.* vide ou sans it()/test() ne
  // prouve rien.
  const isLibModule =
    rel.startsWith("src/lib/") &&
    /\.(ts|tsx|mts|mjs|js|jsx|cts|cjs)$/.test(rel) &&
    !/\.d\.ts$/.test(rel) &&
    !/(^|\/)index\.[a-z]+$/.test(rel);
  if (isLibModule) {
    const stem = rel.replace(/\.[a-z]+$/, "");
    const testPath = `${stem}.test.${rel.endsWith(".tsx") ? "tsx" : "ts"}`;
    const testFile = join(".", testPath);
    const testBody = existsSync(testFile) ? readFileSync(testFile, "utf8") : "";
    if (!/\b(it|test|describe)\s*\(/.test(testBody)) {
      errors.push(
        `${rel} : module de logique sans test réel — crée ${testPath} à côté avec au moins un it()/test() (vitest, convention du skill /nextjs-react-patterns).`,
      );
    }
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
