import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log which Supabase URL is being used
console.log('[Supabase] URL in use:', supabaseUrl || '⚠️ MISSING - will use placeholder');
console.log('[Supabase] Anon key present:', supabaseAnonKey ? '✅ Yes' : '❌ No');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error('❌ Supabase credentials are missing or using placeholder. Check .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

const finalUrl = supabaseUrl && !supabaseUrl.includes('placeholder') ? supabaseUrl : 'https://hsadukhmcclwixuntqwu.supabase.co';
const finalKey = supabaseAnonKey && supabaseAnonKey !== 'placeholder' ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NjA3MDAsImV4cCI6MjA1NzEzNjcwMH0.S7-va_MHHSqHbJyTAwJTVnF9xWAQwCdnFgg-L5jy4-I';

console.log('[Supabase] Final URL:', finalUrl);

export const supabase = createClient(finalUrl, finalKey);
