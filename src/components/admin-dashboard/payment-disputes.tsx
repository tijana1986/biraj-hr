import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentDisputes, resolveDispute } from "@/lib/admin-dashboard.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { hrHR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PaymentDisputes() {
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();
  const limit = 20;

  const { data } = useSuspenseQuery({
    queryKey: ["paymentDisputes", currentPage],
    queryFn: () =>
      getPaymentDisputes({
        status: "open",
        limit,
        offset: (currentPage - 1) * limit,
      }),
  });

  const resolveMutation = useMutation({
    mutationFn: ({
      disputeId,
      res,
      refund,
    }: {
      disputeId: string;
      res: string;
      refund?: number;
    }) =>
      resolveDispute({
        disputeId,
        resolution: res,
        refundAmount: refund,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentDisputes"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      setSelectedDispute(null);
      setResolution("");
      setRefundAmount("");
    },
  });

  const getDisputeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      item_not_received: "Artikl nije primljen",
      item_not_matching: "Artikl ne odgovara",
      damaged_item: "Oštećeni artikl",
      seller_unresponsive: "Prodavač je neresponsivan",
      payment_issue: "Problem sa plaćanjem",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Ukupno sporova</p>
          <p className="text-2xl font-bold">{data.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Na ovoj stranici</p>
          <p className="text-2xl font-bold">{data.disputes.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Stranica</p>
          <p className="text-2xl font-bold">{data.page} od {data.totalPages}</p>
        </Card>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {data.disputes.length > 0 ? (
          data.disputes.map((dispute: any) => (
            <Card key={dispute.id} className="p-6 border-l-4 border-l-red-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold">
                      {getDisputeTypeLabel(dispute.dispute_type)}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {dispute.description}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(dispute.created_at), {
                    locale: hrHR,
                    addSuffix: true,
                  })}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Inicijator</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {dispute.initiated_by?.name?.slice(0, 1) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {dispute.initiated_by?.name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Iznos</p>
                    <p className="text-lg font-bold mt-1">
                      {dispute.promotion_orders?.total_amount} KM
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setSelectedDispute(dispute.id)}
                className="w-full gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Razriješi spor
              </Button>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            Nema otvorenih sporova
          </Card>
        )}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prethodna
          </Button>

          {Array.from({ length: data.totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            disabled={currentPage === data.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sljedeća
          </Button>
        </div>
      )}

      {/* Resolution Dialog */}
      <AlertDialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Razriješi spor</AlertDialogTitle>
            <AlertDialogDescription>
              Unesite rezoluciju i bilo kakvu povratnu informaciju
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rezolucija:</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Kako se spor razriješio..."
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Iznos povrata (KM):
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border rounded-md text-sm"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedDispute && resolution) {
                  resolveMutation.mutate({
                    disputeId: selectedDispute,
                    res: resolution,
                    refund: refundAmount ? parseFloat(refundAmount) : undefined,
                  });
                }
              }}
              disabled={!resolution || resolveMutation.isPending}
            >
              {resolveMutation.isPending ? "Obrada..." : "Razriješi"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
