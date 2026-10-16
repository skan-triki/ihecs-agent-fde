// Analyse et validation du concept MVP (.concept/MVP.md) — logique PARTAGÉE :
//   - scripts/check-concept.mjs : verdict complet (texte + revues sur disque) ;
//   - scripts/hooks/guard-edit.mjs : verrou À L'ÉCRITURE — impossible de cocher
//     une étape dont la section est vide ou sans trace d'approfondissement, et
//     impossible d'écrire « Statut : validé » tant que tout n'est pas complet.
import { existsSync, readFileSync } from "node:fs";

import { launchesCover } from "./subagents.mjs";

// Les 12 étapes de l'interview : chaque case cochée atteste que l'étudiant a
// donné une réponse complète ET approfondie pour cette étape (skill /concept).
const ETAPES = [
  "Étape 1 — Pitch",
  "Étape 2 — Problème utilisateur",
  "Étape 3 — Utilisateur cible",
  "Étape 4 — Parcours clé",
  "Étape 5 — Périmètre",
  "Étape 6 — Écrans",
  "Étape 7 — Expérience utilisateur (UX)",
  "Étape 8 — Données & IA",
  "Étape 9 — Critères de succès",
  "Étape 10 — Risques & hypothèses",
  "Étape 11 — Stress-test (avocat du diable)",
  "Étape 12 — Validation explicite par l'étudiant",
];

// Par étape : les sections attendues (titre exact + règle de contenu + aide),
// et la section « ## » qui doit porter la ligne « > Approfondissement : ».
export const ETAPE_CHECKS = [
  {
    etape: "Étape 1 — Pitch",
    sections: [
      [
        "1. Pitch (une phrase)",
        { chars: 20 },
        "ton pitch en une phrase claire",
      ],
    ],
    deepening: "1. Pitch (une phrase)",
  },
  {
    etape: "Étape 2 — Problème utilisateur",
    sections: [
      ["2. Problème utilisateur", { chars: 20 }, "le problème que tu résous"],
    ],
    deepening: "2. Problème utilisateur",
  },
  {
    etape: "Étape 3 — Utilisateur cible",
    sections: [
      ["3. Utilisateur cible", { chars: 15 }, "pour qui tu le construis"],
    ],
    deepening: "3. Utilisateur cible",
  },
  {
    etape: "Étape 4 — Parcours clé",
    sections: [
      [
        "4. Parcours clé (3 à 5 étapes)",
        { items: 3 },
        "au moins 3 étapes numérotées du parcours de l'utilisateur",
      ],
    ],
    deepening: "4. Parcours clé (3 à 5 étapes)",
  },
  {
    etape: "Étape 5 — Périmètre",
    sections: [
      [
        "Fonctionnalités indispensables (max 3)",
        { items: 1 },
        "au moins 1 fonctionnalité indispensable (3 max), en TES mots",
      ],
      [
        "Hors périmètre (ce qu'on ne fait PAS dans ce MVP)",
        { items: 1 },
        "au moins 1 chose que tu ne fais PAS (hors périmètre)",
      ],
    ],
    deepening: "5. Périmètre du MVP",
  },
  {
    etape: "Étape 6 — Écrans",
    sections: [
      [
        "6. Écrans prévus (pages Next.js)",
        { items: 1 },
        "au moins 1 écran (page) sous forme de liste",
      ],
    ],
    deepening: "6. Écrans prévus (pages Next.js)",
  },
  {
    etape: "Étape 7 — Expérience utilisateur (UX)",
    sections: [
      [
        "Premier contact (ce que l'utilisateur voit en arrivant)",
        { chars: 15 },
        "ce que l'utilisateur voit et comprend en arrivant",
      ],
      [
        "États de l'interface (chargement, erreur, vide, succès)",
        { chars: 20 },
        "ce qui s'affiche pendant le chargement, en cas d'erreur, de vide et de succès",
      ],
      [
        "Ton & ambiance",
        { chars: 10 },
        "le ton des textes et le style visuel visé",
      ],
    ],
    deepening: "7. Expérience utilisateur (UX)",
  },
  {
    etape: "Étape 8 — Données & IA",
    sections: [
      [
        "8. Données & IA",
        { chars: 10 },
        "les données utilisées, et le rôle de l'IA (ou « aucune IA »)",
      ],
    ],
    deepening: "8. Données & IA",
  },
  {
    etape: "Étape 9 — Critères de succès",
    sections: [
      [
        "9. Critères de succès (comment on SAIT que le MVP marche)",
        { items: 1 },
        "au moins 1 critère mesurable sous forme de liste",
      ],
    ],
    deepening: "9. Critères de succès (comment on SAIT que le MVP marche)",
  },
  {
    etape: "Étape 10 — Risques & hypothèses",
    sections: [
      [
        "10. Risques & hypothèses à tester",
        { chars: 10 },
        "au moins un risque ou une hypothèse",
      ],
    ],
    deepening: "10. Risques & hypothèses à tester",
  },
  {
    etape: "Étape 11 — Stress-test (avocat du diable)",
    sections: [
      [
        "11. Stress-test (points challengés)",
        { items: 2 },
        "au moins 2 tensions examinées et tranchées sous forme de liste",
      ],
    ],
    deepening: null,
  },
  {
    etape: "Étape 12 — Validation explicite par l'étudiant",
    sections: [
      [
        "12. Reformulation (test Feynman)",
        { chars: 60 },
        "sa reformulation du projet en 3 phrases, de mémoire, en SES mots",
      ],
    ],
    deepening: null,
  },
];

