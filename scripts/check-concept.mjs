// Vérification mécanique du concept MVP (.concept/MVP.md).
// Utilisé par :
//   - `pnpm concept:check` (manuel / agent)
//   - le hook pre-commit (mode --staged : bloque un commit qui touche src/
//     tant que le concept n'est pas validé)
//   - les hooks Devin guard-edit / guard-exec / stop-gate (mode --quiet).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { isTemplateRepo } from "./lib/template.mjs";

const args = process.argv.slice(2);
const quiet = args.includes("--quiet");
const staged = args.includes("--staged");

// Build Vercel / CI : le template n'a pas de concept, seuls les dépôts
// étudiants sont contrôlés.
if (args.includes("--skip-template") && isTemplateRepo()) {
  if (!quiet)
    console.log("✓ Concept MVP : dépôt modèle (contrôle non applicable).");
  process.exit(0);
}

// Bypass enseignant : identique à celui de guard-edit. Le concept reste honnête
// via `pnpm concept:check` (sans --staged), mais un mainteneur du template peut
// versionner le code applicatif du starter avant que le concept ne soit rempli.
if (staged && process.env.IHECS_TEACHER_BYPASS === "true") process.exit(0);

if (staged) {
  const diff = spawnSync("git", ["diff", "--cached", "--name-only"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const srcStaged = String(diff.stdout ?? "")
    .split(/\r?\n/)
    .some((f) => /^src\//.test(f));
  if (!srcStaged) process.exit(0);
}

const errors = [];

if (!existsSync(".concept/MVP.md")) {
  errors.push(
    "Le fichier .concept/MVP.md n'existe pas : lance le skill /concept avec ton agent pour rédiger le concept du MVP.",
  );
} else {
  const raw = readFileSync(".concept/MVP.md", "utf8");

  if (!/^\s*>?\s*statut\s*:\s*validé/im.test(raw)) {
    errors.push(
      "Le statut du concept doit être « Statut : validé » (ligne sous le titre). Utilise le skill /concept avec ton agent.",
    );
  }

  // Découpage en sections « ## » et sous-sections « ### ».
  const sections = {};
  const parts = raw.split(/^#{2,3}\s+/m);
  for (const part of parts.slice(1)) {
    const [title, ...rest] = part.split(/\r?\n/);
    sections[title.trim()] = rest.join("\n");
  }

  const bodyOf = (title) => sections[title] ?? "";
  const isExample = (body) => /EXEMPLE\s*—/i.test(body);
  const realBody = (body) =>
    body
      .split(/\r?\n/)
      .filter((l) => !/EXEMPLE\s*—/i.test(l))
      .join("\n")
      .trim();
  const countItems = (body) =>
    body.split(/\r?\n/).filter((l) => /^\s*([-*]|\d+[.)])\s+\S/.test(l)).length;

  const required = [
    ["1. Pitch (une phrase)", { chars: 20 }, "ton pitch en une phrase claire"],
    ["2. Problème utilisateur", { chars: 20 }, "le problème que tu résous"],
    ["3. Utilisateur cible", { chars: 15 }, "pour qui tu le construis"],
    [
      "4. Parcours clé (3 à 5 étapes)",
      { items: 3 },
      "au moins 3 étapes numérotées du parcours de l'utilisateur",
    ],
    [
      "6. Écrans prévus (pages Next.js)",
      { items: 1 },
      "au moins 1 écran (page) sous forme de liste",
    ],
    [
      "7. Données & IA",
      { chars: 10 },
      "les données utilisées, et le rôle de l'IA (ou « aucune IA »)",
    ],
    [
      "8. Critères de succès (comment on SAIT que le MVP marche)",
      { items: 1 },
      "au moins 1 critère mesurable sous forme de liste",
    ],
    [
      "9. Risques & hypothèses à tester",
      { chars: 10 },
      "au moins un risque ou une hypothèse",
    ],
  ];

  for (const [title, rule, hint] of required) {
    if (!Object.hasOwn(sections, title)) {
      errors.push(`Section « ${title} » manquante dans .concept/MVP.md.`);
      continue;
    }
    const body = bodyOf(title);
    if (isExample(body)) {
      errors.push(
        `Section « ${title} » encore en EXEMPLE : remplace-la par TON contenu (skill /concept).`,
      );
      continue;
    }
    const content = realBody(body);
    const tooShort =
      rule.items !== undefined
        ? countItems(content) < rule.items
        : content.length < rule.chars;
    if (tooShort) {
      errors.push(`Section « ${title} » incomplète : il faut ${hint}.`);
    }
  }

  // Périmètre : fonctionnalités indispensables + exclusions, en TES mots.
  const features = bodyOf("Fonctionnalités indispensables (max 3)");
  if (isExample(features) || countItems(realBody(features)) < 1) {
    errors.push(
      "Section « 5. Périmètre » : liste au moins 1 fonctionnalité indispensable (3 max), en TES mots.",
    );
  }
  const outOfScope = bodyOf(
    "Hors périmètre (ce qu'on ne fait PAS dans ce MVP)",
  );
  if (isExample(outOfScope) || countItems(realBody(outOfScope)) < 1) {
    errors.push(
      "Section « 5. Périmètre » : liste au moins 1 chose que tu ne fais PAS (hors périmètre) — c'est ce qui rend le MVP faisable.",
    );
  }
}

if (errors.length > 0) {
  if (!quiet) {
    console.error("✗ Concept MVP non validé :");
    for (const e of errors) console.error(`  - ${e}`);
    console.error(
      "\nRappel : aucun code applicatif (src/) n'est accepté tant que le concept n'est pas validé. Utilise le skill /concept.",
    );
  }
  process.exit(1);
}

if (!quiet) console.log("✓ Concept MVP validé (.concept/MVP.md).");
process.exit(0);
