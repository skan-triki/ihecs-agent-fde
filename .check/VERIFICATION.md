# Vérifications — la procédure obligatoire avant chaque commit

Ce fichier est **la référence des contrôles** de ce projet. L'agent doit le consulter et l'appliquer **avant le moindre commit**, et avant de dire qu'une tâche est terminée.

Règle d'or, en une phrase :

> **`pnpm check` à 100 % avant de conclure une tâche ; `pnpm verify` à 100 % avant de livrer (commit + push).**

Les contrôles existent pour protéger l'étudiant : si l'un échoue, on **corrige la cause**, on ne contourne jamais (voir « Interdictions » plus bas).

---

## 1. Les contrôles, un par un

Dans l'ordre où ils doivent être lancés. En français simple : ce que fait chaque commande, et quoi faire si elle échoue.

| #   | Commande             | Ce qu'elle vérifie (en clair)                                                                                                                                                                                       | En cas d'échec                                                                                                          |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | `pnpm concept:check` | Le concept du MVP (`.concept/MVP.md`) est rempli et `Statut : validé`. **Obligatoire dès qu'un fichier de `src/` est touché** — sinon le code est refusé.                                                           | Compléter le concept avec le skill `/concept`. Ne jamais coder « pour voir ».                                           |
| 2   | `pnpm env:check`     | Les variables d'environnement déclarées dans `src/env.ts`, `.env.example` et `.env.local` sont cohérentes (mêmes clés, rien d'orphelin).                                                                            | Aligner les 3 fichiers — passer par le skill `/env-vars`. Ne jamais écrire un secret dans `.env.example`.               |
| 3   | `pnpm format:check`  | La forme du code respecte Prettier (indentation, espaces, longueur des lignes).                                                                                                                                     | `pnpm format` corrige tout automatiquement.                                                                             |
| 4   | `pnpm lint`          | ESLint examine le code : bonnes pratiques Next.js/React, accessibilité, classes Tailwind valides, couleurs uniquement via les tokens du design system, imports triés. **Zéro warning toléré** (`--max-warnings=0`). | Lire chaque erreur (`fichier:ligne`) et corriger la cause. `pnpm lint:fix` répare ce qui est réparable automatiquement. |
| 5   | `pnpm typecheck`     | TypeScript vérifie que les types sont corrects partout (`next typegen` + `tsc --noEmit`).                                                                                                                           | Corriger le type fautif — jamais de `any` ni de `@ts-ignore` pour masquer le problème.                                  |
| 6   | `pnpm knip`          | Détecte le code mort : fichiers, exports ou dépendances inutilisés.                                                                                                                                                 | Supprimer l'inutilisé (ou l'utiliser s'il manque un branchement).                                                       |
| 7   | `pnpm check`         | **Raccourci qui enchaîne les contrôles 2→6** (env, format, lint, types, code mort).                                                                                                                                 | La 1ʳᵉ erreur stoppe la chaîne : corriger puis relancer.                                                                |
| 8   | `pnpm build`         | `next build` fabrique la version de production. Prouve que l'app compile réellement (pages, routes, Server/Client Components).                                                                                      | Lire l'erreur de build ; souvent un type ou un import — corriger la cause.                                              |
| 9   | `pnpm verify`        | **La vérification complète avant livraison** : `check` (2→6) + `build`.                                                                                                                                             | Idem : corriger puis relancer jusqu'à 100 %.                                                                            |

> En parallèle : `pnpm dev` lance le serveur de développement sur <http://localhost:3000> pour tester à la main pendant qu'on code.

## 2. La checklist avant CHAQUE commit

À suivre dans l'ordre, sans en sauter :

- [ ] **1. Revoir le périmètre** — `git status --short` : seuls les fichiers voulus sont modifiés (pas de fichier de test temporaire, pas de `.env*`).
- [ ] **2. Concept** — si un fichier de `src/` est concerné : `pnpm concept:check` passe (sinon le commit sera refusé de toute façon).
- [ ] **3. `pnpm check` à 100 %** — env, format, lint, types, code mort. Zéro erreur, zéro warning.
- [ ] **4. Message de commit** — format Conventional Commits, en français, décrivant le _pourquoi_ : `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:` (ex. `feat: ajoute la page de connexion`). Jamais `--no-verify`.
- [ ] **5. `git commit`** — les hooks git s'exécutent seuls (voir §3). Un refus = une erreur à corriger, pas un obstacle à contourner.
- [ ] **6. `git push`** — le hook `pre-push` relance `pnpm check` complet (env, format, lint, types, code mort).
- [ ] **7. CI** — après le push, vérifier que la CI GitHub est verte : `gh run watch` ou `gh run list --limit 1`. Rouge = corriger et recommencer.
- [ ] **8. Pour une livraison** (pas un simple enregistrement) : `pnpm verify` + test des routes (§4) — ou plus simplement le skill `/ship`, qui enchaîne tout.

