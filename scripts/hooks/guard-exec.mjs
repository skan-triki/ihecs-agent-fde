// Hook bi-format (Devin CLI PreToolUse(exec) / Cascade pre_run_command) —
// LISTE BLANCHE des commandes terminal autorisées à l'agent.
// Tout ce qui n'est pas explicitement autorisé est REFUSÉ : interpréteurs
// (node -e, python, bash -c, powershell -c…), écriture de fichiers par le
// shell (redirections, rm, sed, Set-Content…), désactivation des hooks git
// (HUSKY=0, core.hooksPath, -n…), contournement de la CI ou de Vercel.
// Les fichiers s'écrivent UNIQUEMENT avec les outils d'édition, contrôlés par
// guard-edit. Sortie code 2 = commande bloquée, avec la raison.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

import {
  bootstrapMissing,
  devMissing,
  prodPendingMarker,
} from "../lib/readiness.mjs";
import { codeReviewErrors } from "../lib/review.mjs";
import { isTemplateRepo } from "../lib/template.mjs";

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

// Bypass enseignant : variable de l'environnement du processus de l'IDE,
// que l'agent ne peut pas définir (toute mention dans une commande est refusée).
if (process.env.IHECS_TEACHER_BYPASS === "true") process.exit(0);

const isCascade = typeof payload.agent_action_name === "string";
const command = String(
  payload.tool_input?.command ?? payload.tool_info?.command_line ?? "",
);
if (!command.trim()) process.exit(0);

const block = (reason) => {
  const msg = `${reason} [garde-fou du cours]`;
  if (isCascade) console.error(msg);
  else console.log(JSON.stringify({ decision: "block", reason: msg }));
  process.exit(2);
};

const ROOT = process.cwd();
const rel = (p) => {
  const abs = isAbsolute(p) ? p : resolve(ROOT, p);
  return relative(ROOT, abs).replaceAll("\\", "/");
};
const insideProject = (p) => {
  // ~, $HOME, %USERPROFILE%… : le shell les développe hors du projet.
  if (/^~|\$|%/.test(p)) return false;
  const r = rel(p);
  return r === "" || (!r.startsWith("..") && !isAbsolute(r));
};

// Le dossier de travail de la commande doit être le projet.
const workdir = payload.tool_input?.workdir ?? payload.tool_info?.cwd;
if (workdir && !insideProject(String(workdir))) {
  block("Les commandes s'exécutent uniquement dans le dossier du projet.");
}

