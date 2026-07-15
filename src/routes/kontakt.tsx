import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Unesite ime").max(100),
  email: z.string().trim().email("Neispravna e-pošta").max(255),
  topic: z.string().min(1, "Odaberite temu"),
  message: z.string().trim().min(10, "Poruka mora imati barem 10 znakova").max(2000),
});

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt — Biraj.HR" },
      { name: "description", content: "Kontaktirajte tim Biraj.HR — odgovaramo u roku od 24 sata radnim danom." },
      { property: "og:title", content: "Kontakt — Biraj.HR" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <Breadcrumbs items={[{ label: "Početna", to: "/" }, { label: "Kontakt" }]} />
          <h1 className="mt-4 font-display text-5xl font-semibold">Razgovarajmo</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Pitanje, prijedlog ili poslovna suradnja? Javite nam se — odgovaramo u roku od 24 sata radnim danom.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Info icon={Mail} title="E-pošta" value="podrska@biraj.hr" />
          <Info icon={Phone} title="Telefon" value="+385 1 234 5678" />
          <Info icon={MapPin} title="Adresa" value="Ilica 1, 10000 Zagreb" />
          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            Prije pisanja, provjerite naša <Link to="/faq" className="font-medium text-[color:var(--gold-deep)]">česta pitanja</Link>.
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = {
              name: String(fd.get("name") ?? ""),
              email: String(fd.get("email") ?? ""),
              topic: String(fd.get("topic") ?? ""),
              message: String(fd.get("message") ?? ""),
            };
            const r = schema.safeParse(data);
            if (!r.success) {
              const errs: Record<string, string> = {};
              for (const i of r.error.issues) errs[String(i.path[0])] = i.message;
              setErrors(errs);
              return;
            }
            setErrors({});
            setSent(true);
          }}
          className="space-y-4 rounded-2xl border border-border bg-card p-6"
        >
          {sent ? (
            <div className="rounded-xl bg-[color:var(--gold)]/15 p-6 text-center text-sm">
              Hvala! Vaša poruka je zaprimljena. Javit ćemo se uskoro.
            </div>
          ) : (
            <>
              <Field label="Ime i prezime" name="name" error={errors.name}>
                <Input name="name" placeholder="Ana Marić" />
              </Field>
              <Field label="E-pošta" name="email" error={errors.email}>
                <Input name="email" type="email" placeholder="vasa@adresa.hr" />
              </Field>
              <Field label="Tema" name="topic" error={errors.topic}>
                <Select name="topic">
                  <SelectTrigger><SelectValue placeholder="Odaberite temu" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="podrska">Korisnička podrška</SelectItem>
                    <SelectItem value="prodaja">Pitanje o prodaji</SelectItem>
                    <SelectItem value="kupnja">Pitanje o kupnji</SelectItem>
                    <SelectItem value="suradnja">Poslovna suradnja</SelectItem>
                    <SelectItem value="ostalo">Ostalo</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Poruka" name="message" error={errors.message}>
                <Textarea name="message" rows={6} placeholder="Kako vam možemo pomoći?" />
              </Field>
              <Button type="submit" className="bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
                Pošalji poruku
              </Button>
            </>
          )}
        </form>
      </section>
    </SiteShell>
  );
}

function Info({ icon: Icon, title, value }: { icon: typeof Mail; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{title}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </div>
  );

