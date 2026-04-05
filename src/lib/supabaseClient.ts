import { createClient } from '@supabase/supabase-js';

// Supabase initialization
// ⚠️ IMPORTANT: Set these in your .env.local file!
// Get them from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials! Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Business {
  id: string;
  name?: string;
  nameAr?: string;
  nameKu?: string;
  description?: string;
  descriptionAr?: string;
  descriptionKu?: string;
  category?: string;
  governorate?: string;
  city?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  imageUrl?: string;
  coverImage?: string;
  rating?: number;
  reviewCount?: number;
  isPremium?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  lat?: number;
  lng?: number;
  tags?: string[];
  openHours?: string;
  priceRange?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterState {
  governorate: string; // "All" or specific governorate
  category: string; // "All" or specific category
}

export interface QueryResult {
  businesses: Business[];
  total: number;
  loading: boolean;
  error: string | null;
  availableCategories: string[];
  availableGovernortes: string[];
  hasMore: boolean;
}
