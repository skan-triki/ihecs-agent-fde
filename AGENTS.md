<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Règles du starter MVP — IHECS

## Environnement (non négociable)

- **pnpm uniquement** (npm/yarn/npx/bun interdits — hooks). Node ≥ 24.
- **Stack** : Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · shadcn/ui · déploiement Vercel (URL `*.vercel.app`, jamais de domaine perso).
- Les fichiers de qualité (`eslint.config.mjs`, `tsconfig.json`, `.husky/`, `.github/`, `knip.json`, `lint-staged.config.mjs`, `pnpm-workspace.yaml`) sont **verrouillés** : ne les modifie pas, même si une règle gêne. Signale le besoin à l'étudiant/enseignant.

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
