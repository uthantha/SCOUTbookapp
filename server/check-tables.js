const pool = require('./config/database');

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n');
    
    // List all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check if profiles table exists
    const profilesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
      );
    `);
    
    console.log('\n🔍 Profiles table exists:', profilesCheck.rows[0].exists);
    
    // If profiles table exists, show its structure
    if (profilesCheck.rows[0].exists) {
      const columnsResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'profiles'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 Profiles table columns:');
      columnsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
      
      // Count rows
      const countResult = await pool.query('SELECT COUNT(*) FROM profiles');
      console.log(`\n📈 Total profiles: ${countResult.rows[0].count}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkTables();
