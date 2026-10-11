---
name: setup-vercel
description: Crée le projet Vercel, le relie à GitHub (déploiements automatiques) et publie le MVP sur une URL *.vercel.app (sans nom de domaine). Délègue à l'agent vercel-setup.
argument-hint: "[nom-du-projet]"
agent: vercel-setup
triggers:
  - user
---

Déploie ce projet sur Vercel en suivant intégralement ta procédure. Aucun nom de domaine personnalisé.

Si l'étudiant a fourni un nom de projet, utilise-le ; sinon reprends le nom du dépôt GitHub.

Termine par le rapport final au format imposé.
