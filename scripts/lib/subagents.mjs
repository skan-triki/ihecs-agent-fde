// Journal d'audit des sous-agents : .git/ihecs-subagents.log est créé à
// l'ouverture de session (hook Devin SessionStart) puis alimenté par le hook
// PostToolUse(run_subagent), qui note aussi le commit courant à chaque
// lancement. Les contrôles exigent que les lancements COUVRENT le périmètre
// relu — un lancement dont le code a changé depuis ne vaut plus.
// (Cascade n'a pas de hook équivalent : le journal n'y existe pas et le
// contrôle est alors ignoré — limite assumée, documentée aux relecteurs.
// Passage Devin → Cascade en cours de projet : un journal restant d'une
// ancienne session peut bloquer ; le supprimer à la main le désactive.)
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const SUBAGENT_LOG = ".git/ihecs-subagents.log";

// Vrai si le journal existe (= environnement avec hooks Devin actifs).
const subagentLogActive = () => existsSync(SUBAGENT_LOG);

// Couverture de relecture : ≥3 lancements du profil sur un commit ancêtre
// (ou HEAD) tel que `git diff` ne signale AUCUNE modification des chemins
// donnés depuis ce commit — modifications non commitées comprises.
// « Le code relu est toujours le code présent » : un commit de documentation
// (ex. celui qui ajoute .reviews/) ne périme pas les relectures, mais toute
// retouche du périmètre relu si.
// Retour : null si le journal est inactif (contrôle désactivé), sinon booléen.
export const launchesCover = (profile, paths) => {
  if (!subagentLogActive()) return null;
  const counts = new Map();
  for (const l of readFileSync(SUBAGENT_LOG, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)) {
    try {
      const e = JSON.parse(l);
      if (e?.profile === profile && typeof e?.commit === "string" && e.commit) {
        counts.set(e.commit, (counts.get(e.commit) ?? 0) + 1);
      }
    } catch {
      // Ligne corrompue : ignorée.
    }
  }
  for (const [commit, n] of counts) {
    if (n < 3) continue;
    const ancestor =
      spawnSync("git", ["merge-base", "--is-ancestor", commit, "HEAD"])
        .status === 0;
    if (!ancestor) continue;
    // `git diff <commit> -- <paths>` compare le commit à l'arbre de travail :
    // une modification non commitée du périmètre relu invalide la couverture.
    if (
      spawnSync("git", ["diff", "--quiet", commit, "--", ...paths]).status === 0
    ) {
      return true;
    }
  }
  return false;
};
