import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createSchema = z.object({
  target_type: z.enum(["listing", "message", "service_request", "user"]),
  target_id: z.string().min(1).max(200),
  reason: z.string().trim().min(2).max(80),
  details: z.string().trim().max(2000).optional(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "reviewed", "dismissed", "actioned"]),
  reviewer_note: z.string().trim().max(2000).optional(),
});

export const createReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("reports")
      .insert({
        reporter_id: context.userId,
        target_type: data.target_type,
        target_id: data.target_id,
        reason: data.reason,
        details: data.details ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export type ReportRow = {
  id: string;
  reporter_id: string;
  reporter_name: string | null;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: string;
  reviewer_note: string | null;
  created_at: string;
  updated_at: string;
};

export const isModerator = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .in("role", ["moderator", "admin"]);
    if (error) return false;
    return (data ?? []).length > 0;
  });

export const listReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ReportRow[]> => {
    // RLS restricts non-moderators to their own reports; moderators see all
    const { data, error } = await context.supabase
      .from("reports")
      .select("id, reporter_id, target_type, target_id, reason, details, status, reviewer_note, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const ids = Array.from(new Set(rows.map((r) => r.reporter_id)));
    if (ids.length === 0) return rows.map((r) => ({ ...r, reporter_name: null }));
    const { data: profs } = await context.supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);
    const nameById = new Map((profs ?? []).map((p) => [p.id, p.full_name] as const));
    return rows.map((r) => ({ ...r, reporter_name: nameById.get(r.reporter_id) ?? null }));
  });

export const updateReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("reports")
      .update({
        status: data.status,
        reviewer_note: data.reviewer_note ?? null,
        reviewer_id: context.userId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
