import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Star, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { LISTINGS, formatPrice } from "@/lib/mock/data";

export const Route = createFileRoute("/racun/ostavi-recenziju")({
  component: LeaveReview,
});

function LeaveReview() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isVerified] = useState(true);

  // For demo, use first listing
  const listing = LISTINGS[0];

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Molimo odaberite ocjenu");
      return;
    }
    if (!title.trim()) {
      alert("Molimo unesite naslov recenzije");
      return;
    }
    if (!text.trim()) {
      alert("Molimo unesite tekst recenzije");
      return;
    }
    // In production, send to backend
    alert("Recenzija je uspješno objavljena!");
    setRating(0);
    setTitle("");
    setText("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Link to="/racun" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Nazad na račun
      </Link>

      <div>
        <h1 className="font-display text-3xl font-semibold">Ostavi recenziju</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vaša iskustva s ovim prodavačem pomažu drugima da donose bolju odluku.
        </p>
      </div>

      {/* Transaction Item */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Recenzija za</h2>
        <div className="flex gap-4">
          <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
            {listing.images?.[0] && (
              <img
                src={listing.images[0] as string}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold line-clamp-2">
              {listing.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{listing.city}</p>
            <p className="mt-2 font-display font-semibold" style={{ color: "var(--navy)" }}>
              {formatPrice(listing.price)}
            </p>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="space-y-8">
          {/* Rating */}
          <div>
            <label className="block font-semibold">Kako ste zadovoljni?</label>
            <p className="mt-1 text-sm text-muted-foreground">
              Ocjenite na skali od 1 do 5 zvjezdica.
            </p>
            <div className="mt-4 flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition hover:scale-110"
                  aria-label={`${star} zvjezdica`}
                >
                  <Star
                    className="h-10 w-10 transition"
                    fill={star <= (hoveredRating || rating) ? "var(--gold-deep)" : "none"}
                    stroke={star <= (hoveredRating || rating) ? "var(--gold-deep)" : "currentColor"}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="mt-2 text-sm font-medium">
                {rating === 5 && "Odličan kupac — sve savršeno!"}
                {rating === 4 && "Jako dobro — preporučujem."}
                {rating === 3 && "Zadovoljavajuće — bi moglo biti bolje."}
                {rating === 2 && "Loše — imali su problema."}
                {rating === 1 && "Vrlo loše — nisam zadovoljan."}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold">Naslov recenzije</label>
            <p className="mt-1 text-sm text-muted-foreground">
              Rezumirajte svoje iskustvo u nekoliko riječi.
            </p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Npr. Odličan prodavač, brza dostava"
              className="mt-3 w-full rounded-lg border border-input bg-background px-4 py-2.5 placeholder:text-muted-foreground"
              maxLength={80}
            />
            <div className="mt-2 text-xs text-muted-foreground text-right">
              {title.length}/80 znakova
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block font-semibold">Vaša recenzija</label>
            <p className="mt-1 text-sm text-muted-foreground">
              Detaljnije — što je bilo odličnog, što bi moglo biti bolje?
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Vaša iskustva i povratne informacije..."
              className="mt-3 min-h-32 w-full rounded-lg border border-input bg-background px-4 py-3 placeholder:text-muted-foreground"
              maxLength={1000}
            />
            <div className="mt-2 text-xs text-muted-foreground text-right">
              {text.length}/1000 znakova
            </div>
          </div>

          {/* Verified Badge */}
          <div className="rounded-lg border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/5 p-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-[color:var(--gold-deep)]" />
              <div className="text-xs">
                <div className="font-medium">Verificirana transakcija</div>
                <div className="mt-0.5 text-[color:var(--gold-deep)]">
                  Ova recenzija je od verificiranog kupca koji je zaista kupio ovaj proizvod.
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-border pt-6">
            <button
              onClick={handleSubmit}
              disabled={!rating || !title.trim() || !text.trim()}
              className="w-full rounded-lg bg-[color:var(--navy)] px-6 py-3 font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Objavi recenziju
            </button>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold">Smjernice za recenzije</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>✓ Budi iskren i objektivan u svojoj ocjeni</li>
          <li>✓ Fokusiraj se na svoje doživljaje s prodavačem</li>
          <li>✓ Izbjegavaj vulgarnost i neprimjerene komentare</li>
          <li>✗ Nemoj objaviti osobne podatke (br. telefona, email, adresa)</li>
          <li>✗ Nemoj objaviti recenzije konkurenata ili manipulirane sadržaje</li>
        </ul>
      </div>
    </div>
  );
}
