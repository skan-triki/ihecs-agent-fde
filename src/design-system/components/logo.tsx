import { cn } from "@/design-system/utils";

type LogoProps = {
  className?: string;
};

/**
 * Logo IHECS (sans baseline). Le PNG sert de masque : sa forme est conservée
 * et sa couleur vient du token `brand` défini dans globals.css — bleu IHECS
 * en thème clair, blanc en thème sombre. Ratio du fichier : 340 × 83.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span
      role="img"
      aria-label="IHECS"
      className={cn(
        "inline-block aspect-340/83 h-7 bg-brand mask-[url(/logo-ihecs-mark.png)] mask-contain mask-no-repeat",
        className,
      )}
    />
  );
}
