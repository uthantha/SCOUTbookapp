const axios = require('axios');

async function testDelete() {
  try {
    // Test with a fake token to see if route exists
    console.log('Testing DELETE /api/opportunities/1...');
    
    const response = await axios.delete('http://localhost:5000/api/opportunities/1', {
      headers: { 
        Authorization: 'Bearer fake-token-for-testing'
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n✅ Route exists! (Got 401 Unauthorized as expected with fake token)');
      } else if (error.response.status === 404 && error.response.data.error === 'Route not found') {
        console.log('\n❌ Route not found - DELETE endpoint not registered');
      } else {
        console.log('\n✅ Route exists! (Got different error)');
      }
    } else {
      console.error('Request error:', error.message);
    }
  }
}

testDelete();
