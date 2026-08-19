import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmailCampaigns, createEmailCampaign } from "@/lib/email-notifications.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Plus, Clock, Send } from "lucide-react";
import { useState } from "react";

export function CampaignManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    campaignType: "promotional",
    templateKey: "order_confirmation",
    targetSegment: "all_users",
  });
  const queryClient = useQueryClient();

  const { data: campaigns } = useSuspenseQuery({
    queryKey: ["emailCampaigns"],
    queryFn: () => getEmailCampaigns({ status: "draft" }),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => createEmailCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailCampaigns"] });
      toast.success("Kampanja je kreirana");
      setShowCreateForm(false);
      setFormData({
        name: "",
        description: "",
        campaignType: "promotional",
        templateKey: "order_confirmation",
        targetSegment: "all_users",
      });
    },
    onError: (error) => {
      toast.error(`Greška: ${error.message}`);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const campaignTypes = [
    { value: "promotional", label: "Promotivna" },
    { value: "reengagement", label: "Ponovno uključivanje" },
    { value: "educational", label: "Edukativna" },
    { value: "announcement", label: "Objava" },
  ];

  const targetSegments = [
    { value: "all_users", label: "Svi korisnici" },
    { value: "inactive_sellers", label: "Neaktivni prodavači" },
    { value: "new_sellers", label: "Novi prodavači" },
    { value: "high_value_buyers", label: "Vrijedni kupci" },
  ];

  const templates = [
    { value: "order_confirmation", label: "Potvrda narudžbe" },
    { value: "review_received", label: "Primljena recenzija" },
    { value: "message_received", label: "Primljena poruka" },
    { value: "payment_received", label: "Plaćanje primljeno" },
    { value: "weekly_digest", label: "Tjedni sažetak" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email kampanje
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upravljajte marketing kampanjama i re-engagement inicijativama
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="default"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova kampanja
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold mb-4">Kreiraj novu kampanju</h4>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Naziv</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="npr. Povratak neaktivnih prodavača"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opis</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Kratko opisati svrhu kampanje"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tip</label>
                <select
                  value={formData.campaignType}
                  onChange={(e) =>
                    setFormData({ ...formData, campaignType: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {campaignTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Šablon
                </label>
                <select
                  value={formData.templateKey}
                  onChange={(e) =>
                    setFormData({ ...formData, templateKey: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {templates.map((template) => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ciljna publika
              </label>
              <select
                value={formData.targetSegment}
                onChange={(e) =>
                  setFormData({ ...formData, targetSegment: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                {targetSegments.map((segment) => (
                  <option key={segment.value} value={segment.value}>
                    {segment.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending || !formData.name}
              >
                {createMutation.isPending ? "Kreiranj..." : "Kreiraj kampanju"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Otkaži
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Campaigns List */}
      <div className="space-y-3">
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign: any) => (
            <Card key={campaign.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{campaign.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {campaign.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {campaign.campaign_type}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {campaign.target_segment}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <Mail className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-muted-foreground">
              Nema kampanja. Kreirajte novu kampanju za početak.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
