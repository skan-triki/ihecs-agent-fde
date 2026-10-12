// Revues code indépendantes exigées avant toute livraison : .reviews/<axe>.md
// écrits par les sous-agents `code-review`, avec verdict « validé » portant sur
// le commit COURANT (le SHA HEAD y est inscrit — tout nouveau commit rend la
// revue obsolète et exige une nouvelle relecture).
// Utilisé par scripts/check-reviews.mjs (`pnpm review:check`) et par le hook
// guard-exec.mjs (blocage de push / gh pr create / gh pr merge).
import { existsSync, readFileSync } from "node:fs";

import {
  headSha,
  subagentLaunchesAt,
  subagentLogActive,
} from "./subagents.mjs";

const CODE_AXES = ["fidelite", "qualite", "ux"];

const field = (raw, name) => {
  const m = new RegExp(
    `${name}[^\\S\\r\\n]*:[^\\S\\r\\n]*([^\\r\\n]+)`,
    "i",
  ).exec(raw);
  return m ? m[1].trim() : "";
};

export const codeReviewErrors = () => {
  const errors = [];
  const sha = headSha();
  // Preuve de lancement : 3 relecteurs (un par axe) doivent avoir été lancés
  // SUR CE commit — un lancement ancien ne vaut plus après un nouveau commit.
  if (subagentLogActive() && subagentLaunchesAt("code-review", sha) < 3) {
    errors.push(
      "Les 3 sous-agents `code-review` n'ont pas été lancés sur ce commit — les revues doivent venir de relecteurs indépendants (run_subagent) sur l'état actuel du code, pas d'un fichier écrit à la main ni d'une relecture d'un ancien commit. (Changement d'IDE en cours de projet : supprime `.git/ihecs-subagents.log` pour désactiver cette preuve.)",
    );
  }
  for (const axis of CODE_AXES) {
    const path = `.reviews/${axis}.md`;
    if (!existsSync(path)) {
      errors.push(
        `Revue code manquante : ${path} — lance les 3 sous-agents relecteurs en parallèle (sas de revue code, skill /ship).`,
      );
      continue;
    }
    const raw = readFileSync(path, "utf8");
    const commit = field(raw, "commit");
    if (sha && commit !== sha) {
      errors.push(
        `Revue ${path} : elle porte sur un autre commit (${commit.slice(0, 7) || "?"} ≠ ${sha.slice(0, 7)}) — le code a changé depuis, relance ce relecteur.`,
      );
      continue;
    }
    const verdict = field(raw, "verdict");
    if (!/^validé/i.test(verdict)) {
      errors.push(
        `Revue ${path} : verdict « ${verdict || "?"} » au lieu de « validé » — applique le feedback avec l'étudiant, puis relance ce relecteur.`,
      );
    }
  }
  return errors;
};
