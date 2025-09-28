const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://nuqcvtoelfdymfouhmyz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51cWN2dG9lbGZkeW1mb3VobXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTMwMjUsImV4cCI6MjA3NDU4OTAyNX0.cUrV8K3qViDSgM-Dj2YPSaJczoKHaoMOYKiaFVG8xS8';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser',
  fullName: 'Test User'
};

const testParty = {
  name: 'Test Party',
  type: 'friendly',
  startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  buyIn: 0,
  allowedSports: ['NFL', 'NBA'],
  description: 'Test party for Supabase testing',
  isPrivate: false
};

async function testSupabase() {
  console.log('🧪 Starting Supabase Tests...\n');

  try {
    // Test 1: Sign up user
    console.log('1️⃣ Testing user signup...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          username: testUser.username,
          full_name: testUser.fullName,
        }
      }
    });

    if (signUpError) throw signUpError;
    console.log('✅ Signup successful:', signUpData);

    // Test 2: Sign in user
    console.log('\n2️⃣ Testing user signin...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    if (signInError) throw signInError;
    console.log('✅ Signin successful:', signInData);

    // Test 3: Create user profile
    console.log('\n3️⃣ Testing user profile creation...');
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: signInData.user.id,
        email: testUser.email,
        username: testUser.username,
        full_name: testUser.fullName,
        wallet_balance: 1000,
      })
      .select()
      .single();

    if (profileError) throw profileError;
    console.log('✅ Profile creation successful:', profileData);

    // Test 4: Create party
    console.log('\n4️⃣ Testing party creation...');
    const joinCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const { data: partyData, error: partyError } = await supabase
      .from('parties')
      .insert({
        name: testParty.name,
        type: testParty.type,
        creator_id: signInData.user.id,
        start_date: testParty.startDate,
        end_date: testParty.endDate,
        buy_in_amount: testParty.buyIn,
        prize_pool: 0,
        allowed_sports: testParty.allowedSports,
        max_members: 16,
        current_participants: 1,
        join_code: joinCode,
        description: testParty.description,
        is_private: testParty.isPrivate,
      })
      .select()
      .single();

    if (partyError) throw partyError;
    console.log('✅ Party creation successful:', partyData);

    // Test 5: Add party member
    console.log('\n5️⃣ Testing party member creation...');
    const { data: memberData, error: memberError } = await supabase
      .from('party_members')
      .insert({
        party_id: partyData.id,
        user_id: signInData.user.id,
        is_creator: true,
        is_active: true,
        buy_in_paid: testParty.buyIn,
      })
      .select()
      .single();

    if (memberError) throw memberError;
    console.log('✅ Party member creation successful:', memberData);

    // Test 6: Get user's parties
    console.log('\n6️⃣ Testing get user parties...');
    const { data: userParties, error: partiesError } = await supabase
      .from('parties')
      .select(`
        *,
        party_members!inner(user_id)
      `)
      .or(`creator_id.eq.${signInData.user.id},party_members.user_id.eq.${signInData.user.id}`);

    if (partiesError) throw partiesError;
    console.log('✅ Get parties successful:', userParties);

    // Test 7: Join party by join code
    console.log('\n7️⃣ Testing join party by code...');
    const { data: joinPartyData, error: joinPartyError } = await supabase
      .from('parties')
      .select('*')
      .eq('join_code', joinCode)
      .single();

    if (joinPartyError) throw joinPartyError;
    console.log('✅ Join party lookup successful:', joinPartyData);

    console.log('\n🎉 All Supabase tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testSupabase();
