import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || '';

console.log('Supabase URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('Supabase Key:', supabaseKey ? 'SET' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase query error:', JSON.stringify(error));
      return false;
    }
    
    console.log('Supabase connected successfully');
    return true;
  } catch (err: any) {
    console.error('Supabase connection error:', err.message || err);
    return false;
  }
};

export default supabase;