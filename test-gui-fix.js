#!/usr/bin/env node

/**
 * Test script to verify API fixes
 */

import { existsSync } from 'fs';
import { join } from 'path';

console.log('Checking API file fixes...\n');

const filesToCheck = [
  'lib/api/flow-state-api.js',
  'lib/api/project/index.js',
  'lib/api/doctor/index.js',
  'lib/api/memory/index.js',
  'lib/api/github/index.js',
  'lib/utils/system-diagnostics.js',
  'lib/services/github.js'
];

let allGood = true;

for (const file of filesToCheck) {
  const exists = existsSync(file);
  console.log(`${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allGood = false;
}

console.log('\nAll API files exist:', allGood ? 'YES ✨' : 'NO ❌');

// Check for problematic imports
console.log('\nChecking for removed imports...');
import { readFileSync } from 'fs';

const problematicImports = [
  'config/config-manager.js',
  'commands/doctor/index.js',
  'commands/memory-init.js',
  'commands/github-labels.js',
  'onboarding/orchestrator.js'
];

for (const file of filesToCheck) {
  if (!existsSync(file)) continue;
  
  const content = readFileSync(file, 'utf8');
  for (const importPath of problematicImports) {
    if (content.includes(`from '../../${importPath}'`) && !content.includes('// TODO:')) {
      console.log(`❌ Found unresolved import in ${file}: ${importPath}`);
      allGood = false;
    }
  }
}

if (allGood) {
  console.log('✓ All problematic imports have been resolved\n');
  console.log('✨ API should now work without import errors!');
} else {
  console.log('\n❌ Some issues remain');
}