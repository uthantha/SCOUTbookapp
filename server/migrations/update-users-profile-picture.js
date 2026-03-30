const pool = require('../config/database');

async function updateUsersProfilePicture() {
  try {
    console.log('🔄 Updating users.profile_picture column to TEXT...');
    
    // Change the column type from VARCHAR(500) to TEXT
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN profile_picture TYPE TEXT
    `);
    
    console.log('✅ Successfully updated users.profile_picture to TEXT');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating column:', error);
    process.exit(1);
  }
}

updateUsersProfilePicture();
