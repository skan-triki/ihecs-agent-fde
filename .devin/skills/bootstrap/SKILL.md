---
name: bootstrap
description: Première mise en route complète du projet étudiant — installation, GitHub, Vercel, variables d'environnement, vérification. À lancer une seule fois au début.
triggers:
  - user
---

Mets en route ce projet de A à Z. Enchaîne les étapes dans l'ordre et ARRÊTE-TOI à la première étape en échec en expliquant à l'étudiant quoi faire.

1. **Environnement local**
   - Vérifie `node --version` (≥ 24), `pnpm --version` (≥ 10), `git --version`, `gh --version`, `vercel --version`.
   - Outil manquant → donne la commande d'installation (Node via https://nodejs.org, puis `corepack enable pnpm`, `npm i -g vercel`, `winget install GitHub.cli` / `brew install gh`) et stoppe.
   - `pnpm install`.
   - Si `.env.local` n'existe pas : copie `.env.example` vers `.env.local` (`node -e "require('fs').copyFileSync('.env.example','.env.local')"`).
2. **GitHub** — utilise le skill `/setup-github`.
3. **Vercel** — utilise le skill `/setup-vercel`.
4. **Variables d'environnement** — utilise le skill `/env-vars sync`.
5. **Vérification** — utilise le skill `/verify`.

Synthèse finale pour l'étudiant :

```
🚀 Projet prêt
- Repo GitHub : <url>
- Production : https://<projet>.vercel.app
- Variables : <état>
- Verdict : GO / NO-GO
- Pour coder : `pnpm dev` puis http://localhost:3000
- Avant chaque push : /ship
```
