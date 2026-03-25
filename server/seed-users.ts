import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceRoleKey ? "✅ Loaded" : "❌ Missing");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Define your seed users here
const users = [
  {
    email: 'janedoe@example.com',
    password: 'password123',
  },
  {
    email: 'johndoe@example.com',
    password: 'password456',
  },
];

async function seedUsers() {
  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // avoids sending a confirmation email
    });

    if (error) {
      console.error(`❌ Error creating user ${user.email}:`, error.message);
    } else {
      console.log(`✅ Created user: ${user.email}`);
    }
  }
}

seedUsers()
  .then(() => {
    console.log('🎉 Seeding complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('🚨 Seeding failed:', error);
    process.exit(1);
  });
