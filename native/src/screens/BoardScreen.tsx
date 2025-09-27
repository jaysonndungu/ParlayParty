import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { Card, Button, Badge } from '@/components/ui';
import { useStore } from '@/store/AppStore';
import { ProphetPoll } from '@/components/ProphetPoll';
import { ActionChannel } from '@/components/ActionChannel';
import { PartyChat } from '@/components/PartyChat';
import { BackendTestComponent } from '@/components/BackendTestComponent';

export const BoardScreen: React.FC = () => {
  const { 
    currentParty, 
    partyPrizePools, 
    clutch, 
    poll, 
    resolvedOptionId, 
    votePoll,
    pickOfDay,
    podChoice,
    podStreak,
    handlePodPick,
    partyScores,
    me,
    user,
    logout
  } = useStore();

  const avatarUrl = (name: string) => {
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundType=gradientLinear,gradientRadial&shapeColor=6f4df8,8b5cf6,22c55e,F6C945`;
  };

  const playerImageUrl = (seed: string) => {
    const s = encodeURIComponent(seed);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${s}&backgroundColor=0E0F13&mouth=smile,smirk&top=shortHair,shortFlat,shortRound&accessories=round&hairColor=2e3442`;
  };

  const formatLine = (line: string) => {
    const l = line.toLowerCase();
    if (l.startsWith("o/u")) {
      const num = l.replace("o/u", "").trim();
      return { text: `over/under ${num} yards`, num };
    }
    if (l.startsWith("tt o")) {
      const num = l.replace("tt o", "").trim();
      return { text: `team total over ${num} points`, num };
    }
    if (l.startsWith("tt u")) {
      const num = l.replace("tt u", "").trim();
      return { text: `team total under ${num} points`, num };
    }
    return { text: line, num: line.replace(/[^0-9.]/g, "") };
  };

  const currentScores = currentParty ? partyScores[currentParty.id] || {} : {};
  const currentPrizePool = currentParty ? partyPrizePools[currentParty.id] || 0 : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ink }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing(2) }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(2) }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '800' }}>
            {currentParty?.name ?? 'ParlayParty'}
          </Text>
          {currentParty && (
            <Text style={{ color: colors.textMid, fontSize: 12, textTransform: 'capitalize' }}>
              {currentParty.type} party
            </Text>
          )}
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Badge color={colors.chip}>Points {currentScores[me] ?? 0}</Badge>
            {currentParty?.type === 'competitive' && currentPrizePool > 0 && (
              <Badge color={colors.gold}>Pool ${currentPrizePool}</Badge>
            )}
          </View>
          
          {user && (
            <Pressable 
              onPress={() => {
                // This would navigate to profile, but for now just show user info
                Alert.alert('User Info', `Logged in as ${user.username}\nEmail: ${user.email}\nWallet: $${user.walletBalance.toFixed(2)}`);
              }}
              style={{ alignItems: 'center' }}
            >
              <Image 
                source={{ uri: avatarUrl(user.fullName) }} 
                style={{ width: 40, height: 40, borderRadius: 20 }} 
              />
              <Text style={{ color: colors.textLow, fontSize: 10, marginTop: 2 }}>
                {user.username}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Clutch Time - Always visible to maintain layout */}
      <Card trophy style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>
              {clutch ? 'Clutch Time' : 'Live Action'}
            </Text>
            {clutch && (
              <Button variant="secondary" onPress={() => {/* Dismiss clutch */}}>
                <Text style={{ fontSize: 12 }}>Dismiss</Text>
              </Button>
            )}
          </View>
          
          {clutch ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Image 
                  source={{ uri: avatarUrl(clutch.user) }} 
                  style={{ width: 40, height: 40, borderRadius: 20 }} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textLow, fontSize: 12 }}>{clutch.game} • {clutch.user}</Text>
                  <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '700' }}>{clutch.text}</Text>
                </View>
              </View>
              
              {poll && !resolvedOptionId && (
                <ProphetPoll />
              )}
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ color: colors.textMid, fontSize: 16, textAlign: 'center' }}>
                No clutch moments right now
              </Text>
              <Text style={{ color: colors.textLow, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                Stay tuned for exciting plays!
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Pick of the Day */}
      {pickOfDay && (
        <Card trophy style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>⭐ Pick of the Day</Text>
              <Badge color={colors.chip}>
                <Text style={{ fontSize: 10 }}>⭐ Streak {podStreak}</Text>
              </Badge>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colors.textMid, fontSize: 14 }}>{pickOfDay.league} • {pickOfDay.game}</Text>
              <Badge color={colors.chip}>{pickOfDay.prop}</Badge>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>{pickOfDay.player}</Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>Line {pickOfDay.line}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button 
                  disabled={!!podChoice} 
                  onPress={() => handlePodPick("over")} 
                  style={{ backgroundColor: colors.mint }}
                >
                  <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>Over</Text>
                </Button>
                <Button 
                  disabled={!!podChoice} 
                  onPress={() => handlePodPick("under")} 
                  variant="secondary"
                >
                  <Text style={{ fontSize: 12, fontWeight: '600' }}>Under</Text>
                </Button>
              </View>
            </View>
            
            {podChoice && (
              <Text style={{ color: colors.textMid, fontSize: 12 }}>
                You picked {podChoice.toUpperCase()} {pickOfDay.resolved ? 
                  (pickOfDay.correct === podChoice ? "• Correct! +12" : "• Missed") : 
                  "• Resolving..."
                }
              </Text>
            )}
          </View>
        </Card>
      )}

      {/* Action Channel */}
      <ActionChannel />

      {/* Party Chat */}
      {currentParty && (
        <View style={{ marginTop: spacing(2) }}>
          <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Party Chat</Text>
          <PartyChat partyId={currentParty.id} />
        </View>
      )}

      {/* Backend Test Component */}
      <BackendTestComponent />
      </ScrollView>
    </SafeAreaView>
  );
};