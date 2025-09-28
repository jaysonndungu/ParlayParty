import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { Card, Button, Badge } from '@/components/ui';

interface ParlayDetailScreenProps {
  route: {
    params: {
      parlay: {
        id: string;
        user: string;
        picks: Array<{
          game: string;
          bet: string;
        }>;
        odds: string;
      };
    };
  };
  navigation: any;
}

export const ParlayDetailScreen: React.FC<ParlayDetailScreenProps> = ({ route, navigation }) => {
  const { parlay } = route.params;

  const avatarUrl = (name: string) => {
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundType=gradientLinear,gradientRadial&shapeColor=6f4df8,8b5cf6,22c55e,F6C945`;
  };

  const handleGamePress = (game: string, bet: string) => {
    // Navigate to game detail with fake data
    navigation.navigate('GameDetail', {
      game: game,
      bet: bet,
      user: parlay.user,
      progress: Math.floor(Math.random() * 100),
      current: Math.floor(Math.random() * 50),
      total: 50 + Math.floor(Math.random() * 20),
      timeLeft: 'Q2 08:45',
      quarter: 'Q2',
      score: '14-10'
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ink }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: spacing(2),
        borderBottomWidth: 1,
        borderBottomColor: colors.steel
      }}>
        <Pressable 
          onPress={() => navigation.goBack()}
          style={{ marginRight: 12 }}
        >
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>
          Parlay Details
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing(2) }}>
        {/* Parlay Header */}
        <Card style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Image 
                source={{ uri: avatarUrl(parlay.user) }} 
                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} 
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>
                  {parlay.user}'s Parlay
                </Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>
                  {parlay.picks.length} legs • {parlay.odds}
                </Text>
              </View>
              <Badge color={colors.primary}>
                <Text style={{ fontSize: 12, color: '#000', fontWeight: '600' }}>
                  {parlay.odds}
                </Text>
              </Badge>
            </View>
          </View>
        </Card>

        {/* Parlay Legs */}
        <View style={{ marginBottom: spacing(2) }}>
          <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Parlay Legs
          </Text>
          
          {parlay.picks.map((pick, index) => (
            <Pressable 
              key={index}
              onPress={() => handleGamePress(pick.game, pick.bet)}
            >
              <Card style={{ 
                marginBottom: 12, 
                backgroundColor: colors.slate,
                borderColor: colors.steel,
                borderWidth: 1
              }}>
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '600' }}>
                      Leg {index + 1}
                    </Text>
                    <Badge color={colors.chip}>
                      <Text style={{ fontSize: 10, color: colors.textHigh }}>Upcoming</Text>
                    </Badge>
                  </View>
                  
                  <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
                    {pick.game}
                  </Text>
                  
                  <Text style={{ color: colors.textMid, fontSize: 14, marginBottom: 12 }}>
                    {pick.bet}
                  </Text>
                  
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <Text style={{ color: colors.textLow, fontSize: 12 }}>
                      Click to view game details
                    </Text>
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                      View Game →
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        {/* Parlay Actions */}
        <Card style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              Actions
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <Button 
                style={{ flex: 1, backgroundColor: colors.mint }}
                onPress={() => {
                  // Handle tail action
                }}
              >
                <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>Tail This Parlay</Text>
              </Button>
              <Button 
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => {
                  // Handle fade action
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600' }}>Fade This Parlay</Text>
              </Button>
            </View>
          </View>
        </Card>

        {/* Parlay Stats */}
        <Card style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              Parlay Statistics
            </Text>
            
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-around',
              marginBottom: 16
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '800' }}>
                  {parlay.picks.length}
                </Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>
                  Total Legs
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '800' }}>
                  0
                </Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>
                  Completed
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '800' }}>
                  {parlay.picks.length}
                </Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>
                  Remaining
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 4
              }}>
                <Text style={{ color: colors.textLow, fontSize: 12, fontWeight: '600' }}>
                  PARLAY PROGRESS
                </Text>
                <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '700' }}>
                  0%
                </Text>
              </View>
              
              <View style={{ 
                height: 8, 
                backgroundColor: colors.steel, 
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <View style={{ 
                  height: '100%', 
                  width: '0%', 
                  backgroundColor: colors.mint,
                  borderRadius: 4
                }} />
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
