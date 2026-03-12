import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestAccounts() {
  console.log('Creating test accounts...\n');

  const accounts = [
    {
      email: 'admin@b2b.local',
      password: 'admin123456',
      full_name: 'Администратор',
      role: 'admin'
    },
    {
      email: 'client@b2b.local',
      password: 'client123456',
      full_name: 'Тестовый Клиент',
      role: 'client'
    }
  ];

  for (const account of accounts) {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', account.email)
        .maybeSingle();

      if (existingProfile) {
        console.log(`✓ Account ${account.email} already exists`);
        continue;
      }

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: account.email,
          full_name: account.full_name,
          role: account.role
        });

      if (profileError) throw profileError;

      console.log(`✓ Created ${account.role} account: ${account.email}`);
      console.log(`  Password: ${account.password}`);
    } catch (error) {
      console.error(`✗ Error creating account ${account.email}:`, error.message);
    }
  }

  console.log('\n=== Test Accounts ===');
  console.log('\nAdmin Account:');
  console.log('  Email: admin@b2b.local');
  console.log('  Password: admin123456');
  console.log('\nClient Account:');
  console.log('  Email: client@b2b.local');
  console.log('  Password: client123456');
  console.log('\n=====================\n');
}

createTestAccounts();
