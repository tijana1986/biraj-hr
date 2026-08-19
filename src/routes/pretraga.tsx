import { Suspense, useState } from "react";
import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { SearchBar } from "@/components/search/search-bar";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import {
  getSavedSearches,
  saveSearch,
  getCategories,
  getLocations,
  type SearchFilters as SearchFiltersType,
} from "@/lib/search.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Heart, Save } from "lucide-react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/pretraga")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Pretraga — Biraj.HR" },
      {
        name: "description",
        content: "Pretražite provjerene oglase na Biraj.HR — premium hrvatskom marketplaceu.",
      },
      { property: "og:title", content: "Pretraga — Biraj.HR" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const search = useSearch({ from: "/pretraga" });
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: search.q || "",
    limit: 20,
  });
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [searchName, setSearchName] = useState("");

  // Fetch filter options
  const { data: categories } = useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const { data: locations } = useSuspenseQuery({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
  });

  const handleFiltersChange = (newFilters: Partial<SearchFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return;

    try {
      await saveSearch({
        name: searchName,
        query: filters.query,
        filters: {
          category: filters.category,
          location: filters.location,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        },
      });
      setSearchName("");
      setShowSaveSearch(false);
    } catch (error) {
      console.error("Error saving search:", error);
    }
  };

  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Breadcrumbs
            items={[
              { label: "Početna", to: "/" },
              { label: "Pretraga" },
            ]}
          />
          <h1 className="mt-4 font-display text-4xl font-semibold">
            Pretraži oglase
          </h1>
          <div className="mt-5 max-w-2xl">
            <SearchBar
              initialQuery={search.q}
              onSearch={(query) => handleFiltersChange({ query })}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <SearchFilters
                categories={categories}
                locations={locations}
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
              />

              {/* Save Search Button */}
              <AlertDialog open={showSaveSearch} onOpenChange={setShowSaveSearch}>
                <AlertDialogTrigger asChild>
                  <Button className="w-full gap-2" variant="outline">
                    <Save className="h-4 w-4" />
                    Spremi pretragu
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Spremi pretragu</AlertDialogTitle>
                    <AlertDialogDescription>
                      Daj naziv ovoj pretrazi da je lako pronađeš kasnije
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <input
                      type="text"
                      placeholder="npr. Jeftini automati u Zagrebu"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <AlertDialogCancel>Odustani</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSaveSearch}>
                      Spremi
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>

              {/* Saved Searches */}
              <SavedSearchesList />
            </div>
          </div>

          {/* Main Content - Results */}
          <div className="lg:col-span-3">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-muted-foreground">
                      Učitavanje rezultata...
                    </p>
                  </div>
                </div>
              }
            >
              <SearchResults filters={filters} />
            </Suspense>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

// Saved Searches Component
function SavedSearchesList() {
  const { data: savedSearches } = useSuspenseQuery({
    queryKey: ["savedSearches"],
    queryFn: () => getSavedSearches(),
    staleTime: 5 * 60 * 1000,
  });

  if (savedSearches.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Heart className="h-4 w-4 text-blue-600" />
        Spremljene pretrage
      </h3>
      <div className="space-y-2">
        {savedSearches.map((search) => (
          <Button
            key={search.id}
            variant="ghost"
            className="w-full justify-start text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            onClick={() => {
              // Navigate to search with filters
            }}
          >
            {search.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
