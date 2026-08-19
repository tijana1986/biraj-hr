import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, FileText, Settings, Users, MessageSquare } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { isAdmin } from "@/lib/cms.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Biraj.HR" },
      { name: "description", content: "Upravljajte sadržajem i postavkama aplikacije." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const ADMIN_NAV: {
  to: "/admin" | "/admin/faq" | "/admin/settings" | "/admin/users" | "/admin/testimonials";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}[] = [
  { to: "/admin", label: "Pregled", icon: LayoutDashboard, exact: true },
  { to: "/admin/faq", label: "Česta pitanja", icon: FileText },
  { to: "/admin/settings", label: "Postavke", icon: Settings },
  { to: "/admin/users", label: "Korisnici", icon: Users },
  { to: "/admin/testimonials", label: "Testimonijali", icon: MessageSquare },
];

function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const checkAdmin = useServerFn(isAdmin);

  const { data: hasAccess, isLoading } = useQuery({
    queryKey: ["admin-access", user?.id],
    queryFn: () => checkAdmin(),
    enabled: !!user,
  });

  useEffect(() => {
    if (user === null) {
      navigate({ to: "/prijava" });
    } else if (!isLoading && !hasAccess) {
      navigate({ to: "/" });
    }
  }, [user, navigate, isLoading, hasAccess]);

  if (isLoading || !user) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-6 py-24 text-center text-sm text-muted-foreground">
          Provjera pristupa…
        </div>
      </SiteShell>
    );
  }

  if (!hasAccess) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold">Nemate pristup</h1>
          <p className="mt-2 text-sm text-muted-foreground">Admin panel je dostupan samo administratorima.</p>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[200px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin Panel</div>
            <nav className="overflow-hidden rounded-lg border border-border">
              {ADMIN_NAV.map(({ to, label, icon: Icon, exact }) => {
                const active = exact ? path === to : path === to || path.startsWith(to + "/");
                return (
                  <Link
                    key={to}
                    to={to}
                    className={
                      "flex items-center gap-3 border-b border-border px-3 py-2.5 text-xs font-medium last:border-0 transition " +
                      (active
                        ? "bg-secondary text-foreground"
                        : "text-foreground/70 hover:bg-secondary/50")
                    }
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </section>
    </SiteShell>
  );
}
