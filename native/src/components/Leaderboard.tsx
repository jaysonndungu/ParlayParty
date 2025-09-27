import React from 'react';
import { View, Text } from 'react-native';
import { useStore } from '@/store/AppStore';
import { colors } from '@/theme/tokens';

export const Leaderboard: React.FC = () => {
  const { scores } = useStore();
  const entries = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  return (
    <View style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12 }}>
      {entries.map(([name, pts], idx) => (
        <View key={name} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderTopWidth: idx?1:0, borderTopColor: colors.steel, backgroundColor: idx===0? '#1d2029': colors.slate }}>
          <Text style={{ color: colors.textHigh, fontWeight: idx===0? '800':'600' }}>{idx+1}. {name}</Text>
          <Text style={{ color: colors.textMid }}>{pts} pts</Text>
        </View>
      ))}
    </View>
  );
};