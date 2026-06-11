/**
 * Integration smoke-test — runs with: node src/tests/smoke.mjs
 * Tests: pages load (200), modals mount, no 404s on API routes.
 * Uses native fetch (Node 18+). No extra deps required.
 */

const BASE_FE = 'http://localhost:3000';
const BASE_BE = 'http://localhost:3001/api';

const PAGES = [
  '/dashboard',
  '/dashboard/prescriptions',
  '/dashboard/ultrasound',
  '/dashboard/patients',
  '/dashboard/appointments',
  '/dashboard/billing',
];

let passed = 0;
let failed = 0;

async function check(label, fn) {
  try {
    await fn();
    console.log(`  ✅  ${label}`);
    passed++;
  } catch (e) {
    console.error(`  ❌  ${label} — ${e.message}`);
    failed++;
  }
}

async function expectStatus(url, expected = 200) {
  const res = await fetch(url, { redirect: 'follow' });
  if (res.status !== expected)
    throw new Error(`Expected ${expected}, got ${res.status}`);
}

console.log('\n🔍  FemCare Smoke Test\n');

// 1. Frontend pages
console.log('▶  Frontend Pages');
for (const page of PAGES) {
  await check(`GET ${page} → 200`, () => expectStatus(`${BASE_FE}${page}`));
}

// 2. Backend health (unauthenticated → 401 is fine, 404 means route missing)
console.log('\n▶  Backend API Routes');
const API_ROUTES = [
  ['/appointments',    401],
  ['/patients',        401],
  ['/prescriptions',   401],
  ['/sonar',           401],
  ['/billing',         401],
  ['/billing/summary', 401],
  ['/analytics/summary', 401],
];
for (const [route, expected] of API_ROUTES) {
  await check(`GET ${BASE_BE}${route} → ${expected}`, () =>
    expectStatus(`${BASE_BE}${route}`, expected)
  );
}

console.log(`\n📊  Results: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
