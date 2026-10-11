// Hook Devin PreToolUse(exec) — bloque les commandes interdites par le cours.
// Sortie code 2 = action bloquée, `reason` remontée à l'agent.
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

const command = String(payload.tool_input?.command ?? "");
if (!command) process.exit(0);

const rules = [
  {
    re: /(^|[\s(&|;])npm(\s|exec|install|i|add|run|create|publish|ci)/,
    reason:
      "npm est interdit dans ce cours : utilisez pnpm (ex. `pnpm add`, `pnpm dev`).",
  },
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
if (hit) {
  console.log(
    JSON.stringify({ decision: "block", reason: `${hit.reason} [garde-fou du cours]` }),
  );
  process.exit(2);
}

process.exit(0);
