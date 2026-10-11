import Image from "next/image";

import { Button } from "@/design-system/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/components/card";

const steps = [
  {
    title: "1. Décrire",
    description: "Formule ton idée et le problème utilisateur à résoudre.",
  },
  {
    title: "2. Construire",
    description: "Code avec ton agent IA, en respectant les règles du repo.",
  },
  {
    title: "3. Vérifier",
    description: "Lance /quality-check puis /verify avant chaque livraison.",
  },
  {
    title: "4. Déployer",
    description:
      "Pousse sur GitHub : Vercel publie automatiquement ton projet.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-24">
      <section className="flex flex-col gap-5">
        <Image
          src="/logo-ihecs.png"
          alt="Logo IHECS — Institut des Hautes Études des Communications Sociales"
          width={170}
          height={69}
          priority
        />
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          De l’idée au produit
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Décris ton idée, construis-la avec ton agent IA, fais-la vérifier,
          déploie-la. Chaque étape est protégée par des contrôles automatiques :
          rien ne part en ligne sans être prêt.
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
