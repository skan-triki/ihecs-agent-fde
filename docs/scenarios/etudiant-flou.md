# Scénario B — l'étudiant flou

Personnage : l'étudiant répond vague à tout. Le but du test : le mentor ne
doit **jamais** transformer ces réponses en contenu « propre » tout seul —
il clarifie, reformule, illustre (sans décider à sa place), jusqu'à obtenir
du précis ou laisser l'étape non validée.

Attendu global : l'interview **cale** — les cases restent décochées et
`pnpm concept:check` échoue. Un échec ici est le résultat correct : le
système protège contre la précipitation.

## Réponses à coller

| Étape            | Réponse de l'étudiant                         | Attendu du mentor                                                                                                 |
| ---------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1 — Pitch        | « Un site pour s'entraider entre étudiants. » | Clarification : qui, quoi — ou retour au vécu : « quelle situation t'a donné cette idée ? ». Pas de case cochée.  |
| 2 — Problème     | « Les gens galèrent pour trouver de l'aide. » | Preuve : « qu'as-tu observé ? » — exemple concret, combien de personnes.                                          |
| 3 — Utilisateur  | « Tout le monde, enfin les étudiants quoi. »  | Clarification : « tout le monde » n'est pas une cible — quel profil précis.                                       |
| 4 — Parcours     | « Il arrive, il utilise le site, voilà. »     | Relance : étapes numérotées, du clic d'arrivée au résultat.                                                       |
| 5 — Périmètre    | « Plein de trucs, on verra. »                 | Relance : max 3 indispensables + au moins 1 hors-périmètre nommé — puis illustrations rejetables si blocage.      |
| 6 — Écrans       | « Une page principale et des trucs. »         | Relance : liste de pages avec leur rôle.                                                                          |
| 7 — UX           | « Simple et joli. »                           | Définition : « quand tu dis "simple", ça veut dire quoi à l'écran ? » puis états (chargement/erreur/vide/succès). |
| 8 — Données & IA | « Je sais pas, sûrement de l'IA ? »           | Relance : quelles données, l'IA fait quoi exactement — « aucune IA » est une réponse valide.                      |
| 9 — Critères     | « Que ça marche bien. »                       | Relance : un critère mesurable (chiffre, délai, observation).                                                     |
| 10 — Risques     | « Aucun risque, c'est simple. »               | Relance : au moins un risque ou une hypothèse — personne ne poste ? données ?                                     |
| 11 — Stress-test | « Bah euh… non ? »                            | Le mentor met en regard les tensions restantes, une à la fois ; attendre 2 tensions tranchées.                    |
| 12 — Validation  | « C'est un site quoi. »                       | Relance : reformulation complète en ses mots, ≥ 60 caractères.                                                    |

## Ce qui prouve que le mentor fait son travail

- Il **cite les mots** de l'étudiant dans ses questions (« tu as dit
  "simple et joli" — simple, ça veut dire quoi pour toi ? »).
- Après 2 relances sans avancée, il propose des **illustrations variées** —
  présentées comme ni exhaustives ni attendues, toutes rejetables — puis
  revient à la formulation de l'étudiant. Pas une troisième relance
  identique, pas une liste qui pense à sa place.
- Il ajuste son aide sans décider à la place : simplifier la question
  n'est pas y répondre.
- Il ne coche aucune case tant que la section n'est pas réellement remplie
  (le verrou `guard-edit` le refuse de toute façon).
- Le journal note chaque étape — même si la réponse reste floue,
  l'incertitude est consignée dans « Incertitude restante ».

## Verdict attendu

`pnpm concept:check` **échoue** : sections vides ou sans trace
d'approfondissement, journal incomplet, pas de `Statut : validé`. Si la
commande passe avec ces réponses, c'est un bug du contrôle — à signaler.
