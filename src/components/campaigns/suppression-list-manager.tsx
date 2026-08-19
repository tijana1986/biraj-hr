import { useMutation } from "@tanstack/react-query";
import { addToSuppressionList } from "@/lib/automated-campaigns.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Ban, Plus } from "lucide-react";
import { useState } from "react";

interface SuppressionListManagerProps {
  campaignId: string;
  suppressedEmails?: string[];
}

export function SuppressionListManager({
  campaignId,
  suppressedEmails = [],
}: SuppressionListManagerProps) {
  const [emailAddress, setEmailAddress] = useState("");
  const [reason, setReason] = useState("manual");
  const [emails, setEmails] = useState<string[]>(suppressedEmails);

  const addMutation = useMutation({
    mutationFn: (data: any) =>
      addToSuppressionList({
        campaignId,
        ...data,
      }),
    onSuccess: () => {
      toast.success("Email je dodan na listu isključivanja");
      setEmails([...emails, emailAddress]);
      setEmailAddress("");
    },
    onError: (error) => {
      toast.error(`Greška: ${error.message}`);
    },
  });

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Molim unesite ispravan email");
      return;
    }

    addMutation.mutate({
      emailAddress,
      reason,
    });
  };

  const removeEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
    toast.success("Email je uklonjen");
  };

  const reasonOptions = [
    { value: "manual", label: "Ručno isključen" },
    { value: "bounced", label: "Odbijeni email" },
    { value: "complained", label: "Prijavljen kao spam" },
    { value: "unsubscribed", label: "Odjavljen" },
  ];

  return (
    <div className="space-y-4">
      {/* Add Email Form */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Ban className="h-5 w-5" />
          Lista isključivanja
        </h4>

        <form onSubmit={handleAddEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email adresa</label>
            <Input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="primer@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Razlog</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={addMutation.isPending || !emailAddress}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {addMutation.isPending ? "Dodavanje..." : "Dodaj na listu"}
          </Button>
        </form>
      </Card>

      {/* Suppressed Emails List */}
      {emails.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Isključeni emaili ({emails.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {emails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded"
              >
                <span className="text-sm font-medium text-red-900">{email}</span>
                <button
                  onClick={() => removeEmail(email)}
                  className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
                >
                  Ukloni
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-yellow-50 border border-yellow-200">
        <p className="text-xs text-yellow-900">
          <strong>Napomena:</strong> Emaili na listi isključivanja neće primiti
          ovu kampanju. Koristi za odbijene emaile, žalbe ili eksplicitne
          zahtjeve za isključivanje.
        </p>
      </Card>
    </div>
  );
}
