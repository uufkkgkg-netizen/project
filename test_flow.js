const https = require('https');
const fs = require('fs');

const loginData = JSON.stringify({ email: 'admin@gmail.com', password: '123456' });

const loginOptions = {
  hostname: 'femcare-frontend-app.onrender.com',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length,
  },
};

const req = https.request(loginOptions, (res) => {
  console.log('\n=== LOGIN RESPONSE ===');
  console.log('Status:', res.statusCode);
  console.log('Headers:');
  
  const cookies = [];
  res.headers['set-cookie']?.forEach(c => {
    console.log('  Set-Cookie:', c);
    const name = c.split('=')[0];
    const value = c.split('=')[1].split(';')[0];
    cookies.push({ name, value, raw: c });
  });
  
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('\nBody:', body);
    
    const accessTokenCookie = cookies.find(c => c.name === 'access_token');
    if (!accessTokenCookie) {
      console.log('\n❌ PROBLEM: No access_token cookie in login response!');
      return;
    }
    console.log('\n✅ access_token cookie received');
    
    // Now test dashboard access WITH the cookie
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const dashOptions = {
      hostname: 'femcare-frontend-app.onrender.com',
      port: 443,
      path: '/dashboard',
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
    };
    
    console.log('\n=== DASHBOARD REQUEST (with cookies) ===');
    const req2 = https.request(dashOptions, (res2) => {
      console.log('Status:', res2.statusCode);
      console.log('Location:', res2.headers.location || '(none - no redirect)');
      
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        if (res2.statusCode === 200) {
          console.log('\n✅ Dashboard accessible! (200 OK)');
          console.log('Body preview:', body2.substring(0, 200));
        } else if (res2.statusCode === 307 || res2.statusCode === 302) {
          console.log('\n❌ PROBLEM: Dashboard still redirecting to login!');
          console.log('Redirecting to:', res2.headers.location);
        } else {
          console.log('\nBody preview:', body2.substring(0, 300));
        }
      });
    });
    req2.end();
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(loginData);
req.end();
