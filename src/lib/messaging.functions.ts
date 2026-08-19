import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";

// Schemas
export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  attachmentUrl: z.string().nullable(),
  attachmentType: z.string().nullable(),
  isRead: z.boolean(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Message = z.infer<typeof messageSchema>;

export const conversationSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  listingTitle: z.string(),
  listingImage: z.string().nullable(),
  buyerId: z.string(),
  sellerId: z.string(),
  sellerName: z.string(),
  sellerAvatar: z.string().nullable(),
  lastMessage: z.string().nullable(),
  lastMessageAt: z.string(),
  unreadCount: z.number(),
  isArchived: z.boolean(),
  createdAt: z.string(),
});

export type Conversation = z.infer<typeof conversationSchema>;

// Get conversations for current user
export const getConversations = createServerFn({
  method: "GET",
})
  .input(z.object({ archived: z.boolean().optional() }))
  .handler(async ({ archived = false }) => {
    const { data: user } = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      )
      .then((client) => client.auth.getUser());

    if (!user?.user) {
      throw new Error("Not authenticated");
    }

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    // Get conversations where user is buyer or seller
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        listing_id,
        listings:listing_id (title, image_url),
        buyer_id,
        seller_id,
        last_message_at,
        buyer_read_at,
        seller_read_at,
        is_archived,
        created_at,
        messages (content, created_at)
      `
      )
      .eq("is_archived", archived)
      .or(`buyer_id.eq.${user.user.id},seller_id.eq.${user.user.id}`)
      .order("last_message_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get conversations: ${error.message}`);
    }

    // Get other participant info
    const userIds = new Set<string>();
    conversations?.forEach((conv: any) => {
      if (conv.buyer_id !== user.user.id) userIds.add(conv.buyer_id);
      if (conv.seller_id !== user.user.id) userIds.add(conv.seller_id);
    });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", Array.from(userIds));

    const profileMap = new Map(
      profiles?.map((p: any) => [p.id, p]) || []
    );

    return conversations?.map((conv: any) => {
      const otherUserId =
        conv.buyer_id === user.user.id ? conv.seller_id : conv.buyer_id;
      const otherProfile = profileMap.get(otherUserId);
      const isReadByMe =
        conv.buyer_id === user.user.id
          ? conv.buyer_read_at
          : conv.seller_read_at;
      const lastMessage = conv.messages?.[0]?.content || "";
      const unreadCount = conv.messages?.filter(
        (m: any) =>
          !m.is_read &&
          m.sender_id !== user.user.id
      ).length || 0;

      return {
        id: conv.id,
        listingId: conv.listing_id,
        listingTitle: conv.listings?.title || "",
        listingImage: conv.listings?.image_url,
        buyerId: conv.buyer_id,
        sellerId: conv.seller_id,
        sellerName: otherProfile?.name || "Korisnik",
        sellerAvatar: otherProfile?.avatar_url,
        lastMessage,
        lastMessageAt: conv.last_message_at,
        unreadCount,
        isArchived: conv.is_archived,
        createdAt: conv.created_at,
      };
    });
  });

// Get messages for a conversation
export const getMessages = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      conversationId: z.string(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ conversationId, limit, offset }) => {
    const { data: user } = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      )
      .then((client) => client.auth.getUser());

    if (!user?.user) {
      throw new Error("Not authenticated");
    }

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    // Get messages
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    // Mark messages as read
    await supabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.user.id)
      .eq("is_read", false);

    // Update conversation read status
    await supabase
      .from("conversations")
      .update({
        buyer_read_at: user.user.id === (await supabase.from("conversations").select("buyer_id").eq("id", conversationId)).data?.[0]?.buyer_id ? new Date().toISOString() : undefined,
        seller_read_at: user.user.id === (await supabase.from("conversations").select("seller_id").eq("id", conversationId)).data?.[0]?.seller_id ? new Date().toISOString() : undefined,
      })
      .eq("id", conversationId);

    return messages?.map((m: any) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      content: m.content,
      attachmentUrl: m.attachment_url,
      attachmentType: m.attachment_type,
      isRead: m.is_read,
      readAt: m.read_at,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    })) || [];
  });

