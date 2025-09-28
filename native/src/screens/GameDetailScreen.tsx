import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { Card, Button, Badge } from '@/components/ui';

interface GameDetailScreenProps {
  route: {
    params: {
      game: string;
      bet: string;
      user: string;
      progress: number;
      current: number;
      total: number;
      timeLeft?: string;
      quarter?: string;
      score?: string;
    };
  };
  navigation: any;
}

export const GameDetailScreen: React.FC<GameDetailScreenProps> = ({ route, navigation }) => {
  const { game, bet, user, progress, current, total, timeLeft, quarter, score } = route.params;

  const avatarUrl = (name: string) => {
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundType=gradientLinear,gradientRadial&shapeColor=6f4df8,8b5cf6,22c55e,F6C945`;
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
          Game Details
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing(2) }}>
        {/* Game Info Card */}
        <Card style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '800' }}>
                {game}
              </Text>
              <Badge color={colors.primary}>Live</Badge>
            </View>
            
            {timeLeft && quarter && score && (
              <View style={{ 
                backgroundColor: colors.slate, 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 12 
              }}>
                <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                  {quarter} • {timeLeft}
                </Text>
                <Text style={{ color: colors.textMid, fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                  {score}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Bet Details Card */}
        <Card style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              Bet Details
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Image 
                source={{ uri: avatarUrl(user) }} 
                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} 
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '600' }}>
                  {bet}
                </Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>
                  By {user} • Line {total}
                </Text>
              </View>
            </View>

            {/* Progress Section */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 8
              }}>
                <Text style={{ color: colors.textLow, fontSize: 12, fontWeight: '600' }}>
                  LEG PROGRESS
                </Text>
                <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '700' }}>
                  {progress}%
                </Text>
              </View>
              
              <View style={{ 
                height: 8, 
                backgroundColor: colors.steel, 
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: 8
              }}>
                <View style={{ 
                  height: '100%', 
                  width: `${progress}%`, 
                  backgroundColor: colors.mint,
                  borderRadius: 4
                }} />
              </View>
              
              <Text style={{ color: colors.textLow, fontSize: 12, textAlign: 'center' }}>
                {current}/{total} yards
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button 
                style={{ flex: 1, backgroundColor: colors.mint }}
                onPress={() => {
                  // Handle tail action
                }}
              >
                <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>Tail</Text>
              </Button>
              <Button 
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => {
                  // Handle fade action
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600' }}>Fade</Text>
              </Button>
            </View>
          </View>
        </Card>

        {/* Game Stats Card */}
        <Card style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              Game Statistics
            </Text>
            
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-around',
              marginBottom: 16
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '800' }}>
                  {current}
                </Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>
                  Current
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '800' }}>
                  {total}
                </Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>
                  Line
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '800' }}>
                  {(total - current).toFixed(1)}
                </Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>
                  Needed
                </Text>
              </View>
            </View>

            {/* Team Stats */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Team Performance
              </Text>
              <View style={{ 
                backgroundColor: colors.slate, 
                padding: 12, 
                borderRadius: 8,
                marginBottom: 8
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: colors.textMid, fontSize: 12 }}>Total Yards (Season Avg)</Text>
                  <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600' }}>387.2</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: colors.textMid, fontSize: 12 }}>Home/Away Record</Text>
                  <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600' }}>6-2 / 4-3</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textMid, fontSize: 12 }}>vs Spread</Text>
                  <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600' }}>7-4</Text>
                </View>
              </View>
            </View>

            {/* Recent Plays */}
            <View>
              <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Recent Plays
              </Text>
              <View style={{ 
                backgroundColor: colors.slate, 
                padding: 12, 
                borderRadius: 8 
              }}>
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600' }}>Q3 05:30 - 1st & 10</Text>
                  <Text style={{ color: colors.textMid, fontSize: 11 }}>Pass completion for 8 yards</Text>
                </View>
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600' }}>Q3 05:45 - 2nd & 2</Text>
                  <Text style={{ color: colors.textMid, fontSize: 11 }}>Rush for 3 yards, first down</Text>
                </View>
                <View>
                  <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600' }}>Q3 06:12 - 1st & 10</Text>
                  <Text style={{ color: colors.textMid, fontSize: 11 }}>Incomplete pass</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Weather & Conditions Card */}
        <Card style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              Game Conditions
            </Text>
            
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              marginBottom: 12
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMid, fontSize: 12, marginBottom: 4 }}>Weather</Text>
                <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600' }}>Clear, 72°F</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMid, fontSize: 12, marginBottom: 4 }}>Wind</Text>
                <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600' }}>5 mph NW</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMid, fontSize: 12, marginBottom: 4 }}>Stadium</Text>
                <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600' }}>Arrowhead</Text>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
