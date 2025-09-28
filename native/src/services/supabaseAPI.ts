import { supabase, Database } from '../lib/supabase';

type Party = Database['public']['Tables']['parties']['Row'];
type PartyInsert = Database['public']['Tables']['parties']['Insert'];
type PartyUpdate = Database['public']['Tables']['parties']['Update'];
type PartyMember = Database['public']['Tables']['party_members']['Row'];
type User = Database['public']['Tables']['users']['Row'];

// Generate a unique join code
function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a unique join code that doesn't exist in the database
async function generateUniqueJoinCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  
  while (!isUnique) {
    code = generateJoinCode();
    const { data, error } = await supabase
      .from('parties')
      .select('id')
      .eq('join_code', code)
      .single();
    
    // If no data found (error code PGRST116) or any other error, code is unique
    if (error && error.code === 'PGRST116') {
      isUnique = true;
    } else if (!error && !data) {
      // No error and no data means code is unique
      isUnique = true;
    } else if (error) {
      // Some other error occurred, log it but continue trying
      console.warn('Error checking join code uniqueness:', error.message);
      isUnique = true; // Assume it's unique if we can't check
    }
    // If data exists, code is not unique, continue loop
  }
  
  return code!;
}

export const supabaseAPI = {
  // Authentication
  async signUp(email: string, password: string, userData: {
    username: string;
    fullName: string;
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            full_name: userData.fullName,
          }
        }
      });

      if (error) {
        console.error('Auth signup error:', error);
        throw error;
      }

      // Create user profile - check if user already exists first
      if (data.user) {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              username: userData.username,
              full_name: userData.fullName,
              wallet_balance: 1000, // Starting balance
            });
          
          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't throw here - user is authenticated even if profile creation fails
            console.warn('User authenticated but profile creation failed. Profile can be created later.');
          }
        } else {
          console.log('User profile already exists');
        }
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    // Ensure user has a profile after successful login
    if (data.user) {
      try {
        await this.getUserProfile(data.user.id);
      } catch (profileError) {
        console.log('Creating missing user profile...');
        // Profile doesn't exist, create it
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
            full_name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0],
            wallet_balance: 1000,
          });
        
        if (createError) {
          console.error('Failed to create user profile:', createError);
          // Don't throw here - user is still authenticated
        }
      }
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // User profile management
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      // If profile doesn't exist, try to create it
      if (error.code === 'PGRST116') {
        console.log('User profile not found, creating one...');
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: authUser.user.id,
              email: authUser.user.email!,
              username: authUser.user.user_metadata?.username || 'user' + Math.random().toString(36).substr(2, 9),
              full_name: authUser.user.user_metadata?.full_name || 'User',
              wallet_balance: 1000,
            })
            .select()
            .single();
          
          if (createError) throw createError;
          return newProfile;
        }
      }
      throw error;
    }
    return data;
  },

  async updateUserProfile(userId: string, updates: {
    full_name?: string;
    username?: string;
    profile_picture_url?: string;
    wallet_balance?: number;
  }) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Party management
  async createParty(partyData: {
    name: string;
    type: 'friendly' | 'competitive';
    startDate: string;
    endDate: string;
    buyIn?: number;
    allowedSports?: string[];
    description?: string;
    isPrivate?: boolean;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const joinCode = await generateUniqueJoinCode();

    const partyInsert: PartyInsert = {
      name: partyData.name,
      type: partyData.type,
      creator_id: user.id,
      start_date: partyData.startDate,
      end_date: partyData.endDate,
      buy_in_amount: partyData.buyIn || 0,
      prize_pool: partyData.buyIn || 0,
      allowed_sports: partyData.allowedSports || ['NFL', 'NBA'],
      current_participants: 1,
      join_code: joinCode,
      description: partyData.description || null,
      is_private: partyData.isPrivate || false,
    };

    const { data: party, error: partyError } = await supabase
      .from('parties')
      .insert(partyInsert)
      .select()
      .single();

    if (partyError) throw partyError;

    // Add creator as first member
    const { error: memberError } = await supabase
      .from('party_members')
      .insert({
        party_id: party.id,
        user_id: user.id,
        is_creator: true,
        is_active: true,
        buy_in_paid: partyData.buyIn || 0,
      });

    if (memberError) throw memberError;

      // Deduct buy-in from creator's wallet if competitive
      if (partyData.type === 'competitive' && partyData.buyIn && partyData.buyIn > 0) {
        // First get current balance
        const { data: userProfile, error: fetchError } = await supabase
          .from('users')
          .select('wallet_balance')
          .eq('id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        
        // Update with new balance
        const { error: walletError } = await supabase
          .from('users')
          .update({
            wallet_balance: userProfile.wallet_balance - partyData.buyIn,
          })
          .eq('id', user.id);

        if (walletError) throw walletError;
      }

    return {
      success: true,
      data: {
        party: {
          id: party.id,
          name: party.name,
          type: party.type,
          startDate: party.start_date,
          endDate: party.end_date,
          createdAt: party.created_at,
          updatedAt: party.updated_at,
          createdBy: party.creator_id,
          joinCode: party.join_code,
          status: 'active' as const,
          buyIn: party.buy_in_amount,
          prizePool: party.prize_pool,
          allowedSports: party.allowed_sports,
          currentParticipants: party.current_participants,
          description: party.description,
          isPrivate: party.is_private,
          members: [{
            id: user.id,
            username: user.user_metadata?.username || '',
            displayName: user.user_metadata?.full_name || '',
            joinedAt: new Date().toISOString(),
            isCreator: true,
            isActive: true,
          }]
        },
        joinCode: joinCode, // Use the generated join code, not the database value
      }
    };
  },

  // Delete a party (only by creator)
  async deleteParty(partyId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First check if user is the creator
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('creator_id')
      .eq('id', partyId)
      .single();

    if (partyError) throw partyError;
    if (party.creator_id !== user.id) {
      throw new Error('Only the party creator can delete the party');
    }

    // Delete the party (cascade will handle party_members and party_chat_messages)
    const { error: deleteError } = await supabase
      .from('parties')
      .delete()
      .eq('id', partyId);

    if (deleteError) throw deleteError;

    return { success: true };
  },

  async joinParty(joinData: {
    joinCode: string;
    username: string;
    displayName: string;
    profilePhotoUrl?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Find party by join code
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('join_code', joinData.joinCode)
      .single();

    if (partyError || !party) {
      throw new Error('Party not found with this join code');
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('party_members')
      .select('id')
      .eq('party_id', party.id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      throw new Error('You are already a member of this party');
    }

    // Check if party is full
    if (party.current_participants >= 16) {
      throw new Error('Party has reached its maximum number of participants');
    }

    // Handle competitive party buy-in
    let buyInPaid = 0;
    if (party.type === 'competitive' && party.buy_in_amount > 0) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      if (!userProfile || userProfile.wallet_balance < party.buy_in_amount) {
        throw new Error('Insufficient funds for party buy-in');
      }

      // Deduct buy-in from user's wallet
      const { error: walletError } = await supabase
        .from('users')
        .update({
          wallet_balance: userProfile.wallet_balance - party.buy_in_amount,
        })
        .eq('id', user.id);

      if (walletError) throw walletError;
      buyInPaid = party.buy_in_amount;
    }

    // Add user to party
    const { error: memberError } = await supabase
      .from('party_members')
      .insert({
        party_id: party.id,
        user_id: user.id,
        is_creator: false,
        is_active: true,
        buy_in_paid: buyInPaid,
      });

    if (memberError) throw memberError;

    // Update party participant count
    const { error: updateError } = await supabase
      .from('parties')
      .update({
        current_participants: party.current_participants + 1,
      })
      .eq('id', party.id);

    if (updateError) throw updateError;

    return {
      success: true,
      data: {
        party: {
          id: party.id,
          name: party.name,
          type: party.type,
          startDate: party.start_date,
          endDate: party.end_date,
          createdAt: party.created_at,
          updatedAt: party.updated_at,
          createdBy: party.creator_id,
          joinCode: party.join_code,
          status: 'active' as const,
          buyIn: party.buy_in_amount,
          prizePool: party.prize_pool,
          allowedSports: party.allowed_sports,
          currentParticipants: party.current_participants + 1,
          description: party.description,
          isPrivate: party.is_private,
          members: [] // Will be populated separately if needed
        }
      }
    };
  },

  async getMyParties() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('parties')
      .select(`
        *,
        party_members!inner(user_id)
      `)
      .eq('party_members.user_id', user.id)
      .eq('party_members.is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: {
        parties: data.map(party => ({
          id: party.id,
          name: party.name,
          type: party.type,
          startDate: party.start_date,
          endDate: party.end_date,
          createdAt: party.created_at,
          updatedAt: party.updated_at,
          createdBy: party.creator_id,
          joinCode: party.join_code,
          status: 'active' as const,
          buyIn: party.buy_in_amount,
          prizePool: party.prize_pool,
          allowedSports: party.allowed_sports,
          currentParticipants: party.current_participants,
          description: party.description,
          isPrivate: party.is_private,
          members: [] // Simplified for now
        }))
      }
    };
  },

  async getParty(partyId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: party, error } = await supabase
      .from('parties')
      .select(`
        *,
        party_members!inner(user_id)
      `)
      .eq('id', partyId)
      .eq('party_members.user_id', user.id)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        party: {
          id: party.id,
          name: party.name,
          type: party.type,
          startDate: party.start_date,
          endDate: party.end_date,
          createdAt: party.created_at,
          updatedAt: party.updated_at,
          createdBy: party.creator_id,
          joinCode: party.join_code,
          status: 'active' as const,
          buyIn: party.buy_in_amount,
          prizePool: party.prize_pool,
          allowedSports: party.allowed_sports,
          currentParticipants: party.current_participants,
          description: party.description,
          isPrivate: party.is_private,
          members: [] // Simplified for now
        }
      }
    };
  },
};
