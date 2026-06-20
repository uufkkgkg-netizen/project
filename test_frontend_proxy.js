const https = require('https');

const data = JSON.stringify({ email: 'admin@gmail.com', password: '123456' });

const options = {
  hostname: 'femcare-frontend-app.onrender.com',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers['set-cookie'] ? 'Cookies Set!' : 'No Cookies Set');
    if (res.headers['set-cookie']) {
       console.log(res.headers['set-cookie']);
    }
  });
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
