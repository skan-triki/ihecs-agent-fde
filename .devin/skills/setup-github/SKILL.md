---
name: setup-github
description: Crée et configure le dépôt GitHub du projet (création, premier push, réglages). Délègue à l'agent github-setup.
argument-hint: "[nom-du-repo] [--public]"
agent: github-setup
triggers:
  - user
---

Prépare le dépôt GitHub de ce projet en suivant intégralement ta procédure.

Paramètres éventuels fournis par l'étudiant (nom du repo, visibilité) : utilise-les s'ils sont présents dans la demande, sinon applique les valeurs par défaut (nom du `package.json`, dépôt privé).

Termine par le rapport final au format imposé.
