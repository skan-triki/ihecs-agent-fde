# Starter MVP IA — IHECS

Template prêt à l'emploi pour construire et livrer un MVP d'application IA : Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, GitHub, Vercel — avec des **garde-fous automatiques** qui vous empêchent de livrer du code incorrect.

> Dans ce cours, vous ne codez pas seul : un agent IA (Devin) travaille avec vous, mais un ensemble de contrôles **mécaniques** vérifie chaque modification. Zéro tolérance : si un contrôle échoue, rien ne part en production.

## Stack

| Élément     | Choix                                                                                                           | Rôle                            |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Framework   | [Next.js 16](https://nextjs.org) (App Router)                                                                   | Pages, API, rendu serveur       |
| UI          | [React 19](https://react.dev) + [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com) | Design system et styles         |
| Langage     | TypeScript (strict)                                                                                             | Types vérifiés à la compilation |
| Hébergement | GitHub + [Vercel](https://vercel.com) (URL `*.vercel.app`, sans domaine perso)                                  | Déploiement automatique         |
| Agent IA    | Devin / Windsurf (règles, agents et skills dans `.devin/`)                                                      | Développement assisté           |

## Démarrage rapide

**Rien à installer à la main** : dès votre premier message dans le chat, l'agent détecte l'état de votre machine (outils, dépendances, déploiement) et vous propose l'étape suivante.

| Situation détectée                                                  | L'agent fait quoi                                                                                                                                                      |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Un outil manque (Node, pnpm, Git, GitHub CLI, Vercel CLI, éditeur…) | Il lance `/install-tools` : il **installe tout lui-même** (winget/brew), vous n'avez qu'à approuver — seuls `gh auth login` et `vercel login` restent à faire par vous |
| Outils OK mais le concept du MVP n'est pas défini                   | Il lance `/concept` : une interview guidée qui remplit `.concept/MVP.md` avec vous — **aucun code n'est possible avant** (verrou automatique)                          |
| Outils OK, projet pas encore sur GitHub/Vercel                      | Il propose `/bootstrap` : dépôt GitHub, projet Vercel, variables, déploiement `*.vercel.app`, vérification                                                             |
| Tout est prêt                                                       | Il répond à votre demande (`pnpm dev` pour coder sur http://localhost:3000)                                                                                            |

Vous pouvez aussi tout déclencher explicitement :

```
/install-tools   # installe et configure tout l'environnement
/concept         # définit TON MVP (obligatoire avant de coder)
/bootstrap       # GitHub + Vercel + variables + premier déploiement
```

## Le workflow étudiant (3 commandes à retenir)

| Commande         | Quand                          | Ce qui se passe                                                                                                             |
| ---------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `/concept`       | Une fois, avant de coder       | L'agent t'interviewe et rédige `.concept/MVP.md` (pitch, problème, utilisateurs, périmètre, écrans, IA, critères de succès) |
| `/quality-check` | Pendant le développement       | Audit qualité indépendant : contrôles auto + relecture Next/React/Tailwind/shadcn                                           |
| `/ship`          | Pour livrer une fonctionnalité | Qualité → corrections → build & routes → commit conventionnel → branche → PR → preview Vercel                               |

> Avant chaque commit, l'agent applique la procédure complète de `.check/VERIFICATION.md` (liste de contrôle, commandes, contrôles automatiques) — un rappel lui est aussi injecté à chaque `git commit`.

Également utiles : `/install-tools`, `/setup-github`, `/setup-vercel`, `/env-vars ajouter <NOM>`, `/env-vars audit`, `/verify`, `/design-system`, `/nextjs-react-patterns`, `/bootstrap`.

## Commandes manuelles

| Commande                            | Description                                                             |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`                          | Serveur de développement                                                |
| `pnpm check`                        | Tous les contrôles : env, format, lint (zéro warning), types, code mort |
| `pnpm verify`                       | `check` + build de production                                           |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (aucun warning toléré)                                           |
| `pnpm format` / `pnpm format:check` | Prettier                                                                |
| `pnpm typecheck`                    | Types TypeScript (générés + vérifiés)                                   |
| `pnpm knip`                         | Détection de code et dépendances inutilisés                             |
| `pnpm env:check`                    | Cohérence des variables d'environnement (schéma ↔ `.env.example`)       |
| `pnpm concept:check`                | Validation du concept MVP (`.concept/MVP.md`)                           |
| `pnpm exec shadcn add <composant>`  | Ajouter un composant shadcn/ui                                          |

## Variables d'environnement

Quatre emplacements, **toujours synchronisés** (le skill `/env-vars` le fait pour vous) :

1. `src/env.ts` — source de vérité, schéma Zod typé ;
2. `.env.example` — documentation, commitée, **sans valeur secrète** ;
3. `.env.local` — vos valeurs locales, **jamais commitée** (protégée par hooks et gitignore) ;
4. Vercel (Production / Preview / Development).

Règles : une clé secrète ne prend **jamais** le préfixe `NEXT_PUBLIC_` ; dans le code, on importe toujours `env` depuis `@/env` (l'accès direct à `process.env` est bloqué par ESLint). Sur Vercel, l'[AI Gateway](https://vercel.com/docs/ai-gateway) s'authentifie automatiquement en production — la clé `AI_GATEWAY_API_KEY` n'est nécessaire qu'en local.

## Garde-fous automatiques (ce qui vous protège)

| Où                 | Garde-fou                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Effet                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Éditeur            | VSCode : ESLint + Prettier + Tailwind IntelliSense (extensions recommandées)                                                                                                                                                                                                                                                                                                                                                                                           | Erreurs visibles, format et tri des classes au save                         |
| Lint               | `eslint.config.mjs` : Next core-web-vitals, TS **strictTypeChecked**, jsx-a11y strict, better-tailwindcss (classes inconnues/dupliquées/en conflit, **couleurs brutes interdites hors `src/design-system/`**), imports triés                                                                                                                                                                                                                                           | `--max-warnings=0` : le moindre warning casse tout                          |
| Commits            | husky + lint-staged + commitlint (Conventional Commits)                                                                                                                                                                                                                                                                                                                                                                                                                | Un commit mal formatté ou un mauvais message est rejeté                     |
| Push               | hook `pre-push` : types + code mort                                                                                                                                                                                                                                                                                                                                                                                                                                    | Impossible de pousser du code cassé                                         |
| Agent IA           | `.devin/hooks.v1.json` (Devin CLI) + `.devin/hooks.json` (Cascade/Windsurf) : état onboarding sondé pour guider l'étudiant dès le 1er message (ou lancé par l'agent via `session-onboarding.mjs --human` si l'IDE n'a pas de hook de session) ; rappel de langage à chaque message ; bloque npm/npx, force-push, `--no-verify`, `.env*`, `eslint-disable`, modifications des garde-fous ; relint et reformatte chaque fichier édité ; vérifie lint+types avant l'arrêt | L'agent ne peut pas contourner les règles                                   |
| Concept avant code | hooks Devin (édition de `src/`, `shadcn add`, fin de tour) + hook git `pre-commit` : tant que `.concept/MVP.md` n'est pas `Statut : validé`, tout code applicatif est refusé                                                                                                                                                                                                                                                                                           | Impossible de construire sans avoir défini son MVP                          |
| Langage            | règle absolue dans `AGENTS.md` (français simple, sans jargon, termes expliqués) + hook `UserPromptSubmit` qui la réinjecte à chaque message                                                                                                                                                                                                                                                                                                                            | L'agent parle toujours le langage de l'étudiant                             |
| CI (GitHub)        | `.github/workflows/ci.yml` : `pnpm verify` + commitlint sur les PR                                                                                                                                                                                                                                                                                                                                                                                                     | Toute PR non conforme reste rouge                                           |
| Supply chain       | pnpm `minimumReleaseAge: 7 jours`, lockfile figé en CI, Dependabot avec cooldown 7 jours, actions GitHub épinglées par SHA                                                                                                                                                                                                                                                                                                                                             | Les dépendances fraîchement publiées (risque de supply chain) sont refusées |
| Sécurité           | `.env*` gitignorés, `process.env` restreint, scan de secrets, `poweredByHeader` désactivé                                                                                                                                                                                                                                                                                                                                                                              | Pas de fuite de secrets                                                     |

Fichiers verrouillés (réservés à l'enseignant) : `AGENTS.md`, `eslint.config.mjs`, `prettier.config.mjs`, `tsconfig.json`, `.husky/*`, `.github/*`, `scripts/*`, `.check/*`, `.devin/agents/*`, `.devin/skills/*`, `.devin/workflows/*`, `.devin/config.json`, `.devin/hooks.v1.json`, `.devin/hooks.json`, `pnpm-workspace.yaml`, `knip.json`, `lint-staged.config.mjs`.

## Structure du projet

```
├── .check/                    # Procédure de vérification que l'agent applique avant chaque commit
├── .devin/                    # Configuration de l'agent IA (règles, agents, skills, hooks, MCP)
├── .concept/                  # Concept de TON MVP — interview /concept, verrouillé tant que non validé
├── .github/                   # CI + Dependabot + template de PR
├── .husky/                    # Hooks git (pre-commit, commit-msg, pre-push)
├── .vscode/                   # Réglages et extensions recommandées
├── public/                    # Fichiers publics (images, icônes) servis tels quels
├── scripts/
│   ├── check-env.mjs          # Cohérence variables d'environnement
│   └── hooks/                 # Garde-fous exécutés par l'agent IA
└── src/
    ├── app/                   # Routes (App Router) : layout, page, loading, error, not-found
    ├── components/            # Vos composants métier (regroupés par fonctionnalité)
    ├── design-system/          # ★ SOURCE UNIQUE du design system (voir son README.md)
    │   ├── globals.css         # Tokens : couleurs, rayons, polices — seul endroit autorisé
    │   ├── components/         # Composants shadcn/ui
    │   ├── theme-provider.tsx  # Thème clair/sombre
    │   └── utils.ts            # cn()
    ├── hooks/                  # Hooks React partagés
    ├── lib/                    # Logique pure, clients d'API
    ├── server/                 # Code serveur uniquement (Server Actions, accès aux données)
    └── env.ts                  # Variables d'environnement typées
```

## Déploiement

Chaque push sur `main` déploie automatiquement en production (`https://<projet>.vercel.app`) ; chaque Pull Request crée une preview unique. Le build échoue si un contrôle qualité échoue — c'est voulu. Aucun nom de domaine personnalisé dans ce cours.
