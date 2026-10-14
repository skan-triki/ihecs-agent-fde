# Scénarios de rejeu — tester le comportement du mentor

Les contrôles mécaniques (`pnpm concept:check`, `pnpm guards:test`…) vérifient la
**forme** : sections remplies, challenges présents, journal complet. Ils ne peuvent
pas prouver que le mentor pose de **bonnes questions** — ça demande un vrai échange.

Ces scénarios sont des transcripts prêts à rejouer : des réponses d'étudiant à coller
telles quelles dans une interview `/concept`, avec pour chaque étape la réaction
**attendue** du mentor. On rejoue, on observe, on compare.

> Pourquoi `docs/` et pas `.check/` : ce dossier **ne se synchronise pas** vers les
> dépôts étudiants (`pnpm rules:sync` ne copie que les règles). Sinon un étudiant
> pourrait copier les « bonnes » réponses dans sa fiche.

## Comment rejouer

1. Dans un **dépôt étudiant** après `/bootstrap` (GitHub + Vercel connectés —
   sinon le verrou refuse l'écriture dans `.concept/`). Dans le **dépôt modèle**,
   ce verrou ne s'applique pas : on peut rejouer directement, en veillant à
   restaurer le `MVP.md` d'origine ensuite (`git checkout -- .concept/`).
2. Nouvelle session → skill `/concept`.
3. À chaque question du mentor, coller la réponse du transcript, mot pour mot.
4. Comparer la réaction du mentor avec la colonne « attendu ».
5. À la fin : `pnpm concept:check` et comparer le verdict attendu.

## Critères de réussite

| Scénario              | Verdict attendu                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `etudiant-solide.md`  | Interview complète, `pnpm concept:check` passe, `.concept/SYNTHESE.md` généré                                       |
| `etudiant-flou.md`    | Le mentor **refuse d'avancer** tant que les réponses restent vagues ; `concept:check` échoue si la fiche est bâclée |
| `etudiant-delegue.md` | Le mentor **refuse de faire le travail** à la place de l'étudiant ; `Statut : validé` reste bloqué                  |

Si un scénario donne un résultat différent : le défaut est dans le skill
`/concept` ou dans un verrou — à signaler avant de modifier quoi que ce soit.
