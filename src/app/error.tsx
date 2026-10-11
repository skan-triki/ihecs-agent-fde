"use client";

import { useEffect } from "react";

import { Button } from "@/design-system/components/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Erreur non gérée dans l'interface :", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">
        Oups, une erreur est survenue
      </h1>
      <p className="text-muted-foreground">
        Une erreur inattendue s’est produite. Vous pouvez réessayer ; si le
        problème persiste, signalez-le avec le message ci-dessous.
      </p>
      {error.digest ? (
        <code className="rounded-sm bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
          {error.digest}
          <span className="sr-only"> — identifiant technique de l’erreur</span>
        </code>
      ) : null}
      <Button type="button" onClick={reset}>
        Réessayer
      </Button>
    </main>
  );
}
