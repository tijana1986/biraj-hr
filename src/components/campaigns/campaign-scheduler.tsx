import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCampaignSchedule } from "@/lib/automated-campaigns.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Clock, Calendar } from "lucide-react";
import { useState } from "react";

interface CampaignSchedulerProps {
  campaignId: string;
}

export function CampaignScheduler({ campaignId }: CampaignSchedulerProps) {
  const [scheduleType, setScheduleType] = useState<"once" | "daily" | "weekly" | "monthly">("once");
  const [scheduledFor, setScheduledFor] = useState("");
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const queryClient = useQueryClient();

  const createScheduleMutation = useMutation({
    mutationFn: (data: any) => createCampaignSchedule({ campaignId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaignSchedules", campaignId] });
      toast.success("Raspored je postavljen");
      setScheduledFor("");
      setRecurrenceEnd("");
    },
    onError: (error) => {
      toast.error(`Greška: ${error.message}`);
    },
  });

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    createScheduleMutation.mutate({
      scheduleType,
      scheduledFor: scheduleType === "once" ? scheduledFor : undefined,
      recurrenceEnd: scheduleType !== "once" ? recurrenceEnd : undefined,
    });
  };

  const scheduleTypeOptions = [
    { value: "once", label: "Jednom (sad ili kasnije)" },
    { value: "daily", label: "Svaki dan" },
    { value: "weekly", label: "Svaki tjedan" },
    { value: "monthly", label: "Svaki mjesec" },
  ];

  return (
    <Card className="p-6">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Raspored kampanje
      </h4>

      <form onSubmit={handleCreateSchedule} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tip rasporeda</label>
          <select
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-md"
          >
            {scheduleTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {scheduleType === "once" && (
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Vrijeme slanja
            </label>
            <Input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ostavite prazno za slanje odmah
            </p>
          </div>
        )}

        {scheduleType !== "once" && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Kraj ponavljanja
            </label>
            <Input
              type="date"
              value={recurrenceEnd}
              onChange={(e) => setRecurrenceEnd(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ostavite prazno za beskonačno ponavljanje
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={createScheduleMutation.isPending}
          className="w-full"
        >
          {createScheduleMutation.isPending
            ? "Postavljanje..."
            : "Postavi raspored"}
        </Button>
      </form>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-xs text-blue-900">
          <strong>Napomena:</strong> Ponavljajuće kampanje će se automatski
          pokrenuti prema rasporedu. Možete ih u svakom trenutku zaustaviti ili
          ažurirati.
        </p>
      </div>
    </Card>
  );
}
