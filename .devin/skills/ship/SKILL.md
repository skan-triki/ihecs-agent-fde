---
name: ship
description: Livre une fonctionnalité proprement — contrôle qualité, corrections, vérification, commit conventionnel, push et lien de preview Vercel.
argument-hint: "[message de commit optionnel]"
triggers:
  - user
---

Livre les changements en cours. Enchaîne strictement :

1. **Branche** — si tu es sur `main` et qu'il y a des changements, crée une branche `feat/<sujet-court>` (ou `fix/...`) avant de commiter.
2. **Contrôle qualité** — utilise le skill `/quality-check`.
   - Verdict ❌ ou ⚠️ : corrige TOUS les points bloquants toi-même, puis relance `/quality-check`. Maximum 3 itérations, sinon stoppe et explique ce qui bloque.
3. **Vérification** — utilise le skill `/verify`. NO-GO → corrige et recommence à l'étape 2.
4. **Commit** — `git add -A` puis un commit au format Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`), message court en français décrivant le _pourquoi_. Utilise le message de l'étudiant s'il en a fourni un. Ne jamais utiliser `--no-verify`.
5. **Push** — `git push -u origin <branche>`.
6. **Pull Request** — si la branche n'est pas `main` : `gh pr create --fill` (le template de PR est rempli automatiquement) puis `gh pr view --json url`.
7. **Preview** — l'URL de preview Vercel apparaît dans la PR quelques instants après ; donne le lien de la PR à l'étudiant.

Rapport final : branche, commit, lien de PR, verdicts qualité et vérification.
