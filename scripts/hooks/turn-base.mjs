// Hook UserPromptSubmit — fige l'empreinte de l'arbre de travail au début du
// tour dans `.git/ihecs-turn-base`. En fin de tour, stop-gate la compare :
// si rien n'a bougé depuis le message de l'étudiant (tour « parole seule »),
// les contrôles lourds (lint, types, tests) n'ont pas à rejouer.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { turnBasePath, turnFingerprint } from "../lib/diff.mjs";

try {
  readFileSync(0, "utf8");
} catch {
  // stdin indisponible : on continue quand même.
}

if (existsSync(".git")) {
  const fp = turnFingerprint();
  if (fp) writeFileSync(turnBasePath(), `${fp}\n`);
}
process.exit(0);
