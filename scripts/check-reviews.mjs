// Contrôle des revues code indépendantes (.reviews/<axe>.md) — exigées avant
// toute livraison : les 3 axes (fidelite, qualite, ux) doivent être « validé »
// sur le commit courant. Utilisé par `pnpm review:check` ; le verrou effectif
// est dans guard-exec.mjs (push / PR / fusion).
import { codeReviewErrors } from "./lib/review.mjs";

const errors = codeReviewErrors();

if (errors.length > 0) {
  console.error("✗ Revues code incomplètes :");
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    "\nRappel : la livraison (push, PR, fusion) est bloquée tant que les 3 relecteurs n'ont pas validé le commit courant. Utilise le skill /ship.",
  );
  process.exit(1);
}

console.log("✓ Revues code validées pour le commit courant (.reviews/).");
process.exit(0);
