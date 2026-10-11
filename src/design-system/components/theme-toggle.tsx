"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/design-system/components/button";

/**
 * Bascule clair/sombre : un seul bouton, l'icône affichée est pilotée par CSS
 * (lune en clair, soleil en sombre), donc aucun état React ni décalage
 * d'hydratation. Le thème par défaut du site est « light ».
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Basculer entre le thème clair et le thème sombre"
      onClick={() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }}
    >
      <SunIcon className="hidden size-4 dark:block" />
      <MoonIcon className="size-4 dark:hidden" />
    </Button>
  );
}
