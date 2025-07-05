import { ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold text-primary tracking-tight font-headline">POCHINI</h1>
      </div>
    </header>
  );
}
