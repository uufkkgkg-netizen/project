const http = require('https');
const fs = require('fs');

async function poll() {
  while (true) {
    try {
      const data = await new Promise((resolve, reject) => {
        http.get('https://femcare-backend-api.onrender.com/api/logs', (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve({ code: res.statusCode, body }));
        }).on('error', reject);
      });
      if (data.code === 200) {
        console.log('Logs retrieved!');
        fs.writeFileSync('logs_output.json', data.body);
        break;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 2000));
  }
}
poll();
