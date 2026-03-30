const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function openDatabase() {
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    console.log(`📍 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME}`);
    console.log(`👤 User: ${process.env.DB_USER}`);
    console.log('');

    // Test connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!');
    console.log('');

    // Show all tables
    console.log('📋 Available tables:');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('   No tables found in the database.');
    } else {
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    }
    console.log('');

    // Show database info
    const dbInfo = await client.query('SELECT version();');
    console.log('🔧 Database version:');
    console.log(`   ${dbInfo.rows[0].version}`);
    console.log('');

    // Show current database size
    const sizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size('${process.env.DB_NAME}')) as size;
    `);
    console.log('💾 Database size:');
    console.log(`   ${sizeResult.rows[0].size}`);
    console.log('');

    console.log('🎯 Database is ready to use!');
    console.log('');
    console.log('💡 To interact with your database:');
    console.log('   1. Use pgAdmin (GUI tool)');
    console.log('   2. Install psql command line tool');
    console.log('   3. Use this Node.js script for queries');
    console.log('   4. Use database management extensions in VS Code');

    client.release();
    
  } catch (err) {
    console.error('❌ Error connecting to database:', err.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL service is running');
    console.log('   2. Check your .env file credentials');
    console.log('   3. Verify database exists and user has permissions');
  } finally {
    await pool.end();
  }
}

// Run the function
openDatabase();