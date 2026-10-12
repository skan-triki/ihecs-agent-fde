// Hook Devin PostToolUse(run_subagent) — journal d'audit des sous-agents :
// chaque lancement est noté dans .git/ihecs-subagents.log (horodatage, profil,
// titre). Les contrôles (revues concept / code) exigent ensuite que les
// relecteurs aient réellement été lancés — sinon n'importe qui pourrait écrire
// un fichier de verdict sans relecture.
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

const ti = payload.tool_input ?? {};
const entry = JSON.stringify({
  ts: new Date().toISOString(),
  profile: String(ti.profile ?? ""),
  title: String(ti.title ?? ""),
});
try {
  appendFileSync(".git/ihecs-subagents.log", `${entry}\n`, "utf8");
} catch {
  // Pas de dépôt git ou accès impossible : on ne bloque jamais l'outil.
}
process.exit(0);
