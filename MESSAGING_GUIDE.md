# Messaging System Guide

Complete guide to the buyer-seller messaging system for Biraj.HR marketplace.

---

## 📋 Features

### Core Messaging
- **Direct messaging** between buyers and sellers
- **Conversation threads** grouped by listing
- **Read receipts** - See who read messages
- **Auto-created conversations** when messaging a seller
- **Message timestamps** with relative formatting
- **Real-time updates** via polling (5-second intervals)

### User Experience
- **Conversation list** with unread badges
- **Quick access** to seller info and listing
- **Message history** with scrollback
- **Auto-scroll** to latest message
- **Archive conversations** to keep inbox clean

### Safety & Moderation
- **Block users** to prevent messages
- **Report messages** for harassment or spam
- **User blocking list** management
- **Message moderation** for admins
- **Conversation history** retained

### Notifications
- **Unread message count** in conversation list
- **Read status tracking** per message
- **Conversation last message** preview
- **Auto-mark as read** when viewing

---

## 🏗️ Architecture

### Database Schema

#### Conversations Table
```sql
conversations
├── id (UUID)
├── listing_id (UUID) - Which listing
├── buyer_id (UUID) - Initiating user
├── seller_id (UUID) - Other participant
├── last_message_at (timestamp) - For sorting
├── buyer_read_at (timestamp) - Read status
├── seller_read_at (timestamp) - Read status
├── is_archived (boolean) - Hide from inbox
├── created_at (timestamp)
└── updated_at (timestamp)
```

#### Messages Table
```sql
messages
├── id (UUID)
├── conversation_id (UUID)
├── sender_id (UUID) - Who sent
├── content (text) - Message text
├── attachment_url (varchar) - Optional file/image
├── attachment_type (varchar) - file, image, etc
├── is_read (boolean)
├── read_at (timestamp)
├── created_at (timestamp)
└── updated_at (timestamp)
```

#### User Blocks Table
```sql
user_blocks
├── id (UUID)
├── blocker_id (UUID) - Who blocked
├── blocked_id (UUID) - Who is blocked
├── reason (text) - Why blocked
└── created_at (timestamp)
```

#### Message Reports Table (Moderation)
```sql
message_reports
├── id (UUID)
├── message_id (UUID)
├── reported_by_id (UUID)
├── reason (varchar) - spam, harassment, etc
├── description (text)
├── status (varchar) - pending, reviewed, resolved
├── resolved_at (timestamp)
└── created_at (timestamp)
```

### Performance Indexes
```sql
idx_conversations_buyer_id - List buyer's conversations
idx_conversations_seller_id - List seller's conversations
idx_conversations_listing_id - Find by listing
idx_conversations_last_message_at - Sort by recent
idx_messages_conversation_id - Get messages
idx_messages_is_read - Find unread
idx_user_blocks - Check if blocked
```

### Triggers & Functions
- `update_conversation_on_message()` - Update last_message_at
- `mark_conversation_unread()` - Reset read status on new message
- `mark_messages_as_read()` - Mark all messages as read

---

## 🔧 API Functions

### Get Conversations
```typescript
getConversations({ archived?: boolean })
// Returns: Conversation[] with unread counts and last messages
```

Response includes:
```typescript
{
  id: string,
  listingId: string,
  listingTitle: string,
  listingImage: string | null,
  sellerName: string,
  sellerAvatar: string | null,
  lastMessage: string,
  lastMessageAt: string,
  unreadCount: number,
  isArchived: boolean,
  createdAt: string,
}
```

### Get Messages
```typescript
getMessages({
  conversationId: string,
  limit?: number,        // default: 50
  offset?: number        // default: 0
})
// Returns: Message[]
```

Auto-marks messages as read for current user.

### Send Message
```typescript
sendMessage({
  conversationId: string,
  content: string,
  attachmentUrl?: string,      // Optional file/image URL
  attachmentType?: string      // 'image' or 'file'
})
// Returns: Message
```

### Get or Create Conversation
```typescript
getOrCreateConversation({
  listingId: string,
  otherUserId: string
})
// Returns: conversationId (creates if doesn't exist)
```

