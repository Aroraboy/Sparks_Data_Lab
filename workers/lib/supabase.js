import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!process.env.SUPABASE_URL) {
  console.warn('[Workers] WARNING: SUPABASE_URL not set — DB calls will fail');
}

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