// Send message
export const sendMessage = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      conversationId: z.string(),
      content: z.string().min(1),
      attachmentUrl: z.string().optional(),
      attachmentType: z.string().optional(),
    })
  )
  .handler(async (input) => {
    const { data: user } = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      )
      .then((client) => client.auth.getUser());

    if (!user?.user) {
      throw new Error("Not authenticated");
    }

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: input.conversationId,
        sender_id: user.user.id,
        content: input.content,
        attachment_url: input.attachmentUrl,
        attachment_type: input.attachmentType,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    return {
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      content: message.content,
      attachmentUrl: message.attachment_url,
      attachmentType: message.attachment_type,
      isRead: message.is_read,
      readAt: message.read_at,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
    };
  });

// Create or get conversation
export const getOrCreateConversation = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      listingId: z.string(),
      otherUserId: z.string(),
    })
  )
  .handler(async ({ listingId, otherUserId }) => {
    const { data: user } = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      )
      .then((client) => client.auth.getUser());

    if (!user?.user) {
      throw new Error("Not authenticated");
    }

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    // Try to find existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listingId)
      .or(`and(buyer_id.eq.${user.user.id},seller_id.eq.${otherUserId}),and(buyer_id.eq.${otherUserId},seller_id.eq.${user.user.id})`)
      .limit(1)
      .single();

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: user.user.id,
        seller_id: otherUserId,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return conversation.id;
  });

// Block user
export const blockUser = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      blockedUserId: z.string(),
      reason: z.string().optional(),
    })
  )
  .handler(async ({ blockedUserId, reason }) => {
    const { data: user } = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      )
      .then((client) => client.auth.getUser());

    if (!user?.user) {
      throw new Error("Not authenticated");
    }

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { error } = await supabase.from("user_blocks").insert({
      blocker_id: user.user.id,
      blocked_id: blockedUserId,
      reason,
    });

    if (error) {
      throw new Error(`Failed to block user: ${error.message}`);
    }

    return { success: true };
  });

// Unblock user
export const unblockUser = createServerFn({
  method: "POST",
})
  .input(z.object({ blockedUserId: z.string() }))
  .handler(async ({ blockedUserId }) => {
    const { data: user } = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      )
      .then((client) => client.auth.getUser());

    if (!user?.user) {
      throw new Error("Not authenticated");
    }

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", user.user.id)
      .eq("blocked_id", blockedUserId);

    if (error) {
      throw new Error(`Failed to unblock user: ${error.message}`);
    }

    return { success: true };
  });

// Get blocked users
export const getBlockedUsers = createServerFn({
  method: "GET",
}).handler(async () => {
  const { data: user } = await import("@supabase/supabase-js")
    .then((m) =>
      m.createClient(
        process.env.VITE_SUPABASE_URL || "",
        process.env.SUPABASE_PUBLISHABLE_KEY || ""
      )
    )
    .then((client) => client.auth.getUser());

  if (!user?.user) {
    throw new Error("Not authenticated");
  }

  const supabase = await import("@supabase/supabase-js")
    .then((m) =>
      m.createClient(
        process.env.VITE_SUPABASE_URL || "",
        process.env.SUPABASE_PUBLISHABLE_KEY || ""
      )
    );

  const { data: blocks, error } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", user.user.id);

  if (error) {
    throw new Error(`Failed to get blocked users: ${error.message}`);
  }

  return blocks?.map((b) => b.blocked_id) || [];
});

// Report message
export const reportMessage = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      messageId: z.string(),
      reason: z.string(),
      description: z.string().optional(),
    })
  )
  .handler(async (input) => {
    const { data: user } = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      )
      .then((client) => client.auth.getUser());

    if (!user?.user) {
      throw new Error("Not authenticated");
    }

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { error } = await supabase.from("message_reports").insert({
      message_id: input.messageId,
      reported_by_id: user.user.id,
      reason: input.reason,
      description: input.description,
    });

    if (error) {
      throw new Error(`Failed to report message: ${error.message}`);
    }

    return { success: true };
  });

// Archive conversation
export const archiveConversation = createServerFn({
  method: "POST",
})
  .input(z.object({ conversationId: z.string() }))
  .handler(async ({ conversationId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { error } = await supabase
      .from("conversations")
      .update({ is_archived: true })
      .eq("id", conversationId);

    if (error) {
      throw new Error(`Failed to archive conversation: ${error.message}`);
    }

    return { success: true };
  });
