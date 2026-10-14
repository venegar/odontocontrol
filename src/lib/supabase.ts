import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://terrqwwmcarwahkgrkmm.supabase.co';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcnJxd3dtY2Fyd2Foa2dya21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5ODE0ODgsImV4cCI6MjEwNzU1NzQ4OH0.J2h6HD-A3Agwx31BkfJqs27DdiV_ctPfbwHCBywKws4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
