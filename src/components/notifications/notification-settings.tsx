import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/email-notifications.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Mail, AlertTriangle, Gift, Zap } from "lucide-react";

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const queryClient = useQueryClient();

  const { data: preferences } = useSuspenseQuery({
    queryKey: ["notificationPreferences", userId],
    queryFn: () => getNotificationPreferences({ userId }),
  });

  const updateMutation = useMutation({
    mutationFn: (prefs: Record<string, boolean>) =>
      updateNotificationPreferences({
        userId,
        preferences: prefs,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
      toast.success("Postavke obavijesti su ažurirane");
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: () =>
      updateNotificationPreferences({
        userId,
        unsubscribeAll: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
      toast.success("Odbijeni ste od svih obavijesti");
    },
  });

  const handleToggle = (key: string, value: boolean) => {
    updateMutation.mutate({
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Postavke obavijesti</h2>
        <p className="text-muted-foreground">
          Upravljajte kako i kada primjenjujete obavijesti
        </p>
      </div>

      {/* Email Notification Types */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Vrste obavijesti
        </h3>
        <div className="space-y-4">
          {[
            {
              key: "order_notifications",
              label: "Obavijesti o redoslijedi",
              description: "Potvrde redoslijeda, plaćanja, isporuke",
              icon: "🛒",
            },
            {
              key: "review_notifications",
              label: "Obavijesti o recenzijama",
              description: "Nove recenzije na vašim oglasima",
              icon: "⭐",
            },
            {
              key: "message_notifications",
              label: "Obavijesti o porukama",
              description: "Nove poruke od kupaca",
              icon: "💬",
            },
            {
              key: "payment_notifications",
              label: "Obavijesti o plaćanju",
              description: "Isplate, refunde, problemi sa plaćanjem",
              icon: "💰",
            },
            {
              key: "system_notifications",
              label: "Sistemske obavijesti",
              description: "Upozorenja, suspenzije, probleme sa računom",
              icon: AlertTriangle,
            },
            {
              key: "promotion_notifications",
              label: "Promotivne obavijesti",
              description: "Nove mogućnosti, posebne ponude",
              icon: Gift,
            },
          ].map((notif) => (
            <div
              key={notif.key}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {typeof notif.icon === "string"
                      ? notif.icon
                      : "🔔"}
                  </span>
                  <p className="font-semibold">{notif.label}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notif.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    preferences[
                      notif.key as keyof typeof preferences
                    ] || false
                  }
                  onChange={(e) =>
                    handleToggle(notif.key, e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Frequency Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Učestalost obavijesti
        </h3>
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div>
              <p className="font-semibold">Odmah za kritične probleme</p>
              <p className="text-sm text-muted-foreground">
                Suspenzije, probleme sa plaćanjem
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.immediate_critical || false}
                onChange={(e) =>
                  handleToggle("immediate_critical", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div>
              <p className="font-semibold">Dnevno zbrajanje</p>
              <p className="text-sm text-muted-foreground">
                Pojedinačne obavijesti grupirati u jedan dnevni sažetak
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.batch_daily || false}
                onChange={(e) =>
                  handleToggle("batch_daily", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div>
              <p className="font-semibold">Tjedni sažetak</p>
              <p className="text-sm text-muted-foreground">
                Primite sažetak aktivnosti jednom tjedno
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.batch_weekly || false}
                onChange={(e) =>
                  handleToggle("batch_weekly", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Unsubscribe */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold mb-2 text-red-900">Obustavi sve obavijesti</h3>
        <p className="text-sm text-red-700 mb-4">
          Ako se odjavite sa svih obavijesti, možda ćete propustiti važne ažuriranja o
          vašem računu i redoslijedi.
        </p>
        <Button
          onClick={() => unsubscribeMutation.mutate()}
          disabled={unsubscribeMutation.isPending}
          variant="destructive"
        >
          {unsubscribeMutation.isPending ? "Obrada..." : "Odjavite se od svih"}
        </Button>
      </Card>
    </div>
  );
}
