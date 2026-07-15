import { useState } from "react";
import { Flag } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { createReport } from "@/lib/reports.functions";
import { useAuth } from "@/lib/auth";

type Props = {
  targetType: "listing" | "message" | "service_request" | "user";
  targetId: string;
  label?: string;
  variant?: "ghost" | "outline" | "link";
  size?: "sm" | "default" | "icon";
  className?: string;
};

const REASONS = [
  { value: "spam", label: "Spam ili prevara" },
  { value: "inappropriate", label: "Neprikladan sadržaj" },
  { value: "misleading", label: "Netočni ili obmanjujući podaci" },
  { value: "duplicate", label: "Duplikat oglasa" },
  { value: "harassment", label: "Uznemiravanje" },
  { value: "other", label: "Drugo" },
];

export function ReportButton({ targetType, targetId, label = "Prijavi", variant = "ghost", size = "sm", className }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const createFn = useServerFn(createReport);

  const mut = useMutation({
    mutationFn: () => createFn({ data: { target_type: targetType, target_id: targetId, reason, details: details.trim() || undefined } }),
    onSuccess: () => {
      toast.success("Prijava zaprimljena. Hvala!");
      setOpen(false);
      setDetails("");
      setReason("spam");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Greška pri slanju prijave."),
  });

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Flag className="h-4 w-4" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Prijavi sadržaj</DialogTitle>
          <DialogDescription>
            Vaša prijava je anonimna za drugog korisnika. Moderator će je pregledati u najkraćem roku.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Razlog</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="mt-2 space-y-1.5">
              {REASONS.map((r) => (
                <div key={r.value} className="flex items-center gap-2">
                  <RadioGroupItem value={r.value} id={`r-${r.value}`} />
                  <Label htmlFor={`r-${r.value}`} className="cursor-pointer text-sm font-normal">{r.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="details" className="text-sm font-semibold">Opis (nije obavezno)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Dodatne informacije koje bi mogle pomoći moderatoru…"
              maxLength={2000}
              className="mt-1"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={mut.isPending}>Odustani</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending} className="bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
            {mut.isPending ? "Slanje…" : "Pošalji prijavu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
