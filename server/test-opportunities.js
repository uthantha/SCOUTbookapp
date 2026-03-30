const pool = require('./config/database');

async function testOpportunities() {
  try {
    // Check if there are any opportunities
    const result = await pool.query('SELECT COUNT(*) FROM opportunities');
    console.log('Number of opportunities:', result.rows[0].count);
    
    // If no opportunities, create a few test ones
    if (result.rows[0].count === '0') {
      console.log('Creating test opportunities...');
      
      const testOpportunities = [
        {
          scout_id: 1,
          title: 'U-19 Cricket Team Trial',
          description: 'Looking for talented young cricketers for our U-19 team. Great opportunity to showcase your skills.',
          opportunity_type: 'trial',
          position: 'All-rounder',
          location: 'Kathmandu, Nepal',
          age_range: '16-19',
          experience_level: 'intermediate',
          requirements: 'Must have played district level cricket',
          benefits: 'Professional coaching and match opportunities',
          deadline: '2024-02-15'
        },
        {
          scout_id: 1,
          title: 'Cricket Academy Scholarship',
          description: 'Full scholarship program for promising cricket players. Includes coaching, equipment, and match fees.',
          opportunity_type: 'scholarship',
          position: 'Batsman',
          location: 'Pokhara, Nepal',
          age_range: '14-18',
          experience_level: 'beginner',
          requirements: 'Basic cricket knowledge required',
          benefits: 'Full scholarship worth NPR 50,000',
          deadline: '2024-03-01'
        },
        {
          scout_id: 1,
          title: 'Professional Cricket Training',
          description: 'Intensive 3-month training program with professional coaches. Focus on technique and match strategy.',
          opportunity_type: 'training',
          position: 'Bowler',
          location: 'Lalitpur, Nepal',
          age_range: '18-25',
          experience_level: 'advanced',
          requirements: 'Previous competitive cricket experience',
          benefits: 'Certificate and performance analysis',
          deadline: '2024-02-28'
        }
      ];
      
      for (const opp of testOpportunities) {
        await pool.query(`
          INSERT INTO opportunities (
            scout_id, title, description, opportunity_type, position,
            location, age_range, experience_level, requirements, benefits, deadline
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          opp.scout_id, opp.title, opp.description, opp.opportunity_type, opp.position,
          opp.location, opp.age_range, opp.experience_level, opp.requirements, opp.benefits, opp.deadline
        ]);
      }
      
      console.log('✅ Test opportunities created successfully!');
    } else {
      console.log('Opportunities already exist in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testOpportunities();