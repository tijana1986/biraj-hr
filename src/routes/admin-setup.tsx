import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { Shield, CheckCircle2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { z } from "zod";

export const Route = createFileRoute("/admin-setup")({
  head: () => ({
    meta: [
      { title: "Admin Setup — Biraj.HR" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSetupPage,
});

// Server function to check if any admins exist
export const checkAdminExists = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  );

  const { data, error } = await sb
    .from("admin_users")
    .select("id")
    .eq("role", "admin")
    .limit(1);

  if (error) throw new Error(`Failed to check admins: ${error.message}`);
  return (data?.length ?? 0) > 0;
});

// Server function to grant first admin access
export const grantFirstAdminAccess = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ user_id: z.string() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const sbAdmin = createClient(
      import.meta.env.VITE_SUPABASE_URL || "",
      import.meta.env.VITE_SUPABASE_ANON_KEY || "",
      { auth: { persistSession: false } },
    );

    // Use service role for setup (this is a one-time setup operation)
    const { data: result, error } = await sbAdmin
      .from("admin_users")
      .insert([{ id: data.user_id, role: "admin" }])
      .select()
      .single();

    if (error) throw new Error(`Failed to grant admin access: ${error.message}`);
    return result;
  });

function AdminSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const checkAdminFn = useServerFn(checkAdminExists);
  const grantAdminFn = useServerFn(grantFirstAdminAccess);

  // Check if setup is needed
  const { data: adminExists, isLoading: checkingAdmin } = useQuery({
    queryKey: ["admin-exists"],
    queryFn: () => checkAdminFn(),
  });

  // Redirect if already has admin
  useEffect(() => {
    if (!checkingAdmin && adminExists) {
      navigate({ to: "/" });
    }
    if (!user && !checkingAdmin) {
      navigate({ to: "/prijava" });
    }
  }, [user, adminExists, navigate, checkingAdmin]);

  const grantMutation = useMutation({
    mutationFn: () => grantAdminFn({ user_id: user!.id }),
    onSuccess: () => {
      navigate({ to: "/admin" });
    },
    onError: (err: any) => {
      setError(err.message || "Greška pri postavljanju admina");
    },
  });

  if (checkingAdmin || !user) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-6 py-24 text-center text-sm text-muted-foreground">
          Provjera…
        </div>
      </SiteShell>
    );
  }

  if (adminExists) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[color:var(--gold-deep)]" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Admin je već postavljen</h1>
          <p className="mt-2 text-sm text-muted-foreground">Idite na admin panel.</p>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-md px-6 py-24">
        <div className="rounded-2xl border border-border bg-card p-8">
          <Shield className="mx-auto h-12 w-12 text-[color:var(--gold-deep)]" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-center">Postavite admin račun</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Ovo je prvi admin korisnik. Kada ga postavite, moći ćete upravljati aplikacijom.
          </p>

          <div className="mt-6 rounded-lg border border-border/50 bg-background p-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Korisnik
            </div>
            <div className="font-medium text-sm">{user.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{user.email}</div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div className="text-xs text-destructive font-medium">{error}</div>
            </div>
          )}

          <Button
            onClick={() => grantMutation.mutate()}
            disabled={grantMutation.isPending}
            className="w-full mt-6"
          >
            {grantMutation.isPending ? "Postavljanje…" : "Postavite kao admin"}
          </Button>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Ovaj korak se može obaviti samo jednom. Budite sigurni da je ovo ispravan račun.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
