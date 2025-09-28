-- Fix infinite recursion in RLS policies
-- Run this in your Supabase SQL Editor

-- Drop all existing policies
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

-- Create non-recursive policies
CREATE POLICY "Users can manage own profile" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Allow profile creation" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view parties" ON parties
    FOR SELECT USING (true);

CREATE POLICY "Users can create parties" ON parties
    FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update own parties" ON parties
    FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "Users can delete own parties" ON parties
    FOR DELETE USING (creator_id = auth.uid());

CREATE POLICY "Anyone can view party members" ON party_members
    FOR SELECT USING (true);

CREATE POLICY "Users can join parties" ON party_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own memberships" ON party_members
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can leave parties" ON party_members
    FOR DELETE USING (user_id = auth.uid());
