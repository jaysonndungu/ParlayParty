import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { useStore } from '@/store/AppStore';
import { Badge, Card, Button } from '@/components/ui';

export const MyPollsScreen: React.FC = () => {
  const { myPolls, pickOfDay, podChoice, podStreak, handlePodPick } = useStore();
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  
  const handlePodSelection = (choice: "over" | "under") => {
    handlePodPick(choice);
    setShowConfirmation(true);
    // Hide confirmation after 3 seconds
    setTimeout(() => setShowConfirmation(false), 3000);
  };
  
  const renderPickOfDay = () => (
    <View style={{ marginBottom: spacing(2) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>⭐ Pick of the Day</Text>
        <Badge color={colors.error}>
          <Text style={{ fontSize: 10, color: '#fff' }}>⭐ Streak {podStreak}</Text>
        </Badge>
      </View>
      
      <Card style={{ 
        marginBottom: 12, 
        backgroundColor: colors.slate,
        borderColor: colors.steel,
        borderWidth: 1
      }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.textLow, fontSize: 12 }}>NFL • {pickOfDay?.game}</Text>
            <Text style={{ color: colors.textLow, fontSize: 12 }}>Pick of the Day</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '700' }}>
                {pickOfDay?.player} {pickOfDay?.prop} {pickOfDay?.line}
              </Text>
              <Text style={{ color: colors.textLow, fontSize: 12 }}>Pick of the Day</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.textMid, fontSize: 12 }}>Streak</Text>
              <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '600' }}>
                {podStreak}
              </Text>
            </View>
          </View>
          
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: colors.textLow, fontSize: 12, marginBottom: 4 }}>Your Pick</Text>
            <View style={{ 
              backgroundColor: colors.chip,
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.steel
            }}>
              {!podChoice ? (
                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
                  <Button 
                    onPress={() => handlePodSelection('over')}
                    style={{ backgroundColor: colors.mint, flex: 1 }}
                  >
                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>Over {pickOfDay?.line}</Text>
                  </Button>
                  <Button 
                    onPress={() => handlePodSelection('under')}
                    variant="secondary"
                    style={{ flex: 1 }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600' }}>Under {pickOfDay?.line}</Text>
                  </Button>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
                    {pickOfDay?.player} {pickOfDay?.prop} {pickOfDay?.line} - {podChoice === 'over' ? 'Over' : 'Under'}
                  </Text>
                  <Text style={{ color: colors.textMid, fontSize: 12 }}>
                    {showConfirmation ? '✅ Pick Locked In!' : 'Pick Submitted'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Points Info */}
          <View style={{ backgroundColor: colors.chip, padding: 8, borderRadius: 8 }}>
            <Text style={{ color: colors.textMid, fontSize: 11, textAlign: 'center' }}>
              🏆 40 points + streak bonus
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ink }}>
      <View style={{ flex: 1, padding: spacing(2) }}>
        <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '700', marginBottom: spacing(2) }}>My Polls</Text>
      
      {renderPickOfDay()}
      
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
                    item.status === 'CASH' ? colors.mint : 
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
    </SafeAreaView>
  );
};