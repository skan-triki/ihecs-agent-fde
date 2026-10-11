// Hook Devin PreToolUse(exec) — bloque les commandes interdites par le cours
// et l'ajout de composants tant que le concept MVP n'est pas validé.
// Sortie code 2 = action bloquée, `reason` remontée à l'agent.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

let input = "";
try {
  input = readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let payload = {};
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

// Deux runtimes servis : Devin CLI (hooks.v1.json — payload `tool_input`,
// blocage via JSON `decision:"block"`) et Cascade/Windsurf (hooks.json —
// payload `tool_info`, blocage via stderr + exit 2).
const isCascade = typeof payload.agent_action_name === "string";
const command = String(
  payload.tool_input?.command ?? payload.tool_info?.command_line ?? "",
);
if (!command) process.exit(0);

const block = (reason) => {
  if (isCascade) console.error(reason);
  else console.log(JSON.stringify({ decision: "block", reason }));
  process.exit(2);
};

// CONCEPT AVANT CODE : bloquer l'installation de composants UI (shadcn add)
// tant que le concept MVP n'est pas validé dans .concept/MVP.md.
if (/\bshadcn\s+(add|create)\b/.test(command)) {
  const concept = spawnSync(
    process.execPath,
    ["scripts/check-concept.mjs", "--quiet"],
    { encoding: "utf8", timeout: 10_000 },
  );
  if (concept.status !== 0) {
    block(
      "Verrou « concept avant code » : on n'installe pas de composants avant d'avoir défini le MVP. Lance le skill /concept avec l'étudiant (interview guidée qui remplit .concept/MVP.md), puis valide avec `pnpm concept:check`.",
    );
  }
}

// npm : autorisé UNIQUEMENT pour les installations globales d'outils (-g) et
// l'affichage de version. Le reste (npm install local, npm run…) reste interdit :
// le projet utilise pnpm.
const npmSegmentForbidden = command.split(/&&|\|\||;|\||&/).some((segment) => {
  const seg = segment.trim();
  if (!/^npm\b/.test(seg)) return false;
  const globalInstall = /^npm\s+(install|i)\b[^\n]*\s(-g|--global)\b/;
  const versionOnly = /^npm\s+(-v|--version)$/;
  return !(globalInstall.test(seg) || versionOnly.test(seg));
});

const rules = [
  ...(npmSegmentForbidden
    ? [
        {
          re: /.*/,
          reason:
            "npm est interdit pour ce projet : utilisez pnpm (ex. `pnpm add`, `pnpm dev`). Seules les installations globales d'outils (`npm i -g <outil>`) sont tolérées.",
        },
      ]
    : []),
  {
    re: /(^|[\s(&|;])yarn(\s|\b)/,
    reason:
      "yarn est interdit dans ce cours : utilisez pnpm (ex. `pnpm add`, `pnpm dev`).",
  },
  {
    re: /(^|[\s(&|;])npx\s/,
    reason:
      "npx est interdit : préférez `pnpm exec <cmd>` ou `pnpm dlx <pkg>` (version figée).",
  },
  {
    re: /(^|[\s(&|;])(bun|bunx)\s/,
    reason: "bun est interdit dans ce cours : utilisez pnpm.",
  },
  {
    re: /--no-verify/,
    reason:
      "Contourner les hooks git (--no-verify) est interdit : corrigez la cause de l'échec.",
  },
  {
    re: /git\s+push\s+.*(--force|-f)\b/,
    reason:
      "Le force push est interdit : faites un commit de fix ou demandez à l'enseignant.",
  },
  {
    re: /git\s+reset\s+--hard/,
    reason:
      "`git reset --hard` détruit le travail non commité : interdit. Préférez `git restore <fichier>` fichier par fichier.",
  },
  {
    re: /git\s+(checkout\s+--|clean\s+-[a-z]*f)/,
    reason:
      "Commande destructive pour le travail local : interdite. Demandez à l'étudiant.",
  },
  {
    re: /vercel\s+(domains|alias)\b/,
    reason:
      "Les noms de domaine personnalisés sont interdits dans ce cours : le MVP vit sur *.vercel.app.",
  },
  {
    re: /(^|\s)(([A-Za-z]:)?[\\/][^\s'"`]*|[."\\/])?\.(env|env\.local|env\.development\.local|env\.production\.local|env\.test\.local)\b(?!\.example)/,
    reason:
      "Lire ou écrire directement un fichier `.env*` de secrets est interdit : passez par `vercel env pull .env.local`, `vercel env add`, ou demandez à l'étudiant de le faire lui-même.",
  },
];

const hit = rules.find((rule) => rule.re.test(command));
if (hit) block(`${hit.reason} [garde-fou du cours]`);

process.exit(0);
