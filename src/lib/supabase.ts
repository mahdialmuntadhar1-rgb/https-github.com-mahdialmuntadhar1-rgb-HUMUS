import { createClient } from "@supabase/supabase-js";

export interface Business {
  id: string;
  name: string;
  nameAr?: string;
  nameKu?: string;
  category: string;
  governorate: string;
  city: string;
  address: string;
  phone: string;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  image?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
