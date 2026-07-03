import { createClient } from '@supabase/supabase-js';

// Pull the environment variables we set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail early and clearly if the keys are missing or named incorrectly
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables in .env.local');
}

// Initialize the single shared Supabase instance across your application
export const supabase = createClient(supabaseUrl, supabaseAnonKey);