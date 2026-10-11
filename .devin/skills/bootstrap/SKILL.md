---
name: bootstrap
description: Première mise en route complète du projet étudiant — installation de tous les outils, GitHub, Vercel, variables d'environnement, vérification. À lancer une seule fois au début.
triggers:
  - user
---

Mets en route ce projet de A à Z. Enchaîne les étapes dans l'ordre et ARRÊTE-TOI à la première étape en échec en expliquant à l'étudiant quoi faire.

0. **Pré-requis (bloquant)** — lance `pnpm diagnostic`. Code 1 → ne va PAS plus loin : applique la « PROCHAINE ÉTAPE » qu'il indique (outil manquant → `/install-tools` ; compte non connecté → donne à l'étudiant la commande exacte `gh auth login` ou `vercel login`, attends sa confirmation, relance `pnpm diagnostic`). On ne crée jamais un dépôt ou un projet Vercel avec un compte non connecté.
1. **Outils** — si l'étape 0 l'a demandé, utilise le skill `/install-tools` : il installe Node ≥ 24, pnpm ≥ 10, Git, GitHub CLI, Vercel CLI, l'éditeur + extensions, connecte les comptes (`gh auth login`, `vercel login` par l'étudiant), exécute `pnpm install` et crée `.env.local` depuis `.env.example`.
2. **GitHub** — utilise le skill `/setup-github`.
3. **Vercel** — utilise le skill `/setup-vercel`.
4. **Variables d'environnement** — utilise le skill `/env-vars sync`.
5. **Vérification** — utilise le skill `/verify`.

Synthèse finale pour l'étudiant :

```
🚀 Projet prêt
- Outils : Node / pnpm / Git / GitHub CLI / Vercel CLI / éditeur — ✅
- Repo GitHub : <url>
- Production : https://<projet>.vercel.app
- Variables : <état>
- Verdict : GO / NO-GO
- Prochaine étape : /concept (définir TON MVP — obligatoire avant de coder)
- Pour coder ensuite : `pnpm dev` puis http://localhost:3000
- Pour livrer : /ship
```

Termine en proposant immédiatement le skill `/concept` : le code applicatif reste verrouillé tant que `.concept/MVP.md` n'est pas validé.
