-- ParlayParty Database Schema
-- PostgreSQL Database Schema for Parties and Related Data

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    profile_photo_url TEXT,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- PARTIES TABLE
-- ============================================================================

CREATE TABLE parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('friendly', 'competitive')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    join_code VARCHAR(12) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    
    -- Party metadata
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT false,
    
    -- Competitive party fields
    buy_in DECIMAL(10,2),
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    current_participants INTEGER DEFAULT 1,
    
    -- Evaluation settings
    evaluation_limit INTEGER DEFAULT 5,
    evaluation_period VARCHAR(20) DEFAULT 'daily' CHECK (evaluation_period IN ('daily', 'weekly', 'monthly')),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    CONSTRAINT valid_duration CHECK (end_date - start_date <= INTERVAL '1 year'),
    CONSTRAINT valid_buy_in CHECK (type = 'friendly' OR (type = 'competitive' AND buy_in > 0)),
);

-- ============================================================================
-- PARTY_MEMBERS TABLE
-- ============================================================================

CREATE TABLE party_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_creator BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    total_score INTEGER DEFAULT 0,
    buy_in_paid DECIMAL(10,2),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(party_id, user_id),
    CONSTRAINT valid_buy_in_paid CHECK (buy_in_paid IS NULL OR buy_in_paid >= 0)
);

-- ============================================================================
-- PARTY_ALLOWED_SPORTS TABLE
-- ============================================================================

CREATE TABLE party_allowed_sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    sport VARCHAR(20) NOT NULL CHECK (sport IN ('NFL', 'NBA', 'MLB', 'NHL', 'NCAAB', 'NCAAF', 'MLS', 'UFC')),
    
    UNIQUE(party_id, sport)
);

-- ============================================================================
-- PARLAYS TABLE
-- ============================================================================

CREATE TABLE parlays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Parlay details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sport VARCHAR(20) NOT NULL,
    total_odds DECIMAL(8,2),
    stake DECIMAL(10,2) DEFAULT 0.00,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
    result VARCHAR(20) CHECK (result IN ('hit', 'chalk')),
    decided_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    is_public BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}'
);

-- ============================================================================
-- PARLAY_PICKS TABLE
-- ============================================================================

CREATE TABLE parlay_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parlay_id UUID NOT NULL REFERENCES parlays(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Pick details
    game_id VARCHAR(100) NOT NULL,
    game_title VARCHAR(200) NOT NULL,
    pick_type VARCHAR(50) NOT NULL, -- 'spread', 'total', 'moneyline', 'prop'
    pick_value VARCHAR(100) NOT NULL, -- 'over 44.5', 'Lakers -3.5', etc.
    odds DECIMAL(8,2) NOT NULL,
    
    -- Result tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
    result VARCHAR(20) CHECK (result IN ('hit', 'chalk')),
    decided_at TIMESTAMP WITH TIME ZONE,
    
    -- Order within parlay
    pick_order INTEGER NOT NULL
);

-- ============================================================================
-- PARTY_CHAT_MESSAGES TABLE
-- ============================================================================

CREATE TABLE party_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Message content
    text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'bet_alert', 'result_alert')),
    
    -- Metadata
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    reply_to_id UUID REFERENCES party_chat_messages(id)
);

-- ============================================================================
-- POLLS TABLE
-- ============================================================================

CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Poll details
    question TEXT NOT NULL,
    poll_type VARCHAR(20) DEFAULT 'single' CHECK (poll_type IN ('single', 'multiple')),
    is_anonymous BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
    resolved_option_id UUID
);

-- ============================================================================
-- POLL_OPTIONS TABLE
-- ============================================================================

CREATE TABLE poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Option details
    label VARCHAR(200) NOT NULL,
    description TEXT,
    vote_count INTEGER DEFAULT 0,
    
    -- Order
    option_order INTEGER NOT NULL
);

-- ============================================================================
-- POLL_VOTES TABLE
-- ============================================================================

CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(poll_id, user_id, option_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Parties indexes
CREATE INDEX idx_parties_created_by ON parties(created_by);
CREATE INDEX idx_parties_status ON parties(status);
CREATE INDEX idx_parties_type ON parties(type);
CREATE INDEX idx_parties_join_code ON parties(join_code);
CREATE INDEX idx_parties_dates ON parties(start_date, end_date);
CREATE INDEX idx_parties_search ON parties USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Party members indexes
CREATE INDEX idx_party_members_party_id ON party_members(party_id);
CREATE INDEX idx_party_members_user_id ON party_members(user_id);
CREATE INDEX idx_party_members_active ON party_members(party_id, is_active);

-- Parlays indexes
CREATE INDEX idx_parlays_party_id ON parlays(party_id);
CREATE INDEX idx_parlays_user_id ON parlays(user_id);
CREATE INDEX idx_parlays_status ON parlays(status);
CREATE INDEX idx_parlays_created_at ON parlays(created_at);

-- Chat messages indexes
CREATE INDEX idx_chat_messages_party_id ON party_chat_messages(party_id);
CREATE INDEX idx_chat_messages_created_at ON party_chat_messages(created_at);

-- Polls indexes
CREATE INDEX idx_polls_party_id ON polls(party_id);
CREATE INDEX idx_polls_status ON polls(status);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON parties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parlays_updated_at BEFORE UPDATE ON parlays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate join codes
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update party current_participants count
CREATE OR REPLACE FUNCTION update_party_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE parties 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.party_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE parties 
        SET current_participants = current_participants - 1 
        WHERE id = OLD.party_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update participant count
CREATE TRIGGER update_party_participant_count_trigger
    AFTER INSERT OR DELETE ON party_members
    FOR EACH ROW EXECUTE FUNCTION update_party_participant_count();

