import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Package, MessageSquare, Heart, User, Shield, Plus } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/racun")({
  head: () => ({
    meta: [
      { title: "Moj račun — Biraj.HR" },
      { name: "description", content: "Upravljajte oglasima, porukama, spremljenim primjercima i profilom." },
    ],
  }),
  component: AccountLayout,
});

const NAV: { to: "/racun" | "/racun/oglasi" | "/racun/poruke" | "/racun/spremljeno" | "/racun/profil"; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/racun", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/racun/oglasi", label: "Moji oglasi", icon: Package },
  { to: "/racun/poruke", label: "Poruke", icon: MessageSquare },
  { to: "/racun/spremljeno", label: "Spremljeno", icon: Heart },
  { to: "/racun/profil", label: "Profil i sigurnost", icon: User },
];

function AccountLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (user === null) {
      // not logged in — send to prijava
      navigate({ to: "/prijava" });
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-6 py-24 text-center text-sm text-muted-foreground">
          Preusmjeravanje na prijavu…
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[260px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--navy)] text-base font-bold text-[color:var(--cream)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-base font-semibold">{user.name}</div>
                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-widest" style={{ color: user.verified ? "var(--gold-deep)" : "color-mix(in oklab, var(--muted-foreground) 80%, transparent)" }}>
              <Shield className="h-3 w-3" /> {user.verified ? "Verificirani račun" : "Račun nije verificiran"}
            </div>
          </div>

          <nav className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            {NAV.map(({ to, label, icon: Icon, exact }) => {
              const active = exact ? path === to : path === to || path.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  to={to}
                  className={
                    "flex items-center gap-3 border-b border-border px-4 py-3 text-sm font-medium last:border-0 " +
                    (active ? "bg-secondary text-foreground" : "text-foreground/80 hover:bg-secondary/60")
                  }
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/objavi"
            className="mt-4 flex items-center justify-center gap-2 rounded-md bg-[color:var(--navy)] py-3 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]"
          >
            <Plus className="h-4 w-4" /> Novi oglas
          </Link>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </section>
    </SiteShell>
  );

