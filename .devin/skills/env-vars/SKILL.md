---
name: env-vars
description: Ajoute, audite ou synchronise les variables d'environnement (src/env.ts, .env.example, .env.local, Vercel) sans exposer de secret. Délègue à l'agent env-manager.
argument-hint: "ajouter <NOM> | audit | sync"
agent: env-manager
triggers:
  - user
  - model
---

Gère les variables d'environnement de ce projet selon le mode demandé par l'étudiant :

- `ajouter <NOM>` : déclare une nouvelle variable partout où il le faut ;
- `audit` : rapporte l'état de cohérence local / Vercel ;
- `sync` : aligne Vercel sur `.env.example`.

Sans mode explicite, fais un `audit`. Termine par le rapport final au format imposé.
