import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/theme/tokens';
import { Button, Card, Badge } from '@/components/ui';
import { useStore } from '@/store/AppStore';

export const ProphetPoll: React.FC = () => {
  const { poll, resolvedOptionId, votePoll } = useStore();
  const [now, setNow] = useState<number>(Date.now());
  
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  
  if (!poll) return null;
  
  const remaining = Math.max(0, Math.round((poll.endsAt - now) / 1000));

  return (
    <Card style={{ borderColor: colors.primary, borderWidth: 1, borderRadius: 12, backgroundColor: colors.slate }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.steel }}>
        <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>Prophet Poll</Text>
        <Badge color={colors.warning}>{remaining}s</Badge>
      </View>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ color: colors.textMid, fontSize: 14 }}>{poll.question}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {poll.options.map((option) => (
            <Button 
              key={option.id} 
              variant="secondary" 
              onPress={() => votePoll(option.id)} 
              disabled={!!resolvedOptionId}
              style={{ flex: 1 }}
            >
              <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600' }}>{option.label}</Text>
            </Button>
          ))}
        </View>
        {resolvedOptionId && (
          <Text style={{ color: colors.textMid, fontSize: 12 }}>
            Correct answer: <Text style={{ color: colors.mint }}>{poll.options.find(o=>o.id===resolvedOptionId)?.label}</Text>
          </Text>
        )}
      </View>
    </Card>
  );
};