### Block User
```typescript
blockUser({
  blockedUserId: string,
  reason?: string
})
// Returns: { success: boolean }
```

### Unblock User
```typescript
unblockUser({ blockedUserId: string })
// Returns: { success: boolean }
```

### Get Blocked Users
```typescript
getBlockedUsers()
// Returns: string[] (array of blocked user IDs)
```

### Report Message
```typescript
reportMessage({
  messageId: string,
  reason: string,           // spam, harassment, inappropriate
  description?: string      // additional context
})
// Returns: { success: boolean }
```

### Archive Conversation
```typescript
archiveConversation({ conversationId: string })
// Returns: { success: boolean }
```

---

## 🎨 UI Components

### ConversationList
Displays all conversations in a scrollable list.

```typescript
<ConversationList
  selectedConversationId={id}
  onSelect={(id) => setSelected(id)}
  showArchived={false}
/>
```

Features:
- Live unread badge count
- Last message preview
- Relative time formatting
- User avatar
- Listing title
- Active selection highlight
- Archived filter

### ChatWindow
Full chat interface with message display and input.

```typescript
<ChatWindow
  conversationId={id}
  otherUserName="Marko Horvat"
  otherUserAvatar="https://..."
  currentUserId={userId}
/>
```

Features:
- Message display (own vs other)
- Auto-scroll to bottom
- Real-time updates (2-second poll)
- Message timestamps
- Block user option
- Send button with loading state
- Enter-to-send shortcut
- Shift+Enter for new line

### MessageSellerButton
One-click button to message a seller from listing.

```typescript
<MessageSellerButton
  listingId={listing.id}
  sellerId={seller.id}
  sellerName={seller.name}
  currentUserId={user?.id}
/>
```

Features:
- Auto-creates/finds conversation
- Navigates to messages
- Disabled if same user
- Disabled if not logged in
- Loading state
- Responsive text

---

## 📊 Integration Examples

### Messaging Page (Full Interface)
```typescript
function MessagingPage() {
  const [selectedId, setSelectedId] = useState<string>();
  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations({}),
    refetchInterval: 5000,
  });

  const selected = conversations?.find(c => c.id === selectedId);

  return (
    <div className="grid grid-cols-3">
      <ConversationList
        selectedConversationId={selectedId}
        onSelect={setSelectedId}
      />
      {selected && (
        <ChatWindow
          conversationId={selectedId}
          otherUserName={selected.sellerName}
          otherUserAvatar={selected.sellerAvatar}
          currentUserId={user.id}
        />
      )}
    </div>
  );
}
```

### Listing Detail Page
```typescript
function ListingDetail({ listing, seller }) {
  return (
    <div>
      <h1>{listing.title}</h1>
      <MessageSellerButton
        listingId={listing.id}
        sellerId={seller.id}
        sellerName={seller.name}
        currentUserId={currentUser?.id}
        className="w-full"
      />
    </div>
  );
}
```

### Seller Profile Page
```typescript
function SellerProfile({ sellerId, seller }) {
  const [listing, setListing] = useState<string>();

  return (
    <div>
      <MessageSellerButton
        listingId={listing || ""}
        sellerId={sellerId}
        sellerName={seller.name}
      />
    </div>
  );
}
```

---

## 🔐 Security & RLS

### Row-Level Security Policies

**Conversations:**
- Users can only access conversations they participate in
- Buyer ID or Seller ID must match current user

**Messages:**
- Users can only see messages in their conversations
- Users can only send messages to conversations they're in
- Users can only update their own messages

**User Blocks:**
- Users can only see their own blocks
- Users can only create/delete their own blocks

**Message Reports:**
- Users can only see their own reports
- Admins can view all reports (future)

### Data Protection
- No message content exposed outside conversation
- User email/password never exposed
- Blocked users cannot send messages
- Messages retained in history

---

## 💬 Message Flow

### Starting a Conversation
1. User clicks "Message" button on listing
2. System checks for existing conversation
3. If exists: opens conversation
4. If not: creates new conversation
5. Navigate to /poruke with conversation

