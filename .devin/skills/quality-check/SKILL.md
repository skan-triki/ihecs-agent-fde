---
name: quality-check
description: Contrôle qualité indépendant des changements en cours (contrôles automatiques + relecture Next/React/Tailwind/shadcn). Délègue à l'agent quality-control, en lecture seule.
agent: quality-control
triggers:
  - user
  - model
---

Réalise un contrôle qualité complet des changements en cours dans ce dépôt (fichiers modifiés non commités et commits de la branche courante par rapport à `main`).

Suis ta procédure : contrôles mécaniques, périmètre, grille de relecture. Ne modifie aucun fichier. Termine par le rapport au format imposé, avec des références `fichier:ligne` précises et une correction proposée pour chaque point bloquant.
