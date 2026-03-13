import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jvqbdenevnwrkopdtcai.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DTUFSAsb-tr0I368VAJ4Lg_Xf66ZqJ4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('leads').select('*').limit(1);
  console.log('leads', data, error);
}
check();
