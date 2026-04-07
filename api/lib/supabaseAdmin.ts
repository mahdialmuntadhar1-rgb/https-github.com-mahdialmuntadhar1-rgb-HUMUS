import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Supabase Admin Client - Backend Only
 * 
 * This client uses the SERVICE_ROLE_KEY which has full database access.
 * NEVER expose this key to the frontend - it bypasses all RLS policies.
 * 
 * Required env vars:
 * - SUPABASE_URL: Project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (get from Supabase Dashboard > Project Settings > API)
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[supabaseAdmin] Missing required environment variables:');
  if (!supabaseUrl) console.error('  - SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Type exports for use in API routes
export type SupabaseAdmin = typeof supabaseAdmin;
