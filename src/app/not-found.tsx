import Link from "next/link";

import { Button } from "@/design-system/components/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-6 py-24">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Page introuvable
      </h1>
      <p className="text-muted-foreground">
        Cette page n’existe pas ou a été déplacée.
      </p>
      <Button asChild>
        <Link href="/">Retour à l’accueil</Link>
      </Button>
    </main>
  );
}
