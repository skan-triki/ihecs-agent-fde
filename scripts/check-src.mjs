// Hygiène mécanique de src/ — lancé par pnpm src:check, inclus dans la
// chaîne pnpm check, donc vérifié au commit, au push, en CI et au build.
// Règles : pas de fichier vide ou sans contenu réel ; les modules serveur
// portent le marqueur server-only (un import côté client casse le build) ;
// chaque module de logique pure a son test voisin — un test est une preuve.
// Les noms de fichiers restent en kebab-case et aucun marqueur de travail
// remis à plus tard (TODO, FIXME…) ne doit figurer dans le code livré.
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
// Noms de fichiers : kebab-case partout (segments séparés par - ou .).
// Des noms réguliers rendent les imports prévisibles et le code navigable.
const KEBAB = /^[a-z0-9]+([.-][a-z0-9]+)*$/;
// Marqueurs de travail remis à plus tard : un TODO livré est une dette
// déguisée — on corrige ou on supprime, on ne reporte pas.
const MARKERS = /\b(?:TODO|FIXME|HACK|XXX)\b/;

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
  const raw = readFileSync(file, "utf8");
  const body = stripComments(raw).trim();

  const stem = rel
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "");
  if (!KEBAB.test(stem)) {
    errors.push(
      `${rel} : nom de fichier non kebab-case — renomme-le en minuscules avec tirets (ex. ma-page.tsx).`,
    );
  }
  // Marqueurs cherchés sur le texte BRUT : ils vivent dans les commentaires.
  if (MARKERS.test(raw)) {
    errors.push(
      `${rel} : marqueur TODO/FIXME/HACK/XXX interdit — termine le travail ou supprime la ligne, ne remets pas à plus tard.`,
    );
  }

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
