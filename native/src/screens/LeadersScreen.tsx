import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { Leaderboard } from '@/components/Leaderboard';

export const LeadersScreen: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ink }}>
      <View style={{ flex: 1, padding: spacing(2) }}>
        <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '700', marginBottom: spacing(2) }}>Leaderboard</Text>
        <Leaderboard />
      </View>
    </SafeAreaView>
  );
};