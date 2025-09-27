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
      
      <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12 }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.textMid, fontSize: 14, marginBottom: 12 }}>Your predictions on friends' parlays.</Text>
          
          <FlatList
            data={myPolls}
            keyExtractor={(item, index) => `${item.id}-${item.choice}-${item.partyName}-${index}`}
            renderItem={({ item }) => (
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: 12, 
                backgroundColor: colors.chip, 
                borderRadius: 8, 
                borderWidth: 1, 
                borderColor: colors.steel, 
                marginBottom: 8 
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600' }}>{item.pickLabel}</Text>
                  <Text style={{ color: colors.textLow, fontSize: 12, marginTop: 2 }}>{item.partyName}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Badge color={item.choice === 'hit' ? colors.mint : colors.primary}>
                    <Text style={{ color: '#000', fontSize: 10, fontWeight: '600' }}>{item.choice.toUpperCase()}</Text>
                  </Badge>
                  <Badge color={
                    item.status === 'pending' ? colors.warning : 
                    item.status === 'cashed' ? colors.mint : 
                    colors.error
                  }>
                    <Text style={{ color: '#000', fontSize: 10, fontWeight: '600' }}>{item.status}</Text>
                  </Badge>
                </View>
              </View>
            )}
          />
        </View>
      </Card>
    </View>
  );
};