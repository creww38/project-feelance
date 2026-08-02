import dotenv from 'dotenv';
dotenv.config();

import { supabase, testConnection } from '../config/supabase';

async function main() {
  console.log('🔌 Testing Supabase connection...\n');

  // Test connection
  const connected = await testConnection();
  
  if (!connected) {
    console.log('❌ Connection failed!');
    return;
  }

  // Test query
  console.log('\n📊 Testing queries...');
  
  // Get users
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*');
  
  if (userError) {
    console.log('❌ Users query failed:', userError.message);
  } else {
    console.log(`✅ Users: ${users.length} found`);
    console.log(users);
  }

  // Get roles
  const { data: roles, error: roleError } = await supabase
    .from('roles')
    .select('*');
  
  if (roleError) {
    console.log('❌ Roles query failed:', roleError.message);
  } else {
    console.log(`✅ Roles: ${roles.length} found`);
  }

  // Get categories
  const { data: categories, error: catError } = await supabase
    .from('kategori')
    .select('*');
  
  if (catError) {
    console.log('❌ Categories query failed:', catError.message);
  } else {
    console.log(`✅ Categories: ${categories.length} found`);
  }

  console.log('\n🎉 Test completed!');
}

main().catch(console.error);