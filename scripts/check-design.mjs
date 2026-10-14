// Cohérence des tokens du design system — `pnpm design:check`, inclus dans
// `pnpm check` (commit, push, CI, build Vercel).
//   1. Tout token référencé par un mapping `--color-*` de `@theme` doit
//      exister dans :root ET dans .dark : une couleur sans déclinaison
//      sombre garde sa valeur claire et casse l'écran sans erreur.
//   2. Un token déclaré seulement dans .dark est presque toujours une
//      coquille (le thème clair l'ignore complètement).
//   3. Chaque `var(--x)` de `@theme` doit pointer un token défini :
//      un mapping vers l'inexistant produit une classe muette.
// Les constantes partagées (`--radius`, `--font-*`) peuvent rester dans
// :root seul : elles ne varient pas avec le thème.
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? "src/design-system/globals.css";
const css = readFileSync(path, "utf8");

const block = (re) => re.exec(css)?.[1] ?? "";
const tokens = (body) =>
  new Set([...body.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));

const light = tokens(block(/:root\s*\{([\s\S]*?)\}/));
const dark = tokens(block(/\.dark\s*\{([\s\S]*?)\}/));
const theme = block(/@theme(?:\s+inline)?\s*\{([\s\S]*?)\}/);

// Correspondances mapping → token : --color-card: var(--card) etc.
const mappings = [
  ...theme.matchAll(/(--[a-z0-9-]+)\s*:\s*var\(\s*(--[a-z0-9-]+)\s*\)/g),
].map((m) => ({ alias: m[1], token: m[2] }));

const errors = [];
for (const { alias, token } of mappings) {
  // Les variables --font-* sont injectées par next/font au runtime : elles ne
  // vivent pas dans ce fichier, l'exigence d'existence ne s'applique pas.
  const runtimeToken = alias.startsWith("--font-");
  if (!light.has(token) && !dark.has(token)) {
    if (!runtimeToken) {
      errors.push(`${alias} référence ${token}, un token défini nulle part`);
    }
    continue;
  }
  // Seules les couleurs doivent varier dans les DEUX thèmes.
  if (alias.startsWith("--color-")) {
    if (light.has(token) && !dark.has(token)) {
      errors.push(
        `${token} (via ${alias}) défini dans :root mais pas dans .dark — le mode sombre gardera la couleur claire`,
      );
    }
    if (dark.has(token) && !light.has(token)) {
      errors.push(
        `${token} (via ${alias}) défini dans .dark mais pas dans :root — le mode clair sera sans couleur`,
      );
    }
  }
}
for (const t of dark) {
  if (!light.has(t)) {
    errors.push(
      `${t} déclaré dans .dark mais absent de :root — coquille probable`,
    );
  }
}

if (errors.length > 0) {
  console.error(
    `✗ Design system incohérent (${path}) :\n${errors.map((e) => `  - ${e}`).join("\n")}`,
  );
  process.exit(1);
}
console.log(
  `✓ Design system : ${light.size} tokens clairs, ${dark.size} sombres, couleurs en parité, @theme cohérent.`,
);
