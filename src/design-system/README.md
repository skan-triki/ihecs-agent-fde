# Design System — source unique de vérité

Tout le design de l'application vit dans ce dossier et **nulle part ailleurs** :

| Fichier / dossier    | Rôle                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `globals.css`        | **Le seul endroit** où l'on définit les couleurs, rayons, polices et le thème clair/sombre (variables `:root` et `.dark`) |
| `components/`        | Composants shadcn/ui, installés via `pnpm exec shadcn add <composant>`                                                    |
| `theme-provider.tsx` | Gestion du thème clair/sombre (next-themes)                                                                               |
| `utils.ts`           | `cn()` — la seule façon de fusionner des classes Tailwind                                                                 |

Règles appliquées automatiquement (ESLint, zéro tolérance) :

- hors de ce dossier, seuls les **tokens sémantiques** sont autorisés (`bg-background`, `text-muted-foreground`, `border-border`…) — les couleurs brutes (`bg-zinc-900`, `text-red-500`, `bg-[#1e40af]`, `bg-black`) sont des erreurs ;
- pour changer l'apparence : modifiez `globals.css` (ou appliquez un preset `pnpm exec shadcn apply`), jamais composant par composant ;
- l'ajout d'un composant UI passe par shadcn : `pnpm exec shadcn add <composant>` ;
- guide complet pour l'agent IA : `.devin/skills/design-system/SKILL.md`.
