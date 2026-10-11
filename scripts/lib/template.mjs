// Identité du dépôt modèle (template) du cours. Les contrôles « dépôt
// étudiant » (concept obligatoire, intégrité des règles) ne s'appliquent pas
// au template lui-même, qui n'a pas de concept et dont les règles évoluent.
import { spawnSync } from "node:child_process";

const TEMPLATE_OWNER = "skan-triki";
const TEMPLATE_REPO = "ihecs-mvp-starter";
export const TEMPLATE_URL = `https://github.com/${TEMPLATE_OWNER}/${TEMPLATE_REPO}.git`;

// Fichiers et dossiers de règles : ils doivent rester IDENTIQUES à ceux du
// template dans chaque dépôt étudiant (vérifié par check-integrity.mjs).
export const RULE_DIRS = [
  "scripts",
  ".husky",
  ".github",
  ".check",
  ".devin/agents",
  ".devin/skills",
  ".devin/workflows",
];
export const RULE_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
  ".devin/config.json",
  ".devin/hooks.json",
  ".devin/hooks.v1.json",
  "eslint.config.mjs",
  "prettier.config.mjs",
  "commitlint.config.mjs",
  "lint-staged.config.mjs",
  "tsconfig.json",
  "knip.json",
  "pnpm-workspace.yaml",
  "vercel.json",
  ".npmrc",
  ".nvmrc",
  ".gitignore",
  ".prettierignore",
];
// Dans package.json, seules ces clés font partie des règles (les dépendances
// et le nom du projet appartiennent à l'étudiant).
export const PACKAGE_RULE_KEYS = ["scripts", "engines", "packageManager"];

const sameRepo = (owner, repo) =>
  owner?.toLowerCase() === TEMPLATE_OWNER &&
  repo?.toLowerCase() === TEMPLATE_REPO;

// Vrai si l'on s'exécute dans le template (CI GitHub, build Vercel ou poste local).
export const isTemplateRepo = () => {
  const gh = process.env.GITHUB_REPOSITORY;
  if (gh) {
    const [owner, repo] = gh.split("/");
    return sameRepo(owner, repo);
  }
  if (process.env.VERCEL_GIT_REPO_SLUG) {
    return sameRepo(
      process.env.VERCEL_GIT_REPO_OWNER,
      process.env.VERCEL_GIT_REPO_SLUG,
    );
  }
  const r = spawnSync("git", ["remote", "get-url", "origin"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const m = /github\.com[/:]([^/]+)\/([^/.\s]+)/.exec(String(r.stdout ?? ""));
  return m ? sameRepo(m[1], m[2]) : false;
};
