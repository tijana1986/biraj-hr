import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ApiKeysManager } from "@/components/api/api-keys-manager";
import { WebhooksManager } from "@/components/api/webhooks-manager";
import { ApiUsageAnalytics } from "@/components/api/api-usage-analytics";
import { useAuth } from "@/hooks/use-auth";
import { Code, BookOpen } from "lucide-react";

export const Route = createFileRoute("/racun/api")({
  component: ApiDeveloperPage,
});

function ApiDeveloperPage() {
  const { user } = useAuth();
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);

  if (!user?.id) {
    return <div>Učitavanje...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
          <Code className="h-8 w-8" />
          API i integracije
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upravljaj API ključevima, webhookima i integracijom s vanjskim aplikacijama
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">API ključevi</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="analytics">Analitika</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="mt-6">
          <Suspense
            fallback={
              <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
            }
          >
            <ApiKeysManager userId={user.id} />
          </Suspense>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="mt-6">
          <Suspense
            fallback={
              <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
            }
          >
            <WebhooksManager userId={user.id} />
          </Suspense>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          {selectedKeyId ? (
            <Suspense
              fallback={
                <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
              }
            >
              <ApiUsageAnalytics apiKeyId={selectedKeyId} />
            </Suspense>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <p>Odaberi API ključ u kartici "API ključevi" da vidiš analitiku</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* API Documentation Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5" />
          Dokumentacija API-ja
        </h3>
        <div className="prose prose-sm max-w-none text-sm space-y-4">
          <div>
            <h4 className="font-semibold text-blue-900">Osnove</h4>
            <p className="text-blue-700">
              Sve API zahtjeve dodaj <code className="bg-blue-100 px-2 py-1 rounded">Authorization: Bearer YOUR_API_KEY</code> zaglavlje.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900">Primjer zahtjeva</h4>
            <pre className="bg-blue-100 p-3 rounded overflow-x-auto text-xs">
{`curl -X GET https://api.biraj.hr/v1/listings \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json"`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900">Rate Limiting</h4>
            <p className="text-blue-700">
              Standardni plan dopušta 1000 zahtjeva po satu. Preostali zahtjevi će biti odbijeni s <code className="bg-blue-100 px-2 py-1 rounded">429 Too Many Requests</code> kodom.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900">DostupniEndPointovi</h4>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li><code className="bg-blue-100 px-2 py-1 rounded">GET /v1/listings</code> - Lista oglasa</li>
              <li><code className="bg-blue-100 px-2 py-1 rounded">GET /v1/orders</code> - Popis narudžbi</li>
              <li><code className="bg-blue-100 px-2 py-1 rounded">GET /v1/messages</code> - Poruke</li>
              <li><code className="bg-blue-100 px-2 py-1 rounded">POST /v1/webhooks</code> - Kreiraj webhook</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