## 3. Les contrôles qui s'exécutent SEULS (rien à lancer)

Ces garde-fous tournent automatiquement — il faut les connaître pour comprendre un éventuel refus :

| Moment                                   | Contrôle automatique                                                                                                                   | Effet                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Après chaque fichier modifié par l'agent | hook `post-edit-lint` : re-lint + re-format du fichier                                                                                 | Les erreurs sont signalées immédiatement |
| Avant que l'agent conclue son tour       | hook `stop-gate` : lint + types sur les fichiers modifiés, et verrou concept                                                           | Empêche de conclure sur du code cassé    |
| `git commit`                             | hook `pre-commit` : `concept:check --staged` (si `src/` touché) + `lint-staged` (ESLint `--fix` + Prettier sur les fichiers du commit) | Commit refusé si non conforme            |
| `git commit`                             | hook `commit-msg` : commitlint                                                                                                         | Message mal formé = commit refusé        |
| `git push`                               | hook `pre-push` : `pnpm check` complet (env, format, lint, types, code mort)                                                           | Impossible de pousser du code cassé      |
| Sur GitHub (push `main` / PR)            | CI `.github/workflows/ci.yml` : `pnpm verify` + concept validé (dépôts étudiants) + commitlint sur les PR                              | Une PR rouge ne se fusionne pas          |

## 4. Le test manuel avant de livrer (fonctionnel)

La preuve qu'un code compile ne suffit pas : il faut qu'il **fonctionne**.

1. `pnpm build` puis `pnpm start --port 3123` (serveur de production local).
2. Tester chaque page/routte en HTTP — elle doit répondre **2xx** :
   ```bash
   node -e "fetch('http://localhost:3123'+process.argv[1]).then(async r=>{console.log(process.argv[1],r.status);process.exit(r.ok?0:1)})" /
   ```
3. Tester le parcours clé décrit dans `.concept/MVP.md` (section 4).
4. Si Vercel est lié : `vercel ls` → dernier déploiement `Ready`, et l'URL `https://<projet>.vercel.app` répond 200.
5. Arrêter le serveur lancé.

L'agent **verification** (skill `/verify`) applique exactement cette procédure et conclut par un verdict **GO / NO-GO** appuyé de preuves.

## 5. Interdictions absolues (contourner = tricher)

Ces contournements sont **bloqués mécaniquement** par les hooks — et surtout, ils détruisent la protection offerte à l'étudiant :

- `git commit --no-verify` / `git push --no-verify` — contourner les hooks git.
- `eslint-disable`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` — masquer un diagnostic au lieu de le corriger.
- `git push --force`, `git reset --hard`, `git checkout --` — détruire du travail ou l'historique.
- `npm` / `yarn` / `npx` / `bun` pour le projet — seul `pnpm` est autorisé (exception : `npm i -g <outil>` pour installer un outil système).
- Écrire ou lire directement un `.env*` de secrets.
- Modifier les fichiers de garde-fous (`AGENTS.md`, `eslint.config.mjs`, `.husky/`, `.github/`, `scripts/`, `.devin/`, et **ce dossier `.check/`**) — réservé à l'enseignant.

## 6. Si un contrôle échoue : le protocole

1. **Lire l'erreur en entier** — les outils indiquent `fichier:ligne` et la règle violée.
2. **Corriger la cause**, pas le symptôme (ex. une classe Tailwind inconnue → utiliser le bon token, pas désactiver la règle).
3. **Relancer le contrôle** jusqu'à ce qu'il passe.
4. Après **3 tentatives** qui échouent encore : s'arrêter et expliquer à l'étudiant, en français simple — ce qui bloque, pourquoi, et quelles sont ses options. Ne jamais conclure en cachant un échec.

## 7. Résumé express (mémo)

```
avant de coder        →  /concept  (verrou tant que non validé)
pendant le code       →  pnpm dev   + contrôles auto à chaque fichier
avant de conclure     →  pnpm check (100 %)
avant de livrer       →  pnpm verify + test des routes  (= /ship)
au commit / push      →  hooks git (concept, lint-staged, commitlint, types)
après le push         →  gh run watch → CI verte
```
