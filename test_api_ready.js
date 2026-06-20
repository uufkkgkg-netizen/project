const https = require('https');
https.get('https://femcare-backend-api.onrender.com/api/ready', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => console.log('/api/ready ->', r.statusCode, d));
});
