-- Messaging System for Buyer-Seller Communication

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  buyer_read_at TIMESTAMP WITH TIME ZONE,
  seller_read_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (buyer_id != seller_id)
);

-- Create indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- Enable RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations where they are participant"
  ON conversations
  FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can update conversations they participate in"
  ON conversations
  FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url VARCHAR,
  attachment_type VARCHAR, -- image, file, etc
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- Create user blocking table
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Create indexes for blocks
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON user_blocks(blocked_id);

-- Enable RLS for user_blocks
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_blocks
CREATE POLICY "Users can view their own blocks"
  ON user_blocks
  FOR SELECT
  USING (blocker_id = auth.uid());

CREATE POLICY "Users can create blocks"
  ON user_blocks
  FOR INSERT
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can delete their own blocks"
  ON user_blocks
  FOR DELETE
  USING (blocker_id = auth.uid());

-- Create message reports table for moderation
CREATE TABLE IF NOT EXISTS message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  reported_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL, -- spam, harassment, inappropriate, etc
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, resolved
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for reports
CREATE INDEX IF NOT EXISTS idx_message_reports_message_id ON message_reports(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reports_reported_by_id ON message_reports(reported_by_id);
CREATE INDEX IF NOT EXISTS idx_message_reports_status ON message_reports(status);

-- Enable RLS for message_reports
ALTER TABLE message_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_reports
CREATE POLICY "Users can view their own reports"
  ON message_reports
  FOR SELECT
  USING (reported_by_id = auth.uid());

CREATE POLICY "Users can create reports"
  ON message_reports
  FOR INSERT
  WITH CHECK (reported_by_id = auth.uid());

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_update_conversation_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_on_message();

-- Function to mark conversation as unread
CREATE OR REPLACE FUNCTION mark_conversation_unread()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sender_id != (
    SELECT buyer_id FROM conversations WHERE id = NEW.conversation_id
  ) THEN
    UPDATE conversations
    SET buyer_read_at = NULL
    WHERE id = NEW.conversation_id;
  ELSE
    UPDATE conversations
    SET seller_read_at = NULL
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_mark_unread_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION mark_conversation_unread();

-- Function to mark all messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET
    is_read = true,
    read_at = NOW()
  WHERE
    conversation_id = p_conversation_id
    AND is_read = false
    AND sender_id != auth.uid();
END;
$$ LANGUAGE plpgsql;
