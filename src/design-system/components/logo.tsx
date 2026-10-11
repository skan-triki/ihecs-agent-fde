import Image from "next/image";

import { cn } from "@/design-system/utils";

type LogoProps = {
  className?: string;
};

/**
 * Logo officiel de l'école, sur une pastille claire pour rester lisible
 * quel que soit le thème (clair ou sombre).
 */
export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg bg-white px-2.5 py-1.5",
        className,
      )}
    >
      <Image
        src="/logo-ihecs.png"
        alt="Logo IHECS"
        width={170}
        height={69}
        className="h-8 w-auto"
      />
    </span>
  );
}
