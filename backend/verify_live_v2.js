async function run() {
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'central.regional@portal.local',
      password: 'Password123!'
    })
  });

  const { token } = await loginRes.json();
  console.log('--- Authenticated ---');

  const netRes = await fetch('http://localhost:3001/api/sub-regional/network', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const net = await netRes.json();
  console.log('Associates count:', net.associates?.length);
  if (net.associates?.length > 0) {
    console.log('Associate Detail Check:', {
      name: net.associates[0].name,
      background: !!net.associates[0].backgroundInfo
    });
  }

  const areaRes = await fetch('http://localhost:3001/api/regional/areas', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const areas = await areaRes.json();
  console.log('Areas count:', areas.length);
  if (areas.length > 0) {
    console.log('Area Metadata Check:', {
      name: areas[0].name,
      subRegion: areas[0].subRegion,
      schools: areas[0].schoolsCount
    });
  }
}

run().catch(console.error);
