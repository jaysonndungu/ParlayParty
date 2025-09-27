import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { useStore } from '@/store/AppStore';
import { Badge, Card } from '@/components/ui';

export const MyPollsScreen: React.FC = () => {
  const { myPolls } = useStore();
  return (
    <View style={{ flex: 1, backgroundColor: colors.ink, padding: spacing(2) }}>
      <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '700', marginBottom: spacing(2) }}>My Polls</Text>
      <FlatList
        data={myPolls}
        keyExtractor={(i) => i.id+ i.choice + i.partyName}
        renderItem={({ item }) => (
          <Card style={{ padding: 12, marginBottom: 10, backgroundColor: colors.chip, borderColor: colors.steel, borderWidth: 1 }}>
            <Text style={{ color: colors.textHigh, fontWeight: '600' }}>{item.pickLabel}</Text>
            <Text style={{ color: colors.textLow, marginTop: 4 }}>{item.partyName}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Badge color={item.choice === 'hit' ? colors.mint : colors.primary}>{item.choice.toUpperCase()}</Badge>
              <Badge color={item.status === 'pending' ? colors.warning : item.status === 'cashed' ? colors.mint : colors.error}>{item.status}</Badge>
            </View>
          </Card>
        )}
      />
    </View>
  );
};