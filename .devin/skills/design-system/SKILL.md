---
name: design-system
description: Règles du Design System (shadcn/ui + Tailwind CSS v4) — à consulter AVANT toute création ou modification d'interface (composant, page, style, thème, couleur, mise en page).
triggers:
  - model
  - user
---

# Design System : shadcn/ui + Tailwind CSS v4

## 0. Source unique de vérité : `src/design-system/`

Tout le design vit dans **un seul dossier** — `src/design-system/` — et nulle part ailleurs :

| Fichier / dossier                      | Rôle                                                                                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/design-system/globals.css`        | **Le seul endroit** où l'on définit couleurs, rayons, polices, thème clair/sombre (variables)                                             |
| `src/design-system/components/`        | Composants shadcn/ui + composants maison de la marque (`logo.tsx`, `theme-toggle.tsx` : bascule clair/sombre, thème par défaut « light ») |
| `src/design-system/theme-provider.tsx` | Gestion du thème (next-themes)                                                                                                            |
| `src/design-system/utils.ts`           | `cn()` — la seule façon de fusionner des classes                                                                                          |

- N'importe où ailleurs, seuls les **tokens sémantiques** sont autorisés : ESLint transforme toute couleur brute (`bg-zinc-900`, `text-red-500`, `bg-[#1e40af]`, `bg-black`) en erreur.
- On n'importe le design system QUE depuis `@/design-system/…` : importer depuis `@/components/ui/*` ou `@/lib/utils` est une erreur de lint.
- On ne crée **jamais** un autre fichier CSS de tokens, un autre dossier de composants UI, ou un `tailwind.config.js`.

## 1. Toujours partir de shadcn/ui

1. Cherche le composant : MCP `shadcn` (outils de recherche/consultation du registre) ou `pnpm exec shadcn search <terme>` / `pnpm exec shadcn docs <composant>`.
2. Installe-le avec la version figée du projet : `pnpm exec shadcn add <composant>` (jamais `npx shadcn@latest`). Le composant atterrit automatiquement dans `src/design-system/components/`.
3. Compose-le dans `src/components/<feature>/` (composants métier) — ne réécris pas un bouton, une modale, un menu, un champ… qui existe déjà.
4. Ne modifie `src/design-system/components/*` que pour un changement **global** du design system (et signale-le dans la PR).

Composants déjà installés : `button`, `card`, `input`, `label`, `textarea`, `badge`, `separator`, `skeleton`, `dialog`, `dropdown-menu`, `sonner` (toasts), `tooltip`.

## 2. Tokens sémantiques uniquement

Les couleurs, rayons et polices sont définis comme variables CSS dans `src/design-system/globals.css` (`:root` et `.dark`). Dans le code applicatif, utilise **exclusivement** les tokens :

| Usage                | Classes                                                    |
| -------------------- | ---------------------------------------------------------- |
| Fond / texte de page | `bg-background` `text-foreground`                          |
| Texte secondaire     | `text-muted-foreground`                                    |
| Surfaces             | `bg-card` `text-card-foreground`, `bg-muted`, `bg-popover` |
| Action principale    | `bg-primary` `text-primary-foreground`                     |
| Danger               | `bg-destructive` `text-destructive`                        |
| Bordures / focus     | `border-border` `border-input` `ring-ring`                 |

❌ Interdit dans le code applicatif : `bg-zinc-900`, `text-gray-500`, `bg-[#1e40af]`, `style={{ color: ... }}`.
✅ Pour changer l'identité visuelle : modifie les variables dans `src/design-system/globals.css` (ou applique un preset via `pnpm exec shadcn apply`), jamais composant par composant.

## 3. Tailwind CSS v4

- Configuration **CSS-first** : pas de `tailwind.config.js` ; tout est dans `src/design-system/globals.css` (`@theme inline`).
- Classes conditionnelles : `cn("base", condition && "extra")` depuis `@/design-system/utils` — jamais de concaténation de chaînes (`"p-2 " + x`) ni de classes construites dynamiquement (`` `text-${color}` ``) : Tailwind ne peut pas les détecter.
- Variantes de composant : `cva` (voir `src/design-system/components/button.tsx`).
- Utilise l'échelle (`p-4`, `gap-6`, `max-w-2xl`) ; valeurs arbitraires (`w-[437px]`) uniquement si justifiées.
- Mobile-first : styles de base pour mobile, puis `sm:` `md:` `lg:`.
- Mise en page : `flex` / `grid` + `gap-*` (pas de marges entre frères).
- L'ordre des classes est trié automatiquement par Prettier ; ESLint (`better-tailwindcss`) bloque les classes inconnues, en double, en conflit, obsolètes et — hors design system — toute couleur brute.

## 4. Mode sombre et accessibilité

- Le thème est géré par `next-themes` (`ThemeProvider` dans `layout.tsx`, classe `.dark`). Les tokens s'adaptent seuls : n'écris pas de `dark:` sur des couleurs de token.
- Contraste suffisant, focus visible (fourni par shadcn), cibles tactiles ≥ 40px, `alt` sur les images, `aria-label` sur les boutons-icônes.

## 5. Typographie et icônes

- Police : Geist (`font-sans`) et Geist Mono (`font-mono`) via `next/font`.
- Hiérarchie : `text-4xl font-semibold tracking-tight` (H1), `text-2xl font-semibold` (H2), `text-muted-foreground` pour les descriptions.
- Icônes : `lucide-react` uniquement (`import { PlusIcon } from "lucide-react"`).

## 6. Retours utilisateur

- Toasts : `import { toast } from "sonner"` → `toast.success("Enregistré")`.
- Chargement : `Skeleton` ou état `pending` des boutons. Erreurs : message clair en français, jamais de stack trace.
