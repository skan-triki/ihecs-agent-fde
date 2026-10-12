# Scénario A — l'étudiant solide

Personnage : l'étudiant porte **SkillSwap**, un échange de compétences entre
étudiants IHECS. Ses réponses sont précises : chiffres, exemples, cas limites.

Attendu global : l'interview arrive au bout, chaque section porte un
`> Challenge :`, le journal est rempli, `pnpm concept:check` passe et
`.concept/SYNTHESE.md` est généré.

## Étape 1 — Pitch

> SkillSwap permet à un étudiant IHECS d'offrir 1 compétence qu'il maîtrise
> (ex. montage vidéo) et de demander 1 compétence en échange (ex. anglais).
> Pas d'argent : une compétence contre une compétence.

Attendu : le mentor challenge en citant « en échange » ou « une compétence
contre une compétence » — par exemple « pourquoi pas un simple groupe
WhatsApp ? ».

## Étape 2 — Problème utilisateur

> Dans ma promo de 30 étudiants, 12 ont déjà payé quelqu'un ou abandonné un
> travail faute d'aide ponctuelle (montage, anglais, Excel). Les demandes
> postées dans le groupe WhatsApp coulent en 24 h et personne ne les retrouve.

Attendu : challenge sur « coulent en 24 h » ou « personne ne les retrouve » —
comment il le sait, combien de demandes par semaine.

## Étape 3 — Utilisateur cible

> Étudiant IHECS Bac 1 à Bac 3, 18-24 ans, qui a déjà demandé ou rendu un
> service informel. Pas les profs, pas les anciens : la confiance vient du
> fait qu'on se croise tous les jours.

Attendu : challenge sur la taille du groupe ou « pourquoi pas les profs ».

## Étape 4 — Parcours clé

> 1. Il arrive sur la page et voit les demandes du jour de sa promo.
> 2. Il publie « j'offre X, je cherche Y » en remplissant 2 champs.
> 3. Le système lui propose un match quand une demande croise la sienne.
> 4. Il confirme ; les deux reçoivent le contact de l'autre.

Attendu : challenge sur le cas « aucun match ne vient » ou « demande
inappropriée » — cas limite nommé.

## Étape 5 — Périmètre

> Indispensables (3 max) : publier une offre/demande ; voir les demandes de
> la promo ; confirmer un match. Hors périmètre : messagerie, notation,
> paiement, application mobile, profils détaillés.

Attendu : le mentor vérifie qu'au moins 1 hors-périmètre est nommé et
challenge un indispensable (ex. « pourquoi confirmer, pas juste afficher ? »).

## Étape 6 — Écrans

> 3 pages : `/` accueil avec les demandes du jour, `/nouvelle` formulaire
> offre/demande, `/match/[id]` page de confirmation du match.

Attendu : challenge sur un écran manquant évident (ex. « où voit-on ses
propres demandes ? »).

## Étape 7 — UX

> Premier contact : il voit 3 demandes récentes et un gros bouton « Proposer
> un échange » — il comprend le concept en 10 secondes sans explication.
> États : squelette de chargement ; vide → « personne n'a encore demandé,
> sois le premier » ; erreur → message + bouton réessayer ; succès →
> « Match proposé à <prénom> ».
> Ton : direct et encourageant, zéro jargon, tutoiement.

Attendu : challenge sur l'état vide ou sur « comprend en 10 secondes » —
comment c'est testé.

## Étape 8 — Données & IA

> Aucune IA dans le MVP. Données : 2 champs texte de 140 caractères max
> (offre, demande), stockées côté serveur. Le « match » est une règle simple :
> même mot-clé des deux côtés.

Attendu : challenge sur « même mot-clé » (synonymes ? fautes ?) — la zone
d'ombre classique.

## Étape 9 — Critères de succès

> - 10 échanges proposés en 2 semaines de test auprès de ma promo.
> - au moins 1 match confirmé par les deux côtés.
> - 5 étudiants capables de ré-expliquer le concept sans aide après une visite.

Attendu : challenge sur la mesurabilité (« proposés » vs « confirmés »).

## Étape 10 — Risques & hypothèses

> Risque n°1 : personne ne poste au lancement → je pré-remplis avec 5
> demandes réelles de ma promo. Risque n°2 : demande inappropriée → pas de
> publication automatique, relecture avant affichage dans le test.

Attendu : challenge sur « relecture avant affichage » — qui relit, quel délai.

## Étape 11 — Stress-test

> - « Ça existe déjà avec les groupes WhatsApp » → réponse : les demandes
>   sont structurées (offre + recherche), pas noyées dans un fil ; le match
>   est visible au lieu d'être scrollé.
> - « Personne ne postera » → amorçage avec 5 demandes réelles et test
>   limité à une promo de 30.

Attendu : au moins 2 objections tranchées, en liste — exigé mécaniquement.

## Étape 12 — Validation (test Feynman)

> C'est un tableau d'entraide structuré : un étudiant écrit ce qu'il sait
> faire et ce qu'il cherche ; quand deux demandes se croisent, le site
> propose le match. Zéro argent, une règle : une compétence contre une
> compétence.

Attendu : reformulation de mémoire en ses mots (≥ 60 caractères), puis
`Statut : validé` possible.
