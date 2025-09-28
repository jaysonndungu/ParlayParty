import React from 'react';
import { View, Text } from 'react-native';
import { useStore } from '@/store/AppStore';
import { colors } from '@/theme/tokens';
import { Card, Badge } from '@/components/ui';

export const Leaderboard: React.FC = () => {
  const { currentParty, partyScores, user } = useStore();
  
  if (!currentParty) {
    return (
      <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12 }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.textMid, fontSize: 16, textAlign: 'center' }}>Select a party first!</Text>
        </View>
      </Card>
    );
  }
  
  // Static demo scores with user at top
  const staticDemoScores = {
    [user?.fullName || user?.username || 'You']: 167,  // You at the top
    'Alex': 127,
    'Jordan': 89,
    'Sam': 76,
    'Taylor': 64,
    'Riley': 52,
    'Casey': 41,
    'Devin': 28,
    'Kai': 15
  };
  
  const scores = partyScores[currentParty.id] || staticDemoScores;
  const entries = Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const leader = entries[0]?.[0];

  return (
    <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.steel }}>
        <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>Leaderboard</Text>
        <Badge color={colors.gold}>🏆 Top</Badge>
      </View>
      <View style={{ padding: 16, gap: 8 }}>
        {entries.map(([name, pts], idx) => (
          <View 
            key={name} 
            style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: 12, 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: name === leader ? colors.gold : colors.steel,
              backgroundColor: name === leader ? colors.chip : 'transparent'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ 
                width: 24, 
                height: 24, 
                borderRadius: 12, 
                backgroundColor: idx === 0 ? colors.gold : colors.chip,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '600',
                  color: idx === 0 ? '#000' : colors.textHigh 
                }}>
                  {idx + 1}
                </Text>
              </View>
              <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600' }}>{name}</Text>
            </View>
            <Text style={{ color: colors.textMid, fontSize: 12 }}>{pts} pts</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};