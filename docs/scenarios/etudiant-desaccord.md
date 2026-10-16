# Scénario D — l'étudiant qui tient son choix

Personnage : l'étudiant a déjà réfléchi à son projet — un tableau des
événements de l'école. Ses réponses sont argumentées, et quand le mentor
suggère autre chose, il n'est pas d'accord et il le dit.

Attendu global : l'interview arrive au bout **sans** que le désaccord soit
traité comme un échec — le mentor creuse les raisons, accepte les choix
argumentés, laisse une hypothèse ouverte avec son moyen de vérification.
`pnpm concept:check` peut passer : la divergence argumentée n'est pas un
défaut, c'est un indice d'autonomie.

## Réponses à coller

| Étape            | Réponse de l'étudiant                                                                                                                                                         | Attendu du mentor                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — Pitch        | « Un site qui liste les événements de l'IHECS : l'info est éparpillée entre 5 groupes WhatsApp et des affiches papier. »                                                      | Réponse déjà argumentée (problème observé + public) : le mentor la reconnaît et avance — une objection de pure forme serait artificielle.                               |
| 2 — Problème     | « J'ai raté deux conférences ce semestre parce que la date était dans un groupe dont je ne faisais pas partie. Trois amis pareil. »                                           | Fait vécu distingué de la généralisation : « c'est ton cas et 3 amis — comment vérifier que c'est partagé ? » L'hypothèse peut rester ouverte avec sa vérification.     |
| 3 — Utilisateur  | « Tous les étudiants de l'école, moi le premier. »                                                                                                                            | Clarification, pas confrontation : « tous » → quel profil en premier ?                                                                                                  |
| 4 — Parcours     | « 1. Il ouvre la page, 2. il voit les événements triés par date, 3. il filtre par association, 4. il ajoute à son agenda. »                                                   | Tension mise en regard, tranchée par l'étudiant : « ajouter à son agenda » suppose un compte ou un export — lequel ?                                                    |
| 5 — Périmètre    | « Indispensables : liste des événements, ajout par une asso, le filtre. Non, je garde le filtre : sans lui 40 événements c'est illisible, j'ai compté le mois dernier. »      | Le mentor avait suggéré de couper le filtre ; l'étudiant maintient un choix **argumenté** (comptage réel) → le mentor l'accepte et le consigne. Pas de relance stérile. |
| 6 — Écrans       | « Une seule page. Le filtre est en haut de la liste, pas ailleurs. »                                                                                                          | Une page assumée et argumentée → acceptée.                                                                                                                              |
| 7 — UX           | « En 5 s il voit le prochain événement. Chargement : cartes grisées. Erreur : message + réessayer. Vide : "aucun événement à venir". Ton sobre, comme le site de l'école. »   | Complet → pas d'objection artificielle ; si creusage, une conséquence réelle (« et si le prochain événement est dans 3 semaines ? »).                                   |
| 8 — Données & IA | « Pas d'IA. Les assos remplissent un formulaire, je valide à la main au début. »                                                                                              | Décision argumentée → acceptée ; l'incertitude « les assos joueront-elles le jeu » est notée, pas niée.                                                                 |
| 9 — Critères     | « 5 événements publiés par de vraies assos en 2 semaines, et 10 étudiants qui disent l'avoir utilisé pour choisir. »                                                          | Mesurable → le mentor peut demander comment ce sera mesuré concrètement, puis avancer.                                                                                  |
| 10 — Risques     | « Si aucune asso ne poste, le site est vide — c'est LE risque. Je vais d'abord convaincre 2 assos de tester. »                                                                | Hypothèse identifiée + moyen de vérification choisi par l'étudiant → notée dans le journal, pas transformée en certitude.                                               |
| 11 — Stress-test | « Le site de l'école pourrait faire pareil ? Il ne le fait pas depuis 3 ans — et les assos veulent un outil à elles, elles me l'ont dit. »                                    | Le mentor expose la tension (outil officiel vs outil des assos), l'étudiant tranche avec ses raisons → la divergence reste la sienne, documentée.                       |
| 12 — Validation  | « Les événements de l'école en un seul endroit, rempli par les assos elles-mêmes. Le risque : qu'elles ne postent pas — je le vérifie avec 2 assos avant d'aller plus loin. » | Reformulation qui inclut l'incertitude → indice de compréhension réelle.                                                                                                |

## Ce qui prouve que le mentor fait son travail

- Une réponse argumentée est reconnue comme telle — pas d'objection de
  pure forme après une réponse claire.
- Le désaccord de l'étudiant est examiné puis respecté quand il est
  argumenté ; le mentor ne « gagne » pas le débat à sa place.
- Les hypothèses restent identifiées comme telles, avec un moyen de
  vérification — pas maquillées en certitudes pour finir une étape.
- Le journal montre les 4 lignes : décision en ses mots, raison invoquée,
  approfondissement (ou « aucun »), incertitude restante.
- Si les échanges transmis à un relecteur sont trop maigres pour juger, son
  verdict dit ce qu'il ne peut pas conclure — pas une validation de
  convenance.

## Verdict attendu

`pnpm concept:check` **passe** si tout est rempli : le désaccord argumenté
n'est pas un échec. Si le mentor a imposé sa solution ou « gagné » le débat
à la place de l'étudiant, c'est un défaut de posture — à corriger dans
`.devin/skills/concept/SKILL.md`.
