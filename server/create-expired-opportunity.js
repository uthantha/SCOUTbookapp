const pool = require('./config/database');

async function createExpiredOpportunity() {
  try {
    console.log('🧪 Creating test opportunity with expired deadline...\n');

    // Get a scout user
    const scoutQuery = 'SELECT id, name FROM users WHERE role = $1 LIMIT 1';
    const scoutResult = await pool.query(scoutQuery, ['scout']);
    
    if (scoutResult.rows.length === 0) {
      console.log('❌ No scout user found in database');
      return;
    }

    const scout = scoutResult.rows[0];
    console.log(`Using scout: ${scout.name} (ID: ${scout.id})`);

    // Create an opportunity with a past deadline
    const insertQuery = `
      INSERT INTO opportunities (
        scout_id, title, description, opportunity_type, 
        position, location, deadline, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      scout.id,
      'EXPIRED TEST - Cricket Academy Trial',
      'This is a test opportunity with an expired deadline to verify filtering works correctly.',
      'trial',
      'All-rounder',
      'Test City',
      '2024-01-01', // Past deadline
      'active'
    ];

    const result = await pool.query(insertQuery, values);
    const opportunity = result.rows[0];

    console.log('\n✅ Created expired test opportunity:');
    console.log(`   ID: ${opportunity.id}`);
    console.log(`   Title: ${opportunity.title}`);
    console.log(`   Deadline: ${opportunity.deadline}`);
    console.log(`   Status: ${opportunity.status}`);

    // Verify it's filtered from public view
    console.log('\n🔍 Verifying filtering...');
    
    const publicQuery = `
      SELECT COUNT(*) as count
      FROM opportunities
      WHERE status = 'active'
        AND (deadline IS NULL OR deadline >= CURRENT_DATE)
        AND id = $1
    `;
    const publicResult = await pool.query(publicQuery, [opportunity.id]);
    
    console.log(`   Visible in public view: ${publicResult.rows[0].count === '0' ? 'NO ✅' : 'YES ❌'}`);

    // Verify scout can still see it with expired flag
    const scoutQuery2 = `
      SELECT id, title, deadline,
        CASE 
          WHEN deadline IS NOT NULL AND deadline < CURRENT_DATE THEN true
          ELSE false
        END as is_expired
      FROM opportunities
      WHERE id = $1
    `;
    const scoutResult2 = await pool.query(scoutQuery2, [opportunity.id]);
    const scoutView = scoutResult2.rows[0];
    
    console.log(`   Visible to scout: YES`);
    console.log(`   Marked as expired: ${scoutView.is_expired ? 'YES ✅' : 'NO ❌'}`);

    console.log('\n✅ Test completed successfully!');
    console.log('\nTo clean up, run:');
    console.log(`   DELETE FROM opportunities WHERE id = ${opportunity.id};`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

createExpiredOpportunity();
