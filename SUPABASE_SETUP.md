# Supabase Setup Guide for ParlayParty

This guide will help you set up Supabase for your ParlayParty app.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `parlayparty`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your users
6. Click "Create new project"
7. Wait for the project to be set up (2-3 minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Update Your App Configuration

1. Open `native/src/lib/supabase.ts`
2. Replace the placeholder values:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
```

## 4. Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  wallet_balance DECIMAL(10,2) DEFAULT 1000.00,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create parties table
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('friendly', 'competitive')) NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  buy_in_amount DECIMAL(10,2) DEFAULT 0,
  prize_pool DECIMAL(10,2) DEFAULT 0,
  allowed_sports TEXT[] DEFAULT ARRAY['NFL', 'NBA'],
  max_members INTEGER DEFAULT 16,
  current_participants INTEGER DEFAULT 1,
  join_code TEXT UNIQUE NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create party_members table
CREATE TABLE party_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_creator BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  buy_in_paid DECIMAL(10,2),
  UNIQUE(party_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_party_members_party_id ON party_members(party_id);
CREATE INDEX idx_party_members_user_id ON party_members(user_id);
CREATE INDEX idx_parties_join_code ON parties(join_code);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON parties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and update their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can see parties they're members of
CREATE POLICY "Users can view their parties" ON parties
    FOR SELECT USING (
        creator_id = auth.uid() OR 
        id IN (SELECT party_id FROM party_members WHERE user_id = auth.uid() AND is_active = TRUE)
    );

-- Users can create parties
CREATE POLICY "Users can create parties" ON parties
    FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Users can update parties they created
CREATE POLICY "Users can update own parties" ON parties
    FOR UPDATE USING (creator_id = auth.uid());

-- Users can see party members for their parties
CREATE POLICY "Users can view party members" ON party_members
    FOR SELECT USING (
        user_id = auth.uid() OR 
        party_id IN (SELECT id FROM parties WHERE creator_id = auth.uid())
    );

-- Users can join parties
CREATE POLICY "Users can join parties" ON party_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can leave parties
CREATE POLICY "Users can leave parties" ON party_members
    FOR UPDATE USING (user_id = auth.uid());
```

4. Click "Run" to execute the SQL

## 5. Set Up Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:8081`
3. Under **Redirect URLs**, add:
   - `http://localhost:8081`
   - `exp://localhost:8081`
   - `exp://10.90.171.235:8081` (your local IP)

## 6. Test Your Setup

1. Start your React Native app: `cd native && npx expo start`
2. Try to register a new user
3. Try to create a party
4. Check your Supabase dashboard to see if data is being created

## 7. Environment Variables (Optional)

For production, you can use environment variables:

1. Create a `.env` file in your `native` directory:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Update `native/src/lib/supabase.ts`:
```typescript
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
```

## Troubleshooting

- **"Invalid API key"**: Check that you copied the correct anon key
- **"Failed to create party"**: Make sure the database schema was created correctly
- **"User not authenticated"**: Check that authentication is working properly
- **"Row Level Security"**: Make sure RLS policies are set up correctly

## Next Steps

Once Supabase is set up:
1. Test user registration and login
2. Test party creation and joining
3. Verify data appears in your Supabase dashboard
4. Set up real-time subscriptions for live updates (optional)
