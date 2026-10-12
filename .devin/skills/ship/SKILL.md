---
name: ship
description: Livre une fonctionnalité proprement — contrôle qualité, sas de revue code par sous-agents, corrections, vérification, commit conventionnel, push et lien de preview Vercel.
argument-hint: "[message de commit optionnel]"
triggers:
  - user
---

Livre les changements en cours. La procédure de vérification complète (checklist avant commit, contrôles automatiques, test des routes, interdictions) est documentée dans `.check/VERIFICATION.md` — applique-la.

Enchaîne strictement :

1. **Branche** — si tu es sur `main` et qu'il y a des changements, crée une branche `feat/<sujet-court>` (ou `fix/...`) avant de commiter.
2. **Contrôle qualité** — utilise le skill `/quality-check`.
   - Verdict ❌ ou ⚠️ : corrige TOUS les points bloquants toi-même, puis relance `/quality-check`. Maximum 3 itérations, sinon stoppe et explique ce qui bloque.
3. **Vérification** — utilise le skill `/verify`. NO-GO → corrige et recommence à l'étape 2.
4. **Commit** — applique la checklist de `.check/VERIFICATION.md` §2, puis `git add -A` et un commit au format Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`), message court en français décrivant le _pourquoi_. Utilise le message de l'étudiant s'il en a fourni un. Ne jamais utiliser `--no-verify`.
5. **Sas de revue code (obligatoire, verrouillé)** — lance **3 sous-agents `code-review` en parallèle** (`run_subagent`, un par axe : `fidelite`, `qualite`, `ux`). Chacun relit le diff réel (`git diff main...HEAD`) et le concept (`.concept/MVP.md`), puis écrit `.reviews/<axe>.md` avec `> Verdict :` et `> Commit : <sha>`.
   - Les 3 verdicts `validé` sont exigés avant de pousser — `git push`, `gh pr create` et `gh pr merge` sont **mécaniquement bloqués** sinon.
   - `à retravailler` → corrige les points bloquants, commit, puis relance le relecteur concerné. Attention : tout nouveau commit rend les revues précédentes **obsolètes** (le SHA ne correspond plus) → relance les 3 relecteurs.
   - Vérifie l'état avec `pnpm review:check`. Maximum 3 itérations, sinon stoppe et explique ce qui bloque.
   - Si le profil `code-review` est indisponible dans ta session, dis-le à l'étudiant et demande de recharger la session — ne simule jamais une revue toi-même.
6. **Push** — `git push -u origin <branche>`.
7. **Pull Request** — si la branche n'est pas `main` : `gh pr create --fill` (le template de PR est rempli automatiquement) puis `gh pr view --json url`.
8. **CI** — `gh pr checks --watch`. Tant qu'un contrôle est rouge : lis le journal (`gh run view --log-failed`), corrige, recommence à l'étape 2. Ne passe jamais à la suite avec une CI rouge ou en cours.
9. **Preview** — donne à l'étudiant le lien de preview Vercel (commentaire du bot Vercel dans la PR) et demande-lui de tester le parcours clé de `.concept/MVP.md`.
10. **Fusion** — uniquement avec l'accord explicite de l'étudiant ET la CI verte : `gh pr merge --squash --delete-branch`, puis `git switch main && git pull`.
11. **Production (obligatoire, verrouillé)** — `pnpm prod:check` : il attend que Vercel serve exactement le dernier commit de `main` (route `/api/health`), puis teste la page d'accueil. Tant qu'il n'a pas réussi, toute nouvelle livraison (push, PR, fusion), toute écriture dans `src/` et la fin de tour sont **bloquées**. Échec → lis `vercel ls --prod` / `vercel inspect`, explique-le à l'étudiant, ne dis jamais « livré ».

Rapport final : branche, commit, lien de PR, état de la CI, URL de preview, URL de production + code HTTP, verdicts qualité, revue code et vérification. « Livré » seulement si la production répond 200.
