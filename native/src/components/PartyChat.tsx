import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, Pressable } from 'react-native';
import { useStore, ChatMessage } from '@/store/AppStore';
import { colors } from '@/theme/tokens';
import { Button } from '@/components/ui';

interface PartyChatProps {
  partyId: string;
}

export const PartyChat: React.FC<PartyChatProps> = ({ partyId }) => {
  const { me, getChatMessages, addChatMessage } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const loadMessages = async () => {
      const loadedMessages = await getChatMessages(partyId);
      setMessages(loadedMessages);
    };
    loadMessages();
  }, [partyId, getChatMessages]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    const msg: ChatMessage = { 
      id: Math.random().toString(36).slice(2), 
      user: me, 
      text: t, 
      ts: Date.now() 
    };
    setMessages((arr) => [...arr, msg]);
    addChatMessage(partyId, msg);
    setText('');
  };

  const avatarUrl = (name: string) => {
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundType=gradientLinear,gradientRadial&shapeColor=6f4df8,8b5cf6,22c55e,F6C945`;
  };

  return (
    <View style={{ 
      height: 400, 
      borderRadius: 12, 
      borderWidth: 1, 
      borderColor: colors.steel, 
      backgroundColor: colors.slate,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8, 
        padding: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: colors.steel 
      }}>
        <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600' }}># general</Text>
        <Text style={{ color: colors.textMid, fontSize: 12 }}>Party chat</Text>
      </View>
      
      {/* Messages */}
      <View style={{ flex: 1, padding: 12 }}>
        {messages.map((item) => (
          <View key={item.id} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <Image 
              source={{ uri: avatarUrl(item.user) }} 
              style={{ width: 32, height: 32, borderRadius: 16 }} 
            />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600' }}>{item.user}</Text>
                <Text style={{ color: colors.textLow, fontSize: 10 }}>
                  {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={{ 
                backgroundColor: colors.chip, 
                padding: 8, 
                borderRadius: 8, 
                borderWidth: 1, 
                borderColor: colors.steel 
              }}>
                <Text style={{ color: colors.textHigh, fontSize: 14 }}>{item.text}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      
      {/* Input */}
      <View style={{ 
        borderTopWidth: 1, 
        borderTopColor: colors.steel, 
        padding: 8, 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8 
      }}>
        <TextInput
          placeholder="Message #general"
          placeholderTextColor={colors.textLow}
          value={text}
          onChangeText={setText}
          onSubmitEditing={send}
          style={{ 
            flex: 1, 
            color: colors.textHigh, 
            borderWidth: 1, 
            borderColor: colors.steel, 
            borderRadius: 8, 
            padding: 8,
            backgroundColor: colors.chip
          }}
        />
        <Button variant="primary" onPress={send}>
          <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>Send</Text>
        </Button>
      </View>
    </View>
  );
};
