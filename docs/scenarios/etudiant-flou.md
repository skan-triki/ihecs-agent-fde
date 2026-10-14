# Scénario B — l'étudiant flou

Personnage : l'étudiant répond vague à tout. Le but du test : le mentor ne
doit **jamais** transformer ces réponses en contenu « propre » tout seul —
il doit relancer jusqu'à obtenir du précis, ou laisser l'étape non validée.

Attendu global : l'interview **cale** — les cases restent décochées et
`pnpm concept:check` échoue. Un échec ici est le résultat correct : le
système protège contre la précipitation.

## Réponses à coller

| Étape            | Réponse de l'étudiant                         | Attendu du mentor                                                                            |
| ---------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1 — Pitch        | « Un site pour s'entraider entre étudiants. » | Relance : qui, quoi, en une phrase. Pas de case cochée.                                      |
| 2 — Problème     | « Les gens galèrent pour trouver de l'aide. » | Relance : preuve, exemple concret, combien de personnes.                                     |
| 3 — Utilisateur  | « Tout le monde, enfin les étudiants quoi. »  | Relance : « tout le monde » n'est pas une cible — quel profil précis.                        |
| 4 — Parcours     | « Il arrive, il utilise le site, voilà. »     | Relance : étapes numérotées, du clic d'arrivée au résultat.                                  |
| 5 — Périmètre    | « Plein de trucs, on verra. »                 | Relance : max 3 indispensables + au moins 1 hors-périmètre nommé.                            |
| 6 — Écrans       | « Une page principale et des trucs. »         | Relance : liste de pages avec leur rôle.                                                     |
| 7 — UX           | « Simple et joli. »                           | Relance : premier contact, états (chargement/erreur/vide/succès).                            |
| 8 — Données & IA | « Je sais pas, sûrement de l'IA ? »           | Relance : quelles données, l'IA fait quoi exactement — « aucune IA » est une réponse valide. |
| 9 — Critères     | « Que ça marche bien. »                       | Relance : un critère mesurable (chiffre, délai, observation).                                |
| 10 — Risques     | « Aucun risque, c'est simple. »               | Relance : au moins un risque ou une hypothèse — personne ne poste ? données ?                |
| 11 — Stress-test | « Bah euh… non ? »                            | Le mentor joue l'avocat du diable et confronte ; attendre 2 objections tranchées.            |
| 12 — Validation  | « C'est un site quoi. »                       | Relance : reformulation complète en ses mots, ≥ 60 caractères.                               |

## Ce qui prouve que le mentor fait son travail

- Il **cite les mots** de l'étudiant dans ses objections (« tu as dit
  "simple et joli" — simple comment ? »).
- Après 2 relances sans avancée, il propose 2-3 exemples à choisir —
  pas une troisième relance identique.
- Il ne coche aucune case tant que la section n'est pas réellement remplie
  (le verrou `guard-edit` le refuse de toute façon).
- Le journal note chaque objection — même si la réponse reste floue, la
  question ouverte est consignée.

## Verdict attendu

`pnpm concept:check` **échoue** : sections vides ou non challengées,
journal incomplet, pas de `Statut : validé`. Si la commande passe avec ces
réponses, c'est un bug du contrôle — à signaler.
