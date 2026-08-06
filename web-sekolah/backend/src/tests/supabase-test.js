require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function test() {
  console.log('Testing...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Users count:', data);
    }
  } catch (err) {
    console.error('Catch error:', err.message);
  }
}

test();