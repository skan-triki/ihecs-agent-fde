// Contrôle de sécurité : aucun fichier .env réel suivi par git, aucun secret
// reconnaissable dans le code versionné. Code 0 seulement si tout est propre.
import { spawnSync } from "node:child_process";

const git = (args) =>
  spawnSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === "win32",
  });

const tracked = String(git(["ls-files"]).stdout).split(/\r?\n/);
const envFiles = tracked.filter((f) => /(^|\/)\.env(?!\.example$)/.test(f));

const grep = git([
  "grep",
  "-nIE",
  "(sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY)",
]);
const leaks = String(grep.stdout).split(/\r?\n/).filter(Boolean);

if (envFiles.length === 0 && leaks.length === 0) {
  console.log("✓ Secrets : aucun fichier .env suivi, aucun secret détecté.");
  process.exit(0);
}
for (const f of envFiles)
  console.error(`✗ fichier de secrets suivi par git : ${f}`);
for (const l of leaks) console.error(`✗ secret probable : ${l.slice(0, 120)}`);
process.exit(1);
