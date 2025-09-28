import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, ActivityIndicator, ScrollView } from 'react-native';
import { Card } from './ui';
import { colors, spacing } from '@/theme/tokens';
import { sharpSportsService, PrizePicksStats } from '@/services/sharpsports';

interface PrizePicksCardProps {
  onConnect?: () => void;
}

export const PrizePicksCard: React.FC<PrizePicksCardProps> = ({ onConnect }) => {
  const [stats, setStats] = useState<PrizePicksStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up authentication token (in a real app, this would come from your auth system)
    const token = 'demo_token';
    sharpSportsService.setToken(token);
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, use mock data directly to avoid API connection issues
      const mockData: PrizePicksStats = {
        totalBalance: 245.50,
        totalWagered: 1250.75,
        totalWon: 980.25,
        winRate: 0.62,
        currentStreak: 3,
        recentBets: [
          {
            id: 'demo_bet_1',
            status: 'won',
            stake: 10.00,
            potentialWin: 32.50,
            actualWin: 32.50,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            picksCount: 2
          },
          {
            id: 'demo_bet_2',
            status: 'pending',
            stake: 15.00,
            potentialWin: 63.00,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            picksCount: 2
          }
        ],
        connected: true
      };
      setStats(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PrizePicks data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLinking(true);
      setError(null);
      
      // Simulate connection process
      setTimeout(() => {
        setLinking(false);
        loadStats(); // Load the mock data
        onConnect?.();
      }, 1500);
      
      // Open PrizePicks website to simulate the connection flow
      await Linking.openURL('https://prizepicks.com');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize connection');
      setLinking(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setError(null);
      // Simulate refresh
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh account');
    }
  };

  const openPrizePicks = () => {
    Linking.openURL('https://prizepicks.com');
  };

  if (loading) {
    return (
      <Card style={{ marginBottom: spacing(1), backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1 }}>
        <View style={{ padding: spacing(1.5) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '700' }}>🏆 PrizePicks</Text>
            <ActivityIndicator size="small" color={colors.ppPurple} />
          </View>
        </View>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ marginBottom: spacing(1), backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1 }}>
        <View style={{ padding: spacing(1.5) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(1) }}>
            <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '700' }}>🏆 PrizePicks</Text>
            <TouchableOpacity
              onPress={handleConnect}
              style={{
                backgroundColor: colors.ppPurple,
                paddingHorizontal: spacing(2),
                paddingVertical: spacing(1),
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>Connect</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: colors.error, fontSize: 11, textAlign: 'center' }}>Connection Error</Text>
        </View>
      </Card>
    );
  }

  if (!stats?.connected) {
    return (
      <Card style={{ marginBottom: spacing(1), backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1 }}>
        <View style={{ padding: spacing(1.5) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '700' }}>🏆 PrizePicks</Text>
              <Text style={{ color: colors.textMid, fontSize: 11 }}>Connect to see stats</Text>
            </View>
            <TouchableOpacity
              onPress={handleConnect}
              disabled={linking}
              style={{
                backgroundColor: colors.ppPurple,
                paddingHorizontal: spacing(2),
                paddingVertical: spacing(1),
                borderRadius: 6,
                opacity: linking ? 0.7 : 1,
              }}
            >
              <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>
                {linking ? 'Connecting...' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: spacing(1), backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1 }}>
      <View style={{ padding: spacing(1.5) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(1) }}>
          <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '700' }}>🏆 PrizePicks</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            style={{
              backgroundColor: colors.neutralChip,
              paddingHorizontal: spacing(1.5),
              paddingVertical: spacing(0.5),
              borderRadius: 4,
              borderWidth: 1,
              borderColor: colors.steel,
            }}
          >
            <Text style={{ color: colors.textMid, fontSize: 10 }}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Compact Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing(1) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.mint, fontSize: 12, marginRight: spacing(0.5) }}>💰</Text>
            <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600' }}>
              ${stats.totalBalance.toFixed(0)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.gold, fontSize: 12, marginRight: spacing(0.5) }}>🏆</Text>
            <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600' }}>
              {stats.currentStreak}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.mint, fontSize: 12, marginRight: spacing(0.5) }}>📈</Text>
            <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600' }}>
              {(stats.winRate * 100).toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={openPrizePicks}
            style={{
              backgroundColor: colors.neutralChip,
              paddingHorizontal: spacing(1.5),
              paddingVertical: spacing(0.5),
              borderRadius: 4,
              borderWidth: 1,
              borderColor: colors.steel,
            }}
          >
            <Text style={{ color: colors.textHigh, fontSize: 10, fontWeight: '600' }}>🔗 Open</Text>
          </TouchableOpacity>
          <Text style={{ color: colors.textMid, fontSize: 10 }}>
            {stats.recentBets.length} recent bets
          </Text>
        </View>
      </View>
    </Card>
  );
};
