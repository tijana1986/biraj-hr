import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Heart, Eye } from "lucide-react";
import { formatPrice } from "@/lib/mock/data";
import { resolveImages, type ListingRow } from "@/lib/catalog";
import { useWishlist } from "@/lib/wishlist";

export function ListingCard({ l }: { l: ListingRow }) {
  const { has, toggle } = useWishlist();
  const saved = has(l.id);
  const imgs = resolveImages(l.images);
  const authenticated = Boolean(
    l.metadata && typeof l.metadata === "object" && (l.metadata as { authenticated?: boolean }).authenticated,
  );
  const savedCount = (l.metadata && typeof l.metadata === "object" && (l.metadata as { savedCount?: number }).savedCount) || 0;
  return (
    <Link
      to="/oglas/$id"
      params={{ id: l.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-raised)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-floating)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl">
        <img
          src={imgs[0]}
          alt={l.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        {l.is_verified && (
          <span className="absolute left-3 top-3 inline-flex h-7 items-center gap-1 rounded-full bg-[color:var(--navy)]/85 px-3 text-[11px] font-semibold uppercase tracking-wider text-white">
            <BadgeCheck className="h-3 w-3" style={{ color: "var(--gold)" }} />
            {authenticated ? "Autentificirano" : "Verificirano"}
          </span>
        )}
        <button
          type="button"
          aria-label={saved ? "Ukloni iz spremljenih" : "Spremi oglas"}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(l.id); }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[color:var(--navy)] shadow-[var(--shadow-raised)] transition hover:scale-110 hover:bg-white"
        >
          <Heart className={"h-4 w-4 " + (saved ? "fill-[color:var(--gold-deep)] text-[color:var(--gold-deep)]" : "")} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">{l.title}</h3>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {l.location}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div className="text-lg font-bold text-foreground">
            {formatPrice(l.price_eur)}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--gold-deep)]">Detalji →</span>
        </div>
        {savedCount > 0 && (
          <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[color:var(--gold)]/10 px-2 py-1 text-[11px] font-semibold text-[color:var(--gold-deep)]">
            <Heart className="h-3 w-3 fill-current" /> {savedCount} {savedCount === 1 ? "osoba je spremila" : "osoba je spremilo"}
          </div>
        )}
      </div>
    </Link>
  );
}
