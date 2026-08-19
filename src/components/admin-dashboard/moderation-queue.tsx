import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getModerationQueue,
  updateModerationItem,
} from "@/lib/admin-dashboard.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CheckCircle, XCircle, Trash2 } from "lucide-react";
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

export function ModerationQueue() {
  const [status, setStatus] = useState<"pending" | undefined>("pending");
  const [priority, setPriority] = useState<"critical" | "high" | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | "delete" | null>(
    null
  );
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();
  const limit = 20;

  const { data } = useSuspenseQuery({
    queryKey: ["moderationQueue", status, priority, currentPage],
    queryFn: () =>
      getModerationQueue({
        status,
        priority,
        limit,
        offset: (currentPage - 1) * limit,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      itemId,
      newStatus,
      resolutionNotes,
    }: {
      itemId: string;
      newStatus: "approved" | "rejected" | "deleted";
      resolutionNotes?: string;
    }) =>
      updateModerationItem({
        itemId,
        status: newStatus,
        resolutionNotes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderationQueue"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      setSelectedItem(null);
      setAction(null);
      setNotes("");
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: "Spam",
      offensive: "Uvredljivo",
      fake: "Lažno",
      inappropriate: "Neprikladno",
      scam: "Prijevara",
      irrelevant: "Nebitno",
    };
    return labels[reason] || reason;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Select
          value={status || "pending"}
          onValueChange={(v) => {
            setStatus(v as "pending" | undefined);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Na čekanju</SelectItem>
            <SelectItem value="approved">Odobreno</SelectItem>
            <SelectItem value="rejected">Odbijeno</SelectItem>
            <SelectItem value="deleted">Izbrisano</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priority || "all"}
          onValueChange={(v) => {
            setPriority(v === "all" ? undefined : (v as any));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sve prioritete" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sve prioritete</SelectItem>
            <SelectItem value="critical">Kritično</SelectItem>
            <SelectItem value="high">Visoko</SelectItem>
            <SelectItem value="normal">Normalno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Moderation Items */}
      <div className="space-y-4">
        {data.items.length > 0 ? (
          data.items.map((item: any) => (
            <Card
              key={item.id}
              className="p-6 border-l-4 border-l-orange-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority === "critical"
                        ? "Kritično"
                        : item.priority === "high"
                          ? "Visoko"
                          : "Normalno"}
                    </Badge>
                    <Badge variant="secondary">
                      {item.item_type === "review" && "Recenzija"}
                      {item.item_type === "listing" && "Oglas"}
                      {item.item_type === "message" && "Poruka"}
                      {item.item_type === "profile_photo" && "Profilna slika"}
                    </Badge>
                  </div>
                  <p className="font-semibold">
                    {getReasonLabel(item.reason)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.created_at), {
                    locale: hrHR,
                    addSuffix: true,
                  })}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => {
                    setSelectedItem(item.id);
                    setAction("approve");
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Odobri
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setSelectedItem(item.id);
                    setAction("reject");
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Odbij
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-red-600 border-red-200 hover:bg-red-50 ml-auto"
                  onClick={() => {
                    setSelectedItem(item.id);
                    setAction("delete");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Obriši
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            Nema stavki za moderaciju
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

      {/* Action Dialog */}
      <AlertDialog open={!!selectedItem && !!action} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" && "Odobri stavku"}
              {action === "reject" && "Odbij stavku"}
              {action === "delete" && "Obriši stavku"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Jeste li sigurni da želite nastaviti?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <label className="text-sm font-medium mb-2 block">Bilješke:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dodatne bilješke za rezoluciju..."
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedItem && action) {
                  updateMutation.mutate({
                    itemId: selectedItem,
                    newStatus: action,
                    resolutionNotes: notes,
                  });
                }
              }}
              disabled={updateMutation.isPending}
              className={
                action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : action === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
              }
            >
              {updateMutation.isPending ? "Obrada..." : "Potvrdi"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
