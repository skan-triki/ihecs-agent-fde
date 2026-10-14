// Revues code indépendantes exigées avant toute livraison : .reviews/<axe>.md
// écrits par les sous-agents `code-review`, avec verdict « validé » portant sur
// le commit COURANT (le SHA HEAD y est inscrit — tout nouveau commit rend la
// revue obsolète et exige une nouvelle relecture).
// Utilisé par scripts/check-reviews.mjs (`pnpm review:check`) et par le hook
// guard-exec.mjs (blocage de push / gh pr create / gh pr merge).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { launchesCover } from "./subagents.mjs";

// Périmètre relu par les relecteurs `code-review` : le code produit.
const PRODUCT = ["src/", "public/"];

// Le commit cité par une revue reste valide tant qu'il est un ancêtre de
// HEAD (ou HEAD lui-même) ET que le code produit n'a pas changé depuis —
// commit de doc (ex. celui qui ajoute .reviews/) compris : c'est ce qui
// permet de commiter les verdicts sans invalider les revues qu'ils contiennent.
const coversCurrentCode = (commit) =>
  /^[0-9a-f]{7,40}$/i.test(commit) &&
  spawnSync("git", ["merge-base", "--is-ancestor", commit, "HEAD"]).status ===
    0 &&
  spawnSync("git", ["diff", "--quiet", commit, "--", ...PRODUCT]).status === 0;

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
  // Preuve de lancement : 3 relecteurs (un par axe) doivent avoir été lancés
  // sur un commit ancêtre depuis lequel src/ et public/ n'ont pas bougé —
  // une relecture faite puis retouchée ne vaut plus.
  if (launchesCover("code-review", PRODUCT) === false) {
    errors.push(
      "Les 3 sous-agents `code-review` n'ont pas été lancés sur l'état actuel du code — les revues doivent venir de relecteurs indépendants (run_subagent) sur l'état actuel de src/ et public/, pas d'un fichier écrit à la main ni d'une relecture périmée. (Changement d'IDE en cours de projet : supprime `.git/ihecs-subagents.log` pour désactiver cette preuve.)",
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
    if (!coversCurrentCode(commit)) {
      errors.push(
        `Revue ${path} : elle porte sur un commit (${commit.slice(0, 7) || "?"}) depuis lequel src/ ou public/ a changé — le code relu n'est plus le code présent, relance ce relecteur.`,
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
