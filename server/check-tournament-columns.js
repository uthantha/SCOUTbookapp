const pool = require('./config/database');

async function checkColumns() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tournaments' 
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Tournaments table columns:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check if verification columns exist
    const hasVerification = result.rows.some(row => row.column_name === 'verification_status');
    if (hasVerification) {
      console.log('\n✅ Verification columns are present!');
    } else {
      console.log('\n❌ Verification columns are missing!');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    process.exit();
  }
}

checkColumns();
