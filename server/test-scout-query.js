require('dotenv').config();
const pool = require('./config/database');
const Profile = require('./models/Profile');

async function testScoutQuery() {
  try {
    console.log('Testing scout query...\n');
    
    // Test 1: Check all users with scout role
    console.log('=== TEST 1: All Scout Users ===');
    const usersQuery = `SELECT id, email, name, role FROM users WHERE role = 'scout'`;
    const usersResult = await pool.query(usersQuery);
    console.log(`Found ${usersResult.rows.length} scout users:`);
    usersResult.rows.forEach(user => {
      console.log(`  ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
    });
    
    console.log('\n=== TEST 2: Using Profile.searchScouts() Method ===');
    // Test 2: Use the actual searchScouts method
    const scouts = await Profile.searchScouts({});
    console.log(`Found ${scouts.length} scouts using searchScouts():`);
    scouts.forEach(scout => {
      console.log(`  User ID: ${scout.user_id}, Name: ${scout.full_name || scout.name || scout.email}, Org: ${scout.organization || 'N/A'}`);
    });
    
    console.log('\n=== TEST 3: All Profiles ===');
    // Test 3: Check all profiles
    const allProfilesQuery = `
      SELECT p.user_id, p.full_name, u.role, u.email
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      ORDER BY u.role, p.user_id
    `;
    const allProfilesResult = await pool.query(allProfilesQuery);
    console.log(`Found ${allProfilesResult.rows.length} total profiles:`);
    allProfilesResult.rows.forEach(profile => {
      console.log(`  User ID: ${profile.user_id}, Role: ${profile.role}, Name: ${profile.full_name || 'N/A'}, Email: ${profile.email}`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

testScoutQuery();
