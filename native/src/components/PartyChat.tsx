import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { chatAPI, ChatMessageWithId } from '@/services/chatAPI';
import { ChatMessage } from './ChatMessage';
import { useStore } from '@/store/AppStore';

interface PartyChatProps {
  partyId: string;
  partyName: string;
}

export const PartyChat: React.FC<PartyChatProps> = ({ partyId, partyName }) => {
  const { user } = useStore();
  const [messages, setMessages] = useState<ChatMessageWithId[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const subscriptionRef = useRef<any>(null);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [partyId]);

  // Set up real-time subscription
  useEffect(() => {
    if (partyId) {
      subscriptionRef.current = chatAPI.subscribeToPartyChat(partyId, (message) => {
        setMessages(prev => [...prev, message]);
        // Auto-scroll to bottom when new message arrives
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });
    }

    return () => {
      if (subscriptionRef.current) {
        chatAPI.unsubscribeFromPartyChat(subscriptionRef.current);
      }
    };
  }, [partyId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const fetchedMessages = await chatAPI.getPartyMessages(partyId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load chat messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      await chatAPI.sendMessage(partyId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = (message: ChatMessageWithId) => {
    const isOwnMessage = message.user_id === user?.id;
    
    return (
      <ChatMessage
        key={message.id}
        message={message}
        isOwnMessage={isOwnMessage}
        onLongPress={(msg) => {
          // Handle long press for message options (edit, delete, etc.)
          console.log('Long press on message:', msg.id);
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.ink,
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textMid, marginTop: spacing(1) }}>
          Loading chat...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.ink }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Chat Header */}
      <View style={{
        padding: spacing(2),
        borderBottomWidth: 1,
        borderBottomColor: colors.steel,
        backgroundColor: colors.ink,
      }}>
        <Text style={{
          color: colors.textHigh,
          fontSize: 18,
          fontWeight: '700',
          textAlign: 'center',
        }}>
          {partyName} Chat
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, padding: spacing(1) }}
        contentContainerStyle={{ paddingBottom: spacing(2) }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: spacing(4),
          }}>
            <Text style={{
              color: colors.textMid,
              fontSize: 16,
              textAlign: 'center',
            }}>
              No messages yet. Start the conversation! 🎉
            </Text>
          </View>
        ) : (
          messages.map(renderMessage)
        )}
      </ScrollView>

      {/* Message Input */}
      <View style={{
        flexDirection: 'row',
        padding: spacing(2),
        borderTopWidth: 1,
        borderTopColor: colors.steel,
        backgroundColor: colors.ink,
        alignItems: 'flex-end',
      }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.steel,
            borderRadius: 20,
            paddingHorizontal: spacing(2),
            paddingVertical: spacing(1.5),
            color: colors.textHigh,
            fontSize: 16,
            maxHeight: 100,
          }}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMid}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={{
            marginLeft: spacing(1),
            backgroundColor: colors.primary,
            borderRadius: 20,
            padding: spacing(1.5),
            opacity: (!newMessage.trim() || isSending) ? 0.5 : 1,
          }}
          onPress={sendMessage}
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.textHigh} />
          ) : (
            <Text style={{
              color: colors.textHigh,
              fontWeight: '600',
              fontSize: 16,
            }}>
              Send
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};