const http = require('http');

function post(path, body, cookieStr, csrfToken) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    if (cookieStr) headers['Cookie'] = cookieStr;
    if (csrfToken) headers['x-csrf-token'] = csrfToken;
    
    const opts = {
      host: 'localhost', port: 3001, path, method: 'POST',
      headers,
      timeout: 10000
    };
    const req = http.request(opts, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve({ 
        code: r.statusCode, 
        body: d.substring(0, 400),
        headers: r.headers
      }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ code: 'TIMEOUT', body: '' }); });
    req.on('error', (e) => resolve({ code: 'ERR', body: e.message }));
    req.write(data);
    req.end();
  });
}

function get(path, cookieStr) {
  return new Promise((resolve) => {
    const opts = {
      host: 'localhost', port: 3001, path,
      headers: cookieStr ? { 'Cookie': cookieStr } : {},
      timeout: 10000
    };
    const req = http.get(opts, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve({ 
        code: r.statusCode, 
        body: d.substring(0, 400),
        headers: r.headers
      }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ code: 'TIMEOUT', body: '' }); });
    req.on('error', (e) => resolve({ code: 'ERR', body: e.message }));
  });
}

function extractCookies(headers) {
  const setCookie = headers['set-cookie'] || [];
  return setCookie.map(c => c.split(';')[0]).join('; ');
}

async function main() {
  console.log('=== AUTH FLOW TEST ===\n');

  // 1. Login
  console.log('1. POST /api/auth/login');
  const login = await post('/api/auth/login', { email: 'admin@gmail.com', password: 'Admin123!' });
  console.log('   Status:', login.code);
  console.log('   Body:', login.body);
  const cookies = extractCookies(login.headers);
  console.log('   Cookies set:', cookies ? 'YES' : 'NONE');
  if (login.headers['set-cookie']) {
    login.headers['set-cookie'].forEach(c => console.log('   -', c.substring(0, 80)));
  }
  console.log('   access_token in body:', login.body.includes('access_token') ? 'YES (BAD!)' : 'NO (GOOD)');
  console.log();

  if (login.code !== 200 && login.code !== 201) {
    console.log('Login failed - stopping test');
    process.exit(1);
  }

  // 2. GET /me
  console.log('2. GET /api/auth/me (with cookies)');
  const me = await get('/api/auth/me', cookies);
  console.log('   Status:', me.code);
  console.log('   Body:', me.body);
  console.log();

  // 3. Refresh
  console.log('3. POST /api/auth/refresh');
  let csrfCookie = (login.headers['set-cookie'] || []).find(c => c.startsWith('csrf_token'));
  let csrfToken = csrfCookie ? csrfCookie.split('=')[1].split(';')[0] : '';
  const refresh = await post('/api/auth/refresh', {}, cookies, csrfToken);
  console.log('   Status:', refresh.code);
  console.log('   Body:', refresh.body.substring(0, 200));
  console.log();

  // update cookies/token
  let currentCookies = cookies;
  if (refresh.headers && refresh.headers['set-cookie']) {
    currentCookies = extractCookies(refresh.headers);
    csrfCookie = refresh.headers['set-cookie'].find(c => c.startsWith('csrf_token'));
    if (csrfCookie) csrfToken = csrfCookie.split('=')[1].split(';')[0];
  }

  // 4. Logout
  console.log('4. POST /api/auth/logout (with cookies and CSRF)');
  const logoutResp = await post('/api/auth/logout', {}, currentCookies, csrfToken);
  console.log('   Status:', logoutResp.code);
  console.log('   Body:', logoutResp.body);
  console.log();

  process.exit(0);
}

main();
