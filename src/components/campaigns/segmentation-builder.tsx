import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCampaignSegmentation } from "@/lib/automated-campaigns.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Plus } from "lucide-react";
import { useState } from "react";

interface SegmentationBuilderProps {
  campaignId: string;
}

export function SegmentationBuilder({ campaignId }: SegmentationBuilderProps) {
  const [segmentName, setSegmentName] = useState("");
  const [minAccountAge, setMinAccountAge] = useState("");
  const [maxInactiveDays, setMaxInactiveDays] = useState("");
  const [minSellerRating, setMinSellerRating] = useState("");
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const updateSegmentMutation = useMutation({
    mutationFn: (data: any) =>
      updateCampaignSegmentation({
        campaignId,
        segmentName: data.segmentName,
        criteria: data.criteria,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaignSegmentation", campaignId],
      });
      toast.success("Segmentacija je ažurirana");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Greška: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSegmentName("");
    setMinAccountAge("");
    setMaxInactiveDays("");
    setMinSellerRating("");
    setUserTypes([]);
  };

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();

    const criteria: Record<string, any> = {};

    if (minAccountAge)
      criteria.account_age_days = { min: parseInt(minAccountAge) };
    if (maxInactiveDays)
      criteria.last_activity_days = { max: parseInt(maxInactiveDays) };
    if (minSellerRating)
      criteria.seller_rating = { min: parseFloat(minSellerRating) };
    if (userTypes.length > 0) criteria.user_type = userTypes;

    updateSegmentMutation.mutate({
      segmentName,
      criteria,
    });
  };

  const toggleUserType = (type: string) => {
    setUserTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <Card className="p-6">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Segmentacija korisnika
      </h4>

      <form onSubmit={handleCreateSegment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Naziv segmenta</label>
          <Input
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            placeholder="npr. Neaktivni prodavači"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Minimalna starost računa (dani)
            </label>
            <Input
              type="number"
              value={minAccountAge}
              onChange={(e) => setMinAccountAge(e.target.value)}
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Maksimalna inaktivnost (dani)
            </label>
            <Input
              type="number"
              value={maxInactiveDays}
              onChange={(e) => setMaxInactiveDays(e.target.value)}
              placeholder="60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Minimalna prodavačka ocjena
          </label>
          <Input
            type="number"
            step="0.1"
            value={minSellerRating}
            onChange={(e) => setMinSellerRating(e.target.value)}
            placeholder="4.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Tip korisnika
          </label>
          <div className="space-y-2">
            {["seller", "buyer"].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userTypes.includes(type)}
                  onChange={() => toggleUserType(type)}
                  className="rounded"
                />
                <span className="text-sm capitalize">
                  {type === "seller" ? "Prodavači" : "Kupci"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={updateSegmentMutation.isPending || !segmentName}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {updateSegmentMutation.isPending
            ? "Kreiranje..."
            : "Kreiraj segment"}
        </Button>
      </form>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
        <p className="text-xs text-green-900">
          <strong>Savjet:</strong> Koristi segmentaciju za precizno targetiranje
          specifičnih grupa korisnika sa prilagođenim porukama.
        </p>
      </div>
    </Card>
  );
}
