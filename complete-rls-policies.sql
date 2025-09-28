-- Complete RLS policies for party sharing and joining
-- Run this in your Supabase SQL Editor

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Allow profile creation for existing users" ON users;
DROP POLICY IF EXISTS "Users can manage own profile" ON users;

DROP POLICY IF EXISTS "Users can view their parties" ON parties;
DROP POLICY IF EXISTS "Users can view parties they created" ON parties;
DROP POLICY IF EXISTS "Users can create parties" ON parties;
DROP POLICY IF EXISTS "Users can update own parties" ON parties;

DROP POLICY IF EXISTS "Users can view party members" ON party_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON party_members;
DROP POLICY IF EXISTS "Users can join parties" ON party_members;
DROP POLICY IF EXISTS "Users can leave parties" ON party_members;
DROP POLICY IF EXISTS "Users can update their own memberships" ON party_members;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can manage their own profile
CREATE POLICY "Users can manage own profile" ON users
    FOR ALL USING (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation" ON users
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- PARTIES TABLE POLICIES
-- ============================================================================

-- Anyone can view all parties (for joining)
CREATE POLICY "Anyone can view parties" ON parties
    FOR SELECT USING (true);

-- Users can create parties
CREATE POLICY "Users can create parties" ON parties
    FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Users can update parties they created
CREATE POLICY "Users can update own parties" ON parties
    FOR UPDATE USING (creator_id = auth.uid());

-- Users can delete parties they created
CREATE POLICY "Users can delete own parties" ON parties
    FOR DELETE USING (creator_id = auth.uid());

-- ============================================================================
-- PARTY_MEMBERS TABLE POLICIES
-- ============================================================================

-- Users can view all party memberships (to see who's in parties)
CREATE POLICY "Anyone can view party members" ON party_members
    FOR SELECT USING (true);

-- Users can join parties
CREATE POLICY "Users can join parties" ON party_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own memberships (leave parties, etc.)
CREATE POLICY "Users can update own memberships" ON party_members
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own memberships (leave parties)
CREATE POLICY "Users can leave parties" ON party_members
    FOR DELETE USING (user_id = auth.uid());
