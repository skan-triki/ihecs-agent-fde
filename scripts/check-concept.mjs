// Vérification mécanique du concept MVP (.concept/MVP.md).
// Utilisé par :
//   - `pnpm concept:check` (manuel / agent)
//   - le hook pre-commit (mode --staged : bloque un commit qui touche src/
//     tant que le concept n'est pas validé)
//   - les hooks Devin guard-edit / guard-exec / stop-gate (mode --quiet).
//
// Verrous (logique partagée dans scripts/lib/concept.mjs) :
//   - « étape par étape » : les 12 étapes de « Progression de l'interview »
//     doivent être TOUTES cochées et la ligne « > Étape : 12/12 » à jour ;
//   - « avocat du diable » : chaque section doit porter une ligne
//     « > Challenge : <objection> → <décision> » remplie ;
//   - « revue qualité » : les 3 sous-agents relecteurs (questionnement,
//     couverture, pedagogie) doivent avoir écrit leur revue à mi-parcours ET
//     un verdict « validé » à la finale (.concept/reviews/) ;
//   - chaque section doit contenir du vrai contenu (pas d'EXEMPLE).
// En cas d'échec, la première étape incomplète est nommée.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import {
  conceptTextErrors,
  journalFileErrors,
  reviewFileErrors,
  syntheseMarkdown,
} from "./lib/concept.mjs";
import { isTemplateRepo } from "./lib/template.mjs";

const args = process.argv.slice(2);
const quiet = args.includes("--quiet");
const staged = args.includes("--staged");

// Build Vercel / CI : le template n'a pas de concept, seuls les dépôts
// étudiants sont contrôlés.
if (args.includes("--skip-template") && isTemplateRepo()) {
  if (!quiet)
    console.log("✓ Concept MVP : dépôt modèle (contrôle non applicable).");
  process.exit(0);
}

// Bypass enseignant : identique à celui de guard-edit. Le concept reste honnête
// via `pnpm concept:check` (sans --staged), mais un mainteneur du template peut
// versionner le code applicatif du starter avant que le concept ne soit rempli.
if (staged && process.env.IHECS_TEACHER_BYPASS === "true") process.exit(0);

if (staged) {
  const diff = spawnSync("git", ["diff", "--cached", "--name-only"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const srcStaged = String(diff.stdout ?? "")
    .split(/\r?\n/)
    .some((f) => /^src\//.test(f));
  if (!srcStaged) process.exit(0);
}

const errors = [];

if (!existsSync(".concept/MVP.md")) {
  errors.push(
    "Le fichier .concept/MVP.md n'existe pas : lance le skill /concept avec ton agent pour rédiger le concept du MVP.",
  );
} else {
  const raw = readFileSync(".concept/MVP.md", "utf8");
  errors.push(
    ...conceptTextErrors(raw),
    ...reviewFileErrors(),
    ...journalFileErrors(),
  );
}

if (errors.length > 0) {
  if (!quiet) {
    console.error("✗ Concept MVP non validé :");
    for (const e of errors) console.error(`  - ${e}`);
    console.error(
      "\nRappel : aucun code applicatif (src/) n'est accepté tant que le concept n'est pas validé. Utilise le skill /concept.",
    );
  }
  process.exit(1);
}

// Validation réussie → la synthèse est compilée automatiquement (document
// d'une page pour l'étudiant et l'enseignant : concept, objections, revues).
writeFileSync(".concept/SYNTHESE.md", syntheseMarkdown());
if (!quiet)
  console.log(
    "✓ Concept MVP validé (.concept/MVP.md). Synthèse compilée : .concept/SYNTHESE.md.",
  );
process.exit(0);
