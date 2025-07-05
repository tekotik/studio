import { Logo } from "@/components/icons/Logo";

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold text-primary font-headline">AI Доктор</h1>
      </div>
    </header>
  );
}
