import { useSuspenseQuery } from "@tanstack/react-query";
import { getNotificationLogs } from "@/lib/email-notifications.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, AlertCircle, Eye, Clock } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { hrHR } from "date-fns/locale";

interface NotificationHistoryProps {
  userId: string;
  limit?: number;
}

export function NotificationHistory({ userId, limit = 50 }: NotificationHistoryProps) {
  const [offset, setOffset] = useState(0);

  const { data: logsData } = useSuspenseQuery({
    queryKey: ["notificationLogs", userId, offset, limit],
    queryFn: () => getNotificationLogs({ userId, limit, offset }),
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "opened":
        return <Eye className="h-5 w-5 text-blue-600" />;
      default:
        return <Mail className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      sent: "Poslano",
      failed: "Neuspješno",
      opened: "Otvoreno",
      bounced: "Odbijeno",
      clicked: "Kliknut",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      sent: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      opened: "bg-blue-100 text-blue-800",
      bounced: "bg-yellow-100 text-yellow-800",
      clicked: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Povijest obavijesti
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Pregled svih poslanih obavijesti i njihovog statusa
        </p>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {logsData?.logs && logsData.logs.length > 0 ? (
          logsData.logs.map((log: any) => (
            <Card key={log.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(log.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{log.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.recipient_email}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(log.status)}`}
                    >
                      {getStatusLabel(log.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                    {log.template_key && (
                      <span>Šablon: {log.template_key}</span>
                    )}
                    {log.sent_at && (
                      <span>
                        Poslano:{" "}
                        {formatDistanceToNow(new Date(log.sent_at), {
                          addSuffix: true,
                          locale: hrHR,
                        })}
                      </span>
                    )}
                    {log.opened_at && (
                      <span>
                        Otvoreno:{" "}
                        {formatDistanceToNow(new Date(log.opened_at), {
                          addSuffix: true,
                          locale: hrHR,
                        })}
                      </span>
                    )}
                    {log.clicked_at && (
                      <span>
                        Kliknut:{" "}
                        {formatDistanceToNow(new Date(log.clicked_at), {
                          addSuffix: true,
                          locale: hrHR,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <Mail className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-muted-foreground">
              Nema obavijesti za prikaz
            </p>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {logsData && logsData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Stranica {logsData.page} od {logsData.totalPages} (
            {logsData.total} ukupno)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              Prethodna
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(offset + limit)}
              disabled={logsData.page >= logsData.totalPages}
            >
              Slijedeća
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
