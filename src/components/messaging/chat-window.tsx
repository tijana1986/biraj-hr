import { useState, useRef, useEffect } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getMessages, sendMessage, blockUser } from "@/lib/messaging.functions";
import { formatDistanceToNow } from "date-fns";
import { hr } from "date-fns/locale";
import { Send, MoreVertical, AlertTriangle } from "lucide-react";

interface ChatWindowProps {
  conversationId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  currentUserId: string;
}

export function ChatWindow({
  conversationId,
  otherUserName,
  otherUserAvatar,
  currentUserId,
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState("");
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages } = useSuspenseQuery({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      getMessages({
        conversationId,
        limit: 50,
      }),
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      sendMessage({
        conversationId,
        content,
      }),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  // Block user mutation
  const blockMutation = useMutation({
    mutationFn: () => blockUser({ blockedUserId: currentUserId }),
    onSuccess: () => {
      setShowBlockDialog(false);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMutation.mutate(messageText);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUserAvatar || undefined} />
            <AvatarFallback>
              {otherUserName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{otherUserName}</h3>
          </div>
        </div>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setShowBlockDialog(true)}
              className="text-red-600"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Blokiraj korisnika
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Nema poruka. Počni razgovor!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    isOwn
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.createdAt), {
                      locale: hr,
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Napišite poruku..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={sendMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMutation.isPending}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Block Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Blokiraj korisnika?</AlertDialogTitle>
            <AlertDialogDescription>
              Blokirani korisnik neće moći ti slati poruke niti vidjeti tvoje oglase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blockMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              Blokiraj
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
