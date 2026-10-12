// Journal d'audit des sous-agents : .git/ihecs-subagents.log est créé à
// l'ouverture de session (hook Devin SessionStart) puis alimenté par le hook
// PostToolUse(run_subagent). Sert à exiger que les relecteurs aient réellement
// été lancés — sinon un agent paresseux pourrait écrire un faux verdict.
// (Cascade n'a pas de hook équivalent : le journal n'y existe pas et le
// contrôle est alors ignoré — limite assumée, documentée aux relecteurs.)
import { existsSync, readFileSync } from "node:fs";

const SUBAGENT_LOG = ".git/ihecs-subagents.log";

// Vrai si le journal existe (= environnement avec hooks Devin actifs).
export const subagentLogActive = () => existsSync(SUBAGENT_LOG);

// Vrai si au moins un sous-agent du profil donné a été lancé dans ce dépôt.
export const subagentRan = (profile) => {
  if (!existsSync(SUBAGENT_LOG)) return false;
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
    .some((e) => e?.profile === profile);
};
