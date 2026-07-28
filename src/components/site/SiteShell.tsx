import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Menu, X, Instagram, Facebook, Twitter, ChevronDown, User, Heart, MessageSquare, LayoutDashboard, LogOut, ShieldAlert, TrendingUp, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/mock/data";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { isModerator } from "@/lib/reports.functions";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-sm" style={{ background: "var(--gradient-gold)" }}>
        <span className="font-display text-lg font-bold text-[color:var(--navy-deep)]">B</span>
      </span>
      <span className="font-display text-2xl font-semibold tracking-tight">
        Biraj<span style={{ color: "var(--gold-deep)" }}>.HR</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [accOpen, setAccOpen] = useState(false);
  const { user, logout } = useAuth();
  const { ids } = useWishlist();
  const navigate = useNavigate();
  const isModFn = useServerFn(isModerator);
  const { data: isMod } = useQuery({
    queryKey: ["is-moderator", user?.id],
    queryFn: () => isModFn(),
    enabled: !!user,
    staleTime: 60_000,
  });

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        <Logo />

        <div className="relative hidden md:block">
          <button
            onClick={() => setCatOpen((v) => !v)}
            onBlur={() => setTimeout(() => setCatOpen(false), 150)}
            className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary"
          >
            Kategorije <ChevronDown className="h-4 w-4" />
          </button>
          {catOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-[640px] rounded-xl border border-border bg-background p-4 shadow-[var(--shadow-luxe)]">
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((c) => (
                  <div key={c.slug}>
                    <Link
                      to="/kategorija/$category"
                      params={{ category: c.slug }}
                      className="font-display text-base font-semibold hover:text-[color:var(--gold-deep)]"
                    >
                      {c.name}
                    </Link>
                    <ul className="mt-1 space-y-1">
                      {c.subcategories.map((s) => (
                        <li key={s.slug}>
                          <Link
                            to="/kategorija/$category/$subcategory"
                            params={{ category: c.slug, subcategory: s.slug }}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          action="/pretraga"
          method="get"
          className="hidden flex-1 md:block"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Pretraži oglase..."
              className="h-10 rounded-full border-border bg-secondary/40 pl-10"
            />
          </div>
        </form>

        <nav className="hidden items-center gap-2 md:flex">
          <Link to="/browse" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary">
            Katalog
          </Link>
          <Link to="/poslovi" className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary">
            Poslovi
          </Link>
          <Link to="/racun/spremljeno" className="relative rounded-md p-2 text-foreground/80 hover:bg-secondary" aria-label="Spremljeno">
            <Heart className="h-5 w-5" />
            {ids.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--gold-deep)] px-1 text-[10px] font-bold text-[color:var(--navy-deep)]">{ids.length}</span>
            )}
          </Link>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setAccOpen((v) => !v)}
                onBlur={() => setTimeout(() => setAccOpen(false), 150)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--navy)] text-[10px] font-bold text-[color:var(--cream)]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name.split(" ")[0]} <ChevronDown className="h-3 w-3" />
              </button>
              {accOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-background shadow-[var(--shadow-luxe)]">
                  <Link to="/racun" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                  <Link to="/racun/oglasi" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><User className="h-4 w-4" /> Moji oglasi</Link>
                  <Link to="/racun/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><TrendingUp className="h-4 w-4" /> Analitika</Link>
                  <Link to="/racun/poruke" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><MessageSquare className="h-4 w-4" /> Poruke</Link>
                  <Link to="/racun/notifikacije" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><Bell className="h-4 w-4" /> Obavijesti</Link>
                  <Link to="/racun/spremljeno" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><Heart className="h-4 w-4" /> Spremljeno</Link>
                  <Link to="/racun/profil" className="flex items-center gap-2 border-t border-border px-4 py-2.5 text-sm hover:bg-secondary"><User className="h-4 w-4" /> Profil</Link>
                  {isMod && (
                    <Link to="/moderator" className="flex items-center gap-2 border-t border-border px-4 py-2.5 text-sm font-semibold text-[color:var(--gold-deep)] hover:bg-secondary">
                      <ShieldAlert className="h-4 w-4" /> Moderator
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); navigate({ to: "/" }); }}
                    className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-left text-sm text-destructive hover:bg-secondary"
                  >
                    <LogOut className="h-4 w-4" /> Odjava
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/prijava" className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary">
              <User className="h-4 w-4" /> Prijava
            </Link>
          )}
          <Link
            to="/objavi"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--gold-deep)] px-5 text-sm font-semibold text-white shadow-[var(--shadow-raised)] transition hover:bg-[color:var(--gold-darker)]"
          >
            Objavi oglas
          </Link>
        </nav>

        <button
          aria-label="Menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="ml-auto rounded-md border border-border p-2 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto max-w-7xl space-y-4 px-6 py-4">
            <form action="/pretraga" method="get" className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" placeholder="Pretraži oglase..." className="h-10 rounded-full pl-10" />
            </form>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link to="/browse" onClick={() => setMobileOpen(false)}>Katalog</Link>
              <Link to="/poslovi" onClick={() => setMobileOpen(false)}>Poslovi</Link>
              <Link to="/o-nama" onClick={() => setMobileOpen(false)}>O nama</Link>
              <Link to="/kontakt" onClick={() => setMobileOpen(false)}>Kontakt</Link>
              <Link to="/faq" onClick={() => setMobileOpen(false)}>Česta pitanja</Link>
              {user ? (
                <>
                  <Link to="/racun" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <Link to="/racun/oglasi" onClick={() => setMobileOpen(false)}>Moji oglasi</Link>
                  <Link to="/racun/poruke" onClick={() => setMobileOpen(false)}>Poruke</Link>
                  <Link to="/racun/spremljeno" onClick={() => setMobileOpen(false)}>Spremljeno</Link>
                  {isMod && <Link to="/moderator" onClick={() => setMobileOpen(false)} className="font-semibold text-[color:var(--gold-deep)]">Moderator</Link>}
                </>
              ) : (
                <>
                  <Link to="/prijava" onClick={() => setMobileOpen(false)}>Prijava</Link>
                  <Link to="/registracija" onClick={() => setMobileOpen(false)}>Registracija</Link>
                </>
              )}
            </div>
            <div className="border-t border-border pt-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Kategorije</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    to="/kategorija/$category"
                    params={{ category: c.slug }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/objavi"
              onClick={() => setMobileOpen(false)}
              className="block w-full rounded-full bg-[color:var(--gold-deep)] py-2.5 text-center text-sm font-semibold text-white"
            >
              Objavi oglas
            </Link>
            {user && (
              <button
                onClick={() => { logout(); setMobileOpen(false); navigate({ to: "/" }); }}
                className="block w-full rounded-md border border-border py-2 text-center text-sm font-semibold text-destructive"
              >
                Odjava
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[color:var(--cream)]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Luksuzni marketplace provjerenih oglasa za Hrvatsku. Kvaliteta, povjerenje i sigurnost — bez kompromisa.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social" className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-[color:var(--gold)]">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <FCol title="Marketplace" links={[
            { to: "/browse", label: "Pretraži kategorije" },
            { to: "/pretraga", label: "Napredna pretraga" },
            { to: "/objavi", label: "Objavi oglas" },
            { to: "/cjenik", label: "Cjenik objave" },
          ]} />
          <FCol title="Tvrtka" links={[
            { to: "/o-nama", label: "O nama" },
            { to: "/kontakt", label: "Kontakt" },
            { to: "/faq", label: "Česta pitanja" },
          ]} />
          <FCol title="Pravno" links={[
            { to: "/uvjeti-koristenja", label: "Uvjeti korištenja" },
            { to: "/politika-privatnosti", label: "Politika privatnosti" },
            { to: "/politika-kolacica", label: "Politika kolačića" },
          ]} />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} Biraj.HR — Sva prava pridržana.</div>
          <div>Izrađeno s pažnjom u Hrvatskoj.</div>
        </div>
      </div>
    </footer>
  );
}

function FCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-base font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="transition hover:text-foreground">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string; params?: Record<string, string> }[] }) {
  return (
    <nav aria-label="breadcrumb" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {it.to ? (
              <Link to={it.to} params={it.params as never} className="hover:text-foreground">
                {it.label}
              </Link>
            ) : (
              <span className="text-foreground">{it.label}</span>
            )}
            {i < items.length - 1 && <span>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
