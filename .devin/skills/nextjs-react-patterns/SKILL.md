---
name: nextjs-react-patterns
description: Techniques de référence Next.js 16 (App Router) et React 19 du cours — à consulter AVANT de créer une page, un composant, un formulaire, une Server Action, un Route Handler ou un appel à une API d'IA.
triggers:
  - model
  - user
---

# Patterns Next.js / React du starter IHECS

> La version de Next.js installée peut différer de tes connaissances : en cas de doute, lis la doc locale dans `node_modules/next/dist/docs/` (ou utilise le MCP `next-devtools`).

## Arborescence

```
src/
├── app/                    # Routes (App Router) — uniquement routing, layout et composition
│   ├── (marketing)/        # Groupes de routes (n'affectent pas l'URL)
│   ├── api/<nom>/route.ts  # Route Handlers (webhooks, streaming IA, API publique)
│   ├── layout.tsx          # Racine : polices, thème, Toaster
│   ├── loading.tsx         # Conventionnel : chargement de la route
│   ├── error.tsx           # Conventionnel : erreurs de la route ("use client" obligatoire)
│   ├── not-found.tsx       # Conventionnel : 404
│   └── page.tsx
├── components/
│   └── <feature>/          # Composants métier, regroupés par fonctionnalité
├── design-system/          # ★ SOURCE UNIQUE du design system
│   ├── globals.css         # Tokens : couleurs, rayons, polices (seul endroit autorisé)
│   ├── components/         # shadcn/ui — généré par `pnpm exec shadcn add <composant>`
│   ├── theme-provider.tsx  # Thème clair/sombre
│   └── utils.ts            # cn()
├── hooks/                  # Hooks partagés (créés ici, jamais dans app/)
├── lib/                    # Logique pure — chaque module exige son X.test.ts voisin (pnpm src:check)
├── server/                 # Code serveur — chaque module commence par import "server-only" (pnpm src:check)
└── env.ts                  # Variables d'environnement typées (source de vérité)
```

Règles d'arborescence (canoniques Next.js) :

- `app/` ne contient JAMAIS de logique : délègue aux Server Components/Actions de `src/server/` et aux composants de `src/components/`.
- Crée `loading.tsx`, `error.tsx` et `not-found.tsx` au niveau de chaque route asynchrone qui en a besoin (pas seulement à la racine).
- Un dossier de route = son fichier de test à côté si pertinent ; les hooks partagés dans `src/hooks/`, les types partagés dans `src/types/`.
- `src/server/` : **première ligne = `import "server-only";`** — si un composant client importe le module, le build casse (protection mécanique, pas une convention).
- `src/lib/` : **chaque module exige son `X.test.ts` voisin** — `pnpm src:check` refuse sinon (voir « Tests » plus bas). Exemptés : les fichiers de types (`*.d.ts`) et les barils (`index.ts`).

## Server vs Client Components

- **Par défaut : Server Component** (async possible, accès direct aux données, zéro JS envoyé).
- `"use client"` **seulement** pour : `useState`/`useReducer`, `useEffect`, gestionnaires d'événements, API navigateur, librairies client.
- Pousse `"use client"` vers les **feuilles** : une page serveur qui contient un petit `<LikeButton />` client.
- Passe des données sérialisables d'un Server à un Client Component (pas de fonctions, pas de classes).

## Récupération de données

```tsx
// src/app/projects/page.tsx — Server Component
import { getProjects } from "@/server/projects";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectList projects={projects} />;
}
```

- Jamais de `useEffect(() => fetch(...))` pour des données initiales.
- Requêtes parallèles avec `Promise.all`. Streaming avec `<Suspense>` + `loading.tsx`.

## Mutations : Server Actions + Zod

```ts
// src/server/actions/create-project.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({ name: z.string().trim().min(2).max(80) });

export type ActionState = { ok: boolean; message: string };

export async function createProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { ok: false, message: "Nom invalide (2 à 80 caractères)." };
  }
  // ... persistance
  revalidatePath("/projects");
  return { ok: true, message: "Projet créé." };
}
```

```tsx
// Formulaire client
"use client";

import { useActionState } from "react";

import { Button } from "@/design-system/components/button";
import { Input } from "@/design-system/components/input";
import { Label } from "@/design-system/components/label";
import { createProject } from "@/server/actions/create-project";

export function CreateProjectForm() {
  const [state, action, pending] = useActionState(createProject, {
    ok: false,
    message: "",
  });
  return (
    <form action={action} className="flex flex-col gap-3">
      <Label htmlFor="name">Nom du projet</Label>
      <Input id="name" name="name" required />
      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Créer"}
      </Button>
      {state.message ? (
        <p role="status" className="text-sm text-muted-foreground">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
```

## Appels d'IA (Vercel AI Gateway)

- Toujours **côté serveur** (Server Action ou Route Handler) ; la clé ne quitte jamais le serveur.
- Clé via `env.AI_GATEWAY_API_KEY` (sur Vercel, l'authentification OIDC est automatique).
- Pour du streaming vers l'UI : Route Handler `src/app/api/<nom>/route.ts` + SDK `ai` (`pnpm add ai @ai-sdk/react`).
- Valide l'entrée utilisateur (Zod), limite la taille du prompt, gère les erreurs et les timeouts.

## Pages et métadonnées

- Chaque page exporte `metadata` (ou `generateMetadata` pour du dynamique).
- Ajoute `loading.tsx`, `error.tsx` (Client Component) et `not-found.tsx` au niveau pertinent.
- Navigation interne : `<Link href="/...">` de `next/link`. Images : `next/image` avec `alt` explicite.
- Paramètres dynamiques : `params` et `searchParams` sont des **Promises** — `const { id } = await params;`.

## React — règles d'or

- Pas d'état dérivé : calcule pendant le rendu au lieu de `useState` + `useEffect`.
- Un composant = une responsabilité ; > 150 lignes → découpe.
- Props typées avec `type Props = { ... }` ; pas de `any`.
- Clés de liste = identifiant stable (jamais l'index).
- Accessibilité : chaque champ a un `<Label htmlFor>`, chaque bouton a un texte ou `aria-label`.

## Tests (vitest) — une fonction sans test est une fonction non prouvée

TypeScript prouve que le code compile ; seul un test prouve qu'il calcule juste. `pnpm test` tourne dans `pnpm check` — donc au commit, au push, en CI et au build Vercel.

- **Convention mécanique** : tout module `src/lib/**/*.ts` exige son `X.test.ts` voisin (`pnpm src:check` refuse sinon). Les Server Actions de `src/server/` méritent des tests quand elles sont testables (validation Zod, logique de décision) — le relecteur `qualite` le vérifie.
- Fichier de test = à côté du module : `src/lib/price.ts` → `src/lib/price.test.ts`. Imports explicites : `import { describe, expect, it } from "vitest"`.
- Chaque test nomme un comportement observable : `it("arrondit le prix à 2 décimales")`, pas `it("works")`.
- Couvre le cas nominal, un cas limite et un cas d'erreur — 3 `it` suffisent pour une petite fonction.

```ts
// src/lib/price.test.ts
import { describe, expect, it } from "vitest";

import { formatPrice } from "./price";

describe("formatPrice", () => {
  it("formate un prix entier en euros", () => {
    expect(formatPrice(12)).toBe("12,00 €");
  });
});
```
