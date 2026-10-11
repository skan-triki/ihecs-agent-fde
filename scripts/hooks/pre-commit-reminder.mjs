// Hook bi-format — à chaque commande `git commit`, rappelle à l'agent la
// procédure `.check/VERIFICATION.md` AVANT de commiter :
//   - Devin CLI (hooks.v1.json) : contexte injecté (additionalContext), jamais bloquant ;
//   - Cascade/Windsurf (hooks.json) : bloque le PREMIER commit de la conversation
//     (stderr + exit 2, marqueur .git/) — c'est le seul canal vers l'agent.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

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

const isCascade = typeof payload.agent_action_name === "string";
const command = String(
  payload.tool_input?.command ?? payload.tool_info?.command_line ?? "",
);
if (!command) process.exit(0);

// Détecte `git commit` même dans une commande chaînée (git add … && git commit)
// ou avec des options git (`git -C dir commit`), sans confondre `git log
// --grep=commit` : « commit » doit être le sous-commande, pas un mot du message.
const isCommit = command
  .split(/&&|\|\||;/)
  .some((segment) => /\bgit\s+(?:-[^\s]+\s+)*commit\b/.test(segment));
if (!isCommit) process.exit(0);

const reminder =
  "RAPPEL VÉRIFICATION (avant ce commit, règle du cours) : consulte et applique " +
  ".check/VERIFICATION.md — checklist : git status sans fichier parasite, " +
  "concept validé si src/ touché, `pnpm check` à 100 %, message Conventional " +
  "Commits en français, jamais --no-verify. Après le push : CI verte " +
  "(`gh run watch`). Un refus de hook = corriger la cause, jamais contourner.";

// Cascade : pas d'injection de contexte non bloquante → on bloque UNE fois par
// conversation (trajectory_id) avec la consigne, puis on laisse passer.
if (isCascade) {
  try {
    const traj = String(payload.trajectory_id ?? "default").replace(
      /[^\w-]/g,
      "_",
    );
    const marker = `.git/ihecs-check-reminded-${traj}`;
    if (!existsSync(marker)) {
      writeFileSync(marker, new Date().toISOString());
      console.error(
        `${reminder} Lis .check/VERIFICATION.md, puis relance le commit.`,
      );
      process.exit(2);
    }
  } catch {
    // Marqueur impossible (worktree, .git en fichier) : on laisse passer.
  }
  process.exit(0);
}

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext: reminder,
    },
  }),
);
process.exit(0);
