import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { useStore } from '@/store/AppStore';
import { Badge, Card, Button } from '@/components/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MyPollsScreen: React.FC = () => {
  const { myPolls, podChoice, podStreak } = useStore();
  const [parlayOfTheDay, setParlayOfTheDay] = useState<any>(null);
  const [localPodChoice, setLocalPodChoice] = useState<"over" | "under" | null>(null);

  // Local handlePodPick that works independently
  const handleLocalPodPick = (choice: "over" | "under") => {
    console.log('handleLocalPodPick called with:', choice);
    setLocalPodChoice(choice);
  };

  // Load daily parlay selection from storage
  useEffect(() => {
    const loadDailySelection = async () => {
      try {
        const today = new Date().toDateString();
        const stored = await AsyncStorage.getItem(`daily_parlay_${today}`);
        if (stored) {
          const selection = JSON.parse(stored);
          // Find the parlay data and create the parlay of the day
          const allParlays = [
            // Riley's Parlays
            {
              id: '1',
              user: 'Riley',
              picks: [
                { game: 'KC @ BUF', bet: 'Patrick Mahomes Over 2.5 Passing TDs', status: 'live' },
                { game: 'KC @ BUF', bet: 'Josh Allen Over 250.5 Passing Yards', status: 'live' }
              ],
              odds: '+280',
              status: 'live'
            },
            {
              id: '2',
              user: 'Riley',
              picks: [
                { game: 'SF @ DAL', bet: 'Brock Purdy Over 1.5 Passing TDs', status: 'live' },
                { game: 'SF @ DAL', bet: 'Christian McCaffrey Under 85.5 Rushing Yards', status: 'live' },
                { game: 'SF @ DAL', bet: 'George Kittle Over 5.5 Receptions', status: 'live' }
              ],
              odds: '+520',
              status: 'live'
            },
            // Alex's Parlays
            {
              id: '3',
              user: 'Alex',
              picks: [
                { game: 'KC @ BUF', bet: 'Travis Kelce Over 6.5 Receptions', status: 'live' },
                { game: 'KC @ BUF', bet: 'Stefon Diggs Under 85.5 Receiving Yards', status: 'live' }
              ],
              odds: '+320',
              status: 'live'
            },
            {
              id: '4',
              user: 'Alex',
              picks: [
                { game: 'SF @ DAL', bet: 'Dak Prescott Over 275.5 Passing Yards', status: 'live' },
                { game: 'SF @ DAL', bet: 'CeeDee Lamb Over 7.5 Receptions', status: 'live' },
                { game: 'SF @ DAL', bet: 'Tony Pollard Under 70.5 Rushing Yards', status: 'live' },
                { game: 'SF @ DAL', bet: 'Game Total Over 48.5 Points', status: 'live' },
                { game: 'SF @ DAL', bet: 'Brandon Aiyuk Under 60.5 Receiving Yards', status: 'live' }
              ],
              odds: '+1200',
              status: 'live'
            },
            // Jordan's Parlays
            {
              id: '5',
              user: 'Jordan',
              picks: [
                { game: 'KC @ BUF', bet: 'Josh Allen Over 1.5 Passing TDs', status: 'live' },
                { game: 'KC @ BUF', bet: 'Patrick Mahomes Under 275.5 Passing Yards', status: 'live' },
                { game: 'KC @ BUF', bet: 'James Cook Over 45.5 Rushing Yards', status: 'live' }
              ],
              odds: '+450',
              status: 'live'
            },
            {
              id: '6',
              user: 'Jordan',
              picks: [
                { game: 'SF @ DAL', bet: 'Christian McCaffrey Over 85.5 Rushing Yards', status: 'live' },
                { game: 'SF @ DAL', bet: 'Brock Purdy Under 1.5 Passing TDs', status: 'live' }
              ],
              odds: '+280',
              status: 'live'
            },
            // Sam's Parlays
            {
              id: '7',
              user: 'Sam',
              picks: [
                { game: 'KC @ BUF', bet: 'Isiah Pacheco Over 35.5 Rushing Yards', status: 'live' },
                { game: 'KC @ BUF', bet: 'Travis Kelce Under 5.5 Receptions', status: 'live' },
                { game: 'KC @ BUF', bet: 'Game Total Under 52.5 Points', status: 'live' },
                { game: 'KC @ BUF', bet: 'Stefon Diggs Over 7.5 Receptions', status: 'live' }
              ],
              odds: '+680',
              status: 'live'
            },
            {
              id: '8',
              user: 'Sam',
              picks: [
                { game: 'SF @ DAL', bet: 'George Kittle Over 5.5 Receptions', status: 'live' },
                { game: 'SF @ DAL', bet: 'Dak Prescott Over 275.5 Passing Yards', status: 'live' }
              ],
              odds: '+320',
              status: 'live'
            },
            // Taylor's Parlays
            {
              id: '9',
              user: 'Taylor',
              picks: [
                { game: 'KC @ BUF', bet: 'Josh Allen Over 45.5 Rushing Yards', status: 'live' },
                { game: 'KC @ BUF', bet: 'Patrick Mahomes Over 2.5 Passing TDs', status: 'live' },
                { game: 'KC @ BUF', bet: 'Stefon Diggs Over 100.5 Receiving Yards', status: 'live' },
                { game: 'KC @ BUF', bet: 'Travis Kelce Over 80.5 Receiving Yards', status: 'live' },
                { game: 'KC @ BUF', bet: 'James Cook Under 45.5 Rushing Yards', status: 'live' },
                { game: 'KC @ BUF', bet: 'Game Total Over 52.5 Points', status: 'live' }
              ],
              odds: '+1500',
              status: 'live'
            },
            {
              id: '10',
              user: 'Taylor',
              picks: [
                { game: 'SF @ DAL', bet: 'Christian McCaffrey Under 85.5 Rushing Yards', status: 'live' },
                { game: 'SF @ DAL', bet: 'Brock Purdy Over 1.5 Passing TDs', status: 'live' },
                { game: 'SF @ DAL', bet: 'CeeDee Lamb Under 80.5 Receiving Yards', status: 'live' }
              ],
              odds: '+380',
              status: 'live'
            }
          ];
          
          const selectedParlay = allParlays.find(p => p.id === selection.parlayId);
          if (selectedParlay) {
            let modifiedPicks;
            if (selection.action === 'tail') {
              modifiedPicks = selectedParlay.picks;
            } else {
              modifiedPicks = selectedParlay.picks.map(pick => ({
                ...pick,
                bet: pick.bet.includes('Over') 
                  ? pick.bet.replace('Over', 'Under')
                  : pick.bet.replace('Under', 'Over')
              }));
            }

            setParlayOfTheDay({
              ...selectedParlay,
              picks: modifiedPicks,
              action: selection.action,
              originalUser: selectedParlay.user
            });
          }
        }
      } catch (error) {
        console.error('Error loading daily selection:', error);
      }
    };

    loadDailySelection();
  }, []);

  const renderParlayOfDay = () => (
    <Card style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>
            Parlay of the Day
          </Text>
          {parlayOfTheDay && (
            <Badge color={colors.error}>
              <Text style={{ color: '#000', fontSize: 10, fontWeight: '600' }}>
                {parlayOfTheDay.action === 'tail' ? 'TAIL' : 'FADE'}
              </Text>
            </Badge>
          )}
        </View>
        
        {parlayOfTheDay ? (
          <View style={{ 
            backgroundColor: colors.slate, 
            borderRadius: 12, 
            padding: 12,
            borderWidth: 1,
            borderColor: colors.steel
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600' }}>
                {parlayOfTheDay.originalUser}
              </Text>
              <Badge color={colors.primary}>{parlayOfTheDay.odds}</Badge>
            </View>
            
            {parlayOfTheDay.picks.map((pick, index) => (
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
        ) : (
          <View style={{ 
            backgroundColor: colors.chip, 
            borderRadius: 12, 
            padding: 16,
            borderWidth: 1,
            borderColor: colors.steel
          }}>
            <Text style={{ color: colors.textMid, fontSize: 14, textAlign: 'center' }}>
              Select a friend's parlay to Tail or Fade
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderPickOfDay = () => (
    <Card style={{ marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>⭐ Pick of the Day</Text>
          <Badge color={colors.error}>
            <Text style={{ fontSize: 10, color: '#fff' }}>⭐ Streak {podStreak}</Text>
          </Badge>
        </View>
        
        {/* Points Info */}
        <View style={{ backgroundColor: colors.chip, padding: 8, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ color: colors.textMid, fontSize: 11, textAlign: 'center' }}>
            🏆 40 points + streak bonus
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: colors.textMid, fontSize: 14 }}>NFL • PHI @ DAL</Text>
          <Badge color={colors.chip}>Passing Yds</Badge>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>Jalen Hurts</Text>
            <Text style={{ color: colors.textLow, fontSize: 12 }}>Line 225.5</Text>
          </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button 
            disabled={!!localPodChoice}
            onPress={() => handleLocalPodPick('over')}
            style={{ backgroundColor: colors.mint }}
          >
            <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>Over</Text>
          </Button>
          <Button 
            disabled={!!localPodChoice}
            onPress={() => handleLocalPodPick('under')}
            variant="secondary"
          >
            <Text style={{ fontSize: 12, fontWeight: '600' }}>Under</Text>
          </Button>
        </View>
      </View>
      
      {localPodChoice && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              You selected Jalen Hurts {localPodChoice} 225.5 passing yards
            </Text>
            
            {/* Game Tracker */}
            <View style={{ 
              backgroundColor: colors.chip,
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.steel
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '700' }}>
                    0
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '700' }}>
                    225.5
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </Card>
  );
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ink }}>
      <View style={{ flex: 1, padding: spacing(2) }}>
        <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '700', marginBottom: spacing(2) }}>My Polls</Text>
      
      {renderPickOfDay()}

      {renderParlayOfDay()}
      </View>
    </SafeAreaView>
  );
};