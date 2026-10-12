// Hook Devin PostToolUse(run_subagent) — journal d'audit des sous-agents :
// chaque lancement est noté dans .git/ihecs-subagents.log (horodatage, profil,
// titre, commit courant). Les contrôles (revues concept / code) exigent que
// les relecteurs aient été lancés SUR le commit relu — un fichier de verdict
// écrit à la main ne compte pas.
import { spawnSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";

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

const commit = String(
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).stdout ?? "",
).trim();

const ti = payload.tool_input ?? {};
const entry = JSON.stringify({
  ts: new Date().toISOString(),
  profile: String(ti.profile ?? ""),
  title: String(ti.title ?? ""),
  commit: commit || null,
});
try {
  appendFileSync(".git/ihecs-subagents.log", `${entry}\n`, "utf8");
} catch {
  // Pas de dépôt git ou accès impossible : on ne bloque jamais l'outil.
}
process.exit(0);
