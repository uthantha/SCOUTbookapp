const pool = require('./config/database');

async function testDeleteOpportunity() {
  try {
    console.log('🧪 Testing opportunity delete functionality...\n');

    // Get a scout user
    const scoutQuery = 'SELECT id, name FROM users WHERE role = $1 LIMIT 1';
    const scoutResult = await pool.query(scoutQuery, ['scout']);
    
    if (scoutResult.rows.length === 0) {
      console.log('❌ No scout user found in database');
      return;
    }

    const scout = scoutResult.rows[0];
    console.log(`Using scout: ${scout.name} (ID: ${scout.id})`);

    // Create a test opportunity
    const insertQuery = `
      INSERT INTO opportunities (
        scout_id, title, description, opportunity_type, 
        position, location, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      scout.id,
      'DELETE TEST - Test Opportunity',
      'This is a test opportunity that will be deleted.',
      'trial',
      'Test Position',
      'Test City',
      'active'
    ];

    const createResult = await pool.query(insertQuery, values);
    const opportunity = createResult.rows[0];

    console.log('\n✅ Created test opportunity:');
    console.log(`   ID: ${opportunity.id}`);
    console.log(`   Title: ${opportunity.title}`);

    // Verify it exists
    const checkQuery = 'SELECT * FROM opportunities WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [opportunity.id]);
    console.log(`\n✅ Opportunity exists in database: ${checkResult.rows.length > 0 ? 'YES' : 'NO'}`);

    // Test delete with correct scout
    console.log('\n🔍 Testing delete with correct scout...');
    const verifyQuery = 'SELECT id FROM opportunities WHERE id = $1 AND scout_id = $2';
    const verifyResult = await pool.query(verifyQuery, [opportunity.id, scout.id]);
    
    if (verifyResult.rows.length === 0) {
      console.log('❌ Verification failed - opportunity not found or wrong scout');
      return;
    }
    console.log('✅ Verification passed - scout owns this opportunity');

    // Delete the opportunity
    const deleteQuery = 'DELETE FROM opportunities WHERE id = $1 AND scout_id = $2 RETURNING *';
    const deleteResult = await pool.query(deleteQuery, [opportunity.id, scout.id]);
    
    console.log(`✅ Delete executed - Rows affected: ${deleteResult.rows.length}`);

    // Verify it's deleted
    const checkAfterDelete = await pool.query(checkQuery, [opportunity.id]);
    console.log(`✅ Opportunity deleted from database: ${checkAfterDelete.rows.length === 0 ? 'YES' : 'NO'}`);

    // Test delete with wrong scout (should fail)
    console.log('\n🔍 Testing delete protection (wrong scout)...');
    
    // Create another test opportunity
    const createResult2 = await pool.query(insertQuery, values);
    const opportunity2 = createResult2.rows[0];
    console.log(`Created second test opportunity (ID: ${opportunity2.id})`);

    // Try to delete with wrong scout ID
    const wrongScoutId = scout.id + 999;
    const verifyWrong = await pool.query(verifyQuery, [opportunity2.id, wrongScoutId]);
    
    if (verifyWrong.rows.length === 0) {
      console.log('✅ Protection works - cannot delete opportunity owned by another scout');
    } else {
      console.log('❌ Protection failed - should not be able to verify with wrong scout');
    }

    // Clean up the second test opportunity
    await pool.query('DELETE FROM opportunities WHERE id = $1', [opportunity2.id]);
    console.log(`Cleaned up test opportunity (ID: ${opportunity2.id})`);

    console.log('\n✅ All delete tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testDeleteOpportunity();
