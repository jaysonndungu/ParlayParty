-- Complete ParlayParty Database Schema for Supabase
-- This creates all tables, indexes, triggers, and RLS policies for the full application

-- ============================================================================
-- 1. USER DATA
-- ============================================================================

-- Users table (already exists, but let's ensure it has all fields)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  profile_picture_url TEXT,
  wallet_balance DECIMAL(10,2) DEFAULT 1000.00,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
  avatar_settings JSONB DEFAULT '{}',
  connection_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User transaction history for wallet tracking
CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'buy_in', 'payout', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  party_id UUID REFERENCES parties(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. PARTY SYSTEM DATA
-- ============================================================================

-- Parties table (already exists, but let's ensure it has all fields)
CREATE TABLE IF NOT EXISTS parties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('friendly', 'competitive')),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  buy_in_amount DECIMAL(10,2) DEFAULT 0.00,
  prize_pool DECIMAL(10,2) DEFAULT 0.00,
  max_participants INTEGER DEFAULT 16,
  current_participants INTEGER DEFAULT 1,
  join_code VARCHAR(20) UNIQUE NOT NULL,
  allowed_sports TEXT[] DEFAULT ARRAY['NFL', 'NBA'],
  evaluation_settings JSONB DEFAULT '{"picks_to_evaluate": 5, "evaluation_period": "weekly"}',
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Party members table (already exists, but let's ensure it has all fields)
CREATE TABLE IF NOT EXISTS party_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_creator BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  buy_in_paid DECIMAL(10,2) DEFAULT 0.00,
  current_score INTEGER DEFAULT 0,
  total_picks INTEGER DEFAULT 0,
  correct_picks INTEGER DEFAULT 0,
  UNIQUE(party_id, user_id)
);

-- ============================================================================
-- 3. BETTING & PARLAY DATA
-- ============================================================================

-- Parlays table
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

-- Individual picks within parlays
CREATE TABLE IF NOT EXISTS parlay_picks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parlay_id UUID NOT NULL REFERENCES parlays(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  pick_type VARCHAR(20) NOT NULL CHECK (pick_type IN ('spread', 'total', 'moneyline', 'prop')),
  pick_value VARCHAR(50) NOT NULL,
  odds DECIMAL(8,2) NOT NULL,
  result VARCHAR(20) CHECK (result IN ('win', 'loss', 'push', 'pending')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pick of the Day
CREATE TABLE IF NOT EXISTS pick_of_day (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  pick_type VARCHAR(20) NOT NULL,
  pick_value VARCHAR(50) NOT NULL,
  odds DECIMAL(8,2) NOT NULL,
  date DATE NOT NULL,
  result VARCHAR(20) CHECK (result IN ('win', 'loss', 'push', 'pending')),
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 4. SOCIAL FEATURES
-- ============================================================================

-- Party chat messages (already exists)
CREATE TABLE IF NOT EXISTS party_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'celebration')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prophet polls
CREATE TABLE IF NOT EXISTS prophet_polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of poll options
  poll_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (poll_type IN ('multiple_choice', 'yes_no', 'rating')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Poll votes
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES prophet_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_id VARCHAR(50) NOT NULL,
  vote_value TEXT, -- For rating polls
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Parlay votes (hit/chalk predictions)
CREATE TABLE IF NOT EXISTS parlay_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parlay_id UUID NOT NULL REFERENCES parlays(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prediction VARCHAR(10) NOT NULL CHECK (prediction IN ('hit', 'chalk')),
  confidence_level INTEGER DEFAULT 5 CHECK (confidence_level BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parlay_id, voter_id)
);

-- Leaderboards (computed view)
CREATE TABLE IF NOT EXISTS party_leaderboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  correct_picks INTEGER DEFAULT 0,
  total_picks INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(party_id, user_id)
);

-- ============================================================================
-- 5. GAME SIMULATION DATA
-- ============================================================================

-- Games table
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

-- Game events (AI-generated play-by-play)
CREATE TABLE IF NOT EXISTS game_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  period VARCHAR(20),
  score_home INTEGER,
  score_away INTEGER,
  event_data JSONB DEFAULT '{}',
  is_clutch BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live updates and action events
CREATE TABLE IF NOT EXISTS live_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  event_data JSONB DEFAULT '{}',
  is_clutch BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at DESC);

-- Party indexes
CREATE INDEX IF NOT EXISTS idx_parties_creator_id ON parties(creator_id);
CREATE INDEX IF NOT EXISTS idx_parties_join_code ON parties(join_code);
CREATE INDEX IF NOT EXISTS idx_parties_start_date ON parties(start_date);
CREATE INDEX IF NOT EXISTS idx_parties_type ON parties(type);

-- Party member indexes
CREATE INDEX IF NOT EXISTS idx_party_members_party_id ON party_members(party_id);
CREATE INDEX IF NOT EXISTS idx_party_members_user_id ON party_members(user_id);
CREATE INDEX IF NOT EXISTS idx_party_members_active ON party_members(is_active);

-- Parlay indexes
CREATE INDEX IF NOT EXISTS idx_parlays_user_id ON parlays(user_id);
CREATE INDEX IF NOT EXISTS idx_parlays_party_id ON parlays(party_id);
CREATE INDEX IF NOT EXISTS idx_parlays_status ON parlays(status);
CREATE INDEX IF NOT EXISTS idx_parlays_created_at ON parlays(created_at DESC);

-- Pick indexes
CREATE INDEX IF NOT EXISTS idx_parlay_picks_parlay_id ON parlay_picks(parlay_id);
CREATE INDEX IF NOT EXISTS idx_parlay_picks_game_id ON parlay_picks(game_id);
CREATE INDEX IF NOT EXISTS idx_parlay_picks_result ON parlay_picks(result);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_party_chat_messages_party_id ON party_chat_messages(party_id);
CREATE INDEX IF NOT EXISTS idx_party_chat_messages_created_at ON party_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_party_chat_messages_user_id ON party_chat_messages(user_id);

-- Poll indexes
CREATE INDEX IF NOT EXISTS idx_prophet_polls_party_id ON prophet_polls(party_id);
CREATE INDEX IF NOT EXISTS idx_prophet_polls_status ON prophet_polls(status);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);

-- Game indexes
CREATE INDEX IF NOT EXISTS idx_games_sport ON games(sport);
CREATE INDEX IF NOT EXISTS idx_games_game_date ON games(game_date);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_game_events_game_id ON game_events(game_id);
CREATE INDEX IF NOT EXISTS idx_game_events_timestamp ON game_events(timestamp DESC);

-- Leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_party_leaderboards_party_id ON party_leaderboards(party_id);
CREATE INDEX IF NOT EXISTS idx_party_leaderboards_score ON party_leaderboards(total_score DESC);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON parties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_party_chat_messages_updated_at BEFORE UPDATE ON party_chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update party participant count
CREATE OR REPLACE FUNCTION update_party_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE parties SET current_participants = current_participants + 1 WHERE id = NEW.party_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE parties SET current_participants = current_participants - 1 WHERE id = OLD.party_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply participant count trigger
CREATE TRIGGER update_party_participants_trigger
  AFTER INSERT OR DELETE ON party_members
  FOR EACH ROW EXECUTE FUNCTION update_party_participants();

-- Function to update leaderboard when scores change
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO party_leaderboards (party_id, user_id, total_score, correct_picks, total_picks, win_rate, last_updated)
  VALUES (NEW.party_id, NEW.user_id, NEW.current_score, NEW.correct_picks, NEW.total_picks, 
          CASE WHEN NEW.total_picks > 0 THEN (NEW.correct_picks::DECIMAL / NEW.total_picks) * 100 ELSE 0 END, NOW())
  ON CONFLICT (party_id, user_id) 
  DO UPDATE SET 
    total_score = NEW.current_score,
    correct_picks = NEW.correct_picks,
    total_picks = NEW.total_picks,
    win_rate = CASE WHEN NEW.total_picks > 0 THEN (NEW.correct_picks::DECIMAL / NEW.total_picks) * 100 ELSE 0 END,
    last_updated = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply leaderboard update trigger
CREATE TRIGGER update_leaderboard_trigger
  AFTER UPDATE ON party_members
  FOR EACH ROW EXECUTE FUNCTION update_leaderboard();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE parlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE parlay_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pick_of_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prophet_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parlay_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage own profile" ON users;
DROP POLICY IF EXISTS "Allow profile creation" ON users;
DROP POLICY IF EXISTS "Anyone can view parties" ON parties;
DROP POLICY IF EXISTS "Users can create parties" ON parties;
DROP POLICY IF EXISTS "Users can update own parties" ON parties;
DROP POLICY IF EXISTS "Users can delete own parties" ON parties;
DROP POLICY IF EXISTS "Anyone can view party members" ON party_members;
DROP POLICY IF EXISTS "Users can join parties" ON party_members;
DROP POLICY IF EXISTS "Users can update own memberships" ON party_members;
DROP POLICY IF EXISTS "Users can leave parties" ON party_members;
DROP POLICY IF EXISTS "Users can view party chat messages" ON party_chat_messages;
DROP POLICY IF EXISTS "Users can send party chat messages" ON party_chat_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON party_chat_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON party_chat_messages;

-- User policies
CREATE POLICY "Users can manage own profile" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Allow profile creation" ON users FOR INSERT WITH CHECK (true);

-- Party policies
CREATE POLICY "Anyone can view parties" ON parties FOR SELECT USING (true);
CREATE POLICY "Users can create parties" ON parties FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Users can update own parties" ON parties FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Users can delete own parties" ON parties FOR DELETE USING (creator_id = auth.uid());

-- Party member policies
CREATE POLICY "Anyone can view party members" ON party_members FOR SELECT USING (true);
CREATE POLICY "Users can join parties" ON party_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own memberships" ON party_members FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can leave parties" ON party_members FOR DELETE USING (user_id = auth.uid());

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
CREATE POLICY "Users can delete own parlays" ON parlays FOR DELETE USING (user_id = auth.uid());

-- Pick policies
CREATE POLICY "Users can view parlay picks" ON parlay_picks FOR SELECT USING (
  parlay_id IN (SELECT id FROM parlays WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create parlay picks" ON parlay_picks FOR INSERT WITH CHECK (
  parlay_id IN (SELECT id FROM parlays WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own parlay picks" ON parlay_picks FOR UPDATE USING (
  parlay_id IN (SELECT id FROM parlays WHERE user_id = auth.uid())
);

-- Chat policies
CREATE POLICY "Users can view party chat messages" ON party_chat_messages FOR SELECT USING (
  party_id IN (SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Users can send party chat messages" ON party_chat_messages FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  party_id IN (SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Users can update own messages" ON party_chat_messages FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own messages" ON party_chat_messages FOR DELETE USING (user_id = auth.uid());

-- Poll policies
CREATE POLICY "Users can view party polls" ON prophet_polls FOR SELECT USING (
  party_id IN (SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Users can create polls" ON prophet_polls FOR INSERT WITH CHECK (
  creator_id = auth.uid() AND
  party_id IN (SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Users can update own polls" ON prophet_polls FOR UPDATE USING (creator_id = auth.uid());

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
CREATE POLICY "Users can update own votes" ON poll_votes FOR UPDATE USING (user_id = auth.uid());

-- Game policies (public read access)
CREATE POLICY "Anyone can view games" ON games FOR SELECT USING (true);
CREATE POLICY "Anyone can view game events" ON game_events FOR SELECT USING (true);
CREATE POLICY "Anyone can view live events" ON live_events FOR SELECT USING (true);

-- Leaderboard policies
CREATE POLICY "Users can view party leaderboards" ON party_leaderboards FOR SELECT USING (
  party_id IN (SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = true)
);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Party chat with user info (already exists, but let's ensure it's complete)
CREATE OR REPLACE VIEW party_chat_with_users AS
SELECT 
  pcm.id,
  pcm.party_id,
  pcm.user_id,
  pcm.message,
  pcm.message_type,
  pcm.created_at,
  pcm.updated_at,
  u.username,
  u.full_name,
  u.profile_picture_url
FROM party_chat_messages pcm
JOIN users u ON pcm.user_id = u.id
ORDER BY pcm.created_at ASC;

-- Party details with member count
CREATE OR REPLACE VIEW party_details AS
SELECT 
  p.*,
  u.username as creator_username,
  u.full_name as creator_name,
  COUNT(pm.user_id) as actual_participants
FROM parties p
LEFT JOIN users u ON p.creator_id = u.id
LEFT JOIN party_members pm ON p.id = pm.party_id AND pm.is_active = true
GROUP BY p.id, u.username, u.full_name;

-- User party summary
CREATE OR REPLACE VIEW user_party_summary AS
SELECT 
  u.id as user_id,
  u.username,
  u.full_name,
  COUNT(DISTINCT pm.party_id) as total_parties,
  COUNT(DISTINCT CASE WHEN pm.is_creator = true THEN pm.party_id END) as created_parties,
  SUM(pm.current_score) as total_score,
  AVG(pm.win_rate) as avg_win_rate
FROM users u
LEFT JOIN party_members pm ON u.id = pm.user_id AND pm.is_active = true
GROUP BY u.id, u.username, u.full_name;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample sports games
INSERT INTO games (sport, home_team, away_team, game_date, status, spread, total, home_moneyline, away_moneyline) VALUES
('NFL', 'Kansas City Chiefs', 'Buffalo Bills', NOW() + INTERVAL '2 days', 'scheduled', -3.5, 52.5, -180, 155),
('NFL', 'Dallas Cowboys', 'Philadelphia Eagles', NOW() + INTERVAL '3 days', 'scheduled', 2.5, 48.0, 120, -140),
('NBA', 'Los Angeles Lakers', 'Boston Celtics', NOW() + INTERVAL '1 day', 'scheduled', -4.0, 225.5, -190, 165),
('NBA', 'Golden State Warriors', 'Miami Heat', NOW() + INTERVAL '4 days', 'scheduled', 1.5, 220.0, 105, -125)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- This schema creates a complete database structure for ParlayParty
-- with all the features you outlined:
-- ✅ User Data (profiles, wallet, transactions, preferences)
-- ✅ Party System (parties, members, join codes, evaluation settings)
-- ✅ Betting & Parlay Data (parlays, picks, results, pick of the day)
-- ✅ Social Features (chat, polls, votes, leaderboards)
-- ✅ Game Simulation (games, events, live updates)
-- ✅ Performance indexes and RLS security policies
-- ✅ Triggers for automatic updates
-- ✅ Views for common queries
