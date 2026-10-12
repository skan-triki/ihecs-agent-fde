// Diagnostic unique de l'environnement étudiant — utilisé par :
//   - le hook Devin SessionStart (sortie JSON additionalContext) ;
//   - l'agent lui-même sous Cascade (`--human`, aucun hook de session) ;
//   - `pnpm diagnostic` (`--human --strict` : code 1 si l'environnement n'est pas prêt),
//     critère de fin de /install-tools et pré-requis de /bootstrap.
// Il vérifie les versions minimales, les connexions GitHub/Vercel, les
// dépendances, le concept MVP (via check-concept.mjs, même verdict que les
// verrous) et CALCULE la prochaine étape, pour que l'accueil soit déterministe.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const IS_WIN = process.platform === "win32";
const args = process.argv.slice(2);
const human = args.includes("--human");
const strict = args.includes("--strict");

// Journal d'audit des sous-agents : sa seule existence (créée ici, sous les
// hooks Devin) active l'exigence « les relecteurs ont réellement été lancés ».
// Sous Cascade (pas de hook SessionStart), le fichier n'existe pas et cette
// exigence est ignorée — limite assumée et documentée.
try {
  if (!existsSync(".git/ihecs-subagents.log"))
    writeFileSync(".git/ihecs-subagents.log", "", "utf8");
} catch {
  // Pas de dépôt git : on ne bloque jamais le diagnostic.
}

// Sur Windows, pnpm/vercel sont des .cmd : il faut passer par le shell.
const probe = (cmd, cmdArgs, timeout = 8000) =>
  new Promise((resolve) => {
    const child = IS_WIN
      ? spawn(`${cmd} ${cmdArgs.join(" ")}`, {
          shell: true,
          windowsHide: true,
          timeout,
        })
      : spawn(cmd, cmdArgs, { timeout });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d;
    });
    child.on("error", () => resolve(null));
    child.on("close", (code) =>
      resolve(code === 0 ? out.split(/\r?\n/)[0]?.trim() || "ok" : null),
    );
  });

const [node, pnpm, git, gh, vercel, origin, ghAuth, vercelUser] =
  await Promise.all([
    probe("node", ["--version"]),
    probe("pnpm", ["--version"]),
    probe("git", ["--version"]),
    probe("gh", ["--version"]),
    probe("vercel", ["--version"]),
    probe("git", ["remote", "get-url", "origin"]),
    probe("gh", ["auth", "status"]),
    probe("vercel", ["whoami"], 15_000),
  ]);

const versionOf = (v) => v?.match(/\d+\.\d+(\.\d+)?/)?.[0] ?? null;
const major = (v) => Number(versionOf(v)?.split(".")[0] ?? 0);

// Concept : même verdict que les verrous (guard-edit, stop-gate, pre-commit).
const conceptValid =
  spawnSync(process.execPath, ["scripts/check-concept.mjs", "--quiet"], {
    timeout: 10_000,
  }).status === 0;

const checks = {
  node: node !== null && major(node) >= 24,
  pnpm: pnpm !== null && major(pnpm) >= 10,
  git: git !== null,
  gh: gh !== null,
  vercel: vercel !== null,
  ghAuth: ghAuth !== null,
  vercelAuth: vercelUser !== null,
  deps: existsSync("node_modules/.modules.yaml"),
  envLocal: existsSync(".env.local"),
  origin: origin !== null,
  vercelLinked: existsSync(".vercel/project.json"),
  concept: conceptValid,
};

const tool = (label, raw, ok, min) => {
  if (raw === null) return `${label} : ❌ ABSENT`;
  const v = versionOf(raw);
  return ok
    ? `${label} : ✅ ${v}`
    : `${label} : ❌ ${v} — trop ancien (minimum ${min})`;
};

const toolsOk =
  checks.node && checks.pnpm && checks.git && checks.gh && checks.vercel;
const authOk = checks.ghAuth && checks.vercelAuth;
const envReady = toolsOk && checks.deps && checks.envLocal && authOk;

const logins = [
  checks.ghAuth ? null : "`gh auth login`",
  checks.vercelAuth ? null : "`vercel login`",
]
  .filter(Boolean)
  .join(" puis ");

// Prochaine étape calculée (ordre strict, première condition vraie) : l'agent
// n'a pas à la deviner.
const steps = [
  [!toolsOk, "/install-tools — installer les outils manquants"],
  [
    !checks.deps || !checks.envLocal,
    "/install-tools — finir la préparation (pnpm install, .env.local)",
  ],
  [
    !authOk,
    `connexion de l'étudiant : ${logins} (à lancer par l'étudiant dans le terminal)`,
  ],
  [
    !checks.origin || !checks.vercelLinked,
    "/bootstrap — mettre le projet sur GitHub et en ligne sur Vercel",
  ],
  [!checks.concept, "/concept — définir le MVP (obligatoire avant tout code)"],
];
const next =
  steps.find(([todo]) => todo)?.[1] ??
  "aucune — tout est prêt : réponds à la demande de l'étudiant";

const authLine = (installed, ok, okText, login) => {
  if (!installed) return "— (outil absent)";
  return ok ? `✅ ${okText}` : `❌ non connecté → \`${login}\``;
};

const context = [
  "=== ÉTAT ONBOARDING (diagnostic automatique) ===",
  tool("Node.js", node, checks.node, "24"),
  tool("pnpm", pnpm, checks.pnpm, "10"),
  tool("Git", git, checks.git),
  tool("GitHub CLI", gh, checks.gh),
  tool("Vercel CLI", vercel, checks.vercel),
  `Connexion GitHub (gh auth status) : ${authLine(checks.gh, checks.ghAuth, "connecté", "gh auth login")}`,
  `Connexion Vercel (vercel whoami) : ${authLine(checks.vercel, checks.vercelAuth, String(vercelUser), "vercel login")}`,
  `Dépendances (node_modules) : ${checks.deps ? "✅ installées" : "❌ absentes (pnpm install requis)"}`,
  `Fichier .env.local : ${checks.envLocal ? "✅ présent" : "❌ absent (copie de .env.example requise)"}`,
  `Repo GitHub (remote origin) : ${checks.origin ? `✅ ${origin}` : "❌ non lié"}`,
  `Projet Vercel (.vercel/) : ${checks.vercelLinked ? "✅ lié" : "❌ non lié"}`,
  `Concept MVP (.concept/MVP.md) : ${checks.concept ? "✅ validé" : "❌ à définir (verrou : aucun code applicatif possible avant validation)"}`,
  "",
  `➡️ PROCHAINE ÉTAPE : ${next}`,
  "",
  "DIRECTIVES TUTORAT (applique-les dès le premier message de l'étudiant) :",
  "1. Langage : français simple, sans jargon, tutoiement (règle absolue — voir AGENTS.md).",
  "2. Premier message : salue l'étudiant en 1 phrase, résume son état en 2-3 puces simples (ce qui est prêt / ce qui manque), puis propose UNIQUEMENT la PROCHAINE ÉTAPE ci-dessus et demande son accord. Ne liste pas tout le diagnostic.",
  "3. Si sa demande contredit l'ordre (ex. coder sans concept) : explique gentiment pourquoi on fait d'abord la prochaine étape, puis propose-la.",
  "4. Avant TOUT commit : applique la procédure .check/VERIFICATION.md.",
  "5. Pour revérifier plus tard : `pnpm diagnostic`. Ne recopie pas ce contexte dans ta réponse.",
].join("\n");

if (human) {
  console.log(context);
  process.exit(strict && !envReady ? 1 : 0);
}

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: context,
    },
  }),
);
