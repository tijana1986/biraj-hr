import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Shield, User, Trash2, Edit2 } from "lucide-react";
import { createServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

// Fetch all admin users
export const listAdminUsers = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  );

  const { data, error } = await sb
    .from("admin_users")
    .select("id, role, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch admin users: ${error.message}`);

  // Fetch user emails from auth
  const result = [];
  for (const admin of data || []) {
    const { data: profile } = await sb
      .from("profiles")
      .select("email, name")
      .eq("id", admin.id)
      .single();

    result.push({
      id: admin.id,
      name: profile?.name || "Unknown",
      email: profile?.email || "Unknown",
      role: admin.role,
      created_at: admin.created_at,
    });
  }

  return result;
});

// Update admin user role
export const updateAdminUserRole = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      user_id: z.string(),
      role: z.enum(["admin", "editor", "viewer"]),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      import.meta.env.VITE_SUPABASE_URL || "",
      import.meta.env.VITE_SUPABASE_ANON_KEY || "",
    );

    const { data: result, error } = await sb
      .from("admin_users")
      .update({ role: data.role })
      .eq("id", data.user_id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return result;
  });

// Remove admin access
export const removeAdminAccess = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ user_id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      import.meta.env.VITE_SUPABASE_URL || "",
      import.meta.env.VITE_SUPABASE_ANON_KEY || "",
    );

    const { error } = await sb
      .from("admin_users")
      .delete()
      .eq("id", data.user_id);

    if (error) throw new Error(`Failed to remove admin access: ${error.message}`);
    return { success: true };
  });

// Grant admin access by email
export const grantAdminAccessByEmail = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      email: z.string().email(),
      role: z.enum(["admin", "editor", "viewer"]),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      import.meta.env.VITE_SUPABASE_URL || "",
      import.meta.env.VITE_SUPABASE_ANON_KEY || "",
    );

    // Find user by email
    const { data: profile, error: profileError } = await sb
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();

    if (profileError) throw new Error(`Failed to find user: ${profileError.message}`);
    if (!profile) throw new Error("Korisnik s tom e-poštom nije pronađen");

    // Grant admin access
    const { data: result, error } = await sb
      .from("admin_users")
      .upsert([{ id: profile.id, role: data.role }])
      .select()
      .single();

    if (error) throw new Error(`Failed to grant access: ${error.message}`);
    return result;
  });

function AdminUsersPage() {
  const qc = useQueryClient();
  const [grantEmail, setGrantEmail] = useState("");
  const [grantRole, setGrantRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<"admin" | "editor" | "viewer">("editor");

  const listFn = useServerFn(listAdminUsers);
  const updateFn = useServerFn(updateAdminUserRole);
  const removeFn = useServerFn(removeAdminAccess);
  const grantFn = useServerFn(grantAdminAccessByEmail);

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listFn(),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateFn({ user_id: editingId!, role: editRole }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingId(null);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeFn({ user_id: userId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const grantMutation = useMutation({
    mutationFn: () => grantFn({ email: grantEmail, role: grantRole }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setGrantEmail("");
      setGrantRole("editor");
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-[color:var(--gold-deep)]/20 text-[color:var(--gold-deep)]";
      case "editor":
        return "bg-blue-500/20 text-blue-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Upravljanje admin korisnicima</h1>
        <p className="mt-1 text-sm text-muted-foreground">Dodijelite ili oduzimite admin pristup korisnicima.</p>
      </div>

      {/* Grant new admin */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Dodijelite admin pristup</h2>
        <div className="space-y-3">
          <Input
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            placeholder="E-pošta korisnika"
            type="email"
          />
          <Select value={grantRole} onValueChange={(v: any) => setGrantRole(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Urednik</SelectItem>
              <SelectItem value="viewer">Preglednik</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => grantMutation.mutate()}
            disabled={grantMutation.isPending || !grantEmail}
          >
            {grantMutation.isPending ? "Dodjeljivanje…" : "Dodijelite pristup"}
          </Button>
          {grantMutation.isError && (
            <div className="text-xs text-destructive">
              {(grantMutation.error as any)?.message || "Greška pri dodjeljivanju pristupa"}
            </div>
          )}
        </div>
      </div>

      {/* List admin users */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Admin korisnici ({users.length})</h2>
        <div className="space-y-3">
          {users.map((user: any) => (
            <div key={user.id} className="rounded-lg border border-border/50 bg-background p-4">
              {editingId === user.id ? (
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <Select value={editRole} onValueChange={(v: any) => setEditRole(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Urednik</SelectItem>
                      <SelectItem value="viewer">Preglednik</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateMutation.mutate()}
                      disabled={updateMutation.isPending}
                    >
                      Spremi
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Otkaži
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role === "admin" ? "Admin" : user.role === "editor" ? "Urednik" : "Preglednik"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(user.id);
                        setEditRole(user.role);
                      }}
                      className="rounded px-2 py-1 text-xs font-medium hover:bg-secondary"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeMutation.mutate(user.id)}
                      className="rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-secondary"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
