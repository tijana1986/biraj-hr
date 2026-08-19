import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserSuspensions,
  suspendUser,
  issueSellerWarning,
  getSellerWarnings,
} from "@/lib/admin-dashboard.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, Ban, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { hrHR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function UserManagement() {
  const [tab, setTab] = useState<"suspensions" | "warnings">("suspensions");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [suspensionType, setSuspensionType] = useState<"temporary" | "permanent">(
    "temporary"
  );
  const [durationDays, setDurationDays] = useState("");
  const [reason, setReason] = useState("");

  const queryClient = useQueryClient();

  const { data: suspensions } = useSuspenseQuery({
    queryKey: ["userSuspensions"],
    queryFn: () => getUserSuspensions({ status: "active" }),
  });

  const { data: warnings } = useSuspenseQuery({
    queryKey: ["sellerWarnings"],
    queryFn: () => getSellerWarnings({ severity: "high" }),
  });

  const suspendMutation = useMutation({
    mutationFn: ({
      userId,
      type,
      duration,
      res,
    }: {
      userId: string;
      type: "temporary" | "permanent";
      duration?: number;
      res: string;
    }) =>
      suspendUser({
        userId,
        suspensionType: type,
        reason: res,
        durationDays: duration,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSuspensions"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      setSelectedUser(null);
      setReason("");
      setDurationDays("");
    },
  });

  const getSuspensionStatus = (suspension: any) => {
    if (suspension.status === "active") {
      if (suspension.expires_at) {
        return `Ističe ${formatDistanceToNow(new Date(suspension.expires_at), {
          locale: hrHR,
        })}`;
      }
      return "Trajno suspendirano";
    }
    return suspension.status === "lifted" ? "Uklonjeno" : "Isteklo";
  };

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="suspensions">Suspenzije ({suspensions.length})</TabsTrigger>
        <TabsTrigger value="warnings">Upozorenja ({warnings.length})</TabsTrigger>
      </TabsList>

      {/* Suspensions Tab */}
      <TabsContent value="suspensions" className="space-y-4 mt-6">
        {suspensions.length > 0 ? (
          suspensions.map((suspension: any) => (
            <Card key={suspension.id} className="p-6 border-l-4 border-l-red-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={suspension.user?.avatar_url || undefined} />
                    <AvatarFallback>
                      {suspension.user?.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{suspension.user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {suspension.user?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="destructive">
                        {suspension.suspension_type === "temporary"
                          ? "Privremeno"
                          : "Trajno"}
                      </Badge>
                      <Badge variant="secondary">
                        {getSuspensionStatus(suspension)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(suspension.created_at), {
                    locale: hrHR,
                    addSuffix: true,
                  })}
                </p>
              </div>
              <p className="text-sm mb-4">{suspension.reason}</p>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            Nema aktivnih suspenzija
          </Card>
        )}
      </TabsContent>

      {/* Warnings Tab */}
      <TabsContent value="warnings" className="space-y-4 mt-6">
        {warnings.length > 0 ? (
          warnings.map((warning: any) => (
            <Card key={warning.id} className="p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{warning.seller?.name}</p>
                      <Badge
                        className={
                          warning.severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : warning.severity === "high"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {warning.severity === "critical"
                          ? "Kritično"
                          : warning.severity === "high"
                            ? "Visoko"
                            : "Normalno"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {warning.warning_type}
                    </p>
                    <p className="text-sm mt-2">{warning.description}</p>
                    {warning.action_required && (
                      <p className="text-sm text-blue-600 mt-2">
                        Trebna akcija: {warning.action_required}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(warning.created_at), {
                      locale: hrHR,
                      addSuffix: true,
                    })}
                  </p>
                  {warning.deadline && (
                    <p className="text-xs text-red-600 mt-1">
                      Rok:{" "}
                      {formatDistanceToNow(new Date(warning.deadline), {
                        locale: hrHR,
                      })}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            Nema upozorenja
          </Card>
        )}
      </TabsContent>

      {/* Suspension Dialog */}
      <AlertDialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Suspendiraj korisnika</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tip suspenzije:</label>
              <select
                value={suspensionType}
                onChange={(e) =>
                  setSuspensionType(e.target.value as "temporary" | "permanent")
                }
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="temporary">Privremeno</option>
                <option value="permanent">Trajno</option>
              </select>
            </div>

            {suspensionType === "temporary" && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Trajanje (dana):
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="7"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Razlog:</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Objasni zašto je suspenzija potrebna..."
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser && reason) {
                  suspendMutation.mutate({
                    userId: selectedUser,
                    type: suspensionType,
                    duration: durationDays
                      ? parseInt(durationDays)
                      : undefined,
                    res: reason,
                  });
                }
              }}
              disabled={!reason || suspendMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {suspendMutation.isPending ? "Obrada..." : "Suspendiraj"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  );
}
