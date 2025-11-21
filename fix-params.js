const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (item === 'route.ts' && fullPath.includes('[')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walkDir('app/api');
let fixed = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Fix params type to Promise
  content = content.replace(/params\s*:\s*\{\s*(\w+)\s*:\s*string\s*\}/g, 'params: Promise<{ $1: string }>');
  
  // Also fix cases with multiple params
  content = content.replace(/params\s*:\s*\{\s*(\w+)\s*:\s*string\s*;\s*(\w+)\s*:\s*string\s*\}/g, 'params: Promise<{ $1: string; $2: string }>');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed: ' + file);
    fixed++;
  }
}
console.log('Total fixed: ' + fixed + ' files');

