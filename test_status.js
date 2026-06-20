const https = require('https');

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Testing at', new Date().toISOString());
  
  // 1. Backend health
  const health = await makeRequest({ hostname: 'femcare-backend-api.onrender.com', path: '/health', method: 'GET' });
  console.log('\n1. Backend /health:', health.status, health.status === 200 ? '✅' : '❌');

  // 2. Frontend availability
  const fe = await makeRequest({ hostname: 'femcare-frontend-app.onrender.com', path: '/', method: 'GET' });
  console.log('2. Frontend /:', fe.status, fe.status === 200 || fe.status === 307 ? '✅' : '❌ (502 = deploying)');

  // 3. Backend login
  const loginBody = JSON.stringify({ email: 'admin@gmail.com', password: '123456' });
  const backendLogin = await makeRequest({
    hostname: 'femcare-backend-api.onrender.com',
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': loginBody.length }
  }, loginBody);
  
  const hasCookies = backendLogin.headers['set-cookie'];
  console.log('3. Backend login:', backendLogin.status, hasCookies ? '✅ (cookies set)' : '❌ (no cookies)');
  if (hasCookies) {
    hasCookies.forEach(c => console.log('   Cookie:', c.substring(0, 80) + '...'));
  }

  // 4. Frontend proxy login (only if frontend is up)
  if (fe.status !== 502) {
    const feLogin = await makeRequest({
      hostname: 'femcare-frontend-app.onrender.com',
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': loginBody.length }
    }, loginBody);
    
    const feHasCookies = feLogin.headers['set-cookie'];
    console.log('4. Frontend proxy login:', feLogin.status, feHasCookies ? '✅ (cookies set)' : '❌ (no cookies)');
    if (feHasCookies) {
      feHasCookies.forEach(c => console.log('   Cookie:', c.substring(0, 80) + '...'));
    }
    
    // 5. Check dashboard with cookies
    if (feHasCookies) {
      const cookieStr = feHasCookies.map(c => c.split(';')[0]).join('; ');
      const dashOptions = {
        hostname: 'femcare-frontend-app.onrender.com',
        path: '/dashboard',
        method: 'GET',
        headers: { 'Cookie': cookieStr }
      };
      const dash = await makeRequest(dashOptions);
      console.log('5. Dashboard with cookies:', dash.status, 
        dash.status === 200 ? '✅ ACCESSIBLE' : 
        (dash.status === 307 || dash.status === 302) ? `❌ REDIRECTING TO: ${dash.headers.location}` : '?');
    }
  } else {
    console.log('4. Frontend proxy: ⏳ Frontend still deploying (502)');
  }
}

main().catch(console.error);
