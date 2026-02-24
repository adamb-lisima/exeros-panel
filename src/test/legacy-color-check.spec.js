#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '..');
const EXTENSIONS = new Set(['.ts', '.html', '.scss', '.css']);
const EXCLUDED_DIRS = new Set(['node_modules', '.angular', 'dist']);
const SELF = path.resolve(__filename);

const LEGACY_COLORS = [
  'cultured',
  'chinese-white',
  'anti-flash-white',
  'platinum',
  'chinese-silver',
  'light-steel-blue',
  'manatee',
  'bright-gray',
  'sonic-silver',
  'dim-gray',
  'arsenic',
  'dark-electric-blue',
  'outer-space',
  'dust-storm',
  'quartz',
  'old-lace',
  'carmel',
  'main-primary',
  'main-primary--10',
  'main-primary--30',
  'extra-one',
  'extra-one--10',
  'extra-two',
  'extra-two--10',
  'extra-three',
  'extra-three--10',
  'extra-four',
  'extra-four--10',
];

// Sort longest-first so patterns with modifiers (e.g. main-primary--10) match before base names
const sorted = [...LEGACY_COLORS].sort((a, b) => b.length - a.length);
const pattern = new RegExp(sorted.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

function collectFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) results.push(...collectFiles(full));
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name)) && full !== SELF) {
      results.push(full);
    }
  }
  return results;
}

const files = collectFiles(SRC_DIR);
let totalViolations = 0;

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].match(pattern);
    if (matches) {
      for (const m of matches) {
        totalViolations++;
        const rel = path.relative(process.cwd(), file);
        console.log(`  ${rel}:${i + 1}  found "${m}"`);
        console.log(`    ${lines[i].trimStart()}`);
      }
    }
  }
}

console.log(`\nSummary: ${files.length} files scanned, ${totalViolations} violation(s) found.`);
process.exit(totalViolations > 0 ? 1 : 0);
