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
  
  // Fix: const id = params.id; -> const { id } = await params;
  content = content.replace(/const\s+(\w+)\s*=\s*params\.(\w+)/g, 'const { $2 } = await params;\n    const $1 = $2');
  
  // Also handle direct destructuring in function params
  content = content.replace(/const\s+\{\s*(\w+)\s*\}\s*=\s*params/g, 'const { $1 } = await params');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed usage: ' + file);
    fixed++;
  }
}
console.log('Total fixed: ' + fixed + ' files');

