import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const sendSchema = z.object({
  recipient_id: z.string().uuid(),
  listing_id: z.string().uuid().optional(),
  body: z.string().trim().min(1).max(4000),
});

const threadSchema = z.object({
  counterpart_id: z.string().uuid(),
  listing_id: z.string().uuid().nullable().optional(),
});

export type ThreadSummary = {
  counterpart_id: string;
  counterpart_name: string;
  counterpart_city: string | null;
  listing_id: string | null;
  listing_title: string | null;
  last_body: string;
  last_at: string;
  unread: number;
};

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ThreadSummary[]> => {
    const { supabase, userId } = context;
    const { data: msgs, error } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, listing_id, body, read_at, created_at")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    const buckets = new Map<string, { counterpart_id: string; listing_id: string | null; last_body: string; last_at: string; unread: number }>();
    for (const m of msgs ?? []) {
      const other = m.sender_id === userId ? m.recipient_id : m.sender_id;
      const key = `${other}::${m.listing_id ?? ""}`;
      const existing = buckets.get(key);
      const isUnread = m.recipient_id === userId && !m.read_at ? 1 : 0;
      if (!existing) {
        buckets.set(key, {
          counterpart_id: other,
          listing_id: m.listing_id,
          last_body: m.body,
          last_at: m.created_at,
          unread: isUnread,
        });
      } else {
        existing.unread += isUnread;
      }
    }

    const others = Array.from(new Set(Array.from(buckets.values()).map((b) => b.counterpart_id)));
    const listings = Array.from(new Set(Array.from(buckets.values()).map((b) => b.listing_id).filter((v): v is string => Boolean(v))));

    const [{ data: profiles }, { data: lst }] = await Promise.all([
      others.length
        ? supabase.from("profiles").select("id, full_name, city").in("id", others)
        : Promise.resolve({ data: [] as { id: string; full_name: string | null; city: string | null }[] }),
      listings.length
        ? supabase.from("listings").select("id, title").in("id", listings)
        : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    ]);

    const pMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const lMap = new Map((lst ?? []).map((l) => [l.id, l]));

    return Array.from(buckets.values())
      .sort((a, b) => (a.last_at < b.last_at ? 1 : -1))
      .map((b) => ({
        counterpart_id: b.counterpart_id,
        counterpart_name: pMap.get(b.counterpart_id)?.full_name ?? "Korisnik",
        counterpart_city: pMap.get(b.counterpart_id)?.city ?? null,
        listing_id: b.listing_id,
        listing_title: b.listing_id ? lMap.get(b.listing_id)?.title ?? null : null,
        last_body: b.last_body,
        last_at: b.last_at,
        unread: b.unread,
      }));
  });

export const listThreadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => threadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let q = supabase
      .from("messages")
      .select("id, sender_id, recipient_id, listing_id, body, read_at, created_at")
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${data.counterpart_id}),and(sender_id.eq.${data.counterpart_id},recipient_id.eq.${userId})`)
      .order("created_at", { ascending: true })
      .limit(500);
    if (data.listing_id) q = q.eq("listing_id", data.listing_id);
    else q = q.is("listing_id", null);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // Mark unread from counterpart as read
    const unreadIds = (rows ?? []).filter((m) => m.recipient_id === userId && !m.read_at).map((m) => m.id);
    if (unreadIds.length) {
      await supabase.from("messages").update({ read_at: new Date().toISOString() }).in("id", unreadIds);
    }
    return rows ?? [];
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => sendSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (data.recipient_id === context.userId) throw new Error("Ne možete poslati poruku sami sebi.");
    const { data: row, error } = await context.supabase
      .from("messages")
      .insert({
        sender_id: context.userId,
        recipient_id: data.recipient_id,
        listing_id: data.listing_id ?? null,
        body: data.body,
      })
      .select("id, sender_id, recipient_id, listing_id, body, read_at, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