// Les 3 axes de relecture par les sous-agents `concept-review`.
const AXES = ["questionnement", "couverture", "pedagogie"];

// Découpage en sections « ## » et sous-sections « ### ».
export const parseSections = (raw) => {
  const sections = {};
  const parts = raw.split(/^#{2,3}\s+/m);
  for (const part of parts.slice(1)) {
    const [title, ...rest] = part.split(/\r?\n/);
    sections[title.trim()] = rest.join("\n");
  }
  return sections;
};

const bodyOf = (sections, title) => sections[title] ?? "";
// « EXEMPLE — » (em-dash), « EXEMPLE - » ou « EXEMPLE : » marquent le
// contenu du template à remplacer.
const isExample = (body) => /EXEMPLE\s*[—\-:]/i.test(body);
const realBody = (body) =>
  body
    .split(/\r?\n/)
    .filter((l) => !/EXEMPLE\s*[—\-:]/i.test(l))
    .join("\n")
    .trim();
const countItems = (body) =>
  body.split(/\r?\n/).filter((l) => /^\s*([-*]|\d+[.)])\s+\S/.test(l)).length;
// Ligne « > Approfondissement : question creusée → effet sur la décision » :
// au moins 15 caractères après les deux-points, SUR LA MÊME LIGNE
// ([^\S\r\n] exclut le saut de ligne, sinon une ligne vide + la suivante
// passeraient à tort). L'ancienne forme « > Challenge : » reste acceptée :
// fiches commencées avant la version maïeutique.
const hasDeepening = (body) =>
  body
    .split(/\r?\n/)
    .some((l) =>
      />\s*(?:approfondissement|challenge)[^\S\r\n]*:[^\S\r\n]*\S[^\r\n]{14,}/i.test(
        l,
      ),
    );

export const isEtapeChecked = (sections, etapeLabel) => {
  const line = bodyOf(sections, "Progression de l'interview")
    .split(/\r?\n/)
    .find((l) => l.includes(etapeLabel));
  return !!line && /^\s*-\s*\[[xX]\]/.test(line);
};

