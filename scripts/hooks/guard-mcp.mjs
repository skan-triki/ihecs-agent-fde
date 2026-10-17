// Hook Devin PreToolUse(mcp_call_tool | mcp__<serveur>__<outil>) — les
// serveurs MCP externes ne passent pas par la liste blanche des commandes :
// un `vercel promote` en commande est refusé par guard-exec mais le même acte
// via un outil MCP ne toucherait aucun autre garde. Ce hook impose donc une
// politique « lecture seule » par serveur : les actions (déployer, promouvoir,
// écrire une variable ou un domaine, installer un composant) passent par les
// commandes CLI autorisées — là où les verrous du cours s'appliquent.
// Sortie code 2 = appel bloqué, `reason` remontée à l'agent.
// (Cascade/Windsurf n'a pas d'événement hook équivalent : rien à brancher.)
import { readFileSync } from "node:fs";

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

// Bypass enseignant : identique aux autres gardes (l'agent ne peut pas le
// poser lui-même — toute mention dans une commande est refusée).
if (process.env.IHECS_TEACHER_BYPASS === "true") process.exit(0);

const isCascade = typeof payload.agent_action_name === "string";
const block = (reason) => {
  const msg = `${reason} [garde-fou du cours]`;
  if (isCascade) console.error(msg);
  else console.log(JSON.stringify({ decision: "block", reason: msg }));
  process.exit(2);
};

// Outils de pilotage MCP eux-mêmes : lecture seule par nature.
const toolName = String(
  payload.tool_name ?? payload.tool_info?.tool_name ?? "",
);
if (
  ["mcp_list_servers", "mcp_list_tools", "mcp_read_resource"].includes(toolName)
) {
  process.exit(0);
}

// Deux formes d'appel selon le runtime :
//   mcp_call_tool        → tool_input { server_name, tool_name, arguments }
//   mcp__<serveur>__<outil> → tool_input { arguments de l'outil }
// Les arguments ne sont JAMAIS repris dans les messages (peuvent contenir un
// secret, ex. la valeur d'une variable d'environnement).
let server = "";
let tool = "";
if (toolName === "mcp_call_tool") {
  const ti = payload.tool_input ?? {};
  server = String(ti.server_name ?? "");
  tool = String(ti.tool_name ?? "");
} else {
  const m = /^mcp__([^_]+)__([\w-]+)$/.exec(toolName);
  if (m) [server, tool] = [m[1], m[2]];
}
if (!server || !tool) {
  block(
    "Appel MCP illisible (serveur ou outil non identifiable) : refusé par prudence.",
  );
}

// Préfixes d'outils purement consultatifs : tout le reste est une ACTION
// externe (déploiement, écriture, suppression, promotion…) qui doit passer
// par la CLI pour être couverte par les verrous.
const READ_ONLY =
  /^(get|list|search|view|read|inspect|describe|find|query|fetch|check|download|lookup|retrieve|show|whoami|docs?|help|browse|status)/i;
const POLICY = {
  vercel: {
    read: READ_ONLY,
    deny: "Outil Vercel en écriture refusé : les actions Vercel (déployer, promouvoir, variables, domaines, projets) passent par les commandes autorisées (`vercel deploy --prod --yes`, `vercel env add`, `vercel ls`…).",
  },
  shadcn: {
    read: READ_ONLY,
    deny: "Outil shadcn en écriture refusé : l'ajout de composants passe par `pnpm exec shadcn add`, soumis au verrou « concept avant code ».",
  },
  // Diagnostic local Next.js (docs, erreurs, logs du dev server) : aucun
  // effet externe — tout est autorisé.
  "next-devtools": { read: null },
};

const policy = POLICY[server];
if (!policy) {
  // mcp_config.json est verrouillé : un autre serveur ne devrait pas exister.
  block(
    `Serveur MCP « ${server} » non prévu par le cours : seuls les serveurs officiels (shadcn, next-devtools, vercel) sont utilisables.`,
  );
}
if (policy.read === null || policy.read.test(tool)) process.exit(0);
block(policy.deny);
