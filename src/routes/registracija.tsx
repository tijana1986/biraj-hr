import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { CITIES_LIST } from "@/lib/mock/data";

export const Route = createFileRoute("/registracija")({
  head: () => ({
    meta: [
      { title: "Registracija — Biraj.HR" },
      { name: "description", content: "Otvorite račun na Biraj.HR i pridružite se zajednici provjerenih korisnika." },
      { property: "og:title", content: "Registracija — Biraj.HR" },
    ],
  }),
  component: Register,
});

function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first: "", last: "", email: "", password: "", city: "Zagreb" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!form.first.trim() || !form.last.trim()) return setErr("Unesite ime i prezime.");
    if (!form.email.includes("@")) return setErr("Unesite ispravnu e-poštu.");
    if (form.password.length < 6) return setErr("Lozinka mora imati barem 6 znakova.");
    setLoading(true);
    const { error } = await register(`${form.first.trim()} ${form.last.trim()}`, form.email.trim(), form.password, form.city);
    setLoading(false);
    if (error) return setErr(error);
    navigate({ to: "/racun" });
  };

  const onGoogle = async () => {
    setErr(null);
    const { error } = await loginWithGoogle();
    if (error) setErr(error);
  };

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-md gap-4 px-6 py-20">
        <h1 className="font-display text-3xl font-semibold">Registracija</h1>
        <p className="text-sm text-muted-foreground">Otvorite besplatni Biraj.HR račun u nekoliko sekundi.</p>
        <button
          type="button"
          onClick={onGoogle}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.17v2.84C3.99 20.53 7.7 23 12 23Z"/><path fill="#FBBC05" d="M5.85 14.12A6.99 6.99 0 0 1 5.5 12c0-.74.13-1.45.35-2.12V7.04H2.17A11 11 0 0 0 1 12c0 1.77.42 3.45 1.17 4.96l3.68-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.17 7.04l3.68 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/></svg>
          Nastavi s Google računom
        </button>
        <div className="my-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ili e-poštom <span className="h-px flex-1 bg-border" />
        </div>
        <form className="space-y-3 rounded-2xl border border-border bg-card p-6" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Ime</label>
              <Input className="mt-1" value={form.first} onChange={(e) => setForm({ ...form, first: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Prezime</label>
              <Input className="mt-1" value={form.last} onChange={(e) => setForm({ ...form, last: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">E-pošta</label>
            <Input type="email" className="mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Lozinka</label>
            <Input type="password" className="mt-1" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Grad</label>
            <select
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              {CITIES_LIST.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <Button disabled={loading} className="w-full bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
            {loading ? "Kreiranje…" : "Kreiraj račun"}
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            Već imate račun? <Link to="/prijava" className="font-medium text-[color:var(--gold-deep)]">Prijavite se</Link>
          </div>
        </form>
      </section>
    </SiteShell>
  );
}</content>
