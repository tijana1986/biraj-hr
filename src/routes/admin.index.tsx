import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Settings, Users, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDefaultPage,
});

function AdminDefaultPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upravljajte sadržajem i postavkama Biraj.HR aplikacije.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/faq" className="rounded-2xl border border-border bg-card p-6 hover:border-[color:var(--gold-deep)] transition">
          <FileText className="h-8 w-8 text-[color:var(--gold-deep)]" />
          <h2 className="mt-4 font-display text-lg font-semibold">Česta pitanja</h2>
          <p className="mt-2 text-sm text-muted-foreground">Upravljajte FAQ stavkama na stranici.</p>
        </Link>

        <Link to="/admin/settings" className="rounded-2xl border border-border bg-card p-6 hover:border-[color:var(--gold-deep)] transition">
          <Settings className="h-8 w-8 text-[color:var(--gold-deep)]" />
          <h2 className="mt-4 font-display text-lg font-semibold">Postavke</h2>
          <p className="mt-2 text-sm text-muted-foreground">Osnovne postavke stranice.</p>
        </Link>

        <Link to="/admin/users" className="rounded-2xl border border-border bg-card p-6 hover:border-[color:var(--gold-deep)] transition">
          <Users className="h-8 w-8 text-[color:var(--gold-deep)]" />
          <h2 className="mt-4 font-display text-lg font-semibold">Korisnici</h2>
          <p className="mt-2 text-sm text-muted-foreground">Upravljajte admin korisnicima.</p>
        </Link>

        <Link to="/admin/testimonials" className="rounded-2xl border border-border bg-card p-6 hover:border-[color:var(--gold-deep)] transition">
          <MessageSquare className="h-8 w-8 text-[color:var(--gold-deep)]" />
          <h2 className="mt-4 font-display text-lg font-semibold">Testimonijali</h2>
          <p className="mt-2 text-sm text-muted-foreground">Upravljajte recenzijama korisnika.</p>
        </Link>
      </div>

      <div className="rounded-2xl border border-border/50 bg-background p-6">
        <h2 className="font-display text-lg font-semibold mb-3">Dobrodošli u Admin Panel</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Ovaj panel omogućuje vam da upravljate sadržajem na Biraj.HR bez trebanja znati kako kodirati.
          Možete uređivati FAQ stavke, postavke stranice i drugo.
        </p>
        <p className="text-xs text-muted-foreground">
          Za dodatnu pomoć, kontaktirajte support@biraj.com.hr.
        </p>
      </div>
    </div>
  );
}
