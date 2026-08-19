import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { DashboardOverview } from "@/components/admin-dashboard/dashboard-overview";
import { ModerationQueue } from "@/components/admin-dashboard/moderation-queue";
import { PaymentDisputes } from "@/components/admin-dashboard/payment-disputes";
import { UserManagement } from "@/components/admin-dashboard/user-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/moderation")({
  component: AdminModeration,
});

function AdminModeration() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold">Admin kontrolna ploča</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upravljanje moderacijom, sporovima, suspenzijama i korisnicima.
        </p>
      </div>

      {/* Overview */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 animate-pulse h-32 rounded-lg"
              />
            ))}
          </div>
        }
      >
        <DashboardOverview />
      </Suspense>

      {/* Tabs */}
      <Tabs defaultValue="moderation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="moderation">Moderacija sadržaja</TabsTrigger>
          <TabsTrigger value="disputes">Sporne transakcije</TabsTrigger>
          <TabsTrigger value="users">Upravljanje korisnicima</TabsTrigger>
        </TabsList>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="mt-6">
          <Suspense
            fallback={
              <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
            }
          >
            <ModerationQueue />
          </Suspense>
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes" className="mt-6">
          <Suspense
            fallback={
              <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
            }
          >
            <PaymentDisputes />
          </Suspense>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <Suspense
            fallback={
              <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
            }
          >
            <UserManagement />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
