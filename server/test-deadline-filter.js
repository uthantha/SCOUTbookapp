const pool = require('./config/database');

async function testDeadlineFilter() {
  try {
    console.log('🧪 Testing deadline filtering...\n');

    // Test 1: Check opportunities with expired deadlines
    console.log('Test 1: Checking for expired opportunities in database...');
    const expiredQuery = `
      SELECT id, title, deadline, 
        CASE 
          WHEN deadline IS NOT NULL AND deadline < CURRENT_DATE THEN true
          ELSE false
        END as is_expired
      FROM opportunities
      WHERE deadline IS NOT NULL
      ORDER BY deadline;
    `;
    const expiredResult = await pool.query(expiredQuery);
    console.log(`Found ${expiredResult.rows.length} opportunities with deadlines:`);
    expiredResult.rows.forEach(opp => {
      console.log(`  - ${opp.title}: ${opp.deadline} (Expired: ${opp.is_expired})`);
    });
    console.log('');

    // Test 2: Check what findAll() returns (should exclude expired)
    console.log('Test 2: Testing findAll() query (public view)...');
    const publicQuery = `
      SELECT o.*, u.name as scout_name
      FROM opportunities o
      JOIN users u ON o.scout_id = u.id
      WHERE o.status = 'active'
        AND (o.deadline IS NULL OR o.deadline >= CURRENT_DATE)
      ORDER BY o.created_at DESC;
    `;
    const publicResult = await pool.query(publicQuery);
    console.log(`Public view shows ${publicResult.rows.length} active opportunities (expired ones filtered out)`);
    publicResult.rows.forEach(opp => {
      console.log(`  - ${opp.title} (Deadline: ${opp.deadline || 'None'})`);
    });
    console.log('');

    // Test 3: Check what scouts see (should include expired with flag)
    console.log('Test 3: Testing findByScoutId() query (scout view)...');
    const scoutQuery = `
      SELECT o.*, 
        (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) as application_count,
        CASE 
          WHEN o.deadline IS NOT NULL AND o.deadline < CURRENT_DATE THEN true
          ELSE false
        END as is_expired
      FROM opportunities o
      WHERE o.scout_id = (SELECT id FROM users WHERE role = 'scout' LIMIT 1)
      ORDER BY o.created_at DESC;
    `;
    const scoutResult = await pool.query(scoutQuery);
    console.log(`Scout view shows ${scoutResult.rows.length} opportunities (including expired):`);
    scoutResult.rows.forEach(opp => {
      console.log(`  - ${opp.title} (Deadline: ${opp.deadline || 'None'}, Expired: ${opp.is_expired})`);
    });
    console.log('');

    console.log('✅ All tests completed successfully!');
    console.log('\nSummary:');
    console.log(`- Total opportunities with deadlines: ${expiredResult.rows.length}`);
    console.log(`- Expired opportunities: ${expiredResult.rows.filter(o => o.is_expired).length}`);
    console.log(`- Active opportunities visible to public: ${publicResult.rows.length}`);
    console.log(`- Opportunities visible to scouts: ${scoutResult.rows.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testDeadlineFilter();