### Sending a Message
1. User types message in input
2. User presses Send or Shift+Enter
3. Message sent to database
4. Conversation updated with last_message_at
5. Other user notified (via polling or real-time)
6. Other user's read status reset

### Reading Messages
1. User opens conversation
2. System marks all messages as read
3. Chat window auto-scrolls to latest
4. Sender sees read receipt
5. Unread badge disappears

### Blocking a User
1. User clicks block in conversation menu
2. Confirmation dialog shown
3. User blocked in database
4. Blocked user cannot message or see listings
5. Existing messages retained

---

## 📱 Real-Time Updates

### Polling Strategy
- Conversations: Poll every 5 seconds
- Messages: Poll every 2 seconds
- Reduces server load vs WebSocket
- Acceptable for small-medium traffic

### WebSocket Future (Optional)
```typescript
// Future implementation
const socket = useEffect(() => {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    }, payload => {
      // Handle new message
    })
    .subscribe();
});
```

---

## 🎯 Best Practices

### For Users
1. **Check messages regularly** - Set 5-minute check habit
2. **Block spammers** - Don't engage with spam
3. **Report issues** - Use report feature for harassment
4. **Archive old chats** - Keep inbox organized
5. **Be respectful** - Keep conversations professional

### For Developers
1. **Debounce send** - Prevent duplicate sends
2. **Sanitize input** - Prevent XSS attacks
3. **Rate limit messages** - Max 10 messages/minute
4. **Archive old conversations** - >6 months inactive
5. **Monitor queue** - Track unread message count
6. **Handle errors gracefully** - Show user-friendly messages
7. **Test blocking** - Verify blocked users can't message

### For Admins
1. **Review reports** - Check message_reports table
2. **Monitor spam** - Watch for mass messaging
3. **Action moderation** - Warn or ban users
4. **Purge data** - Delete messages for deleted users
5. **Analytics** - Track message volume and patterns

---

## 🐛 Troubleshooting

### Messages not sending
1. Check network connection
2. Verify conversation exists
3. Check user not blocked
4. Review browser console errors
5. Check Supabase logs

### Messages not appearing
1. Refresh page
2. Check polling interval (2 seconds)
3. Verify conversation ID correct
4. Check RLS policies
5. Verify message sender has access

### Not receiving real-time updates
1. Polling is working (check Network tab)
2. Check server is returning new messages
3. Verify browser is focused (polling continues)
4. Check browser console for errors

### Cannot message seller
1. Verify user is logged in
2. Check if user is seller (can't message self)
3. Verify user not blocked
4. Check listing exists
5. Verify seller_id is correct

---

## 📈 Performance

### Message Loading
- Fetch 50 messages by default
- Pagination for older messages
- Index on conversation_id for fast lookup

### Conversation Listing
- Quick query with indexes
- Only get last message (not full threads)
- Unread counts calculated efficiently

### Real-Time Updates
- 2-second polling for messages
- 5-second polling for conversations
- Debounced queries
- React Query caching

---

## 🚀 Deployment

### Database
1. Apply migration: `20260819_messaging_system.sql`
2. Verify all indexes created
3. Verify RLS policies enabled
4. Test message sending

### Environment
No new environment variables needed (uses existing Supabase keys)

### Frontend
1. Add Messaging page to navigation
2. Add Message button to listings
3. Test on production domain
4. Monitor error tracking (Sentry)

---

## 📊 Analytics Queries

### Message volume
```sql
SELECT DATE(created_at) as date, COUNT(*) as messages
FROM messages
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Most active conversations
```sql
SELECT c.id, c.listing_id, COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id, c.listing_id
ORDER BY message_count DESC
LIMIT 10;
```

### Blocked users
```sql
SELECT COUNT(*) as total_blocks
FROM user_blocks
WHERE created_at > NOW() - INTERVAL '30 days';
```

### Reported messages
```sql
SELECT reason, COUNT(*) as count
FROM message_reports
WHERE status = 'pending'
GROUP BY reason;
```

---

**Status**: Production Ready ✅  
**Last Updated**: August 19, 2026  
**Version**: 1.0.0
