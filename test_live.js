const https = require('https');

function test(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 60000 }, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve({ code: r.statusCode, body: d.substring(0, 200) }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ code: 'TIMEOUT', body: '' }); });
    req.on('error', (e) => resolve({ code: 'ERR', body: e.message }));
  });
}

async function main() {
  const endpoints = ['/health', '/ready', '/api/auth/login'];
  for (const ep of endpoints) {
    const r = await test('https://femcare-backend-api.onrender.com' + ep);
    console.log(ep + ' => ' + r.code + ' | ' + r.body);
  }
}

main();
