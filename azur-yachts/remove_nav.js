const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We look for <nav className="nav-top"> up to the closing </nav>
      // We assume there are no nested <nav> inside.
      const navRegex = /(?:[ \t]*\{\/\*[^\n]*NAV[^\n]*\*\/\}\n)?[ \t]*<nav className="nav-top">[\s\S]*?<\/nav>/;
      
      if (navRegex.test(content)) {
        content = content.replace(navRegex, '');
        fs.writeFileSync(fullPath, content);
        console.log('Removed nav from', fullPath);
      }
    }
  }
}

processDir('src/app');
