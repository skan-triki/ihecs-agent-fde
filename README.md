# IHECS — Agent Forward-Deployed Engineer

> Construis une vraie application web et mets-la en ligne, sans être développeur. Un agent IA écrit le code avec toi, et des contrôles automatiques bloquent tout ce qui ne marche pas.

## Pourquoi ce nom ?

Un _forward-deployed engineer_ — un « ingénieur déployé en première ligne » — c'est un ingénieur envoyé directement chez le client pour construire la solution sur place, au plus près du besoin.

Dans ce cours, c'est ton agent IA qui joue ce rôle. Il est déployé dans ton projet, il écrit le code avec toi, il respecte tes règles et il t'explique tout en français simple.

## Comment ça marche

Tu pars d'une idée et tu aboutis à un site en ligne. Quatre temps, comme le résume la page d'accueil du projet : **de l'idée au produit**.

1. **Décrire.** Tu racontes ton idée et le problème qu'elle résout. L'agent la rédige avec toi dans `.concept/MVP.md` (commande `/concept`). Sans cette étape, aucun code n'est possible — on pense d'abord, on construit ensuite.
2. **Construire.** L'agent écrit le code pendant que tu décides. Tu vois ton site grandir en direct avec `pnpm dev`.
3. **Vérifier.** `/quality-check` fait relire le travail par un regard neuf, et `pnpm check` fait passer tous les contrôles automatiques.
4. **Déployer.** `/ship` envoie ton travail sur GitHub, et Vercel le met en ligne tout seul.

## La première fois

Trois choses à faire, une seule fois :

1. Clique sur **Use this template** en haut de cette page pour créer ton propre dépôt, puis clone-le sur ta machine.
2. Ouvre le dossier dans **Devin Desktop** et réponds **Oui** quand il te demande si tu fais confiance au dossier.
3. Dans le chat de l'agent, écris simplement « bonjour ».

À partir de là, c'est l'agent qui te porte : il regarde l'état de ta machine et te propose **une seule** prochaine étape à la fois — installer un outil, te connecter à GitHub ou Vercel, définir ton idée. Si tu te perds en route, `pnpm diagnostic` te redit où tu en es.

## Les commandes utiles

Tu n'as que quelques commandes à retenir. Elles se tapent dans le terminal, telles quelles :

| Commande          | Pour quoi faire                                     |
| ----------------- | --------------------------------------------------- |
| `pnpm diagnostic` | Savoir où tu en es et quelle est la prochaine étape |
| `pnpm dev`        | Tester ton site en direct (<http://localhost:3000>) |
| `pnpm check`      | Tous les contrôles avant de dire « c'est fini »     |
| `/concept`        | Définir ton idée avec l'agent — obligatoire         |
| `/ship`           | Mettre en ligne une nouveauté                       |

## Ce qui te protège

Rien à installer, rien à configurer : les garde-fous tournent tout seuls, à chaque étape.

- **Le concept avant le code.** Tant que `.concept/MVP.md` n'est pas validé, aucune ligne de code n'est possible — ni pour toi, ni pour l'agent.
- **Chaque fichier est relu.** Après chaque modification, le fichier est reformaté et revérifié automatiquement. Zéro avertissement toléré.
- **Une seule porte vers la mise en ligne.** Tout passe par une PR — une demande de fusion qui fait relire ton travail avant qu'il ne parte sur `main`.
- **Tes réglages privés restent privés.** `.env.local` ne part jamais sur GitHub.
- **Les règles sont verrouillées.** Si quelque chose les abîme, `pnpm rules:sync` les restaure.

## Et sous le capot ?

Pas besoin de connaître ces noms par cœur — ce sont les choix techniques du cours, déjà faits pour toi : le site est construit avec **Next.js** et **React**, écrit en **TypeScript**, habillé par **Tailwind CSS** et **shadcn/ui**. Le code est rangé sur **GitHub** et mis en ligne par **Vercel**, à une adresse en `*.vercel.app`.

## Pour aller plus loin

- `AGENTS.md` — le règlement complet du cours.
- `.check/VERIFICATION.md` — tous les contrôles, expliqués un par un.
- `src/design-system/` — tout le design de ton app, au même endroit.
- `.concept/MVP.md` — la carte d'identité de ton MVP, à remplir avec l'agent.
