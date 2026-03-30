const pool = require('../config/database');

async function addTournamentVerification() {
  try {
    console.log('🔄 Adding verification columns to tournaments table...');

    // Add verification_status column
    await pool.query(`
      ALTER TABLE tournaments 
      ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending' 
      CHECK (verification_status IN ('pending', 'approved', 'rejected'))
    `);

    // Add verified_by column
    await pool.query(`
      ALTER TABLE tournaments 
      ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id)
    `);

    // Add verified_at column
    await pool.query(`
      ALTER TABLE tournaments 
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP
    `);

    // Add rejection_reason column
    await pool.query(`
      ALTER TABLE tournaments 
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
    `);

    console.log('✅ Tournament verification columns added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding verification columns:', error);
    process.exit(1);
  }
}

addTournamentVerification();
