import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'missing-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn('[WARN] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY — database calls will fail');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default supabase;
