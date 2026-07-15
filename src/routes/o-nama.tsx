import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { ShieldCheck, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/o-nama")({
  head: () => ({
    meta: [
      { title: "O nama — Biraj.HR" },
      { name: "description", content: "Biraj.HR je premium hrvatski marketplace s misijom da kupnju i prodaju učini sigurnom, transparentnom i lijepom." },
      { property: "og:title", content: "O nama — Biraj.HR" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <Breadcrumbs items={[{ label: "Početna", to: "/" }, { label: "O nama" }]} />
          <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">Marketplace dostojan povjerenja.</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Biraj.HR je hrvatski marketplace s provjerenim oglasima. Stvaramo platformu na kojoj svaki oglas, svaki prodavač
            i svaka transakcija prolaze najviše standarde kvalitete.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold">Naša misija</h2>
            <p className="mt-3 text-muted-foreground">
              Vratiti povjerenje u online kupnju u Hrvatskoj. Vjerujemo da prodaja vrijednih stvari zaslužuje
              prostor koji odražava njihovu kvalitetu.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold">Naša vizija</h2>
            <p className="mt-3 text-muted-foreground">
              Postati referentno mjesto za premium oglase u regiji — gdje kupci dolaze po sigurnost,
              a prodavači po profesionalnu prezentaciju.
            </p>
          </div>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { i: ShieldCheck, t: "Sigurnost", d: "KYC verifikacija korisnika, moderirani oglasi i transparentne ocjene." },
            { i: Sparkles, t: "Kvaliteta", d: "Provjereni oglasi i profesionalne fotografije." },
            { i: Users, t: "Zajednica", d: "Provjereni korisnici koji cijene povjerenje." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: "var(--gradient-gold)" }}>
                <Icon className="h-5 w-5 text-[color:var(--navy-deep)]" />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-20">
          <h2 className="font-display text-3xl font-semibold">Tim</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {[
              { n: "Ivan Babić", r: "Osnivač i CEO" },
              { n: "Maja Tomić", r: "Voditeljica zajednice" },
              { n: "Luka Šimić", r: "Glavni dizajner" },
              { n: "Petra Novak", r: "Voditeljica sigurnosti" },
            ].map((m) => (
              <div key={m.n} className="rounded-2xl border border-border bg-card p-5 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color:var(--navy)] font-display text-2xl text-[color:var(--cream)]">
                  {m.n[0]}
                </span>
                <div className="mt-3 font-semibold">{m.n}</div>
                <div className="text-xs text-muted-foreground">{m.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );

