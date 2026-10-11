// Ajoute une variable PUBLIQUE (préfixe NEXT_PUBLIC_) sur Vercel, pour les
// trois environnements : `node scripts/vercel-env-public.mjs <NOM> <valeur>`.
// Refuse tout autre nom : un secret est toujours saisi par l'étudiant lui-même.
import { spawnSync } from "node:child_process";

const [name, value] = process.argv.slice(2);
if (!name || value === undefined) {
  console.error(
    "Usage : node scripts/vercel-env-public.mjs <NEXT_PUBLIC_NOM> <valeur>",
  );
  process.exit(2);
}
if (!/^NEXT_PUBLIC_[A-Z0-9_]+$/.test(name)) {
  console.error(
    `✗ ${name} n'est pas une variable publique (NEXT_PUBLIC_…). Un secret doit être ajouté par l'étudiant lui-même : vercel env add ${name} production`,
  );
  process.exit(1);
}

let failed = false;
for (const target of ["production", "preview", "development"]) {
  const r = spawnSync("vercel", ["env", "add", name, target], {
    input: value,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  console.log(`${r.status === 0 ? "✅" : "❌"} ${name} → ${target}`);
  if (r.status !== 0) {
    failed = true;
    console.error(String(r.stderr).slice(0, 400));
  }
}
process.exit(failed ? 1 : 0);
