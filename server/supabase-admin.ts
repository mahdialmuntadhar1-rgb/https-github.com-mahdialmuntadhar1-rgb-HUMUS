import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  "https://mxxaxhrtccomkazpvthn.supabase.co";

// Use service-role key for server-side writes; falls back to anon key for read-only
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eGF4aHJ0Y2NvbWthenB2dGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjQ5OTEsImV4cCI6MjA4ODgwMDk5MX0.RGhIU3C4WUCc6YBXktmXRXLT_wdrEbErKcd9VsFuE-8";

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
