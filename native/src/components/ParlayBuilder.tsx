import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/theme/tokens';
import { Button, Card, Badge } from '@/components/ui';

export type ParlayLeg = { id: string; game: string; market: string; pick: string };

const MOCK_GAMES = {
  nfl: ["NYJ @ BUF", "KC @ LAC", "DAL @ PHI", "SF @ SEA"],
  nba: ["LAL @ DEN", "BOS @ MIA", "GSW @ PHX", "NYK @ MIL"],
};

const MOCK_MARKETS = ["Points", "Rebounds", "Assists", "Passing Yds", "Receiving Yds"];

interface ParlayBuilderProps {
  onSubmit: (legs: ParlayLeg[]) => void;
}

export const ParlayBuilder: React.FC<ParlayBuilderProps> = ({ onSubmit }) => {
  const [sport, setSport] = useState<"nfl"|"nba">("nfl");
  const [legs, setLegs] = useState<ParlayLeg[]>([]);
  const [game, setGame] = useState(MOCK_GAMES.nfl[0]);
  const [market, setMarket] = useState(MOCK_MARKETS[0]);
  const [pick, setPick] = useState("Over");

  const canAdd = legs.length < 5;
  const games = sport === "nfl" ? MOCK_GAMES.nfl : MOCK_GAMES.nba;

  const addLeg = () => {
    if (!canAdd) return;
    setLegs((l) => [
      ...l,
      { id: Math.random().toString(36).slice(2), game, market, pick },
    ]);
  };

  const reset = () => setLegs([]);

  const summary = useMemo(() => `${legs.length}-leg parlay`, [legs.length]);

  return (
    <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12 }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.steel }}>
        <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700' }}>Build a Parlay</Text>
      </View>
      <View style={{ padding: 16, gap: 16 }}>
        {/* Sport Selection */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.textMid, fontSize: 14 }}>Sport</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button 
              variant={sport === "nfl" ? "primary" : "secondary"} 
              onPress={() => {
                setSport("nfl");
                setGame(MOCK_GAMES.nfl[0]);
              }}
              style={{ flex: 1 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600' }}>NFL</Text>
            </Button>
            <Button 
              variant={sport === "nba" ? "primary" : "secondary"} 
              onPress={() => {
                setSport("nba");
                setGame(MOCK_GAMES.nba[0]);
              }}
              style={{ flex: 1 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600' }}>NBA</Text>
            </Button>
          </View>
        </View>

        {/* Game Selection */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.textMid, fontSize: 14 }}>Game</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {games.map((g) => (
              <Button
                key={g}
                variant={game === g ? "primary" : "secondary"}
                onPress={() => setGame(g)}
                style={{ minWidth: 80 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600' }}>{g}</Text>
              </Button>
            ))}
          </View>
        </View>

        {/* Market Selection */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.textMid, fontSize: 14 }}>Market</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MOCK_MARKETS.map((m) => (
              <Button
                key={m}
                variant={market === m ? "primary" : "secondary"}
                onPress={() => setMarket(m)}
                style={{ minWidth: 80 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600' }}>{m}</Text>
              </Button>
            ))}
          </View>
        </View>

        {/* Pick Selection */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.textMid, fontSize: 14 }}>Pick</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button 
              variant={pick === "Over" ? "primary" : "secondary"} 
              onPress={() => setPick("Over")}
              style={{ flex: 1 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600' }}>Over</Text>
            </Button>
            <Button 
              variant={pick === "Under" ? "primary" : "secondary"} 
              onPress={() => setPick("Under")}
              style={{ flex: 1 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600' }}>Under</Text>
            </Button>
            <Button 
              onPress={addLeg} 
              disabled={!canAdd} 
              variant="primary"
              style={{ backgroundColor: colors.primary }}
            >
              <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>Add Leg</Text>
            </Button>
          </View>
        </View>

        {/* Summary and Actions */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.textMid, fontSize: 14 }}>{summary}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button variant="secondary" onPress={reset}>
                <Text style={{ color: colors.textMid, fontSize: 12 }}>Reset</Text>
              </Button>
              <Button 
                disabled={legs.length < 2} 
                variant="primary"
                onPress={() => onSubmit(legs)}
                style={{ backgroundColor: colors.gold }}
              >
                <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>Place Picks</Text>
              </Button>
            </View>
          </View>
          
          {/* Legs List */}
          <View style={{ gap: 8 }}>
            {legs.map((leg) => (
              <View 
                key={leg.id} 
                style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: 12, 
                  backgroundColor: colors.chip, 
                  borderRadius: 8, 
                  borderWidth: 1, 
                  borderColor: colors.steel 
                }}
              >
                <Text style={{ color: colors.textHigh, fontSize: 14 }}>
                  {leg.game} • {leg.market} • <Text style={{ color: colors.primary }}>{leg.pick}</Text>
                </Text>
                <Badge color={colors.chip}>Leg</Badge>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Card>
  );
};
