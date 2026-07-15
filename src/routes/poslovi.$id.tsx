import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, Crown, Lock, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getServiceRequest, unlockServiceContact } from "@/lib/services.functions";
import { useState } from "react";
import { ReportButton } from "@/components/site/ReportButton";

export const Route = createFileRoute("/poslovi/$id")({
  head: () => ({
    meta: [
      { title: "Detalji upita — Biraj.HR" },
      { name: "description", content: "Otvoreni upit investitora. Otključajte kontakt za 5 €." },
    ],
  }),
  component: ServiceRequestDetail,
  notFoundComponent: () => <SiteShell><div className="p-12 text-center">Upit ne postoji.</div></SiteShell>,
  errorComponent: () => <SiteShell><div className="p-12 text-center">Greška pri učitavanju upita.</div></SiteShell>,
});

function ServiceRequestDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(getServiceRequest);
  const unlockFn = useServerFn(unlockServiceContact);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["service-request", id],
    queryFn: () => getFn({ data: { id } }),
    enabled: !!user,
  });

  const unlock = useMutation({
    mutationFn: () => unlockFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-request", id] }),
  });

  if (!user) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold">Prijavite se za pristup</h1>
          <p className="mt-2 text-sm text-muted-foreground">Otvorene upite mogu vidjeti samo registrirani korisnici.</p>
          <Link to="/prijava" className="mt-6 inline-flex h-10 items-center rounded-md bg-[color:var(--navy)] px-5 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">Prijava</Link>
        </div>
      </SiteShell>
    );
  }

  if (isLoading) return <SiteShell><div className="p-12 text-center text-sm text-muted-foreground">Učitavanje…</div></SiteShell>;
  if (isError || !data) return <SiteShell><div className="p-12 text-center text-sm text-destructive">Nije moguće učitati upit.</div></SiteShell>;

  const { request, is_owner, unlocked, is_first, contacts_count } = data;

  const openMessage = () => {
    // Navigate to messages — thread is by counterpart id
    navigate({ to: "/racun/poruke" });
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Breadcrumbs items={[
          { label: "Početna", to: "/" },
          { label: "Poslovi", to: "/poslovi" },
          { label: request.title },
        ]} />

        <Link to="/poslovi" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--gold-deep)]">
          <ArrowLeft className="h-3 w-3" /> Natrag na upite
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <article className="rounded-2xl border border-border bg-card p-6">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">{request.subcategory_slug}</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold">{request.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {request.location}</span>
              <span>Objavljeno {new Date(request.created_at).toLocaleDateString("hr-HR")}</span>
              {request.budget_eur != null && <span className="font-semibold text-foreground">Budžet: {Number(request.budget_eur).toLocaleString("hr-HR")} €</span>}
            </div>
            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{request.description}</p>
            {!is_owner && (
              <div className="mt-6 border-t border-border pt-4">
                <ReportButton targetType="service_request" targetId={request.id} label="Prijavi upit" variant="ghost" className="text-muted-foreground hover:text-destructive" />
              </div>
            )}
          </article>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Investitor</div>
              <div className="mt-2 font-display text-xl font-semibold">{request.requester_name ?? "Investitor"}</div>
              {request.requester_city && <div className="text-sm text-muted-foreground">{request.requester_city}</div>}

              {is_owner ? (
                <div className="mt-5 rounded-xl bg-secondary/60 p-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-[color:var(--gold-deep)]" /> Vi ste vlasnik upita</div>
                  <p className="mt-1 text-muted-foreground">{contacts_count} izvođač(a) kupilo je vaš kontakt.</p>
                </div>
              ) : unlocked ? (
                <div className="mt-5 space-y-3">
                  {is_first && (
                    <div className="flex items-center gap-2 rounded-xl bg-[color:var(--gold)]/15 p-3 text-sm text-[color:var(--gold-deep)]">
                      <Crown className="h-4 w-4" />
                      <span className="font-semibold">Vi ste prvi aplicirali za ovaj posao.</span>
                    </div>
                  )}
                  <div className="rounded-xl border border-border p-4 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-[color:var(--navy)]"><CheckCircle2 className="h-4 w-4" /> Kontakt otključan</div>
                    {request.requester_phone && (
                      <div className="mt-2 flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> <a href={`tel:${request.requester_phone}`} className="font-medium hover:underline">{request.requester_phone}</a></div>
                    )}
                    {!request.requester_phone && <div className="mt-2 text-muted-foreground">Investitor nema pohranjen broj — pošaljite poruku.</div>}
                    <Button onClick={openMessage} variant="outline" className="mt-3 w-full">
                      <MessageCircle className="h-4 w-4" /> Pošalji poruku investitoru
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>Kontakt investitora je zaključan. Otključavanjem pristajete na naplatu od <strong className="text-foreground">{Number(request.contact_fee_eur).toFixed(2)} €</strong> po zaprimljenoj uplati.</span>
                  </div>
                  {!confirmOpen ? (
                    <Button onClick={() => setConfirmOpen(true)} className="w-full bg-[color:var(--gold-deep)] text-white hover:bg-[color:var(--gold-darker)]">
                      Otključaj kontakt · {Number(request.contact_fee_eur).toFixed(2)} €
                    </Button>
                  ) : (
                    <div className="space-y-2 rounded-xl border border-border p-3">
                      <p className="text-sm">Potvrdite plaćanje od <strong>{Number(request.contact_fee_eur).toFixed(2)} €</strong> za otključavanje kontakta.</p>
                      <div className="flex gap-2">
                        <Button onClick={() => unlock.mutate()} disabled={unlock.isPending} className="flex-1 bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
                          {unlock.isPending ? "Procesiranje…" : "Potvrdi i plati"}
                        </Button>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={unlock.isPending}>Odustani</Button>
                      </div>
                      {unlock.isError && <p className="text-xs text-destructive">{unlock.error instanceof Error ? unlock.error.message : "Greška."}</p>}
                    </div>
                  )}
                  <p className="text-[11px] leading-relaxed text-muted-foreground">Demo naplata — u produkciji integracija sa Stripe/Paddle.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );

