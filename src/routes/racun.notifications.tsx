import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/notifications/notification-settings";
import { CampaignManagement } from "@/components/notifications/campaign-management";
import { CampaignAnalytics } from "@/components/notifications/campaign-analytics";
import { NotificationHistory } from "@/components/notifications/notification-history";
import { TemplateEditor } from "@/components/notifications/template-editor";
import { useAuth } from "@/hooks/use-auth";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/racun/notifications")({
  component: NotificationPage,
});

function NotificationPage() {
  const { user } = useAuth();

  if (!user?.id) {
    return <div>Učitavanje...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
          <Mail className="h-8 w-8" />
          Obavijesti i kampanje
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upravljajte email obavijestima, kampanjama i šablonima
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Postavke</TabsTrigger>
          <TabsTrigger value="campaigns">Kampanje</TabsTrigger>
          <TabsTrigger value="templates">Šabloni</TabsTrigger>
          <TabsTrigger value="history">Povijest</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Suspense
            fallback={
              <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
            }
          >
            <NotificationSettings userId={user.id} />
          </Suspense>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-6">
          <Suspense
            fallback={
              <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
            }
          >
            <CampaignManagement />
          </Suspense>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <Suspense
            fallback={
              <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
            }
          >
            <TemplateEditor />
          </Suspense>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Suspense
            fallback={
              <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
            }
          >
            <NotificationHistory userId={user.id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