// --- Interdictions globales (texte brut) ---------------------------------
if (/IHECS_TEACHER_BYPASS/i.test(command)) {
  block("Le bypass enseignant est réservé à l'enseignant.");
}
if (/\bHUSKY\w*\s*=|\$env:HUSKY|core\.hooksPath/i.test(command)) {
  block(
    "Désactiver ou détourner les hooks git est interdit : corrige la cause de l'échec.",
  );
}
if (/--no-verify\b/.test(command)) {
  block(
    "Contourner les hooks git (--no-verify) est interdit : corrige la cause de l'échec.",
  );
}
if (/(^|[\s"'`=/\\:])\.env(?![\w.-]*\bexample\b)/.test(command)) {
  block(
    "Lire ou écrire un fichier `.env*` de secrets est interdit : `pnpm env:init` crée `.env.local`, l'étudiant y met lui-même ses valeurs.",
  );
}

// --- Découpage de la commande (guillemets, enchaînements, redirections) ---
const parse = (cmd) => {
  const segments = [];
  const issues = [];
  let tokens = [];
  let cur = "";
  let has = false;
  let quote = null;
  const pushTok = () => {
    if (has) tokens.push(cur);
    cur = "";
    has = false;
  };
  const endSeg = () => {
    pushTok();
    if (tokens.length) segments.push(tokens);
    tokens = [];
  };
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    const n = cmd[i + 1];
    if (quote === "'") {
      if (c === "'") quote = null;
      else cur += c;
      continue;
    }
    if (quote === '"') {
      if (c === '"') quote = null;
      else if (c === "`" || (c === "$" && n === "("))
        issues.push("substitution");
      else cur += c;
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      has = true;
    } else if (
      c === "`" ||
      (c === "$" && n === "(") ||
      ((c === "<" || c === ">") && n === "(")
    ) {
      issues.push("substitution");
    } else if (c === " " || c === "\t") {
      pushTok();
    } else if (c === "\n" || c === "\r" || c === ";") {
      endSeg();
    } else if (c === "&" || c === "|") {
      if (n === c) i++;
      endSeg();
    } else if (c === ">" || c === "<") {
      if (has && /^\d$/.test(cur)) {
        cur = "";
        has = false;
      } else pushTok();
      let j = i + 1;
      if (cmd[j] === ">") j++;
      if (c === ">" && cmd[j] === "&" && /\d/.test(cmd[j + 1] ?? "")) {
        i = j + 1;
        continue;
      }
      while (cmd[j] === " ") j++;
      let target = "";
      while (j < cmd.length && !/[\s;&|<>]/.test(cmd[j])) target += cmd[j++];
      if (c === "<" || !/^(\/dev\/null|nul|\$null)$/i.test(target)) {
        issues.push(`redirection vers « ${target || "?"} »`);
      }
      i = j - 1;
    } else {
      cur += c;
      has = true;
    }
  }
  if (quote) issues.push("guillemet non fermé");
  endSeg();
  return { segments, issues };
};

const { segments, issues } = parse(command);
if (issues.length > 0) {
  block(
    `Construction de commande interdite (${issues[0]}) : pas de substitution de commande ni de redirection vers un fichier. Pour écrire un fichier, utilise l'outil d'édition.`,
  );
}

// --- Chemins protégés -----------------------------------------------------
const PROTECTED = [
  /^scripts(\/|$)/,
  /^\.husky(\/|$)/,
  /^\.github(\/|$)/,
  /^\.devin(\/|$)/,
  /^\.check(\/|$)/,
  /^\.git(\/|$)/,
  /^node_modules(\/|$)/,
  /^(AGENTS|CLAUDE)\.md$/,
  /^(eslint|prettier|lint-staged|commitlint)\.config\.mjs$/,
  /^(tsconfig|knip|package|vercel)\.json$/,
  /^pnpm-(workspace|lock)\.yaml$/,
  /^\.(npmrc|nvmrc|gitignore|gitattributes|prettierignore|vercelignore)$/,
];
const isProtectedPath = (tok) => {
  if (!tok || tok.startsWith("-")) return false;
  const r = rel(tok).toLowerCase();
  return insideProject(tok) && PROTECTED.some((re) => re.test(r));
};
// Pathspecs magiques ou globaux (« . », « * », « :(icase)… », « :(top)… ») :
// ils peuvent viser les règles — traités comme protégés dans les opérations
// destructrices (rm, mv, checkout, restore) ou réécrivantes (outils --fix).
const isDangerousPath = (tok) =>
  /^\.{1,2}$/.test(tok) || /^:/.test(tok) || /[*?[\]{}()]/.test(tok);
const pathDanger = (t) => isProtectedPath(t) || isDangerousPath(t);

// --- Données de référence -------------------------------------------------
const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return {};
  }
};
const SCRIPTS = new Set(Object.keys(readJson("package.json").scripts ?? {}));
const EXTENSIONS = new Set(
  (readJson(".vscode/extensions.json").recommendations ?? []).map((e) =>
    String(e).toLowerCase(),
  ),
);
const conceptValid = () =>
  spawnSync(process.execPath, ["scripts/check-concept.mjs", "--quiet"], {
    timeout: 10_000,
  }).status === 0;
