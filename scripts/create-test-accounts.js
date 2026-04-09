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
    persistSession: false,
  },
});

async function createTestAccounts() {
  console.log('Creating test accounts...\n');

  const accounts = [
    {
      phone: '+998974110180',
      password: 'Oybekisroilov01',
      full_name: 'Администратор',
      role: 'admin',
    },
    {
      phone: '+998972222222',
      password: 'client123456',
      full_name: 'Тестовый Клиент',
      role: 'client',
    },
  ];

  for (const account of accounts) {
    try {
      const { data: existingProfile, error: existingError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', account.phone)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingProfile) {
        console.log(`✓ Account ${account.phone} already exists`);
        continue;
      }

      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          phone: account.phone,
          password: account.password,
          phone_confirm: true,
        });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          phone: account.phone,
          full_name: account.full_name,
          role: account.role,
        });

      if (profileError) throw profileError;

      console.log(`✓ Created ${account.role} account: ${account.phone}`);
      console.log(`  Password: ${account.password}`);
    } catch (error) {
      console.error(`✗ Error creating account ${account.phone}:`, error.message);
    }
  }

  console.log('\n=== Test Accounts ===');
  console.log('Admin:  +998974110180 / Oybekisroilov01');
  console.log('Client: +998972222222 / client123456');
  console.log('=====================\n');
}

createTestAccounts();
