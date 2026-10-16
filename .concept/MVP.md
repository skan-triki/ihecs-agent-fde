# Concept MVP — <Nom de ton projet>

> Statut : brouillon
> Étape : 0/12

> C'est la carte d'identité de ton MVP. **Ton agent IA ne peut pas coder tant que
> ce fichier n'est pas « Statut : validé »** (verrou automatique). Définis-le avec
> le skill `/concept` : ton agent te pose UNE question à la fois (un seul sujet),
> **approfondit avec toi** quand c'est utile (clarifier un mot, examiner une
> preuve, explorer une conséquence ou une tension — jamais pour te piéger),
> remplit la section avec tes mots, note cet échange en `> Approfondissement :`,
> consigne l'étape dans `.concept/JOURNAL.md` (décision, raison, approfondissement,
> incertitude restante), coche l'étape dans « Progression », puis passe à la
> suivante. **Aucune étape ne peut être sautée** : le verrou ne se lève que si
> les 12 étapes sont cochées, chaque section remplie avec TON contenu, chaque
> `> Approfondissement :` écrit ET le journal rempli. Des relecteurs automatiques
> évaluent aussi la qualité de l'interview à mi-parcours et avant la validation
> — leurs verdicts doivent être « validé » dans `.concept/reviews/`. À la
> validation, `pnpm concept:check` compile automatiquement `.concept/SYNTHESE.md`
> (résumé d'une page). Le contenu ci-dessous est un EXEMPLE de remplissage —
> remplace-le entièrement par TON concept.

## Progression de l'interview

- [ ] Étape 1 — Pitch
- [ ] Étape 2 — Problème utilisateur
- [ ] Étape 3 — Utilisateur cible
- [ ] Étape 4 — Parcours clé
- [ ] Étape 5 — Périmètre
- [ ] Étape 6 — Écrans
- [ ] Étape 7 — Expérience utilisateur (UX)
- [ ] Étape 8 — Données & IA
- [ ] Étape 9 — Critères de succès
- [ ] Étape 10 — Risques & hypothèses
- [ ] Étape 11 — Stress-test (avocat du diable)
- [ ] Étape 12 — Validation explicite par l'étudiant

## 1. Pitch (une phrase)

EXEMPLE — « Un site qui aide les étudiants à réviser en transformant leurs
cours en quiz automatiques. »

> Approfondissement : EXEMPLE — « qu'as-tu observé qui t'a donné cette idée ? »
> → l'étudiant raconte sa dernière révision : il relisait sans savoir s'il
> avait compris.

## 2. Problème utilisateur

EXEMPLE — « Les étudiants relisent passivement leurs cours et ne savent pas
s'ils ont vraiment mémorisé. Résultat : stress et mauvaises notes. »

> Approfondissement : EXEMPLE — « qu'as-tu observé qui te fait penser que
> d'autres ont ce problème ? » → hypothèse notée comme telle : à vérifier en
> faisant tester 3 étudiants dès le début.

## 3. Utilisateur cible

EXEMPLE — « Étudiants de l'IHECS en révision d'examen, à l'aise avec le web,
peu de temps. »

> Approfondissement : EXEMPLE — « pourquoi eux plutôt que tous les
> étudiants ? » → cible resserrée : l'IHECS d'abord, le reste après si ça
> marche.

## 4. Parcours clé (3 à 5 étapes)

EXEMPLE —

1. L'étudiant colle son résumé de cours.
2. Le site génère 5 questions à choix multiples.
3. L'étudiant répond et voit son score.
4. Le site propose de retravailler les questions ratées.

> Approfondissement : EXEMPLE — « comment un nouvel arrivant comprend-il
> l'étape 1 s'il n'a pas de résumé sous la main ? » → le site accepte aussi
> des notes brutes, sinon message clair.

## 5. Périmètre du MVP

> Approfondissement : EXEMPLE — « que se passerait-il sans comptes
> utilisateurs ? » → l'étudiant perd tout à chaque visite ; assumé : le MVP
> teste la génération du quiz, pas la fidélité.

### Fonctionnalités indispensables (max 3)

EXEMPLE —

- Coller un texte de cours
- Générer un quiz de 5 questions avec l'IA
- Afficher le score et les bonnes réponses

### Hors périmètre (ce qu'on ne fait PAS dans ce MVP)

EXEMPLE —

- Comptes utilisateurs et connexion
- Sauvegarde de l'historique
- Application mobile

## 6. Écrans prévus (pages Next.js)

EXEMPLE —

- `/` — accueil : décrire l'objectif + champ pour coller le cours
- `/quiz` — le quiz généré et le score

> Approfondissement : EXEMPLE — « que se passerait-il si tout tenait sur une
> seule page ? » → essayé en parlant : saisie et quiz mélangés rendraient
> l'écran confus, tranche l'étudiant.

## 7. Expérience utilisateur (UX)

> Approfondissement : EXEMPLE — « que se passerait-il si la génération prenait
> 30 secondes ? » → on montre une progression et une astuce de révision
> pendant l'attente.

### Premier contact (ce que l'utilisateur voit en arrivant)

EXEMPLE — « Un grand titre qui dit la promesse ("Transforme ton cours en quiz
en 2 minutes"), un champ texte évident, un bouton "Générer mon quiz". Pas de
menu compliqué. »

### États de l'interface (chargement, erreur, vide, succès)

EXEMPLE — « Chargement : un indicateur + "Ton quiz se prépare…". Erreur :
un message simple + un bouton "Réessayer". Vide : bouton désactivé tant que le
champ est vide. Succès : les questions s'affichent une par une, score en
haut. »

### Ton & ambiance

EXEMPLE — « On tutoie l'étudiant, ton encourageant et léger. Style épuré,
type Notion ou Linear : beaucoup d'espace, peu de couleurs. »

## 8. Données & IA

EXEMPLE — « Modèle : via Vercel AI Gateway. L'utilisateur fournit le texte ;
l'IA doit renvoyer strictement du JSON (5 questions, 4 choix, bonne réponse).
Pas de base de données dans ce MVP. »

> Approfondissement : EXEMPLE — « comment vérifieras-tu que l'IA n'invente pas
> une mauvaise réponse ? » → chaque question affiche le passage du cours dont
> elle est tirée.

## 9. Critères de succès (comment on SAIT que le MVP marche)

EXEMPLE —

- Un étudiant peut créer un quiz en moins de 2 minutes, sans aide
- Le quiz généré est jouable et le score s'affiche

> Approfondissement : EXEMPLE — « quelle observation te ferait dire que ça ne
> marche pas ? » → si personne ne termine un quiz entier, l'idée est à
> revoir.

## 10. Risques & hypothèses à tester

EXEMPLE — « L'IA renvoie parfois du JSON invalide → à tester tôt avec un vrai
cours. Hypothèse ouverte : les étudiants veulent des quiz plus que des
flashcards → à vérifier en proposant les deux formats à 3 camarades. »

> Approfondissement : EXEMPLE — « comment pourrais-tu vérifier que les quiz
> sont préférés aux flashcards ? » → mini-test des deux formats, laissé ouvert
> en attendant.

## 11. Stress-test (points challengés)

Les tensions les plus dures, examinées à la fin de l'interview, et comment
l'étudiant les a tranchées.

EXEMPLE —

- « Un concurrent gratuit fait pareil » → on part du cours de l'étudiant, pas
  d'une banque de questions génériques
- « L'étudiant ne reviendra pas après un essai » → le MVP prouve sa valeur en
  une seule session ; la fidélité sera un problème plus tard

## 12. Reformulation (test Feynman)

EXEMPLE — l'étudiant ré-explique son projet en quelques phrases, de mémoire :
« Mon projet aide les étudiants qui révisent à vérifier qu'ils ont vraiment
mémorisé. Le problème : ils relisent passivement. Le site transforme leur
cours en quiz en 2 minutes et montre le score. Ce qui reste incertain :
que les étudiants préfèrent ça aux flashcards — je le vérifie avec trois
camarades. »
