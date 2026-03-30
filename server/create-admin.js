const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

// Create pool connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function createAdmin() {
  try {
    const email = 'admin@scoutbook.com';
    const password = 'admin123'; // Change this to a secure password
    const name = 'Admin User';

    // Check if admin already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ Admin user already exists with email:', email);
      console.log('   Use this email to login as admin');
      await pool.end();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role`,
      [email, hashedPassword, name, 'admin']
    );

    const adminUser = result.rows[0];

    // Create profile for admin
    await pool.query(
      `INSERT INTO profiles (user_id, full_name, primary_sport)
       VALUES ($1, $2, $3)`,
      [adminUser.id, name, 'Cricket']
    );

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('');
    console.log('🚀 You can now login at: http://localhost:3000/login');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