const run = (cmd, args) =>
  spawnSync(cmd, args, {
    encoding: "utf8",
    timeout: 20_000,
  });

// Ordre des étapes 5 et 7 pour toute livraison (push d'une branche, PR, fusion).
const deliveryBlocked = () => {
  if (existsSync(prodPendingMarker())) {
    return "La dernière fusion n'a pas été vérifiée en production. Lance `pnpm prod:check` avant toute nouvelle livraison.";
  }
  if (isTemplateRepo()) return null;
  const missing = bootstrapMissing();
  if (missing.length > 0) {
    return `Mise en route pas terminée : il manque ${missing.join(" et ")}. Lance d'abord le skill /bootstrap.`;
  }
  // Sas de revue code : les 3 relecteurs indépendants (.reviews/) doivent
  // avoir validé le commit courant (skill /ship, étape « sas de revue code »).
  const reviews = codeReviewErrors();
  return reviews.length > 0 ? reviews.join("\n") : null;
};

const MSG = {
  npm: "npm est interdit pour ce projet : utilise pnpm (`pnpm add`, `pnpm dev`…). Seule exception : `npm install -g pnpm` ou `npm install -g vercel`.",
  npx: "npx est interdit : utilise `pnpm exec <outil>` (version figée du projet).",
  yarn: "yarn est interdit dans ce cours : utilise pnpm.",
  bun: "bun est interdit dans ce cours : utilise pnpm.",
  bunx: "bun est interdit dans ce cours : utilise pnpm.",
  node: "`node` n'est autorisé que pour `node --version` ou un script officiel du projet (`node scripts/…`). Pour un test HTTP : `pnpm routes:check /`.",
};

// --- Règles par programme -------------------------------------------------
// Chaque règle renvoie `null` (autorisé) ou la raison du refus.
const flagsOf = (args) => args.filter((a) => a.startsWith("-"));
const positional = (args) => args.filter((a) => !a.startsWith("-"));

