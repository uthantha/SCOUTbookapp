const axios = require('axios');

async function testDeleteEndpoint() {
  try {
    console.log('🧪 Testing DELETE endpoint...\n');

    // First, login as a scout to get a token
    console.log('Step 1: Logging in as scout...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'scout@example.com', // Update with actual scout email
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Get scout's opportunities
    console.log('\nStep 2: Fetching scout opportunities...');
    const oppsResponse = await axios.get('http://localhost:5000/api/opportunities/scout/my-opportunities', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const opportunities = oppsResponse.data;
    console.log(`✅ Found ${opportunities.length} opportunities`);

    if (opportunities.length === 0) {
      console.log('⚠️  No opportunities to delete. Create one first.');
      return;
    }

    // Try to delete the first opportunity
    const oppToDelete = opportunities[0];
    console.log(`\nStep 3: Attempting to delete opportunity ${oppToDelete.id} (${oppToDelete.title})...`);

    const deleteResponse = await axios.delete(`http://localhost:5000/api/opportunities/${oppToDelete.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Delete successful:', deleteResponse.data);

    // Verify it's deleted
    console.log('\nStep 4: Verifying deletion...');
    const verifyResponse = await axios.get('http://localhost:5000/api/opportunities/scout/my-opportunities', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const remainingOpps = verifyResponse.data;
    const stillExists = remainingOpps.find(opp => opp.id === oppToDelete.id);

    if (stillExists) {
      console.log('❌ Opportunity still exists after deletion');
    } else {
      console.log('✅ Opportunity successfully deleted');
    }

    console.log(`\n✅ Test completed! Remaining opportunities: ${remainingOpps.length}`);

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testDeleteEndpoint();
