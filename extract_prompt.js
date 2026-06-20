const fs = require('fs');
const lines = fs.readFileSync('C:/Users/SR/.gemini/antigravity/brain/fe138584-86e6-47e1-8f38-3f09f1bc98c8/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (const l of lines) {
  if (l.includes('الرسالة / البرومبت الشامل')) {
    console.log(JSON.parse(l).content);
    break;
  }
}
