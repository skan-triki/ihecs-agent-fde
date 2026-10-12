// Vitest : tests unitaires de la logique pure (`src/lib/`) et des modules
// testables. `pnpm test` tourne dans `pnpm check` (pre-push, CI, Vercel).
// Convention : chaque module de `src/lib/**/*.ts` exige son `X.test.ts`
// voisin — vérifié mécaniquement par `pnpm src:check`.
import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    environment: "node",
    // Le template démarre sans module de logique : aucune suite n'existe
    // encore — OK. Dès que src/lib/ se remplit, src:check exige les tests,
    // donc la suite ne peut pas rester vide durablement.
    passWithNoTests: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
