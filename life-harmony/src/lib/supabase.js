import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vvcpapgdbbsdeipiklbl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_F1XH1PU3eQfqsjQxCRhGNQ_ga-aMC85';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
