// Porte du plan — `pnpm plan:ack "<plan ou questions>"` désarme le marqueur
// armé à chaque message de l'étudiant et autorise l'écriture dans src/ et
// public/. Le texte sert de trace (`.git/ihecs-plan-ack.log`) : énoncer ce
// qu'on va faire AVANT de coder, c'est la discipline que la porte impose.
import { appendFileSync, existsSync, rmSync } from "node:fs";

import { planAckPath, planPendingPath } from "./lib/diff.mjs";

const text = process.argv.slice(2).join(" ").trim();
if (text.length < 20) {
  console.error(
    '✗ Plan trop court : énonce en une phrase ce que tu vas faire — ou les questions à poser à l\'étudiant. Exemple : pnpm plan:ack "créer la page profil avec un formulaire nom/email puis la Server Action saveProfile"',
  );
  process.exit(1);
}

if (existsSync(".git")) {
  appendFileSync(
    planAckPath(),
    `${JSON.stringify({ ts: new Date().toISOString(), plan: text })}\n`,
  );
  rmSync(planPendingPath(), { force: true });
}

console.log("✓ Plan enregistré — écriture dans src/ et public/ autorisée.");
process.exit(0);
