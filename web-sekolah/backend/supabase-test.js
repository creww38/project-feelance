require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jjdswuxizkywoivfqemb.supabase.co',
  'sb_secret_nNJGVASC9aqzB4lpMBGmQA_KaHa4oPJ',
  { auth: { persistSession: false } }
);

async function test() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count');

    if (error) {
      console.error('ERROR:', JSON.stringify(error));
    } else {
      console.log('SUCCESS! Data:', data);
    }
  } catch (err) {
    console.error('CATCH:', err.message);
  }
}

test();