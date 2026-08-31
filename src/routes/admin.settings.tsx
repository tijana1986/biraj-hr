import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fetchSiteSetting, updateSiteSetting, type SiteSetting } from "@/lib/cms.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

const EDITABLE_SETTINGS = [
  { key: "site_title", label: "Naziv stranice", type: "string" },
  { key: "site_description", label: "Opis stranice", type: "text" },
  { key: "contact_email", label: "Kontakt e-pošta", type: "string" },
  { key: "support_email", label: "Email podrške", type: "string" },
];

function AdminSettingsPage() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(fetchSiteSetting);
  const updateFn = useServerFn(updateSiteSetting);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const { data: settings = {} } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const result: Record<string, SiteSetting | null> = {};
      for (const setting of EDITABLE_SETTINGS) {
        result[setting.key] = await fetchFn({ key: setting.key });
      }
      return result;
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateFn({
      key: editingKey!,
      value: editValue,
      value_type: EDITABLE_SETTINGS.find(s => s.key === editingKey)?.type || "string",
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      setEditingKey(null);
    },
  });

  const startEdit = (key: string) => {
    setEditingKey(key);
    setEditValue(settings[key]?.value || "");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Postavke stranice</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upravljajte osnovnim postavkama stranice.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="space-y-4">
          {EDITABLE_SETTINGS.map((setting) => {
            const currentValue = settings[setting.key];
            return (
              <div key={setting.key} className="rounded-lg border border-border/50 bg-background p-4">
                <div className="mb-2 font-medium text-sm">{setting.label}</div>
                {editingKey === setting.key ? (
                  <div className="space-y-3">
                    {setting.type === "text" ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-sm"
                        rows={4}
                      />
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        type={setting.type === "string" ? "text" : "number"}
                        className="text-sm"
                      />
                    )}
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
                        onClick={() => setEditingKey(null)}
                      >
                        Otkaži
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {currentValue?.value || "Nije postavljeno"}
                    </div>
                    <button
                      onClick={() => startEdit(setting.key)}
                      className="rounded px-3 py-1 text-xs font-medium hover:bg-secondary"
                    >
                      Uredi
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-background p-6">
        <h2 className="font-display text-lg font-semibold mb-3">O administracijskom panelu</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Ovaj panel omogućuje vam da upravljate sadržajem na Biraj.HR bez pristupa kodu. Trenutno možete:
        </p>
        <ul className="space-y-1 text-sm text-muted-foreground ml-4">
          <li>• Upravljati čestim pitanjima (Česta pitanja)</li>
          <li>• Ažurirati osnovne postavke stranice</li>
          <li>• Upravljati FAQ stavkama bez trebanja znati kod</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Za dodatne značajke ili prilagodbe, kontaktirajte support@biraj.com.hr.
        </p>
      </div>
    </div>
  );
}
