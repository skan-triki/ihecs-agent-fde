---
name: ship
description: Livre une fonctionnalité proprement — contrôle qualité, corrections, vérification, commit conventionnel, push et lien de preview Vercel.
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
5. **Push** — `git push -u origin <branche>`.
6. **Pull Request** — si la branche n'est pas `main` : `gh pr create --fill` (le template de PR est rempli automatiquement) puis `gh pr view --json url`.
7. **CI** — `gh pr checks --watch`. Tant qu'un contrôle est rouge : lis le journal (`gh run view --log-failed`), corrige, recommence à l'étape 2. Ne passe jamais à la suite avec une CI rouge ou en cours.
8. **Preview** — donne à l'étudiant le lien de preview Vercel (commentaire du bot Vercel dans la PR) et demande-lui de tester le parcours clé de `.concept/MVP.md`.
9. **Fusion** — uniquement avec l'accord explicite de l'étudiant ET la CI verte : `gh pr merge --squash --delete-branch`, puis `git switch main && git pull`.
10. **Production** — attends le déploiement : `vercel ls --prod` jusqu'à `Ready` (si Vercel est lié), puis teste l'URL `https://<projet>.vercel.app` (HTTP 200 attendu : `pnpm routes:check https://<projet>.vercel.app`). Échec → explique-le à l'étudiant, ne dis pas « livré ».

Rapport final : branche, commit, lien de PR, état de la CI, URL de preview, URL de production + code HTTP, verdicts qualité et vérification. « Livré » seulement si la production répond 200.
