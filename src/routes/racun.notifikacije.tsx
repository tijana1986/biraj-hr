import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Bell, Mail, Search, Trash2, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/racun/notifikacije")({
  component: NotificationSettings,
});

type SavedSearch = {
  id: string;
  category?: string;
  subcategory?: string;
  query?: string;
  maxPrice?: number;
};

function NotificationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    newListingsInSavedSearches: true,
    priceDropAlerts: true,
    messageReminders: true,
    weeklyDigest: true,
    emailFrequency: "instant" as "instant" | "daily" | "weekly",
  });

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    { id: "1", category: "vozila", subcategory: "osobni-automobili", query: "BMW" },
    { id: "2", category: "nekretnine", subcategory: "prodaja-stanova", maxPrice: 250000 },
  ]);

  const [newSearch, setNewSearch] = useState("");

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const addSavedSearch = () => {
    if (newSearch.trim()) {
      setSavedSearches((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          query: newSearch,
        },
      ]);
      setNewSearch("");
    }
  };

  const removeSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold">Obavijesti i email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upravljajte email obavijestima i preferencijama za nove oglase.
        </p>
      </div>

      {/* Email Preferences */}
      <section className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Mail className="h-5 w-5 text-[color:var(--gold-deep)]" />
            Email obavijesti
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Koji tipovi poruka želite primati na {user?.email}?
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          {/* New Listings Alert */}
          <label className="flex cursor-pointer items-start gap-4 rounded-xl p-3 hover:bg-secondary/50">
            <input
              type="checkbox"
              checked={preferences.newListingsInSavedSearches}
              onChange={() => togglePreference("newListingsInSavedSearches")}
              className="mt-1 h-5 w-5 cursor-pointer rounded border-border"
            />
            <div className="flex-1">
              <div className="font-semibold">Novi oglasi u spremljenim pretrazi</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Primite obavijest kada je objavljen novi oglas koji odgovara vašim spremljenim pretragama.
              </p>
            </div>
          </label>

          {/* Price Drop Alert */}
          <label className="flex cursor-pointer items-start gap-4 rounded-xl p-3 hover:bg-secondary/50">
            <input
              type="checkbox"
              checked={preferences.priceDropAlerts}
              onChange={() => togglePreference("priceDropAlerts")}
              className="mt-1 h-5 w-5 cursor-pointer rounded border-border"
            />
            <div className="flex-1">
              <div className="font-semibold">Obavijesti o padu cijene</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Budite obaviješeni kada se cijena oglasa koji ste spremili smanji.
              </p>
            </div>
          </label>

          {/* Message Reminders */}
          <label className="flex cursor-pointer items-start gap-4 rounded-xl p-3 hover:bg-secondary/50">
            <input
              type="checkbox"
              checked={preferences.messageReminders}
              onChange={() => togglePreference("messageReminders")}
              className="mt-1 h-5 w-5 cursor-pointer rounded border-border"
            />
            <div className="flex-1">
              <div className="font-semibold">Podsjetnici za poruke</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Podsjetnik za neodgovore poruke od potencijalnih kupaca ili prodavača.
              </p>
            </div>
          </label>

          {/* Weekly Digest */}
          <label className="flex cursor-pointer items-start gap-4 rounded-xl p-3 hover:bg-secondary/50">
            <input
              type="checkbox"
              checked={preferences.weeklyDigest}
              onChange={() => togglePreference("weeklyDigest")}
              className="mt-1 h-5 w-5 cursor-pointer rounded border-border"
            />
            <div className="flex-1">
              <div className="font-semibold">Tjedno sažeće</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Primite sažeće od 10 novih oglasa koji odgovaraju vašim interesima svaki tjedan.
              </p>
            </div>
          </label>
        </div>

        {/* Email Frequency */}
        <div className="space-y-3">
          <label className="block font-medium">Frekvencija obavijesti</label>
          <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-secondary/50">
              <input
                type="radio"
                name="frequency"
                value="instant"
                checked={preferences.emailFrequency === "instant"}
                onChange={(e) => setPreferences({ ...preferences, emailFrequency: e.target.value as "instant" | "daily" | "weekly" })}
                className="h-4 w-4 cursor-pointer"
              />
              <div>
                <div className="font-medium">Odmah (Instant)</div>
                <div className="text-xs text-muted-foreground">Primite obavijest čim je novi oglas objavljen</div>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-secondary/50">
              <input
                type="radio"
                name="frequency"
                value="daily"
                checked={preferences.emailFrequency === "daily"}
                onChange={(e) => setPreferences({ ...preferences, emailFrequency: e.target.value as "instant" | "daily" | "weekly" })}
                className="h-4 w-4 cursor-pointer"
              />
              <div>
                <div className="font-medium">Dnevno</div>
                <div className="text-xs text-muted-foreground">Sažeće novih oglasa svakog dana u 9:00 AM</div>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-secondary/50">
              <input
                type="radio"
                name="frequency"
                value="weekly"
                checked={preferences.emailFrequency === "weekly"}
                onChange={(e) => setPreferences({ ...preferences, emailFrequency: e.target.value as "instant" | "daily" | "weekly" })}
                className="h-4 w-4 cursor-pointer"
              />
              <div>
                <div className="font-medium">Tjedno</div>
                <div className="text-xs text-muted-foreground">Jedan email sa svim novim oglasima, svaki ponedjeljak u 9:00 AM</div>
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Saved Searches */}
      <section className="space-y-6 border-t border-border pt-8">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Search className="h-5 w-5 text-[color:var(--gold-deep)]" />
            Spremljene pretrage
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kreirajte pretragu za brzu notifikaciju novih oglasa koji vas zanimaju.
          </p>
        </div>

        {/* Add New Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Npr. BMW, Apartman Split, Satovi…"
            value={newSearch}
            onChange={(e) => setNewSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSavedSearch()}
            className="flex-1"
          />
          <button
            onClick={addSavedSearch}
            className="inline-flex items-center gap-2 rounded-md bg-[color:var(--navy)] px-4 py-2 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]"
          >
            <Plus className="h-4 w-4" /> Dodaj
          </button>
        </div>

        {/* Saved Searches List */}
        <div className="space-y-2">
          {savedSearches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Nema spremljenih pretraga. Kreirajte novu pretragu za obavijesti.
            </div>
          ) : (
            savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--gold)]/10">
                    <Search className="h-4 w-4 text-[color:var(--gold-deep)]" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {search.query ||
                        `${search.category}${search.subcategory ? " • " + search.subcategory : ""}${
                          search.maxPrice ? " do €" + search.maxPrice : ""
                        }`}
                    </div>
                    <div className="text-xs text-muted-foreground">Aktivna pretraga</div>
                  </div>
                </div>
                <button
                  onClick={() => removeSavedSearch(search.id)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-destructive/10 hover:border-destructive/50"
                  aria-label="Obriši"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Info Box */}
      <div className="rounded-2xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-6">
        <div className="flex gap-4">
          <Bell className="h-5 w-5 flex-shrink-0 text-[color:var(--gold-deep)]" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Obavijesti se šalju na vašu email adresu</p>
            <p className="mt-1 text-muted-foreground">
              Sve obavijesti se šalju na <strong>{user?.email}</strong>. Možete promijeniti email adresu u profilu.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 border-t border-border pt-6">
        <button className="inline-flex items-center gap-2 rounded-md bg-[color:var(--navy)] px-6 py-3 font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
          <Check className="h-4 w-4" />
          Spremi postavke
        </button>
      </div>
    </div>
  );
}