// Erreurs d'UNE étape (sections + « > Approfondissement : ») — sert à la fois
// au rapport complet (check-concept) et au verrou d'écriture (guard-edit).
export const etapeErrors = (sections, etape) => {
  const errors = [];
  for (const [title, rule, hint] of etape.sections) {
    if (!Object.hasOwn(sections, title)) {
      errors.push(`section « ${title} » manquante`);
      continue;
    }
    const body = bodyOf(sections, title);
    if (isExample(body)) {
      errors.push(`section « ${title} » encore en EXEMPLE`);
      continue;
    }
    const content = realBody(body);
    const tooShort =
      rule.items !== undefined
        ? countItems(content) < rule.items
        : content.length < rule.chars;
    if (tooShort) errors.push(`section « ${title} » incomplète (${hint})`);
  }
  if (
    etape.deepening &&
    !hasDeepening(realBody(bodyOf(sections, etape.deepening)))
  ) {
    errors.push(
      `ligne « > Approfondissement : <question creusée> → <effet sur la décision> » manquante sous « ${etape.deepening} »`,
    );
  }
  return errors;
};

// Toutes les erreurs du TEXTE MVP.md (statut, progression, sections,
// approfondissements) — sans les fichiers de revue. skipStatut : guard-edit
// valide un fichier où « Statut : validé » est en cours d'écriture.
export const conceptTextErrors = (raw, { skipStatut = false } = {}) => {
  const errors = [];
  const sections = parseSections(raw);

  if (!skipStatut && !/^\s*>?\s*statut\s*:\s*validé/im.test(raw)) {
    errors.push(
      "Le statut du concept doit être « Statut : validé » (ligne sous le titre). Utilise le skill /concept avec ton agent.",
    );
  }

  const unchecked = ETAPES.filter((e) => !isEtapeChecked(sections, e));
  if (unchecked.length > 0) {
    errors.push(
      `Interview non terminée : ${unchecked.length} étape(s) non validée(s). ` +
        `Prochaine étape : « ${unchecked[0]} » — reprends le skill /concept ` +
        `(une question à la fois ; ne coche une étape que quand sa section est remplie ET approfondie).`,
    );
  }

  const mStep = />\s*étape\s*:\s*(\d+)\s*\/\s*(\d+)/i.exec(raw);
  if (
    !mStep ||
    Number(mStep[1]) !== ETAPES.length ||
    Number(mStep[2]) !== ETAPES.length
  ) {
    errors.push(
      `La ligne « > Étape : N/12 » doit indiquer ${ETAPES.length}/${ETAPES.length} (toutes les étapes terminées).`,
    );
  }

  for (const etape of ETAPE_CHECKS) {
    for (const msg of etapeErrors(sections, etape)) {
      errors.push(`${etape.etape} : ${msg}.`);
    }
  }
  return errors;
};

