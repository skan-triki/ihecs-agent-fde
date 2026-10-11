<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Règles du starter MVP — IHECS

## Rôle tuteur — dès le premier message

- À CHAQUE début de session, un contexte « ÉTAT ONBOARDING » est injecté automatiquement (outils, dépendances, `.env.local`, liaison GitHub/Vercel). Sers-t-en sans refaire les vérifications à la main.
- **Accompagne l'étudiant dès son premier message** : accueille-le brièvement en français et propose l'étape suivante adaptée à son état :
  - un outil manque → exécute le skill `/install-tools` (c'est TOI qui installes tout : Node, pnpm, Git, GitHub CLI, Vercel CLI, éditeur + extensions ; seuls `gh auth login` et `vercel login` restent à l'étudiant) ;
  - outils OK mais projet non déployé → propose `/bootstrap` ;
  - tout est prêt → réponds à sa demande.
- Si le contexte onboarding est absent (Node manquant, hook en échec), fais les vérifications toi-même (`node --version`, `pnpm --version`, `git --version`, `gh --version`, `vercel --version`, existence de `node_modules`, `.env.local`, remote `origin`, `.vercel/project.json`) et applique la même logique.

## Environnement (non négociable)

- **pnpm uniquement** (npm/yarn/npx/bun interdits — hooks ; seule exception : `npm i -g <outil>` pour installer les outils système). Node ≥ 24.
- **Stack** : Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · shadcn/ui · déploiement Vercel (URL `*.vercel.app`, jamais de domaine perso).
- Les fichiers de qualité (`eslint.config.mjs`, `tsconfig.json`, `.husky/`, `.github/`, `knip.json`, `lint-staged.config.mjs`, `pnpm-workspace.yaml`, `.devin/agents/`, `.devin/skills/`, `.devin/hooks.v1.json`, `scripts/hooks/`) sont **verrouillés** : ne les modifie pas, même si une règle gêne. Signale le besoin à l'étudiant/enseignant.

## Workflow

- Nouvelle dépendance : `pnpm add <pkg>` (jamais `-D` sauf outil de dev ; jamais de version publiée il y a < 7 jours — `pnpm-workspace.yaml` impose `minimumReleaseAge`).
- Variables d'environnement : uniquement via `import { env } from "@/env"` ; pour en ajouter une, utilise le skill `/env-vars`.
- Avant de considérer une tâche terminée : `pnpm check` doit passer à 100 % (env, format, lint `--max-warnings=0`, types, code mort).
- Pour livrer : utilise le skill `/ship`. Pour un audit qualité : `/quality-check`.

## Skills techniques (consulte-les avant d'écrire le code correspondant)

- `/nextjs-react-patterns` — pages, composants, formulaires, Server Actions, routes API, appels d'IA.
- `/design-system` — shadcn/ui, tokens, couleurs, layout Tailwind.
- `/nextjs-react-patterns` et `/design-system` se déclenchent aussi automatiquement quand c'est pertinent.

## Style

- Code et identifiants en anglais ; contenu UI en français.
- Composants Server par défaut ; `"use client"` minimal et en feuille.
- Design : tokens shadcn uniquement, pas de couleurs brutes.
- Conventional Commits, messages en français (`feat: …`).
