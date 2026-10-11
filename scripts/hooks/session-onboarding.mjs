// Hook Devin SessionStart — sonde l'environnement de l'étudiant (outils, repo, Vercel)
// et injecte un contexte d'accompagnement pour que l'agent guide l'étudiant
// dès son premier message, sans refaire ces vérifications lui-même.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const IS_WIN = process.platform === "win32";

// Sur Windows, pnpm/vercel sont des .cmd : il faut passer par le shell.
const probe = (cmd, args) =>
  new Promise((resolve) => {
    const child = IS_WIN
      ? spawn(`${cmd} ${args.join(" ")}`, {
          shell: true,
          windowsHide: true,
          timeout: 6000,
        })
      : spawn(cmd, args, { timeout: 6000 });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d;
    });
    child.on("error", () => resolve(null));
    child.on("close", (code) =>
      resolve(code === 0 ? out.split(/\r?\n/)[0]?.trim() || "ok" : null),
    );
  });

const [node, pnpm, git, gh, vercel, origin] = await Promise.all([
  probe("node", ["--version"]),
  probe("pnpm", ["--version"]),
  probe("git", ["--version"]),
  probe("gh", ["--version"]),
  probe("vercel", ["--version"]),
  probe("git", ["remote", "get-url", "origin"]),
]);

const versionOf = (v) => v?.match(/\d+\.\d+(\.\d+)?/)?.[0] ?? null;
const line = (label, value) =>
  `${label} : ${value ? `✅ ${value}` : "❌ ABSENT"}`;

const context = [
  "=== ÉTAT ONBOARDING (généré automatiquement à l'ouverture de la session) ===",
  line("Node.js", versionOf(node)),
  line("pnpm", versionOf(pnpm)),
  line("Git", versionOf(git)),
  line("GitHub CLI", versionOf(gh)),
  line("Vercel CLI", versionOf(vercel)),
  `Dépendances (node_modules) : ${existsSync("node_modules") ? "✅ installées" : "❌ absentes (pnpm install requis)"}`,
  `Fichier .env.local : ${existsSync(".env.local") ? "✅ présent" : "❌ absent"}`,
  `Repo GitHub (remote origin) : ${origin ? `✅ ${origin}` : "❌ non lié"}`,
  `Projet Vercel (.vercel/) : ${existsSync(".vercel/project.json") ? "✅ lié" : "❌ non lié"}`,
  "",
  "DIRECTIVES TUTORAT (applique-les dès le premier message de l'étudiant) :",
  "1. Langage : réponds toujours en français simple, sans jargon, en tutoyant l'étudiant (règle absolue — voir AGENTS.md ; un rappel est aussi réinjecté à chaque message).",
  "2. Accueille brièvement et propose l'étape suivante adaptée à l'état ci-dessus.",
  "3. Un outil est ❌ ABSENT → exécute immédiatement le skill /install-tools (tu installes tout, l'étudiant approuve ; seuls gh auth login / vercel login restent à lui).",
  "4. Outils ✅ mais repo/Vercel ❌ → propose /bootstrap.",
  "5. Tout est ✅ → réponds directement à sa demande ; rappelle /quality-check (pendant le dev) et /ship (pour livrer) quand c'est pertinent.",
  "6. Ne refais pas ces vérifications manuellement : ce contexte vient d'être généré. Ne le recopie pas intégralement dans ta réponse.",
].join("\n");

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: context,
    },
  }),
);