// Revue qualité par sous-agents : mi-parcours écrite, finale « validé ».
// Si le journal des sous-agents est actif (hooks Devin), on exige la preuve
// que le profil `concept-review` a réellement été lancé — un fichier de
// verdict écrit à la main ne compte pas.
export const reviewFileErrors = () => {
  const errors = [];
  // Preuve de lancement : les 3 axes doivent avoir été relus par des
  // sous-agents sur un commit ancêtre depuis lequel la SUBSTANCE du concept
  // (MVP.md + JOURNAL.md) n'a pas bougé — les verdicts eux-mêmes vivent dans
  // .concept/reviews/ et ne doivent pas invalider leur propre couverture.
  if (
    launchesCover("concept-review", [
      ".concept/MVP.md",
      ".concept/JOURNAL.md",
    ]) === false
  ) {
    errors.push(
      "Les 3 sous-agents `concept-review` n'ont pas été lancés sur l'état actuel du concept — les revues qualité doivent venir de relecteurs indépendants (run_subagent) sur le MVP.md actuel, pas d'un fichier écrit à la main ni d'une relecture périmée. (Changement d'IDE en cours de projet : supprime `.git/ihecs-subagents.log` pour désactiver cette preuve.)",
    );
  }
  const verdict = (path) => {
    if (!existsSync(path)) return null;
    const m = /verdict[^\S\r\n]*:[^\S\r\n]*([^\r\n]+)/i.exec(
      readFileSync(path, "utf8"),
    );
    return m ? m[1].trim() : "";
  };
  for (const axis of AXES) {
    const midPath = `.concept/reviews/mi-parcours-${axis}.md`;
    const mid = verdict(midPath);
    if (mid === null) {
      errors.push(
        `Revue qualité manquante : ${midPath} — le mentor lance les 3 sous-agents relecteurs au sas mi-parcours (skill /concept).`,
      );
    } else if (mid === "") {
      errors.push(
        `Revue qualité ${midPath} : ligne « > Verdict : … » introuvable — relance le relecteur.`,
      );
    }

    const finPath = `.concept/reviews/finale-${axis}.md`;
    const fin = verdict(finPath);
    if (fin === null) {
      errors.push(
        `Revue qualité finale manquante : ${finPath} — sous-agents relecteurs au sas finale (skill /concept).`,
      );
    } else if (!/^validé/i.test(fin)) {
      errors.push(
        `Revue qualité ${finPath} : verdict « ${fin || "?"} » au lieu de « validé » — applique le feedback du relecteur avec l'étudiant, puis relance ce relecteur.`,
      );
    }
  }
  return errors;
};

// Journal de l'interview (.concept/JOURNAL.md) : le mentor y note chaque
// étape au fil de l'eau — décision dans les mots de l'étudiant, raison
// invoquée, approfondissement réalisé, incertitude restante.
// « Statut : validé » exige les 12 notes — sans elles, pas de trace écrite.
export const journalFileErrors = () => {
  const path = ".concept/JOURNAL.md";
  if (!existsSync(path)) {
    return [
      `Journal d'interview manquant : ${path} — le mentor y note chaque étape (décision en ses mots, raison invoquée, approfondissement, incertitude restante) au fil de l'interview (skill /concept).`,
    ];
  }
  const sections = parseSections(readFileSync(path, "utf8"));
  const errors = [];
  // Chaque note exige les 4 lignes du journal de bord. « aucune », « aucun »
  // ou « non exprimée » sont des réponses acceptables quand c'est honnête —
  // on refuse le remplissage pour remplir, pas l'absence réelle.
  const line = (body, label, min) =>
    new RegExp(
      `${label}[^:\\r\\n]*:[^\\S\\r\\n]*\\S[^\\r\\n]{${min},}`,
      "i",
    ).test(body);
  for (let i = 1; i <= ETAPES.length; i++) {
    const title = Object.keys(sections).find((t) =>
      new RegExp(`^Étape\\s+${i}\\b`).test(t),
    );
    const body = title ? sections[title] : "";
    const missing = [
      !line(body, "décision", 14) && "« - Décision (ses mots) : … »",
      !line(body, "raison", 4) && "« - Raison invoquée : … »",
      !line(body, "approfondissement", 4) && "« - Approfondissement : … »",
      !line(body, "incertitude", 4) && "« - Incertitude restante : … »",
    ].filter(Boolean);
    if (missing.length > 0) {
      errors.push(
        `Journal : note de l'étape ${i} incomplète dans ${path} — ${missing.join(", ")} attendue(s) (« aucune », « aucun » ou « non exprimée » acceptés quand c'est honnête).`,
      );
    }
  }
  return errors;
};

