import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type ServiceRequestInsert = Database["public"]["Tables"]["service_requests"]["Insert"];

const createSchema = z.object({
  subcategory_slug: z.string().min(1).max(60),
  title: z.string().trim().min(6).max(120),
  description: z.string().trim().min(20).max(4000),
  location: z.string().trim().min(2).max(80),
  county: z.string().trim().max(80).optional(),
  budget_eur: z.number().nonnegative().max(10_000_000).optional(),
});

const idSchema = z.object({ id: z.string().uuid() });

export const listOpenServiceRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("service_requests")
      .select("id, requester_id, subcategory_slug, title, description, location, county, budget_eur, contact_fee_eur, status, created_at")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createServiceRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const row: ServiceRequestInsert = {
      requester_id: context.userId,
      subcategory_slug: data.subcategory_slug,
      title: data.title,
      description: data.description,
      location: data.location,
      county: data.county ?? null,
      budget_eur: data.budget_eur ?? null,
    };
    const { data: created, error } = await context.supabase
      .from("service_requests")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return created;
  });

export type ServiceRequestDetail = {
  request: Database["public"]["Tables"]["service_requests"]["Row"] & { requester_name: string | null; requester_city: string | null; requester_phone: string | null };
  is_owner: boolean;
  unlocked: boolean;
  is_first: boolean;
  contacts_count: number;
};

export const getServiceRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data, context }): Promise<ServiceRequestDetail> => {
    const { supabase, userId } = context;
    const { data: r, error } = await supabase
      .from("service_requests")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!r) throw new Error("Upit ne postoji.");

    const isOwner = r.requester_id === userId;

    const [{ data: mine }, { count }] = await Promise.all([
      supabase.from("service_contacts").select("id, created_at").eq("request_id", r.id).eq("provider_id", userId).maybeSingle(),
      // count all contacts for this request (admin-level info; we approximate via count on service_contacts filtered by request_id — SELECT limited by RLS so only mine visible)
      supabase.from("service_contacts").select("id", { count: "exact", head: true }).eq("request_id", r.id).eq("provider_id", userId),
    ]);

    // For "is first" we need to know how many providers unlocked before me — RLS blocks reading other rows.
    // Use an RPC-free approximation: server client here is user-scoped; we track "first" via metadata on the request updated below.
    const meta = (r.metadata ?? {}) as { first_unlock_provider_id?: string; contacts_count?: number };
    const isFirst = mine ? meta.first_unlock_provider_id === userId : false;
    const contactsCount = meta.contacts_count ?? 0;

    // Load requester profile
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name, city, phone")
      .eq("id", r.requester_id)
      .maybeSingle();

    return {
      request: {
        ...r,
        requester_name: prof?.full_name ?? null,
        requester_city: prof?.city ?? null,
        requester_phone: (isOwner || mine) ? (prof?.phone ?? null) : null,
      },
      is_owner: isOwner,
      unlocked: Boolean(mine) || isOwner,
      is_first: isFirst || (isOwner && contactsCount === 0),
      contacts_count: contactsCount + (count ?? 0),
    };
  });

export const unlockServiceContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: req, error: reqErr } = await supabase
      .from("service_requests")
      .select("id, requester_id, contact_fee_eur, metadata, status")
      .eq("id", data.id)
      .maybeSingle();
    if (reqErr) throw new Error(reqErr.message);
    if (!req) throw new Error("Upit ne postoji.");
    if (req.requester_id === userId) throw new Error("Vi ste vlasnik upita.");
    if (req.status !== "open") throw new Error("Upit više nije otvoren.");

    // Idempotent — if already unlocked, just return current state
    const { data: existing } = await supabase
      .from("service_contacts")
      .select("id")
      .eq("request_id", req.id)
      .eq("provider_id", userId)
      .maybeSingle();
    if (existing) return { ok: true as const, alreadyUnlocked: true, isFirst: false };

    // Insert contact row (mock payment reference)
    const paymentRef = `demo-${Date.now()}`;
    const { error: insErr } = await supabase.from("service_contacts").insert({
      request_id: req.id,
      provider_id: userId,
      paid_eur: req.contact_fee_eur ?? 5,
      payment_reference: paymentRef,
    });
    if (insErr) throw new Error(insErr.message);

    // Track first-unlock in request.metadata (requester_id is the only one who can update req; use admin client)
    const meta = (req.metadata ?? {}) as { first_unlock_provider_id?: string; contacts_count?: number };
    const isFirst = !meta.first_unlock_provider_id;
    const nextMeta = {
      ...meta,
      first_unlock_provider_id: meta.first_unlock_provider_id ?? userId,
      contacts_count: (meta.contacts_count ?? 0) + 1,
    };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("service_requests").update({ metadata: nextMeta }).eq("id", req.id);

    return { ok: true as const, alreadyUnlocked: false, isFirst };
  });
