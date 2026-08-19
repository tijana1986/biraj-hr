import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCampaignABTest } from "@/lib/automated-campaigns.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GitCompare } from "lucide-react";
import { useState } from "react";

interface ABTestCreatorProps {
  campaignId: string;
}

export function ABTestCreator({ campaignId }: ABTestCreatorProps) {
  const [testType, setTestType] = useState<"subject_line" | "email_content" | "send_time" | "sender_name">("subject_line");
  const [testPercentage, setTestPercentage] = useState("50");
  const queryClient = useQueryClient();

  const createTestMutation = useMutation({
    mutationFn: (data: any) =>
      createCampaignABTest({
        campaignId,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaignABTests", campaignId],
      });
      toast.success("A/B test je kreiran");
      setTestPercentage("50");
    },
    onError: (error) => {
      toast.error(`Greška: ${error.message}`);
    },
  });

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();

    createTestMutation.mutate({
      testType,
      testPercentage: parseFloat(testPercentage),
      variantAId: "default",
      variantBId: "variant",
    });
  };

  const testTypeOptions = [
    { value: "subject_line", label: "Linija predmeta", description: "Testiraj različite naslove" },
    { value: "email_content", label: "Sadržaj emaila", description: "Testiraj različit sadržaj" },
    { value: "send_time", label: "Vrijeme slanja", description: "Testiraj optimalno vrijeme" },
    { value: "sender_name", label: "Ime pošiljaoca", description: "Testiraj različita imena" },
  ];

  return (
    <Card className="p-6">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <GitCompare className="h-5 w-5" />
        A/B Testing
      </h4>

      <form onSubmit={handleCreateTest} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-3">
            Što želite testirati?
          </label>
          <div className="space-y-2">
            {testTypeOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition ${
                  testType === option.value
                    ? "bg-blue-50 border-blue-300"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="testType"
                  value={option.value}
                  checked={testType === option.value}
                  onChange={(e) => setTestType(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Postotak za test: {testPercentage}%
          </label>
          <input
            type="range"
            min="5"
            max="95"
            value={testPercentage}
            onChange={(e) => setTestPercentage(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {testPercentage}% primatelja će dobiti test verziju, ostatak pobjednika
          </p>
        </div>

        <Button
          type="submit"
          disabled={createTestMutation.isPending}
          className="w-full"
        >
          {createTestMutation.isPending
            ? "Kreiranje..."
            : "Kreiraj A/B test"}
        </Button>
      </form>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
        <p className="text-xs text-purple-900">
          <strong>Kako funkcionira:</strong> Podjeli primatelje na dvije grupe.
          Jedna grupa dobija verziju A, druga verziju B. Pobjednica se šalje
          ostatku primatelja.
        </p>
      </div>
    </Card>
  );
}
