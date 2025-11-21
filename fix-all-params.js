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
  
  // Fix: { params }: { params: { id: string } } -> { params }: { params: Promise<{ id: string }> }
  content = content.replace(/\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*(\w+)\s*:\s*string\s*\}\s*\}/g, '{ params }: { params: Promise<{ $1: string }> }');
  
  // Also fix: params.id -> (await params).id or destructure it
  // First, add await params at the start of functions that use params
  content = content.replace(/(\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*Promise<\{[^}]+\}>\s*\}\s*\)\s*\{[\s\S]*?try\s*\{)/g, (match) => {
    if (match.includes('const { ') && match.includes('} = await params')) {
      return match;
    }
    return match.replace(/try\s*\{/, 'try {\n    const { id } = await params;');
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed: ' + file);
    fixed++;
  }
}
console.log('Total fixed: ' + fixed + ' files');

