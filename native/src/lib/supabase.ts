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
          updated_at?: string;
          is_active?: boolean;
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
        };
        Insert: {
          id?: string;
          party_id: string;
          user_id: string;
          joined_at?: string;
          is_creator?: boolean;
          is_active?: boolean;
          buy_in_paid?: number | null;
        };
        Update: {
          id?: string;
          is_active?: boolean;
          buy_in_paid?: number | null;
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
