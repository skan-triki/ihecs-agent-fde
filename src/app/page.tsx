import { Badge } from "@/design-system/components/badge";
import { Button } from "@/design-system/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/components/card";
import { env } from "@/env";

const steps = [
  {
    title: "1. Décrire",
    description: "Formulez votre idée et le problème utilisateur à résoudre.",
  },
  {
    title: "2. Construire",
    description: "Codez avec votre agent IA, en respectant les règles du repo.",
  },
  {
    title: "3. Vérifier",
    description: "Lancez /quality-check puis /verify avant chaque livraison.",
  },
  {
    title: "4. Déployer",
    description:
      "Poussez sur GitHub : Vercel publie automatiquement votre MVP.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-24">
      <section className="flex flex-col gap-4">
        <Badge variant="secondary" className="w-fit">
          Starter MVP — IHECS
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          {env.NEXT_PUBLIC_APP_NAME}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Next.js, React, Tailwind CSS et shadcn/ui, avec des garde-fous
          automatiques pour livrer un MVP propre, de l&apos;idée au déploiement.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <a
              href="https://ui.shadcn.com/docs/components"
              target="_blank"
              rel="noreferrer"
            >
              Composants shadcn/ui
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://nextjs.org/docs" target="_blank" rel="noreferrer">
              Documentation Next.js
            </a>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </main>
  );
}
