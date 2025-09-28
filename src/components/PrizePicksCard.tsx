"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Trophy,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { sharpSportsService, PrizePicksStats, LinkData } from "@/services/sharpsports";

interface PrizePicksCardProps {
  onConnect?: () => void;
}

export function PrizePicksCard({ onConnect }: PrizePicksCardProps) {
  const [stats, setStats] = useState<PrizePicksStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up authentication token (in a real app, this would come from your auth system)
    const token = localStorage.getItem('auth_token') || 'demo_token';
    sharpSportsService.setToken(token);
    loadStats();

    // Listen for popup messages from the callback page
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SHARPSPORTS_CONNECTED') {
        loadStats(); // Refresh stats after connection
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sharpSportsService.getStats();
      setStats(data);
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
      const linkData: LinkData = await sharpSportsService.initializeAccountLinking();
      
      // Open the linking URL in a new window
      window.open(linkData.linkUrl, '_blank', 'width=800,height=600');
      
      // Show success message
      setTimeout(() => {
        setLinking(false);
        loadStats(); // Refresh stats after potential connection
        onConnect?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize connection');
      setLinking(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setError(null);
      await sharpSportsService.refreshAccount();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh account');
    }
  };

  if (loading) {
    return (
      <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
        <CardHeader>
          <CardTitle className="text-[color:var(--text-high)] flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[color:var(--gold)]" />
            PrizePicks Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-[color:var(--text-mid)]" />
            <span className="ml-2 text-[color:var(--text-mid)]">Loading PrizePicks data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
        <CardHeader>
          <CardTitle className="text-[color:var(--text-high)] flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[color:var(--error)]" />
            PrizePicks Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-[color:var(--error)] mb-4">{error}</p>
            <Button onClick={loadStats} variant="secondary" className="mr-2">
              Retry
            </Button>
            <Button onClick={handleConnect} className="bg-[color:var(--pp-purple)] text-black">
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect PrizePicks
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats?.connected) {
    return (
      <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
        <CardHeader>
          <CardTitle className="text-[color:var(--text-high)] flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[color:var(--gold)]" />
            PrizePicks Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="mb-4">
              <Trophy className="h-12 w-12 text-[color:var(--gold)] mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-[color:var(--text-high)] mb-2">
                Connect Your PrizePicks Account
              </h3>
              <p className="text-[color:var(--text-mid)] text-sm">
                Link your PrizePicks account to see your betting stats and recent picks in the parties tab.
              </p>
            </div>
            <Button 
              onClick={handleConnect} 
              disabled={linking}
              className="bg-[color:var(--pp-purple)] text-black"
            >
              {linking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect PrizePicks
                </>
              )}
            </Button>
            <p className="text-xs text-[color:var(--text-low)] mt-2">
              Secure connection via SharpSports API
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
      <CardHeader>
        <CardTitle className="text-[color:var(--text-high)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[color:var(--gold)]" />
            PrizePicks Stats
          </div>
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="secondary"
            className="text-[color:var(--text-mid)]"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-[color:var(--neutral-chip)] border border-[color:var(--steel-700)]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-4 w-4 text-[color:var(--mint)]" />
              <span className="text-lg font-bold text-[color:var(--text-high)]">
                ${stats.totalBalance.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-[color:var(--text-mid)]">Balance</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-[color:var(--neutral-chip)] border border-[color:var(--steel-700)]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-[color:var(--gold)]" />
              <span className="text-lg font-bold text-[color:var(--text-high)]">
                {stats.currentStreak}
              </span>
            </div>
            <p className="text-xs text-[color:var(--text-mid)]">Win Streak</p>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-[color:var(--neutral-chip)] border border-[color:var(--steel-700)]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-[color:var(--mint)]" />
              <span className="text-lg font-bold text-[color:var(--text-high)]">
                {(stats.winRate * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-[color:var(--text-mid)]">Win Rate</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-[color:var(--neutral-chip)] border border-[color:var(--steel-700)]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-4 w-4 text-[color:var(--gold)]" />
              <span className="text-lg font-bold text-[color:var(--text-high)]">
                ${stats.totalWagered.toFixed(0)}
              </span>
            </div>
            <p className="text-xs text-[color:var(--text-mid)]">Total Wagered</p>
          </div>
        </div>

        <Separator className="bg-[color:var(--steel-700)]" />

        {/* Recent Bets */}
        <div>
          <h4 className="text-sm font-semibold text-[color:var(--text-high)] mb-3">
            Recent Bets
          </h4>
          <div className="space-y-2">
            {stats.recentBets.length === 0 ? (
              <p className="text-xs text-[color:var(--text-mid)] text-center py-4">
                No recent bets found
              </p>
            ) : (
              stats.recentBets.map((bet) => (
                <div 
                  key={bet.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-[color:var(--neutral-chip)] border border-[color:var(--steel-700)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {bet.status === 'won' ? (
                        <TrendingUp className="h-3 w-3 text-[color:var(--mint)]" />
                      ) : bet.status === 'lost' ? (
                        <TrendingDown className="h-3 w-3 text-[color:var(--error)]" />
                      ) : (
                        <div className="h-3 w-3 rounded-full bg-[color:var(--warning)]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[color:var(--text-high)]">
                        ${bet.stake} → ${bet.potentialWin.toFixed(0)}
                      </p>
                      <p className="text-[10px] text-[color:var(--text-mid)]">
                        {bet.picksCount} picks • {new Date(bet.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={
                      bet.status === 'won' 
                        ? 'bg-[color:var(--mint)] text-black' 
                        : bet.status === 'lost'
                        ? 'bg-[color:var(--error)] text-white'
                        : 'bg-[color:var(--warning)] text-black'
                    }
                  >
                    {bet.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <Separator className="bg-[color:var(--steel-700)]" />

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="secondary" 
            className="flex-1"
            onClick={() => window.open('https://prizepicks.com', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open PrizePicks
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="flex-1"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
