import React, { useState, useEffect } from 'react';
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
    logout,
    simulation,
    startGameSimulation,
    stopGameSimulation
  } = useStore();

  const [activeTab, setActiveTab] = useState<'live' | 'parlays' | 'chat'>('live');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Make liveLegs and allParlays stateful so simulation can update them
  // Dummy data should be ONE game with 2 teams and 2 player props
  const [liveLegs, setLiveLegs] = useState([
    {
      id: '1',
      game: 'KC @ BUF',
      time: 'Q1 15:00',
      score: '0-0',
      bet: 'Patrick Mahomes Over 2.5 Passing TDs',
      user: 'Riley',
      legProgress: 0,
      parlayProgress: 0,
      current: 0,
      total: 2.5
    },
    {
      id: '2',
      game: 'KC @ BUF', 
      time: 'Q1 15:00',
      score: '0-0',
      bet: 'Josh Allen Over 250.5 Passing Yards',
      user: 'Kai',
      legProgress: 0,
      parlayProgress: 0,
      current: 0,
      total: 250.5
    }
  ]);

  const [allParlays, setAllParlays] = useState([
    {
      id: '1',
      user: 'Riley',
      picks: [
        { game: 'KC @ BUF', bet: 'Patrick Mahomes Over 2.5 Passing TDs', status: 'live' },
        { game: 'KC @ BUF', bet: 'Josh Allen Over 250.5 Passing Yards', status: 'live' }
      ],
      odds: '+280',
      status: 'live'
    }
  ]);

  // Listen to simulation changes and update UI accordingly
  useEffect(() => {
    if (simulation.isRunning && simulation.currentGame && simulation.currentPlay) {
      const gameString = `${simulation.currentGame.teamA.abbreviation} @ ${simulation.currentGame.teamB.abbreviation}`;
      const scoreString = `${simulation.currentPlay.team_A_score}-${simulation.currentPlay.team_B_score}`;
      const timeString = `Q${simulation.currentPlay.quarter} ${simulation.currentPlay.game_clock}`;
      
      // Get current stats for each player
      const playerACurrent = simulation.playerAStats ? simulation.playerAStats[simulation.currentGame.playerA.type as keyof typeof simulation.playerAStats] || 0 : 0;
      const playerBCurrent = simulation.playerBStats ? simulation.playerBStats[simulation.currentGame.playerB.type as keyof typeof simulation.playerBStats] || 0 : 0;
      
      // Update live legs with simulation data
      const newLiveLegs = [
        {
          id: 'sim_1',
          game: gameString,
          time: timeString,
          score: scoreString,
          bet: `${simulation.currentGame.playerA.player} ${simulation.currentGame.playerA.overUnder} ${simulation.currentGame.playerA.line} ${simulation.currentGame.playerA.prop}`,
          user: 'AI Simulation',
          legProgress: 0, // Not used anymore
          parlayProgress: 0, // Not used anymore
          current: playerACurrent,
          total: simulation.currentGame.playerA.line
        },
        {
          id: 'sim_2',
          game: gameString,
          time: timeString,
          score: scoreString,
          bet: `${simulation.currentGame.playerB.player} ${simulation.currentGame.playerB.overUnder} ${simulation.currentGame.playerB.line} ${simulation.currentGame.playerB.prop}`,
          user: 'AI Simulation',
          legProgress: 0, // Not used anymore
          parlayProgress: 0, // Not used anymore
          current: playerBCurrent,
          total: simulation.currentGame.playerB.line
        }
      ];
      
      setLiveLegs(newLiveLegs);
      
      // Update all parlays with simulation data
      const newAllParlays = [
        {
          id: 'sim_parlay',
          user: 'AI Simulation',
          picks: [
            { game: gameString, bet: `${simulation.currentGame.playerA.player} ${simulation.currentGame.playerA.overUnder} ${simulation.currentGame.playerA.line} ${simulation.currentGame.playerA.prop}`, status: 'live' },
            { game: gameString, bet: `${simulation.currentGame.playerB.player} ${simulation.currentGame.playerB.overUnder} ${simulation.currentGame.playerB.line} ${simulation.currentGame.playerB.prop}`, status: 'live' }
          ],
          odds: '+450',
          status: 'live'
        }
      ];
      
      setAllParlays(newAllParlays);
    } else if (!simulation.isRunning && simulation.currentGame && simulation.playerAStats && simulation.playerBStats) {
      // Show final results when simulation ends
      const gameString = `${simulation.currentGame.teamA.abbreviation} @ ${simulation.currentGame.teamB.abbreviation}`;
      
      // Get final stats for each player
      const playerACurrent = simulation.playerAStats[simulation.currentGame.playerA.type as keyof typeof simulation.playerAStats] || 0;
      const playerBCurrent = simulation.playerBStats[simulation.currentGame.playerB.type as keyof typeof simulation.playerBStats] || 0;
      
      // Determine final outcomes based on Over/Under
      const playerAOutcome = simulation.currentGame.playerA.overUnder === 'Over' ? 
        (playerACurrent > simulation.currentGame.playerA.line ? 'CASH!' : 'CHALK!') :
        (playerACurrent < simulation.currentGame.playerA.line ? 'CASH!' : 'CHALK!');
      
      const playerBOutcome = simulation.currentGame.playerB.overUnder === 'Over' ? 
        (playerBCurrent > simulation.currentGame.playerB.line ? 'CASH!' : 'CHALK!') :
        (playerBCurrent < simulation.currentGame.playerB.line ? 'CASH!' : 'CHALK!');
      
      // Update live legs with final results
      const newLiveLegs = [
        {
          id: 'sim_1',
          game: gameString,
          time: 'FINAL',
          score: 'GAME OVER',
          bet: `${simulation.currentGame.playerA.player} ${simulation.currentGame.playerA.overUnder} ${simulation.currentGame.playerA.line} ${simulation.currentGame.playerA.prop}`,
          user: 'AI Simulation',
          legProgress: 0,
          parlayProgress: 0,
          current: playerACurrent,
          total: simulation.currentGame.playerA.line,
          finalOutcome: playerAOutcome
        },
        {
          id: 'sim_2',
          game: gameString,
          time: 'FINAL',
          score: 'GAME OVER',
          bet: `${simulation.currentGame.playerB.player} ${simulation.currentGame.playerB.overUnder} ${simulation.currentGame.playerB.line} ${simulation.currentGame.playerB.prop}`,
          user: 'AI Simulation',
          legProgress: 0,
          parlayProgress: 0,
          current: playerBCurrent,
          total: simulation.currentGame.playerB.line,
          finalOutcome: playerBOutcome
        }
      ];
      
      setLiveLegs(newLiveLegs);
      
      // Update all parlays with final results
      const newAllParlays = [
        {
          id: 'sim_parlay',
          user: 'AI Simulation',
          picks: [
            { game: gameString, bet: `${simulation.currentGame.playerA.player} ${simulation.currentGame.playerA.overUnder} ${simulation.currentGame.playerA.line} ${simulation.currentGame.playerA.prop}`, status: playerAOutcome === 'CASH!' ? 'win' : 'loss' },
            { game: gameString, bet: `${simulation.currentGame.playerB.player} ${simulation.currentGame.playerB.overUnder} ${simulation.currentGame.playerB.line} ${simulation.currentGame.playerB.prop}`, status: playerBOutcome === 'CASH!' ? 'win' : 'loss' }
          ],
          odds: '+450',
          status: 'final'
        }
      ];
      
      setAllParlays(newAllParlays);
    } else if (!simulation.isRunning && simulation.currentGame === null) {
      // Reset to original dummy data when simulation stops
      setLiveLegs([
        {
          id: '1',
          game: 'KC @ BUF',
          time: 'Q1 15:00',
          score: '0-0',
          bet: 'Patrick Mahomes Over 2.5 Passing TDs',
          user: 'Riley',
          legProgress: 0,
          parlayProgress: 0,
          current: 0,
          total: 2.5
        },
        {
          id: '2',
          game: 'KC @ BUF', 
          time: 'Q1 15:00',
          score: '0-0',
          bet: 'Josh Allen Over 250.5 Passing Yards',
          user: 'Kai',
          legProgress: 0,
          parlayProgress: 0,
          current: 0,
          total: 250.5
        }
      ]);
      
      setAllParlays([
        {
          id: '1',
          user: 'Riley',
          picks: [
            { game: 'KC @ BUF', bet: 'Patrick Mahomes Over 2.5 Passing TDs', status: 'live' },
            { game: 'KC @ BUF', bet: 'Josh Allen Over 250.5 Passing Yards', status: 'live' }
          ],
          odds: '+280',
          status: 'live'
        }
      ]);
    }
  }, [simulation.isRunning, simulation.currentGame, simulation.currentPlay, simulation.playIndex, simulation.playerAStats, simulation.playerBStats]);

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
      
      {/* Game Simulation Button */}
      <View style={{ marginBottom: 16 }}>
        <Button 
          variant="primary"
          onPress={simulation.isRunning ? stopGameSimulation : startGameSimulation}
          disabled={simulation.simulationError !== null}
          style={{ 
            backgroundColor: simulation.isRunning ? colors.error : colors.primary,
            marginBottom: 8
          }}
        >
          <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>
            {simulation.isRunning ? 'Stop Simulation' : 'Game Simulation'}
          </Text>
        </Button>
        
        {simulation.simulationError && (
          <Text style={{ color: colors.error, fontSize: 12, textAlign: 'center' }}>
            {simulation.simulationError}
          </Text>
        )}
        
        {simulation.isRunning && simulation.currentGame && (
          <Text style={{ color: colors.textMid, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            {simulation.currentGame.teamA.abbreviation} @ {simulation.currentGame.teamB.abbreviation} • 
            Play {simulation.playIndex + 1} of {simulation.currentGame.gameScript.length}
          </Text>
        )}
      </View>
      
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
              <Text style={{ color: colors.textLow, fontSize: 12, marginBottom: 4 }}>Current Stats</Text>
              <View style={{ 
                backgroundColor: colors.chip,
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.steel
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '700' }}>
                    {leg.current}
                  </Text>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textMid, fontSize: 12 }}>Line</Text>
                    <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '600' }}>
                      {leg.total}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textMid, fontSize: 12 }}>Status</Text>
                    <Text style={{ 
                      color: leg.finalOutcome ? 
                        (leg.finalOutcome === 'CASH!' ? colors.gold : colors.error) : 
                        colors.textMid, 
                      fontSize: 14, 
                      fontWeight: '600' 
                    }}>
                      {leg.finalOutcome || 'LIVE'}
                    </Text>
                  </View>
                </View>
              </View>
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
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ 
            width: 50, 
            height: 50, 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            {/* Group of people icon */}
            <View style={{ position: 'relative', width: 40, height: 30 }}>
              {/* Main person (foreground) */}
              <View style={{
                position: 'absolute',
                left: 8,
                top: 5,
                width: 12,
                height: 20,
                backgroundColor: colors.primary,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#000'
              }} />
              {/* Person behind left */}
              <View style={{
                position: 'absolute',
                left: 2,
                top: 8,
                width: 10,
                height: 16,
                backgroundColor: colors.primary,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#000',
                opacity: 0.8
              }} />
              {/* Person behind right */}
              <View style={{
                position: 'absolute',
                left: 18,
                top: 8,
                width: 10,
                height: 16,
                backgroundColor: colors.primary,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#000',
                opacity: 0.8
              }} />
            </View>
          </View>
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

        {/* Chat Tab */}
        <Pressable
          style={{
            flex: 1,
            padding: spacing(1.5),
            backgroundColor: activeTab === 'chat' ? colors.slate : 'transparent',
            borderRadius: 8,
            borderWidth: activeTab === 'chat' ? 1 : 0,
            borderColor: activeTab === 'chat' ? colors.steel : 'transparent'
          }}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={{ 
            color: activeTab === 'chat' ? colors.textHigh : colors.textMid, 
            fontSize: 14, 
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Chat
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === 'chat' ? (
        currentParty ? (
          <PartyChat partyId={currentParty.id} partyName={currentParty.name} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing(4) }}>
            <Text style={{ color: colors.textMid, fontSize: 16, textAlign: 'center' }}>
              Join a party to start chatting! 🎉
            </Text>
          </View>
        )
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing(2) }}>
          {activeTab === 'live' ? (
            <>
              {renderClutchTimeSection()}
              {renderPickOfDay()}
              {renderParlayOfDay()}
              {renderLiveLegs()}
            </>
          ) : (
            <>
              {renderAllParlays()}
              <ActionChannel />
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};