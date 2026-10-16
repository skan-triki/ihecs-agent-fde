# Scénario A — l'étudiant solide

Personnage : l'étudiant porte **SkillSwap**, un échange de compétences entre
étudiants IHECS. Ses réponses sont précises : chiffres, exemples, cas limites.

Attendu global : l'interview arrive au bout. Une réponse déjà claire et
argumentée peut être reconnue sans objection artificielle (`> Approfondissement
: aucun — réponse claire d'emblée` est une trace honnête) ; quand le mentor
creuse, c'est une vraie difficulté. Chaque section porte sa ligne
`> Approfondissement :`, le journal est rempli (4 lignes par étape), `pnpm
concept:check` passe et `.concept/SYNTHESE.md` est généré.

## Étape 1 — Pitch

> SkillSwap permet à un étudiant IHECS d'offrir 1 compétence qu'il maîtrise
> (ex. montage vidéo) et de demander 1 compétence en échange (ex. anglais).
> Pas d'argent : une compétence contre une compétence.

Attendu : approfondissement possible en citant « en échange » ou « une
compétence contre une compétence » — par exemple « pourquoi pas un simple
groupe WhatsApp ? » — ou reconnaissance directe : la réponse est complète
et argumentée, pas besoin d'objection de pure forme.

## Étape 2 — Problème utilisateur

> Dans ma promo de 30 étudiants, 12 ont déjà payé quelqu'un ou abandonné un
> travail faute d'aide ponctuelle (montage, anglais, Excel). Les demandes
> postées dans le groupe WhatsApp coulent en 24 h et personne ne les retrouve.

Attendu : examen de la preuve sur « coulent en 24 h » ou « personne ne les
retrouve » — comment il le sait, combien de demandes par semaine. Fait
observé distingué de la supposition.

## Étape 3 — Utilisateur cible

> Étudiant IHECS Bac 1 à Bac 3, 18-24 ans, qui a déjà demandé ou rendu un
> service informel. Pas les profs, pas les anciens : la confiance vient du
> fait qu'on se croise tous les jours.

Attendu : creusage de la raison du choix (« pourquoi pas les profs ? ») —
la réponse est dans la phrase de l'étudiant : le mentor peut la reconnaître.

## Étape 4 — Parcours clé

> 1. Il arrive sur la page et voit les demandes du jour de sa promo.
> 2. Il publie « j'offre X, je cherche Y » en remplissant 2 champs.
> 3. Le système lui propose un match quand une demande croise la sienne.
> 4. Il confirme ; les deux reçoivent le contact de l'autre.

Attendu : conséquence sur le cas « aucun match ne vient » ou « demande
inappropriée » — cas limite nommé par l'étudiant.

## Étape 5 — Périmètre

> Indispensables (3 max) : publier une offre/demande ; voir les demandes de
> la promo ; confirmer un match. Hors périmètre : messagerie, notation,
> paiement, application mobile, profils détaillés.

Attendu : au moins 1 hors-périmètre nommé ; approfondissement par la
conséquence (« que se passerait-il sans la confirmation ? »).

## Étape 6 — Écrans

> 3 pages : `/` accueil avec les demandes du jour, `/nouvelle` formulaire
> offre/demande, `/match/[id]` page de confirmation du match.

Attendu : question d'observation sur un écran manquant évident (ex. « où
voit-on ses propres demandes ? ») — ou reconnaissance si l'étudiant l'a
lui-même anticipé.

## Étape 7 — UX

> Premier contact : il voit 3 demandes récentes et un gros bouton « Proposer
> un échange » — il comprend le concept en 10 secondes sans explication.
> États : squelette de chargement ; vide → « personne n'a encore demandé,
> sois le premier » ; erreur → message + bouton réessayer ; succès →
> « Match proposé à <prénom> ».
> Ton : direct et encourageant, zéro jargon, tutoiement.

Attendu : creusage de la preuve sur « comprend en 10 secondes » — comment
c'est testé — ou de l'état vide.

## Étape 8 — Données & IA

> Aucune IA dans le MVP. Données : 2 champs texte de 140 caractères max
> (offre, demande), stockées côté serveur. Le « match » est une règle simple :
> même mot-clé des deux côtés.

Attendu : tension réelle à explorer — « même mot-clé » : synonymes ?
fautes ? C'est la zone d'ombre classique, l'étudiant la examine.

## Étape 9 — Critères de succès

> - 10 échanges proposés en 2 semaines de test auprès de ma promo.
> - au moins 1 match confirmé par les deux côtés.
> - 5 étudiants capables de ré-expliquer le concept sans aide après une visite.

Attendu : ce qui ferait réviser — « quelle observation te ferait dire que
ça ne marche pas ? » (ex. zéro match confirmé).

## Étape 10 — Risques & hypothèses

> Risque n°1 : personne ne poste au lancement → je pré-remplis avec 5
> demandes réelles de ma promo. Risque n°2 : demande inappropriée → pas de
> publication automatique, relecture avant affichage dans le test.

Attendu : incertitude → enquête : « qui relit, quel délai — comment le
vérifieras-tu ? ». Une hypothèse peut rester ouverte avec son moyen de
vérification.

## Étape 11 — Stress-test

> - « Ça existe déjà avec les groupes WhatsApp » → réponse : les demandes
>   sont structurées (offre + recherche), pas noyées dans un fil ; le match
>   est visible au lieu d'être scrollé.
> - « Personne ne postera » → amorçage avec 5 demandes réelles et test
>   limité à une promo de 30.

Attendu : au moins 2 tensions examinées et tranchées, en liste — exigé
mécaniquement. C'est l'étudiant qui tranche, pas le mentor.

## Étape 12 — Validation (test Feynman)

> C'est un tableau d'entraide structuré : un étudiant écrit ce qu'il sait
> faire et ce qu'il cherche ; quand deux demandes se croisent, le site
> propose le match. Zéro argent, une règle : une compétence contre une
> compétence.

Attendu : reformulation de mémoire en ses mots (≥ 60 caractères), puis
`Statut : validé` possible.
