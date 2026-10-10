import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://vvcpapgdbbsdeipiklbl.supabase.co';
const rawSecret = process.env.SUPABASE_SECRET_KEY;
const isFullSecret = rawSecret && !rawSecret.includes('•') && rawSecret.length > 25;

const supabaseKey =
    (isFullSecret ? rawSecret : null) ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'sb_publishable_F1XH1PU3eQfqsjQxCRhGNQ_ga-aMC85';

export const supabase = createClient(supabaseUrl, supabaseKey);
