// Hook Devin PreToolUse(exec) — à chaque commande `git commit`, injecte dans
// le contexte de l'agent un rappel : consulter et appliquer la procédure de
// vérification `.check/VERIFICATION.md` AVANT de commiter. Ne bloque jamais
// (exit 0) : les refus éventuels restent le rôle des hooks git et des gardes.
import { readFileSync } from "node:fs";

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

const command = String(payload.tool_input?.command ?? "");
if (!command) process.exit(0);

// Détecte `git commit` même dans une commande chaînée (git add … && git commit)
// ou avec des options git (`git -C dir commit`), sans confondre `git log
// --grep=commit` : « commit » doit être le sous-commande, pas un mot du message.
const isCommit = command
  .split(/&&|\|\||;/)
  .some((segment) => /\bgit\s+(?:-[^\s]+\s+)*commit\b/.test(segment));
if (!isCommit) process.exit(0);

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext:
        "RAPPEL VÉRIFICATION (avant ce commit, règle du cours) : consulte et applique " +
        ".check/VERIFICATION.md — checklist : git status sans fichier parasite, " +
        "concept validé si src/ touché, `pnpm check` à 100 %, message Conventional " +
        "Commits en français, jamais --no-verify. Après le push : CI verte " +
        "(`gh run watch`). Un refus de hook = corriger la cause, jamais contourner.",
    },
  }),
);
process.exit(0);
