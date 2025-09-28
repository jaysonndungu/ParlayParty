-- Party Chat Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create party_chat_messages table
CREATE TABLE IF NOT EXISTS party_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'celebration')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_party_chat_messages_party_id ON party_chat_messages(party_id);
CREATE INDEX IF NOT EXISTS idx_party_chat_messages_created_at ON party_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_party_chat_messages_user_id ON party_chat_messages(user_id);

-- Create RLS policies for party chat messages
ALTER TABLE party_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages from parties they're members of
CREATE POLICY "Users can view party chat messages" ON party_chat_messages
  FOR SELECT USING (
    party_id IN (
      SELECT party_id FROM party_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can send messages to parties they're members of
CREATE POLICY "Users can send party chat messages" ON party_chat_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    party_id IN (
      SELECT party_id FROM party_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can update their own messages (for editing)
CREATE POLICY "Users can update own messages" ON party_chat_messages
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages" ON party_chat_messages
  FOR DELETE USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_party_chat_messages_updated_at 
  BEFORE UPDATE ON party_chat_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for chat messages with user info
CREATE OR REPLACE VIEW party_chat_with_users AS
SELECT 
  pcm.id,
  pcm.party_id,
  pcm.user_id,
  pcm.message,
  pcm.message_type,
  pcm.created_at,
  pcm.updated_at,
  u.username,
  u.full_name,
  u.profile_picture_url
FROM party_chat_messages pcm
JOIN users u ON pcm.user_id = u.id
ORDER BY pcm.created_at ASC;
