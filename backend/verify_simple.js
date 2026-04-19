const BASE = 'http://localhost:3001';
const results = [];

async function test(name, fn) {
  try {
    const r = await fn();
    results.push({ name, status: 'PASS', detail: r });
  } catch (e) {
    results.push({ name, status: 'FAIL', detail: e.message });
  }
}

async function login(email) {
  const res = await fetch(`${BASE}/erp/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'SUE@Leader2025' })
  });
  const d = await res.json();
  const cookies = res.headers.getSetCookie?.() || [];
  const token = cookies.find(c => c.startsWith('sue_token='))?.split(';')[0];
  return { status: res.status, role: d.user?.role, name: d.user?.name, token };
}

(async () => {
  // 1. Ping
  await test('API Ping', async () => {
    const r = await fetch(`${BASE}/erp/api/ping`);
    return `HTTP ${r.status}`;
  });

  // 2. Ping without /erp prefix
  await test('Ping (no prefix)', async () => {
    const r = await fetch(`${BASE}/api/ping`);
    return `HTTP ${r.status}`;
  });

  // 3. Login tests
  const accounts = [
    'berhanu.solomon.g.michael@suethiopia.org',
    'rehobot.haile.tedla@suethiopia.org',
    'dr..matewos.tirsitewold.werke@suethiopia.org',
    'eshetu.dessie.mekonnen@suethiopia.org',
    'tsega.zerihun.lambebo@suethiopia.org',
    'kaleb.tesfahun.geta@suethiopia.org',
    'barkot.abebe.korebo@suethiopia.org',
    'deborah.samson.meried@suethiopia.org',
    'samuel.endashaw@suethiopia.org',
  ];

  let execToken = null;
  for (const email of accounts) {
    await test(`Login: ${email.split('@')[0]}`, async () => {
      const r = await login(email);
      if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
      if (!execToken && r.token) execToken = r.token;
      return `${r.name} (${r.role})`;
    });
  }

  // 4. Profile fetch
  if (execToken) {
    await test('GET /auth/me', async () => {
      const r = await fetch(`${BASE}/erp/api/auth/me`, { headers: { Cookie: execToken } });
      const d = await r.json();
      return `HTTP ${r.status} - ${d.name || d.full_name}`;
    });

    // 5. Profile self-update
    await test('PATCH /auth/me', async () => {
      const r = await fetch(`${BASE}/erp/api/auth/me`, {
        method: 'PATCH',
        headers: { Cookie: execToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+251960278345' })
      });
      return `HTTP ${r.status}`;
    });

    // 6. Admin user listing
    await test('GET /admin/users', async () => {
      const r = await fetch(`${BASE}/erp/api/admin/users`, { headers: { Cookie: execToken } });
      const d = await r.json();
      return `HTTP ${r.status} - ${Array.isArray(d) ? d.length : '?'} users`;
    });

    // 7. Admin user update (role change test)
    await test('PATCH /admin/users/:id', async () => {
      const r = await fetch(`${BASE}/erp/api/admin/users/1`, {
        method: 'PATCH',
        headers: { Cookie: execToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'EXECUTIVE' })
      });
      return `HTTP ${r.status}`;
    });
  }

  // Print results
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  for (const r of results) {
    console.log(`${r.status === 'PASS' ? 'PASS' : 'FAIL'} | ${r.name} | ${r.detail}`);
  }
  console.log(`\nTotal: ${passed} passed, ${failed} failed out of ${results.length}`);
})();