// Synthèse compilée automatiquement par `pnpm concept:check` quand le concept
// est validé : document d'une page pour l'étudiant et l'enseignant.
export const syntheseMarkdown = () => {
  const raw = readFileSync(".concept/MVP.md", "utf8");
  const s = parseSections(raw);
  const pick = (title) => realBody(bodyOf(s, title));
  const approfondissements = raw
    .split(/\r?\n/)
    .filter((l) => />\s*(?:approfondissement|challenge)\s*:/i.test(l))
    .map(
      (l) =>
        `- ${l.replace(/^>\s*(?:approfondissement|challenge)\s*:\s*/i, "").trim()}`,
    );
  // Incertitudes restantes : relevées dans le journal — chaque ligne
  // « Incertitude restante » qui n'est pas « aucune » remonte dans la synthèse.
  const incertitudes = [];
  if (existsSync(".concept/JOURNAL.md")) {
    const journal = parseSections(readFileSync(".concept/JOURNAL.md", "utf8"));
    for (const [title, body] of Object.entries(journal)) {
      for (const l of body.split(/\r?\n/)) {
        const m = /incertitude[^:\r\n]*:[^\S\r\n]*(\S[^\r\n]*)/i.exec(l);
        if (m && !/^aucune?\b/i.test(m[1].trim())) {
          incertitudes.push(`- ${title} : ${m[1].trim()}`);
        }
      }
    }
  }
  const verdicts = [];
  for (const axis of AXES) {
    for (const stage of ["mi-parcours", "finale"]) {
      const p = `.concept/reviews/${stage}-${axis}.md`;
      if (!existsSync(p)) continue;
      const m = /verdict\s*:\s*([^\r\n]+)/i.exec(readFileSync(p, "utf8"));
      verdicts.push(`- ${stage} / ${axis} : ${m ? m[1].trim() : "?"}`);
    }
  }
  return `${[
    "# Synthèse du concept",
    "",
    "> Généré automatiquement par `pnpm concept:check` à la validation. Ne pas",
    "> éditer à la main : modifie `.concept/MVP.md` puis relance le contrôle.",
    "",
    "## Pitch",
    "",
    pick("1. Pitch (une phrase)"),
    "",
    "## Problème & utilisateur",
    "",
    `**Problème** : ${pick("2. Problème utilisateur")}`,
    "",
    `**Utilisateur cible** : ${pick("3. Utilisateur cible")}`,
    "",
    "## Parcours clé",
    "",
    pick("4. Parcours clé (3 à 5 étapes)"),
    "",
    "## Périmètre",
    "",
    `**Indispensable** :`,
    "",
    pick("Fonctionnalités indispensables (max 3)"),
    "",
    "**Hors périmètre** :",
    "",
    pick("Hors périmètre (ce qu'on ne fait PAS dans ce MVP)"),
    "",
    "## Écrans",
    "",
    pick("6. Écrans prévus (pages Next.js)"),
    "",
    "## Expérience utilisateur",
    "",
    `**Premier contact** : ${pick("Premier contact (ce que l'utilisateur voit en arrivant)")}`,
    "",
    `**États** : ${pick("États de l'interface (chargement, erreur, vide, succès)")}`,
    "",
    `**Ton & ambiance** : ${pick("Ton & ambiance")}`,
    "",
    "## Données & IA",
    "",
    pick("8. Données & IA"),
    "",
    "## Critères de succès",
    "",
    pick("9. Critères de succès (comment on SAIT que le MVP marche)"),
    "",
    "## Risques & hypothèses",
    "",
    pick("10. Risques & hypothèses à tester"),
    "",
    "## Stress-test (tensions examinées)",
    "",
    pick("11. Stress-test (points challengés)"),
    "",
    "## Reformulation de l'étudiant (test Feynman)",
    "",
    pick("12. Reformulation (test Feynman)"),
    "",
    "## Approfondissements pendant l'interview",
    "",
    approfondissements.length ? approfondissements.join("\n") : "_aucun_",
    "",
    "## Incertitudes restantes (à vérifier)",
    "",
    incertitudes.length ? incertitudes.join("\n") : "_aucune_",
    "",
    "## Verdicts des relecteurs qualité",
    "",
    verdicts.length ? verdicts.join("\n") : "_aucune revue_",
    "",
  ].join("\n")}`;
};
