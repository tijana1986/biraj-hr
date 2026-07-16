import { Shield, CheckCircle2, Badge, Star, AlertCircle } from "lucide-react";

interface TrustBadgeProps {
  level: "unverified" | "partial" | "verified" | "trusted";
  score?: number;
  size?: "sm" | "md" | "lg";
}

export function TrustBadge({ level, score, size = "md" } : TrustBadgeProps) {
  const badges = {
    unverified: {
      icon: AlertCircle,
      label: "Nepotvrdeno",
      color: "text-muted-foreground",
      bg: "bg-secondary/30",
    },
    partial: {
      icon: CheckCircle2,
      label: "Djelomično potvrđeno",
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    verified: {
      icon: Badge,
      label: "Potvrđeno",
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    trusted: {
      icon: Shield,
      label: "Trusted Seller",
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
  };

  const badge = badges[level];
  const Icon = badge.icon;

  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${badge.bg}`}>
      <Icon className={`${sizes[size]} ${badge.color}`} />
      <span className={`font-medium ${textSizes[size]} ${badge.color}`}>
        {badge.label}
        {score !== undefined && ` (${score}/100)`}
      </span>
    </div>
  );
}

interface SellerVerificationProps {
  badges: string[];
  score: number;
  level: "unverified" | "partial" | "verified" | "trusted";
}

export function SellerVerification({ badges, score, level }: SellerVerificationProps) {
  const badgeIcons: Record<string, { icon: any; label: string; color: string }> = {
    email_verified: {
      icon: CheckCircle2,
      label: "Email potvrđen",
      color: "text-blue-500",
    },
    kyc_verified: {
      icon: Shield,
      label: "Identitet potvrđen",
      color: "text-green-500",
    },
    highly_rated: {
      icon: Star,
      label: "Visoko ocijenjeno",
      color: "text-yellow-500",
    },
    active_seller: {
      icon: Badge,
      label: "Aktivan prodavač",
      color: "text-indigo-500",
    },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Povjerenja score</span>
        <span className="font-display text-lg font-bold text-[color:var(--gold-deep)]">
          {score}/100
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full transition-all ${
            score >= 80
              ? "bg-green-500"
              : score >= 50
                ? "bg-blue-500"
                : score >= 20
                  ? "bg-amber-500"
                  : "bg-red-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => {
          const badgeInfo = badgeIcons[badge];
          if (!badgeInfo) return null;
          const Icon = badgeInfo.icon;
          return (
            <div key={badge} className="flex items-center gap-1 rounded-full bg-secondary/50 px-2 py-1">
              <Icon className={`h-3 w-3 ${badgeInfo.color}`} />
              <span className="text-xs text-foreground/80">{badgeInfo.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
