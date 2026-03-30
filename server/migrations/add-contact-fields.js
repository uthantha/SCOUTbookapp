const pool = require('../config/database');

async function addContactFields() {
  try {
    console.log('🔄 Adding contact fields to opportunities table...');
    
    // Add contact fields
    await pool.query(`
      ALTER TABLE opportunities 
      ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)
    `);
    
    console.log('✅ Successfully added contact fields to opportunities table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding contact fields:', error);
    process.exit(1);
  }
}

addContactFields();
