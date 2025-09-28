import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { ChatMessageWithId } from '@/services/chatAPI';

interface ChatMessageProps {
  message: ChatMessageWithId;
  isOwnMessage: boolean;
  onLongPress?: (message: ChatMessageWithId) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwnMessage, 
  onLongPress 
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStyle = (messageType: string, isOwnMessage: boolean) => {
    const baseStyle = {
      padding: spacing(1.5),
      marginVertical: spacing(0.5),
      borderRadius: 12,
      maxWidth: '80%',
    };

    switch (messageType) {
      case 'system':
        return {
          ...baseStyle,
          backgroundColor: colors.steel,
          alignSelf: 'center' as const,
          maxWidth: '90%',
        };
      case 'celebration':
        return {
          ...baseStyle,
          backgroundColor: isOwnMessage ? colors.primary : colors.chip,
          alignSelf: isOwnMessage ? 'flex-end' as const : 'flex-start' as const,
          borderWidth: 1,
          borderColor: colors.primary,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: isOwnMessage ? colors.primary : colors.steel,
          alignSelf: isOwnMessage ? 'flex-end' as const : 'flex-start' as const,
        };
    }
  };

  const getTextStyle = (messageType: string, isOwnMessage: boolean) => {
    const baseStyle = {
      fontSize: 14,
      lineHeight: 20,
    };

    switch (messageType) {
      case 'system':
        return {
          ...baseStyle,
          color: colors.textMid,
          fontStyle: 'italic' as const,
          textAlign: 'center' as const,
        };
      case 'celebration':
        return {
          ...baseStyle,
          color: colors.textHigh,
          fontWeight: '600' as const,
        };
      default:
        return {
          ...baseStyle,
          color: isOwnMessage ? colors.textHigh : colors.textHigh,
        };
    }
  };

  const getUsernameStyle = (messageType: string, isOwnMessage: boolean) => {
    return {
      fontSize: 12,
      color: colors.textMid,
      marginBottom: spacing(0.5),
      fontWeight: '500' as const,
      textAlign: isOwnMessage ? 'right' as const : 'left' as const,
    };
  };

  const getTimestampStyle = (messageType: string, isOwnMessage: boolean) => {
    return {
      fontSize: 10,
      color: colors.textLow,
      marginTop: spacing(0.5),
      textAlign: isOwnMessage ? 'right' as const : 'left' as const,
    };
  };

  const messageStyle = getMessageStyle(message.message_type, isOwnMessage);
  const textStyle = getTextStyle(message.message_type, isOwnMessage);
  const usernameStyle = getUsernameStyle(message.message_type, isOwnMessage);
  const timestampStyle = getTimestampStyle(message.message_type, isOwnMessage);

  const MessageContent = () => (
    <View style={messageStyle}>
      {message.message_type !== 'system' && (
        <Text style={usernameStyle}>
          {message.username}
        </Text>
      )}
      <Text style={textStyle}>{message.message}</Text>
      <Text style={timestampStyle}>
        {formatTime(message.created_at)}
      </Text>
    </View>
  );

  if (onLongPress) {
    return (
      <TouchableOpacity
        onLongPress={() => onLongPress(message)}
        delayLongPress={500}
      >
        <MessageContent />
      </TouchableOpacity>
    );
  }

  return <MessageContent />;
};
