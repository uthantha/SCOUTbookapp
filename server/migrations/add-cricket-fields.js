const pool = require('../config/database');

async function addCricketFields() {
  try {
    console.log('🔄 Adding cricket-specific fields to profiles table...');
    
    // Add batting_style column if it doesn't exist
    await pool.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS batting_style VARCHAR(50),
      ADD COLUMN IF NOT EXISTS bowling_style VARCHAR(100);
    `);
    
    console.log('✅ Cricket fields added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding cricket fields:', error);
    process.exit(1);
  }
}

addCricketFields();
