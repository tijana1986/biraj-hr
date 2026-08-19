import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignScheduler } from "@/components/campaigns/campaign-scheduler";
import { SegmentationBuilder } from "@/components/campaigns/segmentation-builder";
import { ABTestCreator } from "@/components/campaigns/ab-test-creator";
import { AdvancedPerformance } from "@/components/campaigns/advanced-performance";
import { SuppressionListManager } from "@/components/campaigns/suppression-list-manager";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/admin/campaigns")({
  component: AdvancedCampaignsPage,
});

function AdvancedCampaignsPage() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
          <Zap className="h-8 w-8" />
          Napredne kampanje
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kreiraj, raspodijeli, i analiziraj email kampanje sa naprednim
          mogućnostima
        </p>
      </div>

      {/* Campaign Selector */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Odaberi kampanju</h3>
        <div className="text-sm text-muted-foreground p-4 bg-gray-50 rounded">
          <p>Biraj kampanju iz liste kampanja da bih konfigurirao napredne postavke.</p>
        </div>
      </Card>

      {/* Tabs - Only visible if campaign selected */}
      {selectedCampaignId ? (
        <Tabs defaultValue="scheduler" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="scheduler">Raspored</TabsTrigger>
            <TabsTrigger value="segmentation">Segmentacija</TabsTrigger>
            <TabsTrigger value="abtesting">A/B testovi</TabsTrigger>
            <TabsTrigger value="performance">Performanse</TabsTrigger>
            <TabsTrigger value="suppression">Isključivanja</TabsTrigger>
          </TabsList>

          {/* Scheduler Tab */}
          <TabsContent value="scheduler" className="mt-6">
            <Suspense
              fallback={
                <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
              }
            >
              <CampaignScheduler campaignId={selectedCampaignId} />
            </Suspense>
          </TabsContent>

          {/* Segmentation Tab */}
          <TabsContent value="segmentation" className="mt-6">
            <Suspense
              fallback={
                <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
              }
            >
              <SegmentationBuilder campaignId={selectedCampaignId} />
            </Suspense>
          </TabsContent>

          {/* A/B Testing Tab */}
          <TabsContent value="abtesting" className="mt-6">
            <Suspense
              fallback={
                <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
              }
            >
              <ABTestCreator campaignId={selectedCampaignId} />
            </Suspense>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6">
            <Suspense
              fallback={
                <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
              }
            >
              <AdvancedPerformance campaignId={selectedCampaignId} />
            </Suspense>
          </TabsContent>

          {/* Suppression Tab */}
          <TabsContent value="suppression" className="mt-6">
            <Suspense
              fallback={
                <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
              }
            >
              <SuppressionListManager campaignId={selectedCampaignId} />
            </Suspense>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <p>Odaberi kampanju da bih počeo sa konfiguracijom naprednih postavki</p>
        </Card>
      )}
    </div>
  );
}
