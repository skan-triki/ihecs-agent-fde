# Vérifications — la procédure obligatoire avant chaque commit

Ce fichier est **la référence des contrôles** de ce projet. L'agent doit le consulter et l'appliquer **avant le moindre commit**, et avant de dire qu'une tâche est terminée.

Règle d'or, en une phrase :

> **`pnpm check` à 100 % avant de conclure une tâche ; `pnpm verify` à 100 % avant de livrer (commit + push).**

Les contrôles existent pour protéger l'étudiant : si l'un échoue, on **corrige la cause**, on ne contourne jamais (voir « Interdictions » plus bas).

---

## 1. Les contrôles, un par un

Dans l'ordre où ils doivent être lancés. En français simple : ce que fait chaque commande, et quoi faire si elle échoue.

| #   | Commande             | Ce qu'elle vérifie (en clair)                                                                                                                                                                                                                                                                  | En cas d'échec                                                                                                                           |
| --- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `pnpm concept:check` | Le concept du MVP (`.concept/MVP.md`) est rempli et `Statut : validé`. **Obligatoire dès qu'un fichier de `src/` est touché** — sinon le code est refusé.                                                                                                                                      | Compléter le concept avec le skill `/concept`. Ne jamais coder « pour voir ».                                                            |
| 2   | `pnpm env:check`     | Les variables d'environnement déclarées dans `src/env.ts`, `.env.example` et `.env.local` sont cohérentes (mêmes clés, rien d'orphelin).                                                                                                                                                       | Aligner les 3 fichiers — passer par le skill `/env-vars`. Ne jamais écrire un secret dans `.env.example`.                                |
| 3   | `pnpm src:check`     | Hygiène de `src/` : aucun fichier vide, noms de fichiers en kebab-case, pas de marqueur `TODO`/`FIXME`, tout module de `src/server/` porte `import "server-only"`, tout module de `src/lib/` a son `X.test.ts` voisin.                                                                         | Renommer le fichier ; supprimer le fichier vide ; terminer le travail plutôt que laisser un TODO ; ajouter l'import ou le test manquant. |
| 4   | `pnpm design:check`  | Les tokens du design system (`src/design-system/globals.css`) : `:root` et `.dark` déclarent exactement les mêmes variables, et `@theme` ne référence que des tokens définis.                                                                                                                  | Déclarer le token manquant dans l'autre thème ou corriger la référence `var(--…)`.                                                       |
| 5   | `pnpm format:check`  | La forme du code respecte Prettier (indentation, espaces, longueur des lignes).                                                                                                                                                                                                                | `pnpm format` corrige tout automatiquement.                                                                                              |
| 6   | `pnpm lint`          | ESLint examine le code : bonnes pratiques Next.js/React, accessibilité, classes Tailwind valides, couleurs uniquement via les tokens du design system, imports triés, **cycles d'imports refusés**, **imports hallucinés refusés** (`llm-core`). **Zéro warning toléré** (`--max-warnings=0`). | Lire chaque erreur (`fichier:ligne`) et corriger la cause. `pnpm lint:fix` répare ce qui est réparable automatiquement.                  |
| 7   | `pnpm typecheck`     | TypeScript vérifie que les types sont corrects partout (`next typegen` + `tsc --noEmit`).                                                                                                                                                                                                      | Corriger le type fautif — jamais de `any` ni de `@ts-ignore` pour masquer le problème.                                                   |
| 8   | `pnpm test`          | Vitest exécute les tests `*.test.ts` : la preuve que la logique calcule juste, pas seulement qu'elle compile.                                                                                                                                                                                  | Lire le test en échec, corriger la cause (le code ou le test, selon qui a tort).                                                         |
| 9   | `pnpm knip`          | Détecte le code mort : fichiers, exports ou dépendances inutilisés.                                                                                                                                                                                                                            | Supprimer l'inutilisé (ou l'utiliser s'il manque un branchement).                                                                        |
| 10  | `pnpm check`         | **Raccourci qui enchaîne les contrôles 2→9** (env, hygiène src, tokens design, format, lint, types, tests, code mort).                                                                                                                                                                         | La 1ʳᵉ erreur stoppe la chaîne : corriger puis relancer.                                                                                 |
| 11  | `pnpm build`         | `next build` fabrique la version de production. Prouve que l'app compile réellement (pages, routes, Server/Client Components).                                                                                                                                                                 | Lire l'erreur de build ; souvent un type ou un import — corriger la cause.                                                               |
| 12  | `pnpm verify`        | **La vérification complète avant livraison** : `check` (2→9) + `build`.                                                                                                                                                                                                                        | Idem : corriger puis relancer jusqu'à 100 %.                                                                                             |
| 13  | `pnpm review:check`  | Les 3 relecteurs code indépendants (`.reviews/`) ont validé l'état actuel du code — la revue reste valide tant que `src/` et `public/` n'ont pas bougé depuis le commit relu.                                                                                                                  | Lancer les sous-agents `code-review` sur le diff, corriger ce qu'ils bloquent.                                                           |
| 14  | `pnpm prod:check`    | Après chaque fusion : la production Vercel sert bien le dernier commit de `main` et répond en HTTP 200.                                                                                                                                                                                        | Attendre le déploiement Vercel, puis relire l'erreur — corriger et relivrer.                                                             |

