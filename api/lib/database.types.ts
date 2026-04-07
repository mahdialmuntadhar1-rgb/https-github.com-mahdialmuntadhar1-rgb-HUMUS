import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Database Types for Type Safety
 * 
 * These types mirror the SQL schema in supabase/006_crm_messaging.sql
 */

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          channel: 'whatsapp' | 'telegram';
          message_template: string | null;
          total_recipients: number;
          sent_count: number;
          delivered_count: number;
          replied_count: number;
          converted_count: number;
          failed_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['campaigns']['Row']>;
        Update: Partial<Database['public']['Tables']['campaigns']['Row']>;
      };
      messages: {
        Row: {
          id: string;
          campaign_id: string | null;
          business_id: string;
          phone: string;
          message_body: string;
          status: 'pending' | 'sent' | 'delivered' | 'failed' | 'replied' | 'converted';
          channel: 'whatsapp' | 'telegram';
          external_message_id: string | null;
          error_message: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          replied_at: string | null;
          converted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['messages']['Row']>;
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
      conversations: {
        Row: {
          id: string;
          business_id: string;
          phone: string;
          last_message: string | null;
          last_message_at: string | null;
          last_outbound_message_id: string | null;
          message_count: number;
          replied: boolean;
          converted: boolean;
          converted_value: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['conversations']['Row']>;
        Update: Partial<Database['public']['Tables']['conversations']['Row']>;
      };
      businesses: {
        Row: {
          id: string;
          business_name: string;
          phone_1: string | null;
          phone_2: string | null;
          whatsapp: string | null;
          governorate: string | null;
          city: string | null;
          category: string | null;
          image_url: string | null;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['businesses']['Row']>;
        Update: Partial<Database['public']['Tables']['businesses']['Row']>;
      };
      posts: {
        Row: {
          id: string;
          business_id: string;
          caption: string;
          image_url: string;
          created_at: string;
          likes_count: number;
          comments_count: number;
          is_active: boolean;
        };
        Insert: Partial<Database['public']['Tables']['posts']['Row']>;
        Update: Partial<Database['public']['Tables']['posts']['Row']>;
      };
    };
    Functions: {
      update_campaign_stats: {
        Args: { p_campaign_id: string };
        Returns: void;
      };
    };
  };
}
