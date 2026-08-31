import { Suspense, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatWindow } from "@/components/messaging/chat-window";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Archive } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/poruke")({
  head: () => ({
    meta: [
      { title: "Poruke — Biraj.HR" },
      {
        name: "description",
        content: "Komuniciraj s kupcima i prodavačima na Biraj.HR",
      },
    ],
  }),
  component: MessagingPage,
});

function MessagingPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [showArchived, setShowArchived] = useState(false);

  // Get current user
  const { user } = useAuth();

  // Get selected conversation data
  const { data: conversations } = useSuspenseQuery({
    queryKey: ["conversations", showArchived],
    queryFn: async () => {
      const { getConversations } = await import("@/lib/messaging.functions");
      return getConversations({ archived: showArchived });
    },
    refetchInterval: 5000,
  });

  const selectedConversation = conversations?.find(
    (c) => c.id === selectedConversationId
  );

  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Breadcrumbs
            items={[
              { label: "Početna", to: "/" },
              { label: "Poruke" },
            ]}
          />
          <h1 className="mt-4 font-display text-4xl font-semibold">
            Poruke
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversation List */}
          <div className="lg:col-span-1 border rounded-lg bg-white overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white">
              <Tabs
                value={showArchived ? "archived" : "active"}
                onValueChange={(v) => setShowArchived(v === "archived")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Aktivni</span>
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    <span className="hidden sm:inline">Arhiva</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="p-4">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Učitavanje...
                      </p>
                    </div>
                  </div>
                }
              >
                <ConversationList
                  selectedConversationId={selectedConversationId}
                  onSelect={setSelectedConversationId}
                  showArchived={showArchived}
                />
              </Suspense>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 border rounded-lg bg-white overflow-hidden">
            {selectedConversation && user ? (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2 text-muted-foreground">
                        Učitavanje poruka...
                      </p>
                    </div>
                  </div>
                }
              >
                <ChatWindow
                  conversationId={selectedConversation.id}
                  otherUserName={selectedConversation.sellerName}
                  otherUserAvatar={selectedConversation.sellerAvatar}
                  currentUserId={user.id}
                />
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Odaberi razgovor</h3>
                  <p className="text-sm text-muted-foreground">
                    Odaberi razgovor sa liste da počneš čitati poruke
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
