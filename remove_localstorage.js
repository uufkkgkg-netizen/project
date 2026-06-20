const fs = require('fs');
const path = require('path');
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('c:/Users/SR/Desktop/web/frontend/src/app/portal', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove token fetching from localStorage
    content = content.replace(/const token = localStorage\.getItem\("portal_access_token"\);\s*/g, '');
    
    // In headers, remove Authorization: `Bearer ${token}` entirely for patient portal since cookies are used.
    content = content.replace(/headers:\s*{\s*Authorization:\s*`Bearer \${token}`\s*},?\s*/g, '');
    content = content.replace(/,\s*headers:\s*{\s*Authorization:\s*`Bearer \${token}`\s*}/g, '');
    
    // In layout.tsx, token checking was used to redirect
    if (filePath.includes('layout.tsx')) {
        content = content.replace(/const token = localStorage\.getItem\("portal_access_token"\);\s*/g, '');
        content = content.replace(/const patientStr = localStorage\.getItem\("portal_patient"\);\s*/g, '');
        content = content.replace(/localStorage\.removeItem\("portal_access_token"\);\s*/g, '');
        content = content.replace(/localStorage\.removeItem\("portal_patient"\);\s*/g, '');
    }
    
    if (filePath.includes('login\\page.tsx')) {
        content = content.replace(/localStorage\.setItem\("portal_patient", JSON\.stringify\(patient\)\);\s*/g, '');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
