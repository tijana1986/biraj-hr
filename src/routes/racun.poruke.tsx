import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import { listThreads, listThreadMessages, sendMessage, type ThreadSummary } from "@/lib/messages.functions";
import { ReportButton } from "@/components/site/ReportButton";

export const Route = createFileRoute("/racun/poruke")({
  component: Messages,
});

function Messages() {
  const { user } = useAuth();
  const threadsFn = useServerFn(listThreads);
  const msgsFn = useServerFn(listThreadMessages);
  const sendFn = useServerFn(sendMessage);
  const qc = useQueryClient();

  const { data: threads = [] } = useQuery({
    queryKey: ["threads"],
    queryFn: () => threadsFn(),
    enabled: !!user,
    refetchInterval: 15000,
  });

  const [active, setActive] = useState<ThreadSummary | null>(null);
  useEffect(() => {
    if (!active && threads.length) setActive(threads[0]);
  }, [threads, active]);

  const threadKey = active ? `${active.counterpart_id}::${active.listing_id ?? ""}` : "";
  const { data: conv = [] } = useQuery({
    queryKey: ["thread", threadKey],
    queryFn: () =>
      msgsFn({ data: { counterpart_id: active!.counterpart_id, listing_id: active!.listing_id ?? undefined } }),
    enabled: !!active,
    refetchInterval: 8000,
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conv.length, threadKey]);

  const send = useMutation({
    mutationFn: async (body: string) => {
      if (!active) return null;
      return sendFn({ data: { recipient_id: active.counterpart_id, listing_id: active.listing_id ?? undefined, body } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["thread", threadKey] });
      qc.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  const [draft, setDraft] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    send.mutate(body);
    setDraft("");
  };

  const empty = useMemo(() => threads.length === 0, [threads]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-semibold">Poruke</h1>
        <p className="text-sm text-muted-foreground">Razgovori s kupcima i prodavačima.</p>
      </div>

      {empty ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground" />
          <div className="mt-2 font-display text-lg font-semibold">Još nemate poruka</div>
          <p className="mt-1 text-sm text-muted-foreground">Kad kontaktirate prodavača ili primite upit, razgovor se pojavljuje ovdje.</p>
        </div>
      ) : (
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[280px_1fr] md:min-h-[520px]">
          <aside className="border-b border-border md:border-b-0 md:border-r">
            {threads.map((t) => {
              const key = `${t.counterpart_id}::${t.listing_id ?? ""}`;
              const isActive = active && `${active.counterpart_id}::${active.listing_id ?? ""}` === key;
              return (
                <button
                  key={key}
                  onClick={() => setActive(t)}
                  className={"flex w-full items-start gap-3 border-b border-border p-4 text-left last:border-0 " + (isActive ? "bg-secondary" : "hover:bg-secondary/60")}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--navy)] text-sm font-bold text-[color:var(--cream)]">{t.counterpart_name.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{t.counterpart_name}</span>
                      {t.unread > 0 && <span className="grid h-4 min-w-[16px] place-items-center rounded-full bg-[color:var(--gold-deep)] px-1 text-[10px] font-bold text-[color:var(--cream)]">{t.unread}</span>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{t.last_body}</div>
                    {t.listing_title && <div className="mt-0.5 truncate text-[10px] uppercase tracking-widest text-muted-foreground">o: {t.listing_title}</div>}
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="flex min-h-[520px] flex-col">
            {active ? (
              <>
                <header className="flex items-center gap-3 border-b border-border p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--navy)] text-sm font-bold text-[color:var(--cream)]">{active.counterpart_name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="font-display text-base font-semibold">{active.counterpart_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {active.counterpart_city ?? ""}{active.listing_title ? ` • o: ${active.listing_title}` : ""}
                    </div>
                  </div>
                </header>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {conv.map((m) => (
                    <div key={m.id} className={"flex " + (m.sender_id === user?.id ? "justify-end" : "justify-start")}>
                      <div className="group max-w-[75%]">
                        <div className={"rounded-2xl px-4 py-2 text-sm " + (m.sender_id === user?.id ? "bg-[color:var(--navy)] text-[color:var(--cream)]" : "bg-secondary text-foreground")}>
                          <div className="whitespace-pre-wrap">{m.body}</div>
                          <div className="mt-1 text-[10px] opacity-70">{new Date(m.created_at).toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                        {m.sender_id !== user?.id && (
                          <div className="mt-1 opacity-0 transition group-hover:opacity-100">
                            <ReportButton targetType="message" targetId={m.id} label="Prijavi" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-destructive" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border p-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Napišite poruku…"
                    className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                  />
                  <button type="submit" disabled={send.isPending || !draft.trim()} className="inline-flex h-10 items-center gap-2 rounded-md bg-[color:var(--navy)] px-4 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)] disabled:opacity-50">
                    <Send className="h-4 w-4" /> Pošalji
                  </button>
                </form>
              </>
            ) : (
              <div className="grid flex-1 place-items-center text-sm text-muted-foreground">Odaberite razgovor.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

