import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserApiKeys, generateApiKey, revokeApiKey } from "@/lib/api-integration.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Trash2, Plus, Key, AlertCircle } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { hrHR } from "date-fns/locale";

interface ApiKeysManagerProps {
  userId: string;
}

export function ApiKeysManager({ userId }: ApiKeysManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyDescription, setKeyDescription] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: keys } = useSuspenseQuery({
    queryKey: ["apiKeys", userId],
    queryFn: () => getUserApiKeys({ userId }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => generateApiKey({ userId, ...data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys", userId] });
      toast.success("API ključ je kreiran");
      setShowNewKey(data.key);
      setKeyName("");
      setKeyDescription("");
    },
    onError: (error) => {
      toast.error(`Greška: ${error.message}`);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (apiKeyId: string) => revokeApiKey({ apiKeyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys", userId] });
      toast.success("API ključ je opozvana");
    },
    onError: (error) => {
      toast.error(`Greška: ${error.message}`);
    },
  });

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: keyName,
      description: keyDescription,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopirano u međuspremnik");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5" />
            API ključevi
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upravljaj API ključevima za integracije
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Novi ključ
        </Button>
      </div>

      {/* New Key Display */}
      {showNewKey && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-green-900">
                Novi API ključ je kreiran
              </p>
              <p className="text-xs text-green-700 mt-1">
                Kopira ključ sada. Nećete ga moći vidjeti ponovno!
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="bg-white px-3 py-2 rounded font-mono text-sm flex-1 truncate">
                  {showNewKey}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(showNewKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewKey(null)}
                className="mt-3"
              >
                Zatvori
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold mb-4">Kreiraj novi API ključ</h4>
          <form onSubmit={handleCreateKey} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Naziv</label>
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="npr. Integracija s vanjskom aplikacijom"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opis</label>
              <Input
                value={keyDescription}
                onChange={(e) => setKeyDescription(e.target.value)}
                placeholder="Što se koristi za"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending || !keyName}
              >
                {createMutation.isPending ? "Kreiranje..." : "Kreiraj ključ"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Otkaži
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Keys List */}
      <div className="space-y-3">
        {keys && keys.length > 0 ? (
          keys.map((key: any) => (
            <Card key={key.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{key.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {key.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                      {key.key_prefix}...
                    </code>
                    {key.expires_at && (
                      <span className="text-xs text-muted-foreground">
                        Istječe:{" "}
                        {formatDistanceToNow(new Date(key.expires_at), {
                          addSuffix: true,
                          locale: hrHR,
                        })}
                      </span>
                    )}
                    {key.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aktivna
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Opozvana
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => revokeMutation.mutate(key.id)}
                  disabled={revokeMutation.isPending || !key.is_active}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <Key className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>Nema API ključeva. Kreiraj prvi da bih počeo.</p>
          </Card>
        )}
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-xs text-yellow-900">
          <strong>Sigurnost:</strong> Nikada ne dijelite API ključeve
          javno. Koristite za privatne integracije samo.
        </p>
      </Card>
    </div>
  );
}
