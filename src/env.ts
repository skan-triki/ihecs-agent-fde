import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Source de vérité UNIQUE des variables d'environnement.
 *
 * Pour ajouter une variable (ou utilisez le skill `/env-vars`) :
 *   1. Déclarez-la ici (`server` = secrète, `client` = publique, préfixe NEXT_PUBLIC_).
 *   2. Ajoutez-la dans `runtimeEnv` ci-dessous.
 *   3. Documentez-la dans `.env.example` (sans valeur secrète).
 *   4. Renseignez sa valeur dans `.env.local` ET sur Vercel (`vercel env add`).
 *
 * `pnpm env:check` vérifie mécaniquement la cohérence entre ce fichier et `.env.example`.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    AI_GATEWAY_API_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default("IHECS"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
