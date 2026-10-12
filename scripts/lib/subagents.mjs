// Journal d'audit des sous-agents : .git/ihecs-subagents.log est créé à
// l'ouverture de session (hook Devin SessionStart) puis alimenté par le hook
// PostToolUse(run_subagent), qui note aussi le commit courant à chaque
// lancement. Les contrôles exigent des lancements SUR le commit relu — un
// lancement ancien ne vaut pas pour un nouveau commit.
// (Cascade n'a pas de hook équivalent : le journal n'y existe pas et le
// contrôle est alors ignoré — limite assumée, documentée aux relecteurs.
// Passage Devin → Cascade en cours de projet : un journal restant d'une
// ancienne session peut bloquer ; le supprimer à la main le désactive.)
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const SUBAGENT_LOG = ".git/ihecs-subagents.log";

// Vrai si le journal existe (= environnement avec hooks Devin actifs).
export const subagentLogActive = () => existsSync(SUBAGENT_LOG);

// SHA du commit courant ("" hors dépôt git).
export const headSha = () =>
  String(
    spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).stdout ?? "",
  ).trim();

// Nombre de lancements du profil enregistrés sur le commit donné.
export const subagentLaunchesAt = (profile, commit) => {
  if (!existsSync(SUBAGENT_LOG)) return 0;
  return readFileSync(SUBAGENT_LOG, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(
      (e) =>
        e?.profile === profile &&
        // Compatibilité : les entrées sans champ « commit » (avant le
        // tampon SHA) ne valent pour rien — elles ne prouvent pas que la
        // relecture porte sur le commit relu.
        e?.commit === commit,
    ).length;
};