const rules = {
  pnpm(args) {
    const a = [...args];
    while (a[0] === "-s" || a[0] === "--silent") a.shift();
    const [sub, ...rest] = a;
    if (!sub) return "Indique une commande pnpm (ex. `pnpm dev`).";
    if (["--version", "-v"].includes(sub) && rest.length === 0) return null;
    if (sub.startsWith("-"))
      return "Options globales de pnpm interdites (`-C`, `--dir`, `--filter`…).";
    if (
      rest.some((t) =>
        /^--(config\.|registry|ignore-pnpmfile|pnpmfile)/.test(t),
      )
    ) {
      return "Modifier la configuration de pnpm (registre, âge minimum des versions…) est interdit.";
    }
    if (
      [
        "install",
        "i",
        "add",
        "remove",
        "rm",
        "uninstall",
        "un",
        "update",
        "up",
      ].includes(sub)
    ) {
      if (sub === "add") {
        const bad = positional(rest).find(
          (t) => !/^(@[\w.-]+\/)?[\w.-]+(@[\w.^~<>*xX0-9.-]+)?$/.test(t),
        );
        if (bad)
          return `\`pnpm add\` n'accepte que des paquets du registre npm (nom@version) : « ${bad} » (file:, link:, git+, tarball…) est interdit.`;
      }
      return null;
    }
    if (["list", "ls", "why", "outdated", "audit"].includes(sub)) return null;
    if (sub === "exec") {
      const BIN = [
        "shadcn",
        "eslint",
        "prettier",
        "tsc",
        "next",
        "knip",
        "commitlint",
        "lint-staged",
        "vitest",
      ];
      if (!BIN.includes(rest[0] ?? ""))
        return `\`pnpm exec\` est limité aux outils du projet : ${BIN.join(", ")}.`;
      // Outils capables de réécrire des fichiers — mais seulement quand ils
      // écrivent vraiment : `eslint` n'écrit qu'avec --fix, `prettier` qu'avec
      // --write, `tsc` sauf --noEmit ; `lint-staged` écrit toujours. Un outil
      // qui écrit ne vise jamais les règles ni des pathspecs globaux
      // (« . », « * » ratisseraient .husky/, scripts/…).
      const toolWrites =
        rest[0] === "lint-staged" ||
        (rest[0] === "eslint" && rest.includes("--fix")) ||
        (rest[0] === "prettier" && rest.includes("--write")) ||
        (rest[0] === "tsc" && !rest.includes("--noEmit"));
      if (toolWrites && rest.slice(1).some(pathDanger))
        return `Cet outil peut réécrire des fichiers : viser les règles du cours ou des chemins globaux (., *, :) est interdit.`;
      if (
        rest[0] === "shadcn" &&
        ["add", "create", "init"].includes(rest[1] ?? "")
      ) {
        const missing = devMissing();
        if (missing.length > 0) {
          return `Installation pas terminée (il manque ${missing.join(", ")}) : lance d'abord /install-tools.`;
        }
        if (!conceptValid()) {
          return "Verrou « concept avant code » : on n'installe pas de composants avant d'avoir défini le MVP. Lance le skill /concept avec l'étudiant, puis `pnpm concept:check`.";
        }
      }
      return null;
    }
    const script = sub === "run" ? positional(rest)[0] : sub;
    if (script && SCRIPTS.has(script)) {
      if (script === "prod:check") {
        const extra =
          sub === "run" ? positional(rest).slice(1) : positional(rest);
        if (
          extra.some(
            (a) => !/^https:\/\/[\w-]+(\.[\w-]+)*\.vercel\.app\/?$/i.test(a),
          )
        )
          return "`pnpm prod:check` ne vérifie que la vraie production : URL https://<projet>.vercel.app uniquement.";
      }
      return null;
    }
    if (sub === "run")
      return `Le script « ${script ?? "?"} » n'existe pas dans package.json — vérifie son nom (scripts du projet : ${[...SCRIPTS].join(", ")}).`;
    return `\`pnpm ${sub}\` n'est pas autorisé. Utilise un script du projet (${[...SCRIPTS].join(", ")}) ou \`pnpm add\`.`;
  },

  npm(args) {
    if (args.length === 1 && ["-v", "--version"].includes(args[0])) return null;
    const [sub, ...rest] = args;
    const flags = flagsOf(rest);
    const pkgs = positional(rest);
    const okFlags =
      flags.length > 0 && flags.every((f) => ["-g", "--global"].includes(f));
    const okPkgs =
      pkgs.length > 0 &&
      pkgs.every((p) => /^(pnpm|vercel)(@[\w.^~-]+)?$/.test(p));
    if (["install", "i"].includes(sub ?? "") && okFlags && okPkgs) return null;
    return MSG.npm;
  },

  corepack(args) {
    if (
      args[0] === "--version" ||
      (args[0] === "enable" &&
        positional(args.slice(1)).every((p) => p === "pnpm"))
    )
      return null;
    return "Seul `corepack enable pnpm` est autorisé.";
  },

  node(args) {
    if (args.length === 1 && ["--version", "-v"].includes(args[0])) return null;
    const file = (args[0] ?? "").replaceAll("\\", "/");
    // Les hooks sont lancés par le système, jamais à la main — les exécuter
    // directement permettrait par ex. de forger le journal des sous-agents.
    if (
      /^(\.\/)?scripts\/hooks\//.test(file) &&
      !/session-onboarding\.mjs$/.test(file)
    )
      return "Les hooks sont lancés par le système, pas à la main. (Diagnostic autorisé : `node scripts/hooks/session-onboarding.mjs --human`.)";
    if (/^(\.\/)?scripts\/[\w./-]+\.m?js$/.test(file) && !file.includes(".."))
      return null;
    return MSG.node;
  },

  git(args) {
    const a = [...args];
    if (a[0] === "--no-pager") a.shift();
    const [sub, ...rest] = a;
    if (sub === "--version" && rest.length === 0) return null;
    if (["help", "-h", "--help", "-P"].includes(sub)) return null;
    if (!sub || sub.startsWith("-"))
      return "Options globales de git interdites (`-c`, `-C`, `--git-dir`…). Si une option est vraiment nécessaire, explique le besoin à l'étudiant.";
    // Options d'exécution détournée ou d'écriture de fichier : exécuter une
    // commande distante (--upload-pack/--receive-pack/--exec), changer le
    // dépôt visé (--repo/--git-dir/--work-tree) ou écrire dans un fichier
    // (--output, -o) contournent les autres verrous.
    if (
      rest.some((t) =>
        /^--(upload-pack|receive-pack|exec|repo|git-dir|work-tree|config-env|output)/.test(
          t,
        ),
      ) ||
      rest.includes("-o")
    )
      return "Options git de contournement (--upload-pack, --receive-pack, --exec, --repo, --output, -o…) interdites.";
    const touches = rest.some(pathDanger);
    switch (sub) {
      case "status":
      case "diff":
      case "log":
      case "show":
      case "add":
      case "pull":
      case "fetch":
      case "stash":
      case "init":
      case "ls-files":
      case "ls-remote":
      case "grep":
      case "rev-parse":
      case "blame":
      case "shortlog":
      case "describe":
      case "tag":
      case "merge":
      case "cherry-pick":
      case "revert":
        return null;
      case "switch":
        if (
          rest.some((t) =>
            ["-f", "--force", "-C", "--force-create"].includes(t),
          )
        )
          return "`git switch --force` écrase le travail non enregistré : interdit.";
        return null;
      case "remote": {
        const subs = rest.filter((t) => !t.startsWith("-"));
        const ok =
          (subs.length === 0 || ["get-url", "show"].includes(subs[0] ?? "")) &&
          flagsOf(rest).every((f) => ["-v", "--verbose"].includes(f));
        if (ok) return null;
        return "`git remote` est en lecture seule (`git remote -v`, `git remote get-url`) : modifier l'URL du dépôt est réservé à l'enseignant.";
      }
      case "commit": {
        for (let i = 0; i < rest.length; i++) {
          const t = rest[i];
          if (/^-[A-Za-z]+$/.test(t)) {
            if (t.includes("n"))
              return "`git commit -n` désactive les contrôles : interdit. Corrige la cause de l'échec.";
            if (/[mFcC]$/.test(t)) i++;
          } else if (
            [
              "--message",
              "--file",
              "--author",
              "--date",
              "--reuse-message",
              "--reedit-message",
              "--fixup",
              "--squash",
            ].includes(t)
          )
            i++;
        }
        return null;
      }
      case "push": {
        if (
          rest.some(
            (t) =>
              /^(--force.*|--mirror|--delete|--prune)$/.test(t) ||
              /^-[A-Za-z0-9]*[fd]/.test(t),
          )
        ) {
          return "Le force push et la suppression de branches distantes sont interdits.";
        }
        const pos = positional(rest);
        // `git push origin HEAD:main`, `git push HEAD:refs/heads/main` (remote
        // implicite) : un positionnel contenant « : » est un refspec, pas un
        // remote. La cible = ce qu'il y a après « : », forme longue comprise
        // (« refs/heads/main » → « main »).
        const refspecs = pos[0]?.includes(":") ? pos : pos.slice(1);
        if (
          pos.some((r) => r.startsWith("+")) ||
          refspecs.some((r) => r.startsWith(":"))
        ) {
          return "Refspec forcée ou suppression distante interdite.";
        }
        const remote = pos[0] && !pos[0].includes(":") ? pos[0] : "origin";
        const current = String(
          run("git", ["rev-parse", "--abbrev-ref", "HEAD"]).stdout,
        ).trim();
        const dstOf = (r) => {
          const dst = (r.includes(":") ? r.split(":").pop() : r)
            .replace(/^\+/, "")
            .replace(/^refs\/heads\//, "");
          return dst === "HEAD" ? current : dst;
        };
        const targets = refspecs.length > 0 ? refspecs.map(dstOf) : [current];
        if (targets.includes("main")) {
          const probe = run("git", [
            "ls-remote",
            "--exit-code",
            "--heads",
            remote,
            "main",
          ]);
          if (probe.status === 0) {
            return "Pousser directement sur `main` est interdit : crée une branche et passe par une PR (skill /ship). Seul le tout premier envoi de `main` est autorisé.";
          }
          if (probe.status !== 2) {
            return "Impossible de vérifier la branche distante (réseau ?) : push vers `main` refusé par prudence — réessaie connecté.";
          }
          // Tout premier envoi de main (mise en route GitHub) : autorisé.
          return null;
        }
        return deliveryBlocked();
      }
      case "checkout":
        if (
          rest.includes("--") ||
          rest.includes(".") ||
          rest.some((t) =>
            ["-f", "--force", "-p", "--patch", "-B"].includes(t),
          ) ||
          positional(rest).length > 1 ||
          touches
        ) {
          return "`git checkout` ne sert ici qu'à changer de branche (`git switch` est préférable) : restaurer ou écraser des fichiers par checkout est interdit.";
        }
        return null;
      case "restore":
        if (rest.some((t) => /^(-s|--source)/.test(t)))
          return "Restaurer une ancienne version de fichiers (`--source`) est interdit.";
        return null;
      case "branch":
        if (
          rest.some((t) => ["-D", "-f", "--force", "-M", "-C"].includes(t)) ||
          (rest.includes("--delete") && rest.includes("--force"))
        ) {
          return "Supprimer ou écraser une branche de force est interdit.";
        }
        return null;
      case "rebase":
        if (rest.some((t) => /^(-x|--exec|-i|--interactive)/.test(t)))
          return "`git rebase` interactif ou avec `--exec` est interdit.";
        return null;
      case "reset":
        if (rest.some((t) => ["--hard", "--merge", "--keep"].includes(t))) {
          return "`git reset --hard` détruit le travail non enregistré : interdit. Utilise `git restore <fichier>`.";
        }
        return null;
      case "rm":
      case "mv":
        if (touches)
          return "Supprimer ou déplacer un fichier de règles du cours est interdit.";
        return null;
      case "config": {
        const pos = positional(rest);
        const fl = flagsOf(rest);
        if (
          fl.every((f) =>
            [
              "--get",
              "--get-all",
              "--list",
              "-l",
              "--show-origin",
              "--local",
              "--global",
            ].includes(f),
          ) &&
          pos.length <= 1
        )
          return null;
        return "Modifier la configuration git est interdit (lecture seule : `git config --get <clé>`).";
      }
      default:
        return `\`git ${sub}\` n'est pas autorisé dans ce cours — dis à l'étudiant ce que tu veux faire, un équivalent autorisé existe sûrement.`;
    }
  },

  gh(args) {
    const [sub, sub2, ...rest] = args;
    const all = args.slice(1);
    if (sub === "--version") return null;
    if (sub === "auth")
      return sub2 === "status"
        ? null
        : "La connexion GitHub se fait par l'étudiant lui-même : `gh auth login`.";
    if (sub === "browse") return null;
    if (
      sub === "repo" &&
      ["create", "view", "edit", "list"].includes(sub2 ?? "")
    ) {
      if (
        sub2 === "edit" &&
        all.some((t) => /--visibility|--accept-visibility/.test(t))
      )
        return "Changer la visibilité du dépôt est réservé à l'étudiant.";
      return null;
    }
    if (
      sub === "run" &&
      ["list", "view", "watch", "rerun"].includes(sub2 ?? "")
    )
      return null;
    if (
      sub === "issue" &&
      ["list", "view", "create", "comment"].includes(sub2 ?? "")
    )
      return null;
    if (sub === "api") {
      if (
        all.some((t) =>
          /^(-X|--method|-f|-F|--field|--raw-field|--input)/.test(t),
        )
      ) {
        return "`gh api` est autorisé en lecture seule (GET) : modifier GitHub par l'API est interdit.";
      }
      return null;
    }
    if (sub === "pr") {
      if (
        [
          "view",
          "checks",
          "list",
          "status",
          "diff",
          "comment",
          "edit",
        ].includes(sub2 ?? "")
      )
        return null;
      if (sub2 === "create" || sub2 === "ready") return deliveryBlocked();
      if (sub2 === "merge") {
        if (rest.includes("--admin"))
          return "`--admin` contourne les protections de GitHub : interdit.";
        const blocked = deliveryBlocked();
        if (blocked) return blocked;
        const pr = positional(rest)[0];
        const checks = run("gh", ["pr", "checks", ...(pr ? [pr] : [])]);
        if (checks.status !== 0) {
          return "Fusion refusée : la CI de cette PR n'est pas entièrement verte (ou est encore en cours). Attends `gh pr checks --watch`, corrige si besoin, puis fusionne.";
        }
        // Fusion autorisée → la production devra être vérifiée (étape 7).
        writeFileSync(prodPendingMarker(), new Date().toISOString());
        return null;
      }
    }
    return `\`gh ${[sub, sub2].filter(Boolean).join(" ")}\` n'est pas autorisé dans ce cours — dis à l'étudiant ce que tu veux faire, un équivalent autorisé existe sûrement.`;
  },

  vercel(args) {
    if (args.some((t) => /^(--prebuilt|-b|--build-env)/.test(t))) {
      return "Déployer une version construite en local (`--prebuilt`) ou modifier l'environnement de build contourne les contrôles : interdit.";
    }
    const [sub, sub2] = positional(args);
    if (args.length === 1 && ["--version", "-v"].includes(args[0])) return null;
    if (!sub || sub === "deploy" || sub === "redeploy") return null;
    if (
      ["whoami", "ls", "list", "inspect", "logs", "link", "help"].includes(sub)
    )
      return null;
    if (
      sub === "env" &&
      ["ls", "list", "add", "rm", "remove"].includes(sub2 ?? "")
    )
      return null;
    if (sub === "git" && sub2 === "connect") return null;
    if (sub === "project" && ["ls", "list", "inspect"].includes(sub2 ?? ""))
      return null;
    if (sub === "login")
      return "La connexion Vercel se fait par l'étudiant lui-même : `vercel login`.";
    if (["domains", "domain", "alias", "dns", "certs"].includes(sub)) {
      return "Les noms de domaine personnalisés sont interdits dans ce cours : le MVP vit sur *.vercel.app.";
    }
    return `\`vercel ${[sub, sub2].filter(Boolean).join(" ")}\` n'est pas autorisé dans ce cours (build local, promotion, suppression et domaines sont interdits).`;
  },

  winget(args) {
    if (args.length === 1 && ["--info", "--version", "-v"].includes(args[0]))
      return null;
    if (args[0] === "list") return null;
    const IDS = [
      "OpenJS.NodeJS.LTS",
      "Git.Git",
      "GitHub.cli",
      "Microsoft.VisualStudioCode",
    ];
    const id = args[args.indexOf("--id") + 1];
    if (
      args[0] === "install" &&
      args.includes("--id") &&
      IDS.includes(id ?? "")
    )
      return null;
    return `winget est limité à l'installation des outils du cours : ${IDS.join(", ")}.`;
  },

  brew(args) {
    if (args.length === 1 && args[0] === "--version") return null;
    if (args[0] === "list") return null;
    const PKGS = ["node@24", "git", "gh", "visual-studio-code"];
    const pkgs = positional(args.slice(1));
    if (
      args[0] === "install" &&
      pkgs.length > 0 &&
      pkgs.every((p) => PKGS.includes(p))
    )
      return null;
    if (
      args[0] === "link" &&
      args.includes("--overwrite") &&
      pkgs.join() === "node@24"
    )
      return null;
    return `brew est limité à l'installation des outils du cours : ${PKGS.join(", ")}.`;
  },

  "xcode-select"(args) {
    return args.join(" ") === "--install"
      ? null
      : "Seul `xcode-select --install` est autorisé.";
  },

  code(args) {
    if (
      args.length === 1 &&
      ["--version", "--list-extensions"].includes(args[0])
    )
      return null;
    const i = args.indexOf("--install-extension");
    if (
      i >= 0 &&
      args.length === 2 &&
      EXTENSIONS.has(String(args[i + 1]).toLowerCase())
    )
      return null;
    return "L'éditeur ne peut installer que les extensions recommandées du projet (`.vscode/extensions.json`).";
  },
};
rules.windsurf = rules.code;
rules.devin = rules.code;

// Lecture seule et utilitaires sans effet (aucune redirection n'est possible :
// elles sont refusées plus haut).
const READ_ONLY = new Set([
  "ls",
  "dir",
  "pwd",
  "cat",
  "type",
  "head",
  "tail",
  "wc",
  "echo",
  "which",
  "where",
  "sleep",
  "sort",
  "uniq",
  "grep",
  "findstr",
  "date",
  "get-content",
  "get-childitem",
  "test-path",
  "start-sleep",
  "write-output",
  "get-location",
]);

for (const seg of segments) {
  const [first, ...args] = seg;
  if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(first)) {
    block(
      "Définir une variable d'environnement dans une commande est interdit.",
    );
  }
  if (/[\\/]/.test(first)) {
    block(
      `Exécuter un programme par son chemin (« ${first} ») est interdit : utilise les scripts du projet (\`pnpm <script>\`).`,
    );
  }
  const prog = first.toLowerCase().replace(/\.(exe|cmd|bat|ps1)$/, "");
  if (READ_ONLY.has(prog)) {
    // `sort -o <fichier>` écrit dans un fichier : ça contourne l'outil
    // d'édition (et peut réécrire un hook, un .env…).
    if (
      prog === "sort" &&
      args.some((t) => t === "-o" || t === "--output" || /^--output=/.test(t))
    )
      block("`sort -o` écrit dans un fichier : utilise l'outil d'édition.");
    const TEXT_ONLY = ["echo", "write-output", "sleep", "start-sleep", "date"];
    // Ces commandes affichent leur argument tel quel : interdit d'y mettre
    // une expansion de variable ($SECRET, %KEY%, $env:X…) qui afficherait un
    // secret ou l'état du système.
    if (TEXT_ONLY.includes(prog)) {
      if (args.some((t) => /%\w+%|\$[\w({]|`/.test(t)))
        block(
          "Afficher des variables d'environnement (`$VAR`, `%VAR%`…) est interdit : elles peuvent contenir des secrets.",
        );
      continue;
    }
    // « /x » = options Windows (dir /b, findstr /m, sort /?), pas des chemins.
    if (
      args.some(
        (t) =>
          !t.startsWith("-") &&
          !/^\/[A-Za-z?]+$/.test(t) &&
          !insideProject(t) &&
          t !== "/etc/os-release",
      )
    ) {
      block("Lire des fichiers hors du projet est interdit.");
    }
    continue;
  }
  const rule = rules[prog];
  if (!rule)
    block(
      MSG[prog] ??
        `La commande « ${first} » n'est pas autorisée dans ce cours. Si elle est vraiment nécessaire, demande à l'enseignant.`,
    );
  const reason = rule(args);
  if (reason) block(reason);
}

process.exit(0);
