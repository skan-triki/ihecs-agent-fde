---
name: install-tools
description: Installe tout l'environnement de travail manquant (Node, pnpm, Git, GitHub CLI, Vercel CLI, éditeur + extensions) et connecte les comptes. À lancer dès qu'un outil manque. Délègue à l'agent install-tools.
triggers:
  - user
---

Installe l'environnement complet de ce poste en suivant intégralement ta procédure (détection OS → installations → logins → extensions → vérification). L'étudiant n'a qu'à approuver les commandes et faire les deux logins interactifs (`gh auth login`, `vercel login`).

Termine par le rapport final au format imposé.
