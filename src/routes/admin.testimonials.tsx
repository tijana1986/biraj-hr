import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Edit2, Trash2, Plus, Star } from "lucide-react";
import { fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, type Testimonial } from "@/lib/cms.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/testimonials")({
  component: AdminTestimonialsPage,
});

function AdminTestimonialsPage() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(fetchTestimonials);
  const createFn = useServerFn(createTestimonial);
  const updateFn = useServerFn(updateTestimonial);
  const deleteFn = useServerFn(deleteTestimonial);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [creatingNew, setCreatingNew] = useState(false);
  const [newData, setNewData] = useState({
    author_name: "",
    author_title: "",
    content: "",
    rating: 5,
    featured: false,
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => fetchFn(),
  });

  const createMutation = useMutation({
    mutationFn: () => createFn(newData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      setCreatingNew(false);
      setNewData({ author_name: "", author_title: "", content: "", rating: 5, featured: false });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateFn({ id: editingId!, ...editData }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    },
  });

  const startEdit = (item: Testimonial) => {
    setEditingId(item.id);
    setEditData({
      author_name: item.author_name,
      author_title: item.author_title,
      content: item.content,
      rating: item.rating,
      featured: item.featured,
    });
  };

  const renderStars = (rating: number, onRatingChange?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            onClick={() => onRatingChange?.(r)}
            className={`transition ${
              r <= rating ? "text-yellow-500" : "text-muted-foreground"
            }`}
          >
            <Star className="h-4 w-4" fill={r <= rating ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Upravljanje testimonijala</h1>
          <p className="mt-1 text-sm text-muted-foreground">Dodajte, ažurirajte ili uklonite recenzije korisnika.</p>
        </div>
        <Button onClick={() => setCreatingNew(true)} variant="default">
          <Plus className="h-4 w-4 mr-2" /> Novi testimonijal
        </Button>
      </div>

      {/* Create New */}
      {creatingNew && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Novi testimonijal</h2>
          <div className="space-y-3">
            <Input
              value={newData.author_name}
              onChange={(e) => setNewData({ ...newData, author_name: e.target.value })}
              placeholder="Ime autora"
            />
            <Input
              value={newData.author_title}
              onChange={(e) => setNewData({ ...newData, author_title: e.target.value })}
              placeholder="Naslov (npr. Kupac, Prodavač)"
            />
            <Textarea
              value={newData.content}
              onChange={(e) => setNewData({ ...newData, content: e.target.value })}
              placeholder="Tekst recenzije"
              rows={4}
            />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Ocjena</label>
              {renderStars(newData.rating, (r) => setNewData({ ...newData, rating: r }))}
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newData.featured}
                onChange={(e) => setNewData({ ...newData, featured: e.target.checked })}
              />
              <span className="text-sm">Istaknuto na početnoj stranici</span>
            </label>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!newData.author_name || !newData.content || createMutation.isPending}>
                Dodaj
              </Button>
              <Button variant="outline" onClick={() => setCreatingNew(false)}>
                Otkaži
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* List testimonials */}
      <div className="space-y-3">
        {testimonials.map((item: Testimonial) => (
          <div key={item.id} className="rounded-lg border border-border/50 bg-background p-4">
            {editingId === item.id ? (
              <div className="space-y-3">
                <Input
                  value={editData.author_name}
                  onChange={(e) => setEditData({ ...editData, author_name: e.target.value })}
                  placeholder="Ime"
                />
                <Input
                  value={editData.author_title}
                  onChange={(e) => setEditData({ ...editData, author_title: e.target.value })}
                  placeholder="Naslov"
                />
                <Textarea
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  placeholder="Sadržaj"
                  rows={3}
                />
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Ocjena</label>
                  {renderStars(editData.rating, (r) => setEditData({ ...editData, rating: r }))}
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.featured}
                    onChange={(e) => setEditData({ ...editData, featured: e.target.checked })}
                  />
                  <span className="text-sm">Istaknutio</span>
                </label>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                    Spremi
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    Otkaži
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm">{item.author_name}</div>
                    {item.author_title && <div className="text-xs text-muted-foreground">{item.author_title}</div>}
                  </div>
                  {item.featured && (
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-[color:var(--gold-deep)]/20 text-[color:var(--gold-deep)]">
                      Istaknutio
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-3">{item.content}</div>
                <div className="mb-3">{renderStars(item.rating)}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium hover:bg-secondary"
                  >
                    <Edit2 className="h-3 w-3" /> Uredi
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-secondary"
                  >
                    <Trash2 className="h-3 w-3" /> Obriši
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {testimonials.length === 0 && !creatingNew && (
        <div className="rounded-lg border border-border/50 bg-background p-8 text-center">
          <p className="text-sm text-muted-foreground">Nema testimonijala. Dodajte novi da počnete.</p>
        </div>
      )}
    </div>
  );
}
