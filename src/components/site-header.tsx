import { Logo } from "@/design-system/components/logo";
import { ThemeToggle } from "@/design-system/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-6 py-3">
        <Logo />
        <ThemeToggle />
      </div>
    </header>
  );
}
