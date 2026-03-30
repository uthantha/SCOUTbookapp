const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function addAdminRole() {
  try {
    console.log('🔄 Adding admin role to users table...');

    // Drop the existing constraint
    await pool.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    `);

    // Add new constraint with admin role
    await pool.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('player', 'scout', 'admin'));
    `);

    console.log('✅ Admin role added successfully!');
    console.log('   Users can now have role = \'admin\'');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding admin role:', error);
    await pool.end();
    process.exit(1);
  }
}

addAdminRole();
