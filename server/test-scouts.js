require('dotenv').config();
const pool = require('./config/database');

async function testScouts() {
  try {
    console.log('Testing scout search...\n');
    
    // Check all users with scout role
    const usersQuery = `
      SELECT u.id, u.email, u.name, u.role
      FROM users u
      WHERE u.role = 'scout'
      LIMIT 10
    `;
    
    const usersResult = await pool.query(usersQuery);
    console.log(`Found ${usersResult.rows.length} scout users:`);
    usersResult.rows.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
    });
    
    console.log('\n---\n');
    
    // Check scouts with profiles
    const scoutsQuery = `
      SELECT p.*, u.email, u.name, u.role
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.role = 'scout'
      ORDER BY p.profile_views DESC
      LIMIT 10
    `;
    
    const scoutsResult = await pool.query(scoutsQuery);
    console.log(`Found ${scoutsResult.rows.length} scouts with profiles:`);
    scoutsResult.rows.forEach(scout => {
      console.log(`  - User ID: ${scout.user_id}, Name: ${scout.full_name || scout.name}, Org: ${scout.organization || 'N/A'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testScouts();
