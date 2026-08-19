import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getConversations } from "@/lib/messaging.functions";
import { Archive, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { hrHR } from "date-fns/locale";

interface ConversationListProps {
  selectedConversationId?: string;
  onSelect: (conversationId: string) => void;
  showArchived?: boolean;
}

export function ConversationList({
  selectedConversationId,
  onSelect,
  showArchived = false,
}: ConversationListProps) {
  const { data: conversations } = useSuspenseQuery({
    queryKey: ["conversations", showArchived],
    queryFn: () => getConversations({ archived: showArchived }),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">Nema razgovora</h3>
        <p className="text-sm text-muted-foreground">
          {showArchived
            ? "Nemaš arhiviranih razgovora"
            : "Počni razgovor s kupcima ili prodavačima"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Card
          key={conversation.id}
          className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
            selectedConversationId === conversation.id ? "bg-accent" : ""
          }`}
          onClick={() => onSelect(conversation.id)}
        >
          <div className="flex gap-3">
            {/* Avatar */}
            <Avatar>
              <AvatarImage src={conversation.sellerAvatar || undefined} />
              <AvatarFallback>
                {conversation.sellerName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{conversation.sellerName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.listingTitle}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <Badge variant="default" className="shrink-0">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>

              {/* Last message */}
              <p className="text-sm text-muted-foreground truncate mt-1">
                {conversation.lastMessage}
              </p>

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                  locale: hrHR,
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
