const pool = require('./config/database');

async function checkContactColumns() {
  try {
    // Check if columns exist
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'opportunities' 
      AND column_name LIKE 'contact%'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Contact columns in opportunities table:');
    console.table(columnsResult.rows);
    
    // Check latest opportunity
    const latestResult = await pool.query(`
      SELECT id, title, contact_name, contact_email, contact_phone, created_at
      FROM opportunities 
      ORDER BY id DESC 
      LIMIT 1
    `);
    
    console.log('\n📝 Latest opportunity:');
    console.log(JSON.stringify(latestResult.rows[0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkContactColumns();
