import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sliders } from "lucide-react";
import type { SearchFilters } from "@/lib/search.functions";

interface SearchFiltersProps {
  categories: Array<{ name: string; count: number }>;
  locations: Array<{ name: string; count: number }>;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  initialFilters?: Partial<SearchFilters>;
}

export function SearchFilters({
  categories,
  locations,
  onFiltersChange,
  initialFilters = {},
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<Partial<SearchFilters>>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFiltersChange({});
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Sliders className="h-4 w-4" />
          Filtri
        </h3>

        {/* Sort */}
        <div>
          <Label htmlFor="sort" className="text-sm font-medium mb-2 block">
            Sortiranje
          </Label>
          <Select
            value={filters.sortBy || "newest"}
            onValueChange={(value) =>
              handleFilterChange("sortBy", value as any)
            }
          >
            <SelectTrigger id="sort" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Najnoviji</SelectItem>
              <SelectItem value="popular">Najpopularniji</SelectItem>
              <SelectItem value="rating">Najbolje ocijenjeni</SelectItem>
              <SelectItem value="price-asc">Cijena: od manjeg</SelectItem>
              <SelectItem value="price-desc">Cijena: od većeg</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        {categories.length > 0 && (
          <div>
            <Label htmlFor="category" className="text-sm font-medium mb-2 block">
              Kategorija
            </Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) =>
                handleFilterChange("category", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Location */}
        {locations.length > 0 && (
          <div>
            <Label htmlFor="location" className="text-sm font-medium mb-2 block">
              Lokacija
            </Label>
            <Select
              value={filters.location || "all"}
              onValueChange={(value) =>
                handleFilterChange("location", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger id="location" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve lokacije</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.name} value={loc.name}>
                    {loc.name} ({loc.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Advanced Filters */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showAdvanced ? "Sakrij" : "Prikaži"} dodatne filtere
        </button>

        {showAdvanced && (
          <div className="space-y-3 pt-3 border-t">
            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Raspon cijene (€)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-20"
                />
                <span className="flex items-center">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-20"
                />
              </div>
            </div>

            {/* Promotion Filter */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="promotion"
                checked={filters.promotion || false}
                onCheckedChange={(checked) =>
                  handleFilterChange("promotion", checked)
                }
              />
              <Label htmlFor="promotion" className="text-sm cursor-pointer">
                Samo promocionirani oglasi
              </Label>
            </div>

            {/* Featured Filter */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="featured"
                checked={filters.featured || false}
                onCheckedChange={(checked) =>
                  handleFilterChange("featured", checked)
                }
              />
              <Label htmlFor="featured" className="text-sm cursor-pointer">
                Samo istaknuti oglasi
              </Label>
            </div>
          </div>
        )}

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleReset}
        >
          Resetiraj filtere
        </Button>
      </div>
    </div>
  );
}
