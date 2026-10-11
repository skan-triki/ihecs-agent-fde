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

```bash
# Prérequis : Node >= 24, pnpm >= 10, GitHub CLI (gh), Vercel CLI
pnpm install
cp .env.example .env.local    # Windows : copy .env.example .env.local
pnpm dev                      # http://localhost:3000
```

Puis, avec votre agent IA, lancez **une seule fois** :

```
/bootstrap
```

Il installe, crée le dépôt GitHub, le projet Vercel, synchronise les variables d'environnement et vérifie que tout fonctionne.

## Le workflow étudiant (2 commandes à retenir)

| Commande         | Quand                          | Ce qui se passe                                                                               |
| ---------------- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| `/quality-check` | Pendant le développement       | Audit qualité indépendant : contrôles auto + relecture Next/React/Tailwind/shadcn             |
| `/ship`          | Pour livrer une fonctionnalité | Qualité → corrections → build & routes → commit conventionnel → branche → PR → preview Vercel |

Également utiles : `/setup-github`, `/setup-vercel`, `/env-vars ajouter <NOM>`, `/env-vars audit`, `/verify`, `/design-system`, `/nextjs-react-patterns`, `/bootstrap`.

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
| `pnpm exec shadcn add <composant>`  | Ajouter un composant shadcn/ui                                          |

## Variables d'environnement

Quatre emplacements, **toujours synchronisés** (le skill `/env-vars` le fait pour vous) :

1. `src/env.ts` — source de vérité, schéma Zod typé ;
2. `.env.example` — documentation, commitée, **sans valeur secrète** ;
3. `.env.local` — vos valeurs locales, **jamais commitée** (protégée par hooks et gitignore) ;
4. Vercel (Production / Preview / Development).

Règles : une clé secrète ne prend **jamais** le préfixe `NEXT_PUBLIC_` ; dans le code, on importe toujours `env` depuis `@/env` (l'accès direct à `process.env` est bloqué par ESLint). Sur Vercel, l'[AI Gateway](https://vercel.com/docs/ai-gateway) s'authentifie automatiquement en production — la clé `AI_GATEWAY_API_KEY` n'est nécessaire qu'en local.

## Garde-fous automatiques (ce qui vous protège)

| Où           | Garde-fou                                                                                                                                                                                                  | Effet                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Éditeur      | VSCode : ESLint + Prettier + Tailwind IntelliSense (extensions recommandées)                                                                                                                               | Erreurs visibles, format et tri des classes au save                         |
| Lint         | `eslint.config.mjs` : Next core-web-vitals, TS **strictTypeChecked**, jsx-a11y strict, better-tailwindcss, imports triés                                                                                   | `--max-warnings=0` : le moindre warning casse tout                          |
| Commits      | husky + lint-staged + commitlint (Conventional Commits)                                                                                                                                                    | Un commit mal formatté ou un mauvais message est rejeté                     |
| Push         | hook `pre-push` : types + code mort                                                                                                                                                                        | Impossible de pousser du code cassé                                         |
| Agent IA     | `.devin/hooks.v1.json` : bloque npm/npx, force-push, `--no-verify`, `.env*`, `eslint-disable`, modifications des garde-fous ; relint et reformatte chaque fichier édité ; vérifie lint+types avant l'arrêt | L'agent ne peut pas contourner les règles                                   |
| CI (GitHub)  | `.github/workflows/ci.yml` : `pnpm verify` + commitlint sur les PR                                                                                                                                         | Toute PR non conforme reste rouge                                           |
| Supply chain | pnpm `minimumReleaseAge: 7 jours`, lockfile figé en CI, Dependabot avec cooldown 7 jours, actions GitHub épinglées par SHA                                                                                 | Les dépendances fraîchement publiées (risque de supply chain) sont refusées |
| Sécurité     | `.env*` gitignorés, `process.env` restreint, scan de secrets, `poweredByHeader` désactivé                                                                                                                  | Pas de fuite de secrets                                                     |

Fichiers verrouillés (réservés à l'enseignant) : `eslint.config.mjs`, `tsconfig.json`, `.husky/*`, `.github/*`, `scripts/hooks/*`, `.devin/hooks.v1.json`, `pnpm-workspace.yaml`, `knip.json`, `lint-staged.config.mjs`.

## Structure du projet

```
├── .devin/                    # Configuration de l'agent IA (règles, agents, skills, hooks, MCP)
├── .github/                   # CI + Dependabot + template de PR
├── .husky/                    # Hooks git (pre-commit, commit-msg, pre-push)
├── .vscode/                   # Réglages et extensions recommandées
├── scripts/
│   ├── check-env.mjs          # Cohérence variables d'environnement
│   └── hooks/                 # Garde-fous exécutés par l'agent IA
└── src/
    ├── app/                   # Routes (App Router)
    ├── components/            # ui/ = shadcn, vos composants métier à côté
    ├── lib/                   # Utilitaires (cn, clients d'API)
    └── env.ts                 # Variables d'environnement typées
```

## Déploiement

Chaque push sur `main` déploie automatiquement en production (`https://<projet>.vercel.app`) ; chaque Pull Request crée une preview unique. Le build échoue si un contrôle qualité échoue — c'est voulu. Aucun nom de domaine personnalisé dans ce cours.
