import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Alert, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { Card, Button, Badge } from '@/components/ui';
import { useStore } from '@/store/AppStore';
import { ProphetPoll } from '@/components/ProphetPoll';
import { ActionChannel } from '@/components/ActionChannel';
import { PartyChat } from '@/components/PartyChat';
import { BackendTestComponent } from '@/components/BackendTestComponent';

interface BoardScreenProps {
  navigation: any;
}

export const BoardScreen: React.FC<BoardScreenProps> = ({ navigation }) => {
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

  const [activeTab, setActiveTab] = useState<'live' | 'parlays'>('live');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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

  // Mock data for the new UI
  const clutchTimeEvents = [
    {
      id: '1',
      game: 'KC @ BUF',
      user: 'Riley',
      text: 'over/under 50.5 yards',
      progress: 97,
      current: 49,
      total: 50.5,
      isClutch: true
    },
    {
      id: '2', 
      game: 'SF @ DAL',
      user: 'Kai',
      text: 'team total over 23.5 points',
      progress: 95,
      current: 22.3,
      total: 23.5,
      isClutch: false
    }
  ];

  const parlayOfDay = {
    id: '1',
    user: 'Alex',
    picks: [
      { game: 'KC @ BUF', bet: 'over/under 50.5 yards', status: 'live' },
      { game: 'SF @ DAL', bet: 'team total over 23.5 points', status: 'live' },
      { game: 'MIA @ NE', bet: 'team total over 29.5 points', status: 'live' }
    ],
    odds: '+450',
    status: 'live'
  };

  const liveLegs = [
    {
      id: '1',
      game: 'KC @ BUF',
      time: 'Q3 03:59',
      score: '33-29',
      bet: 'over/under 50.5 yards',
      user: 'Riley',
      legProgress: 97,
      parlayProgress: 100,
      current: 49,
      total: 50.5
    },
    {
      id: '2',
      game: 'SF @ DAL', 
      time: 'Q4 01:12',
      score: '24-29',
      bet: 'team total over 23.5 points',
      user: 'Kai',
      legProgress: 95,
      parlayProgress: 100,
      current: 22.3,
      total: 23.5
    },
    {
      id: '3',
      game: 'MIA @ NE',
      time: 'Q4 06:52', 
      score: '23-22',
      bet: 'team total over 29.5 points',
      user: 'Sam',
      legProgress: 87,
      parlayProgress: 91,
      current: 25.7,
      total: 29.5
    }
  ];

  const allParlays = [
    {
      id: '1',
      user: 'Riley',
      picks: [
        { game: 'KC @ BUF', bet: 'over/under 50.5 yards', status: 'live' },
        { game: 'SF @ DAL', bet: 'team total over 23.5 points', status: 'live' }
      ],
      odds: '+280',
      status: 'live'
    },
    {
      id: '2',
      user: 'Kai', 
      picks: [
        { game: 'SF @ DAL', bet: 'team total over 23.5 points', status: 'live' },
        { game: 'MIA @ NE', bet: 'team total over 29.5 points', status: 'live' }
      ],
      odds: '+320',
      status: 'live'
    }
  ];

  // Dropdown data
  const gameOptions = [
    { value: 'all', label: 'All Games' },
    { value: 'KC @ BUF', label: 'KC @ BUF' },
    { value: 'SF @ DAL', label: 'SF @ DAL' },
    { value: 'MIA @ NE', label: 'MIA @ NE' }
  ];

  const userOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'Riley', label: 'Riley' },
    { value: 'Kai', label: 'Kai' },
    { value: 'Sam', label: 'Sam' },
    { value: 'Alex', label: 'Alex' }
  ];

  const renderClutchTimeSection = () => (
    <View style={{ height: 200, marginBottom: spacing(2) }}>
      <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
        Clutch Time
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {clutchTimeEvents.length > 0 ? (
          clutchTimeEvents.map((event) => (
            <Pressable 
              key={event.id}
              onPress={() => {
                navigation.navigate('ClutchVote', {
                  game: event.game,
                  user: event.user,
                  bet: event.text,
                  progress: event.progress,
                  current: event.current,
                  total: event.total
                });
              }}
            >
              <Card style={{ 
                width: Dimensions.get('window').width - 80, 
                marginRight: 12,
                backgroundColor: event.isClutch ? colors.gold : colors.slate,
                borderColor: event.isClutch ? colors.gold : colors.steel,
                borderWidth: 1
              }}>
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ color: colors.textLow, fontSize: 12 }}>{event.game} • {event.user}</Text>
                  </View>
          
                  <Text style={{ 
                    color: event.isClutch ? '#000' : colors.textHigh, 
                    fontSize: 16, 
                    fontWeight: '700',
                    marginBottom: 12
                  }}>
                    {event.text}
                  </Text>
                  
                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ color: event.isClutch ? '#000' : colors.textLow, fontSize: 12, marginBottom: 4 }}>
                      Leg progress
                    </Text>
                    <View style={{ 
                      height: 6, 
                      backgroundColor: event.isClutch ? 'rgba(0,0,0,0.2)' : colors.steel, 
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}>
                      <View style={{ 
                        height: '100%', 
                        width: `${event.progress}%`, 
                        backgroundColor: colors.mint,
                        borderRadius: 3
                      }} />
                    </View>
                    <Text style={{ color: event.isClutch ? '#000' : colors.textLow, fontSize: 12, marginTop: 4 }}>
                      {event.current}/{event.total} • {event.progress}%
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))
        ) : (
          <Card style={{ 
            width: Dimensions.get('window').width - 80, 
            backgroundColor: colors.slate,
            borderColor: colors.steel,
            borderWidth: 1
          }}>
            <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Text style={{ color: colors.textMid, fontSize: 16, textAlign: 'center' }}>
                No clutch moments right now
              </Text>
              <Text style={{ color: colors.textLow, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                Stay tuned for exciting plays!
              </Text>
            </View>
          </Card>
          )}
      </ScrollView>
        </View>
  );

  const renderPickOfDay = () => (
    <Card style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>⭐ Pick of the Day</Text>
              <Badge color={colors.chip}>
                <Text style={{ fontSize: 10 }}>⭐ Streak {podStreak}</Text>
              </Badge>
            </View>
            
        {pickOfDay ? (
          <>
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
          </>
        ) : (
          <Text style={{ color: colors.textMid, fontSize: 14, textAlign: 'center' }}>
            No pick of the day available
          </Text>
        )}
      </View>
    </Card>
  );

  const renderParlayOfDay = () => (
    <Card style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>Parlay of the Day</Text>
          <Button variant="secondary" onPress={() => Alert.alert('Add Parlay', 'Add your own parlay of the day')}>
            <Text style={{ fontSize: 12 }}>+ Add</Text>
          </Button>
        </View>
        
        <Pressable 
          onPress={() => {
            // Navigate to parlay details
            navigation.navigate('ParlayDetail', {
              parlay: parlayOfDay
            });
          }}
        >
          <View style={{ 
            backgroundColor: colors.slate, 
            borderRadius: 12, 
            padding: 12, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.steel
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '600' }}>By {parlayOfDay.user}</Text>
              <Badge color={colors.primary}>{parlayOfDay.odds}</Badge>
            </View>
            
            {parlayOfDay.picks.map((pick, index) => (
              <View key={index} style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: 4
              }}>
                <Text style={{ color: colors.textMid, fontSize: 12 }}>{pick.game}</Text>
                <Text style={{ color: colors.textHigh, fontSize: 12 }}>{pick.bet}</Text>
              </View>
            ))}
          </View>
        </Pressable>
        
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button 
            style={{ flex: 1, backgroundColor: colors.mint }}
            onPress={() => Alert.alert('Tail', 'Tailing this parlay!')}
          >
            <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>Tail</Text>
          </Button>
          <Button 
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => Alert.alert('Fade', 'Fading this parlay!')}
          >
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Fade</Text>
          </Button>
        </View>
      </View>
    </Card>
  );

  const renderLiveLegs = () => (
    <View style={{ marginBottom: spacing(2) }}>
      <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
        Live Legs - Everyone
      </Text>
      
      {liveLegs.map((leg) => (
        <Pressable 
          key={leg.id}
          onPress={() => {
            navigation.navigate('GameDetail', {
              game: leg.game,
              bet: leg.bet,
              user: leg.user,
              progress: leg.legProgress,
              current: leg.current,
              total: leg.total,
              timeLeft: leg.time,
              quarter: leg.time.split(' ')[0],
              score: leg.score
            });
          }}
        >
          <Card style={{ 
            marginBottom: 12, 
            backgroundColor: colors.slate,
            borderColor: colors.steel,
            borderWidth: 1
          }}>
            <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: colors.textLow, fontSize: 12 }}>{leg.game}</Text>
              <Text style={{ color: colors.textLow, fontSize: 12 }}>{leg.time} • {leg.score}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '700' }}>{leg.bet}</Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>By {leg.user} • Line {leg.total}</Text>
              </View>
              <Image 
                source={{ uri: avatarUrl(leg.user) }} 
                style={{ width: 32, height: 32, borderRadius: 16 }} 
              />
            </View>
            
            <View style={{ marginBottom: 8 }}>
              <Text style={{ color: colors.textLow, fontSize: 12, marginBottom: 4 }}>Leg progress</Text>
              <View style={{ 
                height: 6, 
                backgroundColor: colors.steel, 
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <View style={{ 
                  height: '100%', 
                  width: `${leg.legProgress}%`, 
                  backgroundColor: colors.mint,
                  borderRadius: 3
                }} />
              </View>
              <Text style={{ color: colors.textLow, fontSize: 12, marginTop: 4 }}>
                {leg.current}/{leg.total} • {leg.legProgress}%
              </Text>
            </View>
            
            <View>
              <Text style={{ color: colors.textLow, fontSize: 12, marginBottom: 4 }}>{leg.user}'s parlay</Text>
              <View style={{ 
                height: 6, 
                backgroundColor: colors.steel, 
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <View style={{ 
                  height: '100%', 
                  width: `${leg.parlayProgress}%`, 
                  backgroundColor: colors.primary,
                  borderRadius: 3
                }} />
              </View>
              <Text style={{ color: colors.textLow, fontSize: 12, marginTop: 4 }}>
                {leg.parlayProgress}%
              </Text>
            </View>
          </View>
        </Card>
        </Pressable>
      ))}
    </View>
  );

  const renderDropdown = (options: any[], selectedValue: string, onSelect: (value: string) => void, isVisible: boolean, onToggle: () => void) => (
    <View style={{ flex: 1, marginRight: 8 }}>
      <Pressable 
        style={{
          backgroundColor: colors.slate,
          borderColor: colors.steel,
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onPress={onToggle}
      >
        <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600' }}>
          {options.find(opt => opt.value === selectedValue)?.label || 'Select...'}
        </Text>
        <Text style={{ color: colors.textMid, fontSize: 12 }}>
          {isVisible ? '▲' : '▼'}
        </Text>
      </Pressable>
      
      {isVisible && (
        <View style={{
          position: 'absolute',
          top: 45,
          left: 0,
          right: 0,
          backgroundColor: colors.slate,
          borderColor: colors.steel,
          borderWidth: 1,
          borderRadius: 8,
          zIndex: 1000,
          maxHeight: 200
        }}>
          <ScrollView style={{ maxHeight: 200 }}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.steel,
                  backgroundColor: selectedValue === option.value ? colors.primary : 'transparent'
                }}
                onPress={() => {
                  onSelect(option.value);
                  onToggle();
                }}
              >
                <Text style={{ 
                  color: selectedValue === option.value ? '#000' : colors.textHigh, 
                  fontSize: 12,
                  fontWeight: selectedValue === option.value ? '600' : '400'
                }}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderAllParlays = () => (
    <View style={{ marginBottom: spacing(2) }}>
      <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
        All Parlays
      </Text>
      
      {/* Filter Dropdowns */}
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {renderDropdown(
          gameOptions,
          selectedGame,
          setSelectedGame,
          showGameDropdown,
          () => {
            setShowGameDropdown(!showGameDropdown);
            setShowUserDropdown(false);
          }
        )}
        {renderDropdown(
          userOptions,
          selectedUser,
          setSelectedUser,
          showUserDropdown,
          () => {
            setShowUserDropdown(!showUserDropdown);
            setShowGameDropdown(false);
          }
        )}
      </View>
      
      {allParlays
        .filter(parlay => {
          const gameMatch = selectedGame === 'all' || parlay.picks.some(pick => pick.game === selectedGame);
          const userMatch = selectedUser === 'all' || parlay.user === selectedUser;
          return gameMatch && userMatch;
        })
        .map((parlay) => (
        <Pressable 
          key={parlay.id}
          onPress={() => {
            navigation.navigate('ParlayDetail', {
              parlay: parlay
            });
          }}
        >
          <Card style={{ 
            marginBottom: 12, 
            backgroundColor: colors.slate,
            borderColor: colors.steel,
            borderWidth: 1
          }}>
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '600' }}>By {parlay.user}</Text>
                <Badge color={colors.primary}>{parlay.odds}</Badge>
              </View>
              
              {parlay.picks.map((pick, index) => (
                <View key={index} style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingVertical: 4
                }}>
                  <Text style={{ color: colors.textMid, fontSize: 12 }}>{pick.game}</Text>
                  <Text style={{ color: colors.textHigh, fontSize: 12 }}>{pick.bet}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ink }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: spacing(2),
        borderBottomWidth: 1,
        borderBottomColor: colors.steel
      }}>
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

      {/* Tab Navigation */}
      <View style={{ 
        flexDirection: 'row', 
        backgroundColor: colors.ink,
        margin: spacing(2),
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.steel
      }}>
        <Pressable 
          style={{ 
            flex: 1, 
            paddingVertical: 12, 
            paddingHorizontal: 16,
            backgroundColor: activeTab === 'live' ? colors.slate : 'transparent',
            borderRadius: 8,
            borderWidth: activeTab === 'live' ? 1 : 0,
            borderColor: activeTab === 'live' ? colors.steel : 'transparent'
          }}
          onPress={() => setActiveTab('live')}
        >
          <Text style={{ 
            color: activeTab === 'live' ? colors.textHigh : colors.textMid, 
            fontSize: 14, 
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Party Picks
          </Text>
        </Pressable>
        <Pressable 
          style={{ 
            flex: 1, 
            paddingVertical: 12, 
            paddingHorizontal: 16,
            backgroundColor: activeTab === 'parlays' ? colors.slate : 'transparent',
            borderRadius: 8,
            borderWidth: activeTab === 'parlays' ? 1 : 0,
            borderColor: activeTab === 'parlays' ? colors.steel : 'transparent'
          }}
          onPress={() => setActiveTab('parlays')}
        >
          <Text style={{ 
            color: activeTab === 'parlays' ? colors.textHigh : colors.textMid, 
            fontSize: 14, 
            fontWeight: '600',
            textAlign: 'center'
          }}>
            All Parlays
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing(2) }}>
        {activeTab === 'live' ? (
          <>
            {renderClutchTimeSection()}
            {renderPickOfDay()}
            {renderParlayOfDay()}
            {renderLiveLegs()}

      {/* Party Chat */}
      {currentParty && (
        <View style={{ marginTop: spacing(2) }}>
          <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Party Chat</Text>
          <PartyChat partyId={currentParty.id} />
        </View>
      )}
          </>
        ) : (
          <>
            {renderAllParlays()}
            <ActionChannel />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};