> En parallèle : `pnpm dev` lance le serveur de développement sur <http://localhost:3000> pour tester à la main pendant qu'on code.

## 2. La checklist avant CHAQUE commit

À suivre dans l'ordre, sans en sauter :

- [ ] **1. Revoir le périmètre** — `git status --short` : seuls les fichiers voulus sont modifiés (pas de fichier de test temporaire, pas de `.env*`).
- [ ] **2. Concept** — si un fichier de `src/` est concerné : `pnpm concept:check` passe (sinon le commit sera refusé de toute façon).
- [ ] **3. `pnpm check` à 100 %** — env, hygiène `src/`, tokens design, format, lint, types, tests, code mort. Zéro erreur, zéro warning.
- [ ] **4. Message de commit** — format Conventional Commits, en français, décrivant le _pourquoi_ : `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:` (ex. `feat: ajoute la page de connexion`). Jamais `--no-verify`.
- [ ] **5. `git commit`** — les hooks git s'exécutent seuls (voir §3). Un refus = une erreur à corriger, pas un obstacle à contourner.
- [ ] **6. `git push`** — le hook `pre-push` relance `pnpm check` complet (env, hygiène `src/`, tokens design, format, lint, types, tests, code mort).
- [ ] **7. CI** — après le push, vérifier que la CI GitHub est verte : `gh run watch` ou `gh run list --limit 1`. Rouge = corriger et recommencer.
- [ ] **8. Pour une livraison** (pas un simple enregistrement) : `pnpm verify` + test des routes (§4) — ou plus simplement le skill `/ship`, qui enchaîne tout.

## 3. Les contrôles qui s'exécutent SEULS (rien à lancer)

Ces garde-fous tournent automatiquement — il faut les connaître pour comprendre un éventuel refus :

| Moment                                   | Contrôle automatique                                                                                                                                                                                                  | Effet                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| À chaque message de l'étudiant           | hooks `UserPromptSubmit` : la **porte du plan** s'arme (écriture `src/`/`public/` bloquée tant que `pnpm plan:ack "<plan>"` n'a pas énoncé l'intention) et l'**empreinte du tour** est figée (`.git/ihecs-turn-base`) | Réfléchir avant de coder, mécaniquement  |
| Après chaque fichier modifié par l'agent | hook `post-edit-lint` : re-lint + re-format du fichier                                                                                                                                                                | Les erreurs sont signalées immédiatement |
| Avant que l'agent conclue son tour       | hook `stop-gate` : si l'empreinte du tour n'a pas bougé, passage libre ; sinon lint + types + hygiène `src/` + tests liés sur les fichiers modifiés, et verrou concept                                                | Empêche de conclure sur du code cassé    |
| `git commit`                             | hook `pre-commit` : `concept:check --staged` (si `src/` touché) + `lint-staged` (ESLint `--fix` + Prettier sur les fichiers du commit)                                                                                | Commit refusé si non conforme            |
| `git commit`                             | hook `commit-msg` : commitlint                                                                                                                                                                                        | Message mal formé = commit refusé        |
| `git push`                               | hook `pre-push` : `pnpm check` + `pnpm rules:check` + `pnpm secrets:check`                                                                                                                                            | Impossible de pousser du code cassé      |
| Sur GitHub (push `main` / PR)            | CI : `rules:check` + `secrets:check` + `pnpm verify` + concept validé et revues code validées (dépôts étudiants) + commitlint sur les PR                                                                              | Une PR rouge ne se fusionne pas          |
| Mise en ligne Vercel                     | `vercel.json` → `pnpm build:vercel` : concept + règles + secrets + `pnpm verify`                                                                                                                                      | Code non conforme jamais en ligne        |

## 4. Le test manuel avant de livrer (fonctionnel)

La preuve qu'un code compile ne suffit pas : il faut qu'il **fonctionne**.

1. `pnpm build` puis `pnpm start --port 3123` (serveur de production local).
2. Tester chaque page/route en HTTP — elle doit répondre **2xx** :
   ```bash
   pnpm routes:check / /autre-route
   ```
3. Tester le parcours clé décrit dans `.concept/MVP.md` (section 4).
4. Si Vercel est lié : `vercel ls` → dernier déploiement `Ready`, et l'URL `https://<projet>.vercel.app` répond 200.
5. Arrêter le serveur lancé.

L'agent **verification** (skill `/verify`) applique exactement cette procédure et conclut par un verdict **GO / NO-GO** appuyé de preuves.

## 5. Zéro tolérance : ce qui est bloqué mécaniquement

