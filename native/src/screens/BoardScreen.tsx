import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { Card, Button, Badge } from '@/components/ui';
import { useStore } from '@/store/AppStore';
import { ProphetPoll } from '@/components/ProphetPoll';
import { ActionChannel } from '@/components/ActionChannel';

export const BoardScreen: React.FC = () => {
  const { clutch, prizePool, parties, selectedPartyId, me, scores, pickOfDay, podChoice, podStreak, handlePodPick } = useStore();
  const party = parties.find(p => p.id === selectedPartyId);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ink, padding: spacing(2) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(2) }}>
        <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '800' }}>{party?.name ?? 'ParlayParty'}</Text>
        {party?.type !== 'friendly' && (
          <Badge color={colors.primary}>Pool ${prizePool}</Badge>
        )}
      </View>

      {/* Points + quick status */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(1) }}>
        <Badge>Points {scores[me] ?? 0}</Badge>
        {party && <Text style={{ color: colors.textLow, fontSize: 12 }}>{party.type} party</Text>}
      </View>

      {clutch && (
        <Card trophy style={{ padding: 12, marginBottom: spacing(2), borderColor: colors.primary, borderWidth: 1 }}>
          <Text style={{ color: colors.textLow, marginBottom: 6 }}>{clutch.game} • {clutch.user}</Text>
          <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 10 }}>{clutch.text}</Text>
          <ProphetPoll />
        </Card>
      )}

      {/* Pick of the Day */}
      {pickOfDay && (
        <Card trophy style={{ padding: 12, marginBottom: spacing(2), borderColor: colors.steel, borderWidth: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textHigh, fontWeight: '700' }}>Pick of the Day</Text>
            <Badge>
              <Text style={{ color: colors.textMid, fontSize: 12 }}>Streak {podStreak}</Text>
            </Badge>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: colors.textMid }}>{pickOfDay.league} • {pickOfDay.game}</Text>
              <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '700', marginTop: 4 }}>{pickOfDay.player}</Text>
              <Text style={{ color: colors.textLow, marginTop: 2 }}>Line {pickOfDay.line} • {pickOfDay.prop}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button variant='mint' onPress={() => handlePodPick('over')} disabled={!!podChoice}>Over</Button>
              <Button variant='secondary' onPress={() => handlePodPick('under')} disabled={!!podChoice}>Under</Button>
            </View>
          </View>
          {podChoice && (
            <Text style={{ color: colors.textMid, marginTop: 8 }}>
              You picked {podChoice.toUpperCase()} {pickOfDay.resolved ? (pickOfDay.correct === podChoice ? '• Correct! +12' : '• Missed') : '• Resolving...'}
            </Text>
          )}
        </Card>
      )}

      <Text style={{ color: colors.textHigh, fontWeight: '700', marginBottom: 8 }}>Action Channel</Text>
      <ActionChannel />
    </ScrollView>
  );
};