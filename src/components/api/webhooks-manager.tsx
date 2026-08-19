import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserWebhooks, createWebhook, deleteWebhook, testWebhook } from "@/lib/api-integration.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Webhook, Plus, Trash2, TestTube, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { hrHR } from "date-fns/locale";

interface WebhooksManagerProps {
  userId: string;
}

const AVAILABLE_EVENTS = [
  "order.created",
  "order.completed",
  "order.cancelled",
  "message.received",
  "listing.created",
  "listing.updated",
  "review.received",
  "payment.received",
];

export function WebhooksManager({ userId }: WebhooksManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: webhooks } = useSuspenseQuery({
    queryKey: ["webhooks", userId],
    queryFn: () => getUserWebhooks({ userId }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createWebhook({ userId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", userId] });
      toast.success("Webhook je kreiran");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Greška: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (webhookId: string) => deleteWebhook({ webhookId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", userId] });
      toast.success("Webhook je obrisan");
    },
    onError: (error) => {
      toast.error(`Greška: ${error.message}`);
    },
  });

  const testMutation = useMutation({
    mutationFn: (webhookId: string) => testWebhook({ webhookId }),
    onSuccess: () => {
      toast.success("Test webhook je poslan");
    },
    onError: (error) => {
      toast.error(`Greška: ${error.message}`);
    },
  });

  const resetForm = () => {
    setWebhookUrl("");
    setDescription("");
    setSelectedEvents([]);
    setShowCreateForm(false);
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      webhookUrl,
      description,
      events: selectedEvents.length > 0 ? selectedEvents : AVAILABLE_EVENTS,
    });
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Primaj real-time obavijesti o događajima
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Novi webhook
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold mb-4">Kreiraj novi webhook</h4>
          <form onSubmit={handleCreateWebhook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <Input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opis</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Što je svrha ovog webhhooka"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Događaji (ostavite prazno za sve)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <label key={event} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="rounded"
                    />
                    <span className="text-sm">{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending || !webhookUrl}
              >
                {createMutation.isPending ? "Kreiranje..." : "Kreiraj webhook"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Otkaži
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Webhooks List */}
      <div className="space-y-3">
        {webhooks && webhooks.length > 0 ? (
          webhooks.map((webhook: any) => (
            <Card key={webhook.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{webhook.webhook_url}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {webhook.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {webhook.events?.map((event: string) => (
                      <span
                        key={event}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    {webhook.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        Aktivna
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        Neaktivna
                      </span>
                    )}
                    {webhook.last_triggered_at && (
                      <span className="text-xs text-muted-foreground">
                        Zadnja aktivacija:{" "}
                        {formatDistanceToNow(new Date(webhook.last_triggered_at), {
                          addSuffix: true,
                          locale: hrHR,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testMutation.mutate(webhook.id)}
                    disabled={testMutation.isPending}
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(webhook.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <Webhook className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>Nema webhooksa. Kreiraj prvi da bih primio real-time obavijesti.</p>
          </Card>
        )}
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-xs text-blue-900">
          <strong>Napomena:</strong> Webhooksi šalju POST zahtjeve s JSON
          podacima kada se događaji dogode. Prosljeđujemo HMAC potpis za
          sigurnost.
        </p>
      </Card>
    </div>
  );
}
