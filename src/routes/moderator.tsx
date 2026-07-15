import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert, CheckCircle2, XCircle, Eye, AlertTriangle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { isModerator, listReports, updateReport, type ReportRow } from "@/lib/reports.functions";

export const Route = createFileRoute("/moderator")({
  head: () => ({
    meta: [
      { title: "Moderator — Biraj.HR" },
      { name: "description", content: "Pregled prijavljenih oglasa i poruka." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ModeratorPage,
});

const TYPE_LABEL: Record<string, string> = {
  listing: "Oglas",
  message: "Poruka",
  service_request: "Upit za posao",
  user: "Korisnik",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Na čekanju",
  reviewed: "Pregledano",
  dismissed: "Odbijeno",
  actioned: "Uklonjeno",
};

function ModeratorPage() {
  const { user, loading } = useAuth();
  const isModFn = useServerFn(isModerator);
  const listFn = useServerFn(listReports);

  const { data: isMod, isLoading: modLoading } = useQuery({
    queryKey: ["is-moderator", user?.id],
    queryFn: () => isModFn(),
    enabled: !!user,
  });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => listFn(),
    enabled: !!user && isMod === true,
  });

  if (loading || modLoading) {
    return <SiteShell><div className="p-12 text-center text-sm text-muted-foreground">Učitavanje…</div></SiteShell>;
  }

  if (!user) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold">Prijavite se</h1>
          <p className="mt-2 text-sm text-muted-foreground">Stranica je dostupna samo moderatorima.</p>
        </div>
      </SiteShell>
    );
  }

  if (!isMod) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-3 font-display text-2xl font-semibold">Nemate pristup</h1>
          <p className="mt-2 text-sm text-muted-foreground">Za pristup moderatorskoj konzoli potrebna je uloga „moderator" ili „admin".</p>
        </div>
      </SiteShell>
    );
  }

  const pending = reports.filter((r) => r.status === "pending");
  const closed = reports.filter((r) => r.status !== "pending");

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--navy)] text-[color:var(--cream)]"><ShieldAlert className="h-5 w-5" /></span>
          <div>
            <h1 className="font-display text-3xl font-semibold">Moderator konzola</h1>
            <p className="text-sm text-muted-foreground">{pending.length} prijava na čekanju • ukupno {reports.length}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">Učitavanje prijava…</div>
        ) : reports.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <CheckCircle2 className="mx-auto h-6 w-6 text-[color:var(--gold-deep)]" />
            <div className="mt-2 font-display text-lg font-semibold">Nema prijavljenog sadržaja</div>
            <p className="mt-1 text-sm text-muted-foreground">Sve je čisto — dobar posao.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <ReportList title="Na čekanju" items={pending} highlight />
            <ReportList title="Zatvoreno" items={closed} />
          </div>
        )}
      </div>
    </SiteShell>
  );
}

function ReportList({ title, items, highlight = false }: { title: string; items: ReportRow[]; highlight?: boolean }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
        {highlight && <AlertTriangle className="h-4 w-4 text-[color:var(--gold-deep)]" />}
        {title} <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
      </h2>
      <ul className="space-y-3">
        {items.map((r) => <ReportItem key={r.id} r={r} />)}
      </ul>
    </section>
  );
}

function ReportItem({ r }: { r: ReportRow }) {
  const qc = useQueryClient();
  const updFn = useServerFn(updateReport);
  const [note, setNote] = useState(r.reviewer_note ?? "");
  const [expanded, setExpanded] = useState(false);

  const mut = useMutation({
    mutationFn: (status: "reviewed" | "dismissed" | "actioned") =>
      updFn({ data: { id: r.id, status, reviewer_note: note.trim() || undefined } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });

  const targetHref =
    r.target_type === "listing" ? `/oglas/${r.target_id}` :
    r.target_type === "service_request" ? `/poslovi/${r.target_id}` :
    r.target_type === "user" ? `/prodavac/${r.target_id}` :
    null;

  return (
    <li className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold uppercase tracking-widest">{TYPE_LABEL[r.target_type] ?? r.target_type}</span>
            <span className="rounded-full bg-secondary/60 px-2 py-0.5 font-semibold" style={{ color: r.status === "pending" ? "var(--gold-deep)" : undefined }}>
              {STATUS_LABEL[r.status] ?? r.status}
            </span>
            <span className="text-muted-foreground">{new Date(r.created_at).toLocaleString("hr-HR")}</span>
          </div>
          <div className="mt-2 font-display text-base font-semibold">Razlog: {r.reason}</div>
          <div className="mt-1 text-xs text-muted-foreground">Prijavio: {r.reporter_name ?? r.reporter_id.slice(0, 8)} • target: <code className="rounded bg-secondary/60 px-1 py-0.5 text-[11px]">{r.target_id}</code></div>
          {r.details && (
            <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm text-foreground/90">{r.details}</p>
          )}
        </div>
        {targetHref && (
          <a href={targetHref} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-semibold hover:bg-secondary">
            <Eye className="h-3.5 w-3.5" /> Otvori sadržaj
          </a>
        )}
      </div>

      {r.status === "pending" && (
        <div className="mt-4 border-t border-border pt-4">
          {!expanded ? (
            <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>Odluči</Button>
          ) : (
            <div className="space-y-2">
              <Textarea rows={2} placeholder="Napomena moderatora (neobavezno)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => mut.mutate("actioned")} disabled={mut.isPending} className="bg-destructive text-destructive-foreground hover:opacity-90">
                  <XCircle className="h-4 w-4" /> Ukloni sadržaj
                </Button>
                <Button size="sm" variant="outline" onClick={() => mut.mutate("reviewed")} disabled={mut.isPending}>
                  <CheckCircle2 className="h-4 w-4" /> Označi pregledano
                </Button>
                <Button size="sm" variant="ghost" onClick={() => mut.mutate("dismissed")} disabled={mut.isPending}>
                  Odbaci prijavu
                </Button>
              </div>
              {mut.isError && <p className="text-xs text-destructive">{mut.error instanceof Error ? mut.error.message : "Greška."}</p>}
            </div>
          )}
        </div>
      )}
      {r.reviewer_note && r.status !== "pending" && (
        <p className="mt-3 rounded-md bg-secondary/40 p-2 text-xs text-muted-foreground">Napomena: {r.reviewer_note}</p>
      )}
    </li>
  );

