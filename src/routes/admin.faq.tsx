import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Edit2, Trash2, Plus } from "lucide-react";
import { fetchFAQItems, updateFAQItem, createFAQItem, deleteFAQItem, type FAQItem } from "@/lib/cms.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/faq")({
  component: AdminFAQPage,
});

function AdminFAQPage() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(fetchFAQItems);
  const updateFn = useServerFn(updateFAQItem);
  const createFn = useServerFn(createFAQItem);
  const deleteFn = useServerFn(deleteFAQItem);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [creatingSection, setCreatingSection] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const { data: faqGroups = {} } = useQuery({
    queryKey: ["admin-faq"],
    queryFn: () => fetchFn(),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateFn({ id: editingId!, question: editQuestion, answer: editAnswer }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faq"] });
      setEditingId(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: () => createFn({
      section: creatingSection!,
      question: newQuestion,
      answer: newAnswer,
      sort_order: (faqGroups[creatingSection!]?.length || 0) + 1,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faq"] });
      setCreatingSection(null);
      setNewQuestion("");
      setNewAnswer("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faq"] });
    },
  });

  const startEdit = (item: FAQItem) => {
    setEditingId(item.id);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
  };

  const sections = Object.keys(faqGroups).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Upravljanje čestim pitanjima</h1>
        <p className="mt-1 text-sm text-muted-foreground">Dodajte, ažurirajte ili uklonite FAQ stavke.</p>
      </div>

      {sections.map((section) => (
        <div key={section} className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">{section}</h2>
          <div className="space-y-3">
            {(faqGroups[section] || []).map((item: FAQItem) => (
              <div key={item.id} className="rounded-lg border border-border/50 bg-background p-4">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      placeholder="Pitanje"
                      className="text-sm"
                    />
                    <Textarea
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      placeholder="Odgovor"
                      className="min-h-24 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateMutation.mutate()}
                        disabled={updateMutation.isPending}
                      >
                        Spremi
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Otkaži
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 font-medium text-sm">{item.question}</div>
                    <div className="mb-3 text-xs text-muted-foreground">{item.answer}</div>
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

          {creatingSection === section ? (
            <div className="mt-4 rounded-lg border border-border/50 bg-background p-4">
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Novo pitanje"
                className="mb-3 text-sm"
              />
              <Textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Odgovor"
                className="mb-3 min-h-24 text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !newQuestion || !newAnswer}
                >
                  Dodaj
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCreatingSection(null)}
                >
                  Otkaži
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreatingSection(section)}
              className="mt-3 inline-flex items-center gap-1 rounded px-3 py-2 text-xs font-medium text-[color:var(--gold-deep)] hover:bg-secondary"
            >
              <Plus className="h-3 w-3" /> Dodaj pitanje
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
