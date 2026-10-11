# Concept MVP — <Nom de ton projet>

> Statut : brouillon
>
> C'est la carte d'identité de ton MVP. **Ton agent IA ne peut pas coder tant que
> ce fichier n'est pas « Statut : validé »** (verrou automatique). Définis-le avec
> le skill `/concept` : ton agent t'interviewe une question à la fois et remplit
> ce document AVEC toi. Le contenu ci-dessous est un EXEMPLE de remplissage —
> remplace-le entièrement par TON concept.

## 1. Pitch (une phrase)

EXEMPLE — « Un site qui aide les étudiants à réviser en transformant leurs
cours en quiz automatiques. »

## 2. Problème utilisateur

EXEMPLE — « Les étudiants relisent passivement leurs cours et ne savent pas
s'ils ont vraiment mémorisé. Résultat : stress et mauvaises notes. »

## 3. Utilisateur cible

EXEMPLE — « Étudiants de l'IHECS en révision d'examen, à l'aise avec le web,
peu de temps. »

## 4. Parcours clé (3 à 5 étapes)

EXEMPLE —

1. L'étudiant colle son résumé de cours.
2. Le site génère 5 questions à choix multiples.
3. L'étudiant répond et voit son score.
4. Le site propose de retravailler les questions ratées.

## 5. Périmètre du MVP

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

## 7. Données & IA

EXEMPLE — « Modèle : via Vercel AI Gateway. L'utilisateur fournit le texte ;
l'IA doit renvoyer strictement du JSON (5 questions, 4 choix, bonne réponse).
Pas de base de données dans ce MVP. »

## 8. Critères de succès (comment on SAIT que le MVP marche)

EXEMPLE —

- Un étudiant peut créer un quiz en moins de 2 minutes, sans aide
- Le quiz généré est jouable et le score s'affiche

## 9. Risques & hypothèses à tester

EXEMPLE — « L'IA renvoie parfois du JSON invalide → à tester tôt avec un vrai
cours. Hypothèse : les étudiants veulent des quiz plus que des flashcards. »
