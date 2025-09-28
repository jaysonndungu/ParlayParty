import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { Card, Badge } from '@/components/ui';
import { useStore } from '@/store/AppStore';

interface ClutchVoteScreenProps {
  route: {
    params: {
      game: string;
      user: string;
      bet: string;
      progress: number;
      current: number;
      total: number;
    };
  };
  navigation: any;
}

export const ClutchVoteScreen: React.FC<ClutchVoteScreenProps> = ({ route, navigation }) => {
  const { game, user, bet, progress, current, total } = route.params;
  const [timeLeft, setTimeLeft] = useState(6); // 6 seconds timer
  const [hasVoted, setHasVoted] = useState(false);
  const [vote, setVote] = useState<'yes' | 'no' | null>(null);
  const { submitVote, simulation } = useStore();

  const avatarUrl = (name: string) => {
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundType=gradientLinear,gradientRadial&shapeColor=6f4df8,8b5cf6,22c55e,F6C945`;
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleVote = (voteType: 'yes' | 'no') => {
    if (!hasVoted && timeLeft > 0) {
      setVote(voteType);
      setHasVoted(true);
      // Add to My Polls as pending and resolve at game end
      const choice = voteType === 'yes' ? 'hit' : 'miss';
      const partyName = game;
      // Determine player side and meta from current simulation
      let meta: { playerSide: 'A'|'B'; playerName: string; overUnder: 'Over'|'Under'; line: number; type: string } | undefined;
      if (simulation.currentGame) {
        const a = simulation.currentGame.playerA;
        const b = simulation.currentGame.playerB;
        if (a.player === user) meta = { playerSide: 'A', playerName: a.player, overUnder: a.overUnder, line: a.line, type: a.type };
        if (b.player === user) meta = { playerSide: 'B', playerName: b.player, overUnder: b.overUnder, line: b.line, type: b.type };
      }
      const question = `Will ${user}'s prop (${bet}) hit?`;
      submitVote({ id: `clutchvote_${Date.now()}`, label: question, partyName, choice, isClutch: true, meta });
    }
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
          Clutch Vote
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', padding: spacing(2) }}>
        {/* Prophet Poll Card */}
        <Card style={{ 
          backgroundColor: colors.slate,
          borderColor: colors.steel,
          borderWidth: 1,
          borderTopWidth: 3,
          borderTopColor: colors.gold
        }}>
          <View style={{ padding: 20 }}>
            {/* Header */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 16 
            }}>
              <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '800' }}>
                Prophet Poll
              </Text>
              <Badge color={colors.gold}>
                <Text style={{ fontSize: 12, color: '#000', fontWeight: '700' }}>
                  {timeLeft}s
                </Text>
              </Badge>
            </View>

            {/* Question */}
            <Text style={{ 
              color: colors.textHigh, 
              fontSize: 16, 
              fontWeight: '600',
              marginBottom: 20,
              lineHeight: 22
            }}>
              Will {user}'s clutch parlay hit in {game}?
            </Text>

            {/* Bet Details */}
            <View style={{ 
              backgroundColor: colors.ink, 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 20 
            }}>
              <Text style={{ color: colors.textMid, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
                {bet}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Image 
                  source={{ uri: avatarUrl(user) }} 
                  style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }} 
                />
                <Text style={{ color: colors.textLow, fontSize: 12 }}>
                  By {user} • {current}/{total} yards ({progress}%)
                </Text>
              </View>
              <View style={{ 
                height: 4, 
                backgroundColor: colors.steel, 
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <View style={{ 
                  height: '100%', 
                  width: `${progress}%`, 
                  backgroundColor: colors.mint,
                  borderRadius: 2
                }} />
              </View>
            </View>

            {/* Vote Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: vote === 'yes' ? colors.mint : colors.chip,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: vote === 'yes' ? colors.mint : colors.steel,
                  opacity: hasVoted && vote !== 'yes' ? 0.5 : 1
                }}
                onPress={() => handleVote('yes')}
                disabled={hasVoted || timeLeft === 0}
              >
                <Text style={{ 
                  color: vote === 'yes' ? '#000' : colors.textHigh, 
                  fontSize: 14, 
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Yes, it hits
                </Text>
              </Pressable>

              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: vote === 'no' ? colors.primary : colors.chip,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: vote === 'no' ? colors.primary : colors.steel,
                  opacity: hasVoted && vote !== 'no' ? 0.5 : 1
                }}
                onPress={() => handleVote('no')}
                disabled={hasVoted || timeLeft === 0}
              >
                <Text style={{ 
                  color: vote === 'no' ? '#000' : colors.textHigh, 
                  fontSize: 14, 
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  No, it misses
                </Text>
              </Pressable>
            </View>

            {/* Vote Status */}
            {hasVoted && (
              <View style={{ 
                marginTop: 16, 
                padding: 12, 
                backgroundColor: colors.ink, 
                borderRadius: 8,
                alignItems: 'center'
              }}>
                <Text style={{ 
                  color: colors.textHigh, 
                  fontSize: 14, 
                  fontWeight: '600' 
                }}>
                  You voted: {vote === 'yes' ? 'Yes, it hits' : 'No, it misses'}
                </Text>
                <Text style={{ 
                  color: colors.textLow, 
                  fontSize: 12, 
                  marginTop: 4 
                }}>
                  Results will be shown when the poll closes
                </Text>
              </View>
            )}

            {timeLeft === 0 && !hasVoted && (
              <View style={{ 
                marginTop: 16, 
                padding: 12, 
                backgroundColor: colors.ink, 
                borderRadius: 8,
                alignItems: 'center'
              }}>
                <Text style={{ 
                  color: colors.textMid, 
                  fontSize: 14, 
                  fontWeight: '600' 
                }}>
                  Time's up! Poll closed.
                </Text>
              </View>
            )}
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
};
