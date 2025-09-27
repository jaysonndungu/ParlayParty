import React from 'react';
import { FlatList, Text, View, Image } from 'react-native';
import { useStore } from '@/store/AppStore';
import { colors } from '@/theme/tokens';

export const ActionChannel: React.FC = () => {
  const { events } = useStore();
  return (
    <FlatList
      data={events}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', gap: 12, padding: 12, backgroundColor: colors.chip, borderWidth: 1, borderColor: colors.steel, borderRadius: 12, marginBottom: 8 }}>
          <Image source={{ uri: `https://api.dicebear.com/7.x/thumbs/png?seed=${encodeURIComponent(item.user)}` }} style={{ width: 36, height: 36, borderRadius: 18 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textHigh, fontWeight: '600' }}>{item.game}</Text>
            <Text style={{ color: colors.textMid, marginTop: 2 }}>{item.text}</Text>
          </View>
        </View>
      )}
    />
  );
};