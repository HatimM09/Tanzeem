import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const msg = 'CRITICAL: Supabase credentials (VITE_SUPABASE_URL/KEY) are missing. Check your .env or Netlify settings.';
  console.error(msg);
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