**Commandes terminal de l'agent : liste blanche.** Seules sont autorisées les commandes du cours : scripts `pnpm` du projet, `pnpm add/remove/install`, `pnpm exec` (shadcn, eslint, prettier, tsc, next, knip, commitlint, lint-staged, vitest), `git` courant (sans options dangereuses), `gh` (PR, CI, dépôt, API en lecture), `vercel` (sans build local, domaine ni promotion), installation des outils (winget/brew/corepack/`npm i -g pnpm|vercel`), `node scripts/…` officiels, et la lecture de fichiers du projet. **Tout le reste est refusé**, notamment :

- `git commit -n` / `--no-verify`, `HUSKY=0`, `core.hooksPath`, `git -c …` — couper les hooks git ;
- `node -e`, `python`, `bash -c`, `powershell -c`, programmes lancés par chemin — exécuter du code arbitraire ;
- redirections vers un fichier (`>`, `>>`), `rm`, `sed`, `tee`, `Set-Content`, substitution `$(…)` — écrire des fichiers sans passer par l'outil d'édition ;
- `git push --force`, `git reset --hard`, `git checkout -- …`, `git restore --source`, `git rebase -i/--exec` — détruire du travail ;
- `git push` direct sur `main` (sauf tout premier envoi) — tout passe par une PR ;
- `gh pr merge` tant que la CI de la PR n'est pas entièrement verte, `--admin` ;
- `vercel --prebuilt`, `vercel build`, `vercel promote`, domaines ;
- `npm`/`npx`/`yarn`/`bun`, `pnpm dlx`, `pnpm pkg`, `pnpm --config.*` ;
- toute mention de `.env*`, de `IHECS_TEACHER_BYPASS` ou une variable d'environnement en préfixe.

**Fichiers (outil d'édition) :** écriture hors du projet, dans `.git/`, `node_modules/`, et dans toutes les règles (`AGENTS.md`, `package.json`, `vercel.json`, configs de qualité, `.husky/`, `.github/`, `scripts/`, `.devin/`, **ce dossier `.check/`**) ; `eslint-disable`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error`, `ignoreBuildErrors`, `skipValidation` ; `src/` tant que le concept n'est pas validé ; `.concept/` tant que GitHub et Vercel ne sont pas connectés (dépôt étudiant).

**Filets de sécurité indépendants de l'agent** (ils s'appliquent aussi aux modifications faites à la main) :

| Où                           | Contrôle                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git commit`                 | concept (si `src/`), lint-staged, commitlint                                                                                                          |
| `git push`                   | `pnpm check` + `pnpm rules:check` (règles identiques au template officiel) + `pnpm secrets:check`                                                     |
| CI GitHub                    | `rules:check`, `secrets:check`, `pnpm verify`, concept et revues code validées (dépôts étudiants, sur les PR), commitlint                             |
| Build Vercel (`vercel.json`) | concept + `rules:check` + `secrets:check` + `pnpm verify` : **un code non conforme n'est jamais mis en ligne**, même si tout le reste a été contourné |

**Ordre des étapes (verrouillé) :**

| Tant que…                                                   | …sont refusés                                                                          |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| installation pas terminée (Node, dépendances, `.env.local`) | écriture dans `.concept/`, `src/`, `public/` ; `shadcn add`                            |
| comptes GitHub et Vercel non connectés (dépôt étudiant)     | écriture dans `.concept/` (l'interview du concept)                                     |
| concept non validé                                          | écriture dans `src/`, `public/` ; `shadcn add` ; commit de `src/` ; CI et build Vercel |
| GitHub ou Vercel non liés (dépôt étudiant)                  | push d'une branche, création et fusion de PR                                           |
| production non vérifiée après une fusion                    | push, PR, fusion, écriture dans `src/`, fin de tour → `pnpm prod:check`                |

Règles modifiées par erreur ? `pnpm rules:sync` remet les versions officielles.

**Bypass enseignant** (maintenance du dépôt modèle uniquement) : la variable
d'environnement `IHECS_TEACHER_BYPASS=true`, posée par l'enseignant dans son
propre terminal — jamais par l'agent — désactive les verrous d'écriture sur les
fichiers de règles et le contrôle « concept avant code » au commit. Elle sert à
faire évoluer le template ; les étudiants ne l'utilisent jamais, et
`guard-exec` refuse à l'agent toute commande qui la mentionne.

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
au commit / push      →  hooks git (concept, lint-staged, commitlint, check, règles, secrets)
après le push         →  gh pr checks --watch → CI verte → fusion
mise en ligne         →  build Vercel = concept + règles + secrets + verify
```

## 8. Test comportemental du mentor (scénarios de rejeu)

Les contrôles mécaniques prouvent la **forme**, pas que le mentor pose de
bonnes questions. Pour ça : rejouer les transcripts de `docs/scenarios/`
(réponses d'étudiant prêtes à coller, réaction attendue à chaque étape).
Procédure complète et critères de réussite : `docs/scenarios/README.md`.
