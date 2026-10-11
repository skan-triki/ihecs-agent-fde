import { env } from "@/env";

// Indique quel commit est en ligne : utilisé par `pnpm prod:check` pour
// prouver que la production sert bien la dernière version de `main`.
export function GET() {
  return Response.json({ commit: env.VERCEL_GIT_COMMIT_SHA ?? null });
}
