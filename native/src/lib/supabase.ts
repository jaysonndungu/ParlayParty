import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://nuqcvtoelfdymfouhmyz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51cWN2dG9lbGZkeW1mb3VobXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTMwMjUsImV4cCI6MjA3NDU4OTAyNX0.cUrV8K3qViDSgM-Dj2YPSaJczoKHaoMOYKiaFVG8xS8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          full_name: string;
          wallet_balance: number;
          profile_picture_url: string | null;
          last_active: string;
          account_status: string;
          avatar_settings: any;
          connection_preferences: any;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          full_name: string;
          wallet_balance?: number;
          profile_picture_url?: string | null;
          last_active?: string;
          account_status?: string;
          avatar_settings?: any;
          connection_preferences?: any;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          full_name?: string;
          wallet_balance?: number;
          profile_picture_url?: string | null;
          last_active?: string;
          account_status?: string;
          avatar_settings?: any;
          connection_preferences?: any;
          updated_at?: string;
          is_active?: boolean;
        };
      };
      user_transactions: {
        Row: {
          id: string;
          user_id: string;
          transaction_type: string;
          amount: number;
          description: string | null;
          party_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_type: string;
          amount: number;
          description?: string | null;
          party_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_type?: string;
          amount?: number;
          description?: string | null;
          party_id?: string | null;
        };
      };
      parties: {
        Row: {
          id: string;
          name: string;
          type: 'friendly' | 'competitive';
          creator_id: string;
          start_date: string;
          end_date: string;
          buy_in_amount: number;
          prize_pool: number;
          allowed_sports: string[];
          max_members: number;
          current_participants: number;
          join_code: string;
          description: string | null;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'friendly' | 'competitive';
          creator_id: string;
          start_date: string;
          end_date: string;
          buy_in_amount?: number;
          prize_pool?: number;
          allowed_sports?: string[];
          max_members?: number;
          current_participants?: number;
          join_code: string;
          description?: string | null;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'friendly' | 'competitive';
          buy_in_amount?: number;
          prize_pool?: number;
          allowed_sports?: string[];
          max_members?: number;
          current_participants?: number;
          description?: string | null;
          is_private?: boolean;
          updated_at?: string;
        };
      };
      party_members: {
        Row: {
          id: string;
          party_id: string;
          user_id: string;
          joined_at: string;
          is_creator: boolean;
          is_active: boolean;
          buy_in_paid: number | null;
          current_score: number;
          total_picks: number;
          correct_picks: number;
        };
        Insert: {
          id?: string;
          party_id: string;
          user_id: string;
          joined_at?: string;
          is_creator?: boolean;
          is_active?: boolean;
          buy_in_paid?: number | null;
          current_score?: number;
          total_picks?: number;
          correct_picks?: number;
        };
        Update: {
          id?: string;
          is_active?: boolean;
          buy_in_paid?: number | null;
          current_score?: number;
          total_picks?: number;
          correct_picks?: number;
        };
      };
      parlays: {
        Row: {
          id: string;
          user_id: string;
          party_id: string;
          title: string;
          description: string | null;
          total_odds: number | null;
          stake_amount: number;
          potential_payout: number | null;
          status: string;
          created_at: string;
          resolved_at: string | null;
          payout_amount: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          party_id: string;
          title: string;
          description?: string | null;
          total_odds?: number | null;
          stake_amount?: number;
          potential_payout?: number | null;
          status?: string;
          created_at?: string;
          resolved_at?: string | null;
          payout_amount?: number | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          total_odds?: number | null;
          stake_amount?: number;
          potential_payout?: number | null;
          status?: string;
          resolved_at?: string | null;
          payout_amount?: number | null;
        };
      };
      games: {
        Row: {
          id: string;
          sport: string;
          home_team: string;
          away_team: string;
          game_date: string;
          current_score_home: number;
          current_score_away: number;
          period: string;
          time_remaining: string | null;
          status: string;
          spread: number | null;
          total: number | null;
          home_moneyline: number | null;
          away_moneyline: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sport: string;
          home_team: string;
          away_team: string;
          game_date: string;
          current_score_home?: number;
          current_score_away?: number;
          period?: string;
          time_remaining?: string | null;
          status?: string;
          spread?: number | null;
          total?: number | null;
          home_moneyline?: number | null;
          away_moneyline?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          current_score_home?: number;
          current_score_away?: number;
          period?: string;
          time_remaining?: string | null;
          status?: string;
          spread?: number | null;
          total?: number | null;
          home_moneyline?: number | null;
          away_moneyline?: number | null;
          updated_at?: string;
        };
      };
      prophet_polls: {
        Row: {
          id: string;
          party_id: string;
          creator_id: string;
          question: string;
          options: any;
          poll_type: string;
          status: string;
          created_at: string;
          closed_at: string | null;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          party_id: string;
          creator_id: string;
          question: string;
          options: any;
          poll_type?: string;
          status?: string;
          created_at?: string;
          closed_at?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          question?: string;
          options?: any;
          poll_type?: string;
          status?: string;
          closed_at?: string | null;
          resolved_at?: string | null;
        };
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          user_id: string;
          option_id: string;
          vote_value: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          user_id: string;
          option_id: string;
          vote_value?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          option_id?: string;
          vote_value?: string | null;
        };
      };
      party_chat_messages: {
        Row: {
          id: string;
          party_id: string;
          user_id: string;
          message: string;
          message_type: 'text' | 'system' | 'celebration';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          party_id: string;
          user_id: string;
          message: string;
          message_type?: 'text' | 'system' | 'celebration';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          message?: string;
          message_type?: 'text' | 'system' | 'celebration';
          updated_at?: string;
        };
      };
    };
    Views: {
      party_chat_with_users: {
        Row: {
          id: string;
          party_id: string;
          user_id: string;
          message: string;
          message_type: 'text' | 'system' | 'celebration';
          created_at: string;
          updated_at: string;
          username: string;
          full_name: string;
          profile_picture_url: string | null;
        };
      };
    };
  };
}
