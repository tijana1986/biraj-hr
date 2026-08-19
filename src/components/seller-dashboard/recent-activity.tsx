import { useSuspenseQuery } from "@tanstack/react-query";
import { getSellerDashboard } from "@/lib/seller-dashboard.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { hrHR } from "date-fns/locale";
import { CheckCircle, Clock, XCircle, MessageCircle } from "lucide-react";

interface RecentActivityProps {
  sellerId: string;
}

export function RecentActivity({ sellerId }: RecentActivityProps) {
  const { data } = useSuspenseQuery({
    queryKey: ["sellerDashboard", sellerId],
    queryFn: () => getSellerDashboard({ sellerId }),
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "canceled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Završen";
      case "pending":
        return "Na čekanju";
      case "canceled":
        return "Otkazan";
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Orders */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Nedavni redoslijedi</h3>
        <div className="space-y-4">
          {data.recentOrders.length > 0 ? (
            data.recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="flex items-start justify-between pb-4 border-b last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {order.listings?.title || "Oglas"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(order.created_at), {
                      locale: hrHR,
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {order.total_amount} KM
                  </span>
                  <Badge
                    variant={
                      order.payment_status === "completed"
                        ? "default"
                        : "secondary"
                    }
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(order.payment_status)}
                    {getStatusLabel(order.payment_status)}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nema nedavnih redoslijeda
            </p>
          )}
        </div>
      </Card>

      {/* Recent Messages */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Nedavne poruke</h3>
        <div className="space-y-4">
          {data.recentMessages.length > 0 ? (
            data.recentMessages.map((conversation: any) => (
              <div
                key={conversation.id}
                className="flex items-start gap-3 pb-4 border-b last:border-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={conversation.buyer?.avatar_url || undefined} />
                  <AvatarFallback>
                    {conversation.buyer?.name?.slice(0, 2).toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {conversation.buyer?.name || "Anonimni korisnik"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.messages?.[0]?.content || "Nema poruke"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(
                      new Date(conversation.last_message_at),
                      {
                        locale: hrHR,
                        addSuffix: true,
                      }
                    )}
                  </p>
                </div>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nema nedavnih poruka
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
