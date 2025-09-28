-- Quick Setup for ParlayParty Database
-- Run this in your Supabase SQL Editor for immediate functionality

-- ============================================================================
-- ESSENTIAL TABLES ONLY (for immediate testing)
-- ============================================================================

-- 1. Users table (enhanced)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_settings JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS connection_preferences JSONB DEFAULT '{}';

-- 2. User transactions
CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'buy_in', 'payout', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  party_id UUID REFERENCES parties(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enhanced party members with scoring
ALTER TABLE party_members ADD COLUMN IF NOT EXISTS current_score INTEGER DEFAULT 0;
ALTER TABLE party_members ADD COLUMN IF NOT EXISTS total_picks INTEGER DEFAULT 0;
ALTER TABLE party_members ADD COLUMN IF NOT EXISTS correct_picks INTEGER DEFAULT 0;

-- 4. Parlays table
CREATE TABLE IF NOT EXISTS parlays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  total_odds DECIMAL(8,2),
  stake_amount DECIMAL(10,2) DEFAULT 0.00,
  potential_payout DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'won', 'lost', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  payout_amount DECIMAL(10,2)
);

-- 5. Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sport VARCHAR(20) NOT NULL,
  home_team VARCHAR(100) NOT NULL,
  away_team VARCHAR(100) NOT NULL,
  game_date TIMESTAMP WITH TIME ZONE NOT NULL,
  current_score_home INTEGER DEFAULT 0,
  current_score_away INTEGER DEFAULT 0,
  period VARCHAR(20) DEFAULT '1st',
  time_remaining VARCHAR(10),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'final', 'postponed', 'cancelled')),
  spread DECIMAL(4,1),
  total DECIMAL(4,1),
  home_moneyline INTEGER,
  away_moneyline INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Prophet polls
CREATE TABLE IF NOT EXISTS prophet_polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  poll_type VARCHAR(20) DEFAULT 'multiple_choice',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 7. Poll votes
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES prophet_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_id VARCHAR(50) NOT NULL,
  vote_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- ============================================================================
-- ESSENTIAL INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_parlays_user_id ON parlays(user_id);
CREATE INDEX IF NOT EXISTS idx_parlays_party_id ON parlays(party_id);
CREATE INDEX IF NOT EXISTS idx_games_sport ON games(sport);
CREATE INDEX IF NOT EXISTS idx_games_game_date ON games(game_date);
CREATE INDEX IF NOT EXISTS idx_prophet_polls_party_id ON prophet_polls(party_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);

-- ============================================================================
-- ESSENTIAL RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE prophet_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Transaction policies
CREATE POLICY "Users can view own transactions" ON user_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own transactions" ON user_transactions FOR INSERT WITH CHECK (user_id = auth.uid());

-- Parlay policies
CREATE POLICY "Users can view party parlays" ON parlays FOR SELECT USING (
  party_id IN (SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Users can create parlays" ON parlays FOR INSERT WITH CHECK (
  user_id = auth.uid() AND 
  party_id IN (SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Users can update own parlays" ON parlays FOR UPDATE USING (user_id = auth.uid());

-- Game policies (public read)
CREATE POLICY "Anyone can view games" ON games FOR SELECT USING (true);

-- Poll policies
CREATE POLICY "Users can view party polls" ON prophet_polls FOR SELECT USING (
  party_id IN (SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Users can create polls" ON prophet_polls FOR INSERT WITH CHECK (
  creator_id = auth.uid() AND
  party_id IN (SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = true)
);

-- Poll vote policies
CREATE POLICY "Users can view poll votes" ON poll_votes FOR SELECT USING (
  poll_id IN (SELECT id FROM prophet_polls WHERE party_id IN (
    SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = true
  ))
);
CREATE POLICY "Users can vote on polls" ON poll_votes FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  poll_id IN (SELECT id FROM prophet_polls WHERE party_id IN (
    SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = true
  ))
);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample games
INSERT INTO games (sport, home_team, away_team, game_date, status, spread, total, home_moneyline, away_moneyline) VALUES
('NFL', 'Kansas City Chiefs', 'Buffalo Bills', NOW() + INTERVAL '2 days', 'scheduled', -3.5, 52.5, -180, 155),
('NFL', 'Dallas Cowboys', 'Philadelphia Eagles', NOW() + INTERVAL '3 days', 'scheduled', 2.5, 48.0, 120, -140),
('NBA', 'Los Angeles Lakers', 'Boston Celtics', NOW() + INTERVAL '1 day', 'scheduled', -4.0, 225.5, -190, 165),
('NBA', 'Golden State Warriors', 'Miami Heat', NOW() + INTERVAL '4 days', 'scheduled', 1.5, 220.0, 105, -125)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- This quick setup adds the essential tables and functionality
-- for immediate testing while keeping the existing party system intact
