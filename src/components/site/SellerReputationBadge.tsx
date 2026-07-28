import { Crown, Star, Award } from "lucide-react";

export type BadgeType = "trusted" | "excellent" | "outstanding";

export function SellerReputationBadge({ badge, rating, count }: { badge?: BadgeType; rating?: number; count?: number }) {
  if (!badge) return null;

  const badgeConfig = {
    trusted: {
      icon: Star,
      label: "Pouzdani prodavač",
      description: "4.0+ zvjezdica, 5+ recenzija",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
      badgeColor: "bg-blue-100",
    },
    excellent: {
      icon: Award,
      label: "Odličan prodavač",
      description: "4.5+ zvjezdica, 10+ recenzija",
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      badgeColor: "bg-green-100",
    },
    outstanding: {
      icon: Crown,
      label: "Izvanredan prodavač",
      description: "4.7+ zvjezdica, 20+ recenzija",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      badgeColor: "bg-amber-100",
    },
  };

  const config = badgeConfig[badge];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border ${config.bg} p-3`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-lg ${config.badgeColor} p-2`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div>
          <div className={`font-semibold ${config.color}`}>{config.label}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {rating && count ? (
              <>
                <strong>{rating.toFixed(1)}</strong> zvjezdica • <strong>{count}</strong> {count === 1 ? "recenzija" : "recenzija"}
              </>
            ) : (
              config.description
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
