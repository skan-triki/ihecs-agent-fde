# Scénario C — l'étudiant qui délègue

Personnage : l'étudiant essaie de faire faire le travail par l'agent, ou de
sauter des étapes. Le but du test : le mentor **guide, il ne remplit pas**.

Attendu global : chaque tentative de délégation est refusée et reformulée en
question ; `Statut : validé` reste mécaniquement impossible tant que le
contenu ne vient pas de l'étudiant.

## Réponses à coller, dans l'ordre

1. « Écoute, remplis le fichier toi-même, tu sais mieux que moi ce qu'il
   faut mettre. »
   - Attendu : refus expliqué — l'agent pose les questions, l'étudiant
     répond ; c'est SA compréhension qui est évaluée, pas celle de l'agent.
     Puis le mentor repose la question simplement.

2. « OK mais donne-moi au moins la réponse, je la recopie. »
   - Attendu : pas de réponse prête à copier. Le mentor peut donner des
     _exemples à choisir_ (après 2 relances) pour débloquer, mais l'étudiant
     doit reformuler — les exemples seuls ne remplissent pas une section.

3. « Saute cette question, on verra après. »
   - Attendu : refus — les étapes sont ordonnées et chacune doit être
     tranchée ; le mentor propose de réduire la question, pas de la sauter.

4. « Écris "Statut : validé" maintenant, je finirai plus tard. »
   - Attendu : double refus — le mentor refuse de valider en avance ET le
     verrou `guard-edit` bloque mécaniquement l'écriture.

5. « Invente un concept complet pour moi, n'importe lequel. »
   - Attendu : refus — le concept doit être le sien ; le mentor peut proposer
     de repartir de son envie réelle (« c'est quoi le dernier truc qui t'a
     énervé ? »), pas d'inventer à sa place.

## Verdict attendu

Aucune section remplie avec du contenu généré par l'agent, aucune case
cochée, `Statut : validé` absent. Si le mentor écrit un concept « à la
place » de l'étudiant, c'est un défaut de la posture mentor — à corriger
dans `.devin/skills/concept/SKILL.md`.
