// Hook UserPromptSubmit — arme la « porte du plan » à chaque message de
// l'étudiant : tant que le marqueur existe, guard-edit refuse toute écriture
// dans src/ ou public/. L'agent le désarme en énonçant ce qu'il va faire :
// `pnpm plan:ack "<plan ou questions, ≥20 caractères>"`.
// (Cascade n'a pas cet événement : le marqueur n'y est jamais créé et la
// porte reste inactive — limite assumée, comme le journal des sous-agents.)
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { planPendingPath } from "../lib/diff.mjs";

// On consomme le payload sans l'utiliser : certains harnais de hooks
// envoient l'entrée après coup et un stdin non lu peut casser le tuyau.
try {
  readFileSync(0, "utf8");
} catch {
  // stdin indisponible : on continue quand même.
}

// Hors dépôt git : rien à armer (le contrôle désamorce tout seul).
if (existsSync(".git")) {
  writeFileSync(planPendingPath(), `${new Date().toISOString()}\n`);
}
process.exit(0);
