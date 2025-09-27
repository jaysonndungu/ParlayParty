import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/theme/tokens';
import { Button } from '@/components/ui';
import { useStore } from '@/store/AppStore';

export const ProphetPoll: React.FC = () => {
  const { poll, resolvedOptionId, votePoll } = useStore();
  if (!poll) return null;
  return (
    <View style={{ borderColor: colors.primary, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: colors.slate }}>
      <Text style={{ color: colors.textHigh, fontWeight: '700', marginBottom: 8 }}>{poll.question}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {poll.options.map(opt => (
          <Button key={opt.id} variant={resolvedOptionId ? 'secondary' : 'primary'} onPress={() => votePoll(opt.id)} disabled={!!resolvedOptionId}>
            {opt.label}
          </Button>
        ))}
      </View>
      {resolvedOptionId && (
        <Text style={{ color: colors.textMid, marginTop: 8 }}>Resolved: {resolvedOptionId === 'yes_hit' ? 'Yes, it hits' : 'No, it misses'}</Text>
      )}
    </View>
  );
};