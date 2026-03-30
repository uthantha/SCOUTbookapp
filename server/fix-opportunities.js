const pool = require('./config/database');

async function fixOpportunities() {
  try {
    // Get all scouts
    const scoutsResult = await pool.query('SELECT id, email, role FROM users WHERE role = $1', ['scout']);
    console.log('Scouts in database:', scoutsResult.rows);
    
    if (scoutsResult.rows.length === 0) {
      console.log('No scouts found in database');
      return;
    }
    
    const scoutId = scoutsResult.rows[0].id;
    console.log('Using scout ID:', scoutId);
    
    // Check existing opportunities
    const oppResult = await pool.query('SELECT id, scout_id, title FROM opportunities');
    console.log('Existing opportunities:', oppResult.rows);
    
    // Update opportunities to use the correct scout_id
    if (oppResult.rows.length > 0) {
      await pool.query('UPDATE opportunities SET scout_id = $1', [scoutId]);
      console.log('✅ Updated opportunities to use scout ID:', scoutId);
    }
    
    // Verify the update
    const verifyResult = await pool.query('SELECT id, scout_id, title FROM opportunities');
    console.log('Updated opportunities:', verifyResult.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixOpportunities();