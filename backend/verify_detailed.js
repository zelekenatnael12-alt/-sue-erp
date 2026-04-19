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
  console.log('Keys in network response:', Object.keys(net));
  console.log('Full Network Response:', JSON.stringify(net, null, 2));

  const areaRes = await fetch('http://localhost:3001/api/regional/areas', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const areas = await areaRes.json();
  console.log('\nAreas response type:', Array.isArray(areas) ? 'Array' : typeof areas);
  if (Array.isArray(areas) && areas.length > 0) {
    console.log('First Area Keys:', Object.keys(areas[0]));
  }
}

run().catch(console.error);
