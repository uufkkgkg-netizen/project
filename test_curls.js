const { execSync } = require('child_process');
const fs = require('fs');

const commands = [
  'curl -i -s https://femcare-backend-api.onrender.com/health',
  'curl -i -s https://femcare-backend-api.onrender.com/ready',
  'curl -i -s -X POST https://femcare-frontend-app.onrender.com/api/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"admin@gmail.com\\",\\"password\\":\\"123456\\"}"',
  'curl -i -s -X POST https://femcare-backend-api.onrender.com/api/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"admin@gmail.com\\",\\"password\\":\\"123456\\"}"',
  // Note: the subsequent calls require cookies/tokens, which is hard to do in simple curl without a cookie jar.
  // I will skip the protected route curls in this script and do them if needed, or just let them fail with 401 as proof they are protected.
];

let out = '';
for (const cmd of commands) {
  out += `\n\n--- COMMAND: ${cmd}\n`;
  try {
    out += execSync(cmd).toString();
  } catch (e) {
    out += 'ERROR: ' + e.message;
  }
}

fs.writeFileSync('test_results.txt', out);
