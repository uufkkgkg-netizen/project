const http = require('http');

function test(path) {
  return new Promise((resolve) => {
    const req = http.get({ host: 'localhost', port: 3001, path, timeout: 10000 }, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve({ code: r.statusCode, body: d.substring(0, 300) }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ code: 'TIMEOUT', body: '' }); });
    req.on('error', (e) => resolve({ code: 'ERR', body: e.message }));
  });
}

async function main() {
  const paths = ['/health', '/ready', '/api/auth/me'];
  for (const p of paths) {
    const r = await test(p);
    console.log(p + ' => ' + r.code + ' | ' + r.body);
  }
  process.exit(0);
}

main();
