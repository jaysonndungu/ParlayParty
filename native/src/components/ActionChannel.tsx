import React from 'react';
import { Text, View, Image, Pressable } from 'react-native';
import { useStore } from '@/store/AppStore';
import { colors } from '@/theme/tokens';
import { Card, Badge, Button } from '@/components/ui';

export const ActionChannel: React.FC = () => {
  const { events, clutch } = useStore();
  const topEvents = [...events].sort((a, b) => b.priority - a.priority).slice(0, 6);

  return (
    <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.steel }}>
        <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>Action Channel</Text>
        <Badge color={colors.primary}>Live</Badge>
      </View>
      <View style={{ padding: 16 }}>
        {topEvents.map((item) => (
          <View 
            key={item.id}
            style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              gap: 12, 
              padding: 12, 
              backgroundColor: colors.chip, 
              borderWidth: 1, 
              borderColor: colors.steel, 
              borderRadius: 12, 
              marginBottom: 8 
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ color: item.priority >= 9 ? colors.gold : colors.primary, fontSize: 16 }}>⚡</Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>{item.game} • {item.user}</Text>
              </View>
              <Text style={{ color: colors.textHigh, fontSize: 14 }}>{item.text}</Text>
            </View>
            {item.isClutch && (
              <Button 
                variant="primary" 
                onPress={() => {/* Handle clutch focus */}}
                style={{ backgroundColor: colors.gold }}
              >
                <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>Clutch Time</Text>
              </Button>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
};