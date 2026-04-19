async function verify() {
  const BASE_URL = 'http://127.0.0.1:3001/api';
  try {
    console.log('1. Logging in as Regional Director...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'central.regional@portal.local',
        password: 'Password123!'
      })
    });
    const { token, user } = await loginRes.json();
    console.log('   Login successful. Region:', user.region);

    console.log('2. Adding a new test area...');
    const addAreaRes = await fetch(`${BASE_URL}/regional/areas`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Automated Test Area',
        subRegion: 'Test Subregion',
        zone: 'Test Zone',
        town: 'Test Town',
        contactPerson: 'Test Coordinator',
        fellowshipsCount: 15
      })
    });
    const newArea = await addAreaRes.json();
    console.log('   Area created:', newArea.name, 'with ID:', newArea.id);

    console.log('3. Fetching regional areas with stats...');
    const areasRes = await fetch(`${BASE_URL}/regional/areas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const areas = await areasRes.json();
    
    const testArea = areas.find(a => a.name === 'Automated Test Area');
    if (testArea) {
      console.log('✅ Success: Test area found in list.');
      console.log('   Stats check:', {
        schools: testArea.schoolsCount,
        staff: testArea.staffCount,
        associates: testArea.associatesCount,
        volunteers: testArea.volunteersCount
      });
      if ('schoolsCount' in testArea && 'staffCount' in testArea) {
        console.log('✅ Success: Aggregated stats fields are present.');
      } else {
        console.log('❌ Failed: Stats fields missing in response.');
      }
    } else {
      console.log('❌ Failed: Test area NOT found in list.');
    }

  } catch (err) {
    console.error('❌ Error during verification:', err.message);
  }
}

verify();
