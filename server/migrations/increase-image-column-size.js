const pool = require('../config/database');

async function increaseImageColumnSize() {
  try {
    console.log('🔄 Increasing profile_picture column size...');
    
    // Change VARCHAR(500) to TEXT to support base64 images
    await pool.query(`
      ALTER TABLE profiles 
      ALTER COLUMN profile_picture TYPE TEXT,
      ALTER COLUMN cover_photo TYPE TEXT;
    `);
    
    console.log('✅ Image column size increased successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error increasing column size:', error);
    process.exit(1);
  }
}

increaseImageColumnSize();
