const axios = require('axios');

async function verify() {
  const token = 'YOUR_TOKEN_HERE'; // I'll need to get this or use the one from previous sessions
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('--- Verifying Regional Network API ---');
    const networkRes = await axios.get(`${baseURL}/sub-regional/network`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Associates count:', networkRes.data.associates.length);
    if (networkRes.data.associates.length > 0) {
      const first = networkRes.data.associates[0];
      console.log('Sample Associate Detail:', {
        name: first.name,
        background: first.backgroundInfo,
        area: first.registeredBy?.area
      });
    }

    console.log('\n--- Verifying Regional Areas API ---');
    const areasRes = await axios.get(`${baseURL}/regional/areas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Areas count:', areasRes.data.length);
    if (areasRes.data.length > 0) {
      console.log('Sample Area Stats:', areasRes.data[0]);
    }

  } catch (err) {
    console.error('Verification failed:', err.response?.data || err.message);
  }
}

// In this environment, I'll actually just run a few curls instead of this script 
// because getting a fresh token is easier via curl + grep if I have the credentials.
