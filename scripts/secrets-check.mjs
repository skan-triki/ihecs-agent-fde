// Contrôle de sécurité : aucun fichier .env réel versionné (ou envoyé à
// Vercel), aucun secret reconnaissable dans le code. Avec git : fichiers
// suivis. Sans git (build Vercel) : fichiers présents sur le disque.
// Code 0 seulement si tout est propre.
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SECRET =
  /(sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY)/;
const ENV_FILE = /(^|\/)\.env(?!\.example$)/;
// Dépendances, caches et résultats de build : le cache pnpm de Vercel contient
// des exemples de clés dans le code des paquets, ce n'est pas le projet.
const SKIP = new Set([
  "node_modules",
  ".pnpm-store",
  ".cache",
  ".next",
  ".git",
  ".vercel",
  "out",
  "build",
]);

const ls = spawnSync("git", ["ls-files"], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const p = dir === "." ? name : join(dir, name).replaceAll("\\", "/");
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files =
  ls.status === 0
    ? String(ls.stdout).split(/\r?\n/).filter(Boolean)
    : walk(".");

const envFiles = files.filter((f) => ENV_FILE.test(f));
const leaks = [];
for (const f of files) {
  if (ENV_FILE.test(f)) continue;
  let text;
  try {
    if (statSync(f).size > 2_000_000) continue;
    text = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  if (text.includes("\0")) continue;
  text.split(/\r?\n/).forEach((line, i) => {
    if (SECRET.test(line)) leaks.push(`${f}:${i + 1}`);
  });
}

if (envFiles.length === 0 && leaks.length === 0) {
  console.log(
    `✓ Secrets : aucun fichier .env ${ls.status === 0 ? "suivi" : "envoyé"}, aucun secret détecté.`,
  );
  process.exit(0);
}
for (const f of envFiles) console.error(`✗ fichier de secrets présent : ${f}`);
for (const l of leaks) console.error(`✗ secret probable : ${l}`);
process.exit(1);
