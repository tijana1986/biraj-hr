import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/prijava")({
  head: () => ({
    meta: [
      { title: "Prijava — Biraj.HR" },
      { name: "description", content: "Prijavite se na Biraj.HR za upravljanje oglasima i porukama." },
      { property: "og:title", content: "Prijava — Biraj.HR" },
    ],
  }),
  component: Login,
});

function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) return setError("Unesite ispravnu e-poštu.");
    if (password.length < 6) return setError("Lozinka mora imati barem 6 znakova.");
    setLoading(true);
    const { error: err } = await login(email.trim(), password);
    setLoading(false);
    if (err) return setError(err);
    navigate({ to: "/racun" });
  };

  const onGoogle = async () => {
    setError(null);
    const { error: err } = await loginWithGoogle();
    if (err) setError(err);
  };

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-md gap-4 px-6 py-20">
        <h1 className="font-display text-3xl font-semibold">Prijava</h1>
        <p className="text-sm text-muted-foreground">
          Demo prijava — unesite bilo koju e-poštu i lozinku za pristup vašem računu.
        </p>
        <button
          type="button"
          onClick={onGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.17v2.84C3.99 20.53 7.7 23 12 23Z"/><path fill="#FBBC05" d="M5.85 14.12A6.99 6.99 0 0 1 5.5 12c0-.74.13-1.45.35-2.12V7.04H2.17A11 11 0 0 0 1 12c0 1.77.42 3.45 1.17 4.96l3.68-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.17 7.04l3.68 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/></svg>
          Nastavi s Google računom
        </button>
        <div className="my-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ili e-poštom <span className="h-px flex-1 bg-border" />
        </div>
        <form className="space-y-3 rounded-2xl border border-border bg-card p-6" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">E-pošta</label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vasa@adresa.hr" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Lozinka</label>
            <Input type="password" required placeholder="••••••••" className="mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button disabled={loading} className="w-full bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
            {loading ? "Prijavljivanje…" : "Prijavi se"}
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            Nemate račun? <Link to="/registracija" className="font-medium text-[color:var(--gold-deep)]">Registrirajte se</Link>
          </div>
        </form>
      </section>
    </SiteShell>
  );


}
