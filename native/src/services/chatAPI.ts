import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type ChatMessage = Database['public']['Views']['party_chat_with_users']['Row'];
type ChatMessageInsert = Database['public']['Tables']['party_chat_messages']['Insert'];

export interface ChatMessageWithId extends ChatMessage {
  id: string;
}

export const chatAPI = {
  // Get chat messages for a party
  async getPartyMessages(partyId: string, limit: number = 50): Promise<ChatMessageWithId[]> {
    try {
      const { data, error } = await supabase
        .from('party_chat_with_users')
        .select('*')
        .eq('party_id', partyId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching party messages:', error);
      throw error;
    }
  },

  // Send a message to a party
  async sendMessage(partyId: string, message: string, messageType: 'text' | 'system' | 'celebration' = 'text'): Promise<ChatMessageWithId> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const messageData: ChatMessageInsert = {
        party_id: partyId,
        user_id: user.id,
        message,
        message_type: messageType,
      };

      const { data, error } = await supabase
        .from('party_chat_messages')
        .insert(messageData)
        .select(`
          id,
          party_id,
          user_id,
          message,
          message_type,
          created_at,
          updated_at,
          username:users!inner(username),
          full_name:users!inner(full_name),
          profile_picture_url:users!inner(profile_picture_url)
        `)
        .single();

      if (error) throw error;
      return data as ChatMessageWithId;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Subscribe to real-time chat messages for a party
  subscribeToPartyChat(partyId: string, onMessage: (message: ChatMessageWithId) => void) {
    const subscription = supabase
      .channel(`party_chat_${partyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'party_chat_messages',
          filter: `party_id=eq.${partyId}`,
        },
        async (payload) => {
          // Fetch the full message with user details
          const { data, error } = await supabase
            .from('party_chat_with_users')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            onMessage(data as ChatMessageWithId);
          }
        }
      )
      .subscribe();

    return subscription;
  },

  // Unsubscribe from chat messages
  unsubscribeFromPartyChat(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },

  // Send a celebration message (for wins, big plays, etc.)
  async sendCelebrationMessage(partyId: string, message: string): Promise<ChatMessageWithId> {
    return this.sendMessage(partyId, message, 'celebration');
  },

  // Send a system message (for party events, joins, etc.)
  async sendSystemMessage(partyId: string, message: string): Promise<ChatMessageWithId> {
    return this.sendMessage(partyId, message, 'system');
  },

  // Delete a message (only own messages)
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('party_chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Edit a message (only own messages)
  async editMessage(messageId: string, newMessage: string): Promise<ChatMessageWithId> {
    try {
      const { data, error } = await supabase
        .from('party_chat_messages')
        .update({ message: newMessage })
        .eq('id', messageId)
        .select(`
          id,
          party_id,
          user_id,
          message,
          message_type,
          created_at,
          updated_at,
          username:users!inner(username),
          full_name:users!inner(full_name),
          profile_picture_url:users!inner(profile_picture_url)
        `)
        .single();

      if (error) throw error;
      return data as ChatMessageWithId;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  },
};
