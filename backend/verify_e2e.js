/**
 * Comprehensive E2E API Verification Script
 * Tests all provisioned leadership accounts and key endpoints.
 */

const BASE = 'http://localhost:3001';

async function loginAs(email, password) {
  const res = await fetch(`${BASE}/erp/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  // Extract set-cookie header
  const cookies = res.headers.getSetCookie?.() || [];
  const token = cookies.find(c => c.startsWith('sue_token='))?.split(';')[0];
  return { status: res.status, data, token };
}

async function getProfile(token) {
  const res = await fetch(`${BASE}/erp/api/auth/me`, {
    headers: { 'Cookie': token }
  });
  return { status: res.status, data: await res.json() };
}

async function testAdminUsers(token) {
  const res = await fetch(`${BASE}/erp/api/admin/users`, {
    headers: { 'Cookie': token }
  });
  return { status: res.status, data: await res.json() };
}

async function testUpdateProfile(token) {
  const res = await fetch(`${BASE}/erp/api/auth/me`, {
    method: 'PATCH',
    headers: { 'Cookie': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+251999999999' })
  });
  return { status: res.status, data: await res.json() };
}

async function testPing() {
  const res = await fetch(`${BASE}/erp/api/ping`);
  return { status: res.status, data: await res.json() };
}

// ─── Test Suite ─────────────────────────────────────────────────────────────

const TESTS = [
  { email: 'berhanu.solomon.g.michael@suethiopia.org', name: 'Berhanu (National Director)', role: 'EXECUTIVE' },
  { email: 'rehobot.haile.tedla@suethiopia.org', name: 'Rehobot (Finance)', role: 'EXECUTIVE' },
  { email: 'eshetu.dessie.mekonnen@suethiopia.org', name: 'Eshetu (Addis Ababa Regional)', role: 'REGIONAL' },
  { email: 'tsega.zerihun.lambebo@suethiopia.org', name: 'Tsega (South Ethiopia Regional)', role: 'REGIONAL' },
  { email: 'kaleb.tesfahun.geta@suethiopia.org', name: 'Kaleb (Central Ethiopia Regional)', role: 'REGIONAL' },
  { email: 'deborah.samson.meried@suethiopia.org', name: 'Deborah (Sub-Regional)', role: 'SUB_REGIONAL' },
];

async function run() {
  console.log('═══════════════════════════════════════════════');
  console.log('  SUE ERP — Comprehensive Local Verification   ');
  console.log('═══════════════════════════════════════════════');

  // Test 1: Ping
  console.log('\n📡 Test 1: API Health Check (/erp/api/ping)');
  try {
    const ping = await testPing();
    console.log(`   Status: ${ping.status} → ${ping.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
  }

  // Test 2: Login all leadership accounts
  console.log('\n🔐 Test 2: Leadership Account Login');
  let executiveToken = null;
  let passCount = 0;
  let failCount = 0;
  
  for (const t of TESTS) {
    try {
      const result = await loginAs(t.email, 'SUE@Leader2025');
      if (result.status === 200) {
        console.log(`   ✅ ${t.name} — Login OK (role: ${result.data.user?.role})`);
        passCount++;
        if (t.role === 'EXECUTIVE' && !executiveToken) executiveToken = result.token;
      } else {
        console.log(`   ❌ ${t.name} — Status ${result.status}: ${result.data.error}`);
        failCount++;
      }
    } catch (e) {
      console.log(`   ❌ ${t.name} — Error: ${e.message}`);
      failCount++;
    }
  }
  console.log(`   Summary: ${passCount} passed, ${failCount} failed out of ${TESTS.length}`);

  if (!executiveToken) {
    console.log('\n⚠️  Cannot continue — no executive token obtained');
    return;
  }

  // Test 3: Profile fetch
  console.log('\n👤 Test 3: Profile Fetch (/erp/api/auth/me)');
  try {
    const profile = await getProfile(executiveToken);
    console.log(`   Status: ${profile.status} → ${profile.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    if (profile.data.name) console.log(`   Name: ${profile.data.name}`);
    if (profile.data.role) console.log(`   Role: ${profile.data.role}`);
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
  }

  // Test 4: Profile self-update
  console.log('\n✏️  Test 4: Profile Self-Update (PATCH /erp/api/auth/me)');
  try {
    const update = await testUpdateProfile(executiveToken);
    console.log(`   Status: ${update.status} → ${update.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
  }

  // Test 5: Admin user listing
  console.log('\n📋 Test 5: Admin User Listing (/erp/api/admin/users)');
  try {
    const users = await testAdminUsers(executiveToken);
    console.log(`   Status: ${users.status} → ${users.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    if (Array.isArray(users.data)) console.log(`   Total users: ${users.data.length}`);
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
  }

  // Test 6: Prefix stripping
  console.log('\n🔀 Test 6: /erp Prefix Stripping Middleware');
  try {
    const r1 = await fetch(`${BASE}/api/ping`);
    const r2 = await fetch(`${BASE}/erp/api/ping`);
    console.log(`   /api/ping → ${r1.status} ${r1.status === 200 ? '✅' : '❌'}`);
    console.log(`   /erp/api/ping → ${r2.status} ${r2.status === 200 ? '✅' : '❌'}`);
  } catch (e) {
    console.log(`   ❌ FAIL: ${e.message}`);
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  Verification Complete');
  console.log('═══════════════════════════════════════════════');
}

run().catch(console.error);
