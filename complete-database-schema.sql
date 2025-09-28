-- ============================================================================
-- Fixed ParlayParty Database Schema for Supabase
-- ============================================================================

-- ============================================================================
-- 1. USER DATA
-- ============================================================================
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
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  current_participants INTEGER DEFAULT 1,
  join_code VARCHAR(20) UNIQUE NOT NULL,
  allowed_sports TEXT[] DEFAULT ARRAY['NFL', 'NBA'],
  evaluation_settings JSONB DEFAULT '{"picks_to_evaluate": 5, "evaluation_period": "weekly"}',
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  win_rate DECIMAL(5,2) DEFAULT 0.00,  -- ensure this column exists
  UNIQUE(party_id, user_id)
);

-- Safety: patch existing tables to add missing column
ALTER TABLE party_members
ADD COLUMN IF NOT EXISTS win_rate DECIMAL(5,2) DEFAULT 0.00;

-- ============================================================================
-- 3. GAME SIMULATION DATA
-- ============================================================================
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
-- 4. BETTING & PARLAY DATA
-- ============================================================================
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
-- 5. SOCIAL FEATURES
-- ============================================================================
CREATE TABLE IF NOT EXISTS party_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'celebration')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prophet_polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  poll_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (poll_type IN ('multiple_choice', 'yes_no', 'rating')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES prophet_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_id VARCHAR(50) NOT NULL,
  vote_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

CREATE TABLE IF NOT EXISTS parlay_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parlay_id UUID NOT NULL REFERENCES parlays(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prediction VARCHAR(10) NOT NULL CHECK (prediction IN ('hit', 'chalk')),
  confidence_level INTEGER DEFAULT 5 CHECK (confidence_level BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parlay_id, voter_id)
);

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
-- TRIGGERS & FUNCTIONS (with DROP safety)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_parties_updated_at ON parties;
CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON parties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_party_chat_messages_updated_at ON party_chat_messages;
CREATE TRIGGER update_party_chat_messages_updated_at BEFORE UPDATE ON party_chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_games_updated_at ON games;
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS (fixed user_party_summary)
-- ============================================================================
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
-- ADDITIONAL TRIGGERS & FUNCTIONS
-- ============================================================================

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

-- Trigger for participant count updates
DROP TRIGGER IF EXISTS update_party_participants_trigger ON party_members;
CREATE TRIGGER update_party_participants_trigger
  AFTER INSERT OR DELETE ON party_members
  FOR EACH ROW EXECUTE FUNCTION update_party_participants();

-- Function to update leaderboard when scores change
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO party_leaderboards (party_id, user_id, total_score, correct_picks, total_picks, win_rate, last_updated)
  VALUES (NEW.party_id, NEW.user_id, NEW.current_score, NEW.correct_picks, NEW.total_picks, NEW.win_rate, NOW())
  ON CONFLICT (party_id, user_id) 
  DO UPDATE SET 
    total_score = NEW.current_score,
    correct_picks = NEW.correct_picks,
    total_picks = NEW.total_picks,
    win_rate = NEW.win_rate,
    last_updated = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for leaderboard updates
DROP TRIGGER IF EXISTS update_leaderboard_trigger ON party_members;
CREATE TRIGGER update_leaderboard_trigger
  AFTER UPDATE ON party_members
  FOR EACH ROW EXECUTE FUNCTION update_leaderboard();

-- Function to track wallet balance changes
CREATE OR REPLACE FUNCTION track_wallet_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert transaction record when wallet balance changes
  IF OLD.wallet_balance != NEW.wallet_balance THEN
    INSERT INTO user_transactions (user_id, transaction_type, amount, description)
    VALUES (
      NEW.id,
      CASE 
        WHEN NEW.wallet_balance > OLD.wallet_balance THEN 'deposit'
        ELSE 'withdrawal'
      END,
      ABS(NEW.wallet_balance - OLD.wallet_balance),
      'Wallet balance updated'
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for wallet balance tracking
DROP TRIGGER IF EXISTS track_wallet_transaction_trigger ON users;
CREATE TRIGGER track_wallet_transaction_trigger
  AFTER UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION track_wallet_transaction();

-- ============================================================================
-- ADDITIONAL VIEWS
-- ============================================================================

-- Party chat with user info (needed for chat)
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

