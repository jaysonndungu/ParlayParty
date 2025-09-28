import React from 'react';
import { Text, View, Image, Pressable } from 'react-native';
import { useStore } from '@/store/AppStore';
import { colors } from '@/theme/tokens';
import { Card, Badge, Button } from '@/components/ui';

export const ActionChannel: React.FC = () => {
  const { events, clutch } = useStore();
  
  // Always show 3 live legs with realistic data
  const liveLegs = [
    {
      id: '1',
      game: 'KC @ BUF',
      time: 'Q2 8:32',
      score: '14-7',
      player: 'Patrick Mahomes',
      bet: 'Over 2.5 Passing TDs',
      current: 2,
      total: 2.5,
      progress: 80
    },
    {
      id: '2', 
      game: 'SF @ DAL',
      time: 'Q1 12:15',
      score: '0-3',
      player: 'Christian McCaffrey',
      bet: 'Over 85.5 Rushing Yds',
      current: 23,
      total: 85.5,
      progress: 27
    },
    {
      id: '3',
      game: 'MIA @ NE', 
      time: 'Q3 4:22',
      score: '21-17',
      player: 'Tua Tagovailoa',
      bet: 'Over 240.5 Passing Yds',
      current: 189,
      total: 240.5,
      progress: 79
    }
  ];

  return (
    <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.steel }}>
        <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>Action Channel</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Badge color={colors.primary}>Live</Badge>
          <Button 
            variant="secondary"
            onPress={() => {/* Navigate to View All page */}}
            style={{ paddingHorizontal: 12, paddingVertical: 4 }}
          >
            <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600' }}>View All</Text>
          </Button>
        </View>
      </View>
      <View style={{ padding: 16 }}>
        {liveLegs.map((leg) => (
          <View 
            key={leg.id}
            style={{ 
              backgroundColor: colors.chip, 
              borderWidth: 1, 
              borderColor: colors.steel, 
              borderRadius: 12, 
              marginBottom: 12,
              padding: 12
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colors.textLow, fontSize: 12 }}>{leg.game} • {leg.time} • {leg.score}</Text>
              <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600' }}>{leg.current}/{leg.total}</Text>
            </View>
            <Text style={{ color: colors.textHigh, fontSize: 14, marginBottom: 8 }}>
              {leg.player} {leg.bet}
            </Text>
            <View style={{ width: '100%', backgroundColor: colors.steel, borderRadius: 4, height: 6 }}>
              <View 
                style={{ 
                  width: `${leg.progress}%`, 
                  backgroundColor: leg.progress >= 80 ? colors.mint : colors.primary, 
                  borderRadius: 4, 
                  height: 6 
                }} 
              />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};