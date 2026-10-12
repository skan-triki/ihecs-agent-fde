# Agent Forward-Deployed Engineer — Starter MVP (IHECS)

> Un projet tout prêt pour construire et mettre en ligne ta première application web, avec un agent IA qui code à tes côtés et des contrôles automatiques qui veillent sur toi.

## Pourquoi « Forward-Deployed Engineer » ?

Un _forward-deployed engineer_ (« ingénieur déployé en première ligne ») est un ingénieur envoyé directement chez le client pour construire la solution sur place, au plus près du besoin réel.

C'est exactement le rôle de ton agent IA dans ce cours : il est **déployé dans ton projet**, il écrit le code avec toi, il se conforme à tes règles — et il t'explique tout en français simple.

## C'est quoi, ce dépôt ?

Le kit de démarrage du cours IHECS. Les étudiant·e·s — sans être développeurs — créent chacun leur propre copie, puis construisent et mettent en ligne un **MVP** (une première version minimale de leur application) en travaillant avec l'agent IA Devin.

Le principe du cours :

1. **Tu décris** ce que tu veux, en français.
2. **L'agent écrit** le code et le vérifie.
3. **Des contrôles automatiques** relisent chaque modification. Si l'un échoue, rien ne part en ligne — c'est voulu, et ça te protège.

## Pour démarrer (une seule fois)

1. Crée ton propre dépôt depuis ce modèle : bouton **Use this template** en haut de la page GitHub, puis clone-le sur ta machine.
2. Ouvre le dossier dans **Devin Desktop** et réponds **Oui (Trust)** quand il demande si tu fais confiance au dossier — sinon les contrôles de l'agent sont désactivés.
3. Ouvre le chat de l'agent et écris simplement « bonjour ».

C'est tout. L'agent regarde l'état de ta machine (outils, connexions, projet) et te propose **une seule** prochaine étape à la fois : installer ce qui manque, te connecter à GitHub et Vercel, définir ton idée… Tu peux revoir ce point d'étape quand tu veux avec `pnpm diagnostic`.

## Travailler au quotidien

| Tu veux…                                      | Tu écris         | Ce qui se passe                                                 |
| --------------------------------------------- | ---------------- | --------------------------------------------------------------- |
| Définir ton idée (obligatoire avant de coder) | `/concept`       | L'agent t'interviewe et rédige `.concept/MVP.md` avec toi       |
| Voir ton site en construction                 | `pnpm dev`       | Ton site tourne sur ta machine : <http://localhost:3000>        |
| Faire relire ton travail                      | `/quality-check` | Un audit qualité indépendant passe ton code en revue            |
| Mettre en ligne une nouveauté                 | `/ship`          | Contrôles → commit → branche → PR → preview, puis mise en ligne |

## Les outils, en clair

| Outil                       | À quoi il sert                                                     |
| --------------------------- | ------------------------------------------------------------------ |
| Next.js 16 + React 19       | Le moteur qui fabrique les pages du site                           |
| TypeScript                  | Le langage du code, avec vérification automatique des erreurs      |
| Tailwind CSS v4 + shadcn/ui | L'habillage : couleurs, boutons, mise en page                      |
| GitHub                      | L'endroit où ton projet est rangé, sauvegardé et relu              |
| Vercel                      | L'endroit où ton site est mis en ligne (adresse en `*.vercel.app`) |
| Devin                       | L'agent IA qui écrit et vérifie le code avec toi                   |

## Ce qui te protège (sans rien avoir à faire)

- **Le concept avant le code** : impossible d'écrire la moindre ligne tant que `.concept/MVP.md` n'est pas rempli et validé. On réfléchit d'abord, on code ensuite.
- **Chaque fichier est relu** : après chaque modification de l'agent, le fichier est reformaté et revérifié automatiquement.
- **Rien ne passe cassé** : avant chaque commit (enregistrement de tes modifications) et chaque envoi sur GitHub, une batterie de contrôles tourne toute seule. Zéro warning toléré.
- **Une seule porte vers la mise en ligne** : tout passe par une PR (une demande de fusion qui fait relire ton travail) — jamais d'envoi direct.
- **Des règles verrouillées** : les fichiers de contrôle ne peuvent pas être modifiés, ni par toi ni par l'agent. `pnpm rules:sync` les restaure si besoin.
- **Tes secrets restent secrets** : `.env.local` (tes réglages privés) n'est jamais envoyé sur GitHub.

## Les commandes à connaître

| Commande           | En français                                             |
| ------------------ | ------------------------------------------------------- |
| `pnpm diagnostic`  | Où j'en suis, et quelle est la prochaine étape          |
| `pnpm dev`         | Lance le site sur ma machine pour tester                |
| `pnpm check`       | Tous les contrôles avant de dire « c'est fini »         |
| `pnpm verify`      | Les contrôles **+** la fabrication de la version finale |
| `pnpm prod:check`  | La version en ligne est-elle bien à jour ?              |
| `pnpm rules:check` | Les règles du cours sont-elles intactes ?               |

## Déploiement (la mise en ligne)

Chaque fusion sur `main` déploie automatiquement ton site à l'adresse `https://<ton-projet>.vercel.app`. Chaque PR crée une **preview** (une version d'essai en ligne, rien que pour toi).

Si un contrôle échoue pendant la fabrication, la mise en ligne est bloquée — un code non conforme ne se retrouve jamais en ligne. Pas de nom de domaine personnalisé dans ce cours : ton site vit sur `*.vercel.app`.

## Structure du projet (pour les curieux)

```
├── .concept/          # TON idée de MVP, rédigée avec l'agent (obligatoire avant de coder)
├── .check/            # La procédure de vérification appliquée avant chaque commit
├── .devin/            # Le cerveau de l'agent : règles, skills, contrôles automatiques
├── public/            # Images et fichiers servis tels quels
└── src/
    ├── app/           # Les pages de ton site
    ├── components/    # Tes briques d'interface réutilisables
    ├── design-system/ # Le design : couleurs, boutons, styles (source unique)
    ├── lib/           # La logique qui ne touche pas l'écran
    └── server/        # Le code qui tourne uniquement côté serveur
```

## Aller plus loin

- `AGENTS.md` — le règlement complet du cours (réservé à l'enseignant).
- `.check/VERIFICATION.md` — la liste des contrôles appliqués avant chaque livraison.
- `pnpm diagnostic` — ton point d'étape, à relancer aussi souvent que tu veux.
