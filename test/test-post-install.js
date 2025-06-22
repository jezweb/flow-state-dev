#!/usr/bin/env node

// Test the post-install script to ensure it doesn't break
// and handles errors gracefully

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing post-install script...');

try {
  // Test the post-install script
  const output = execSync('node scripts/post-install.cjs', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    timeout: 10000 // 10 second timeout
  });

  console.log('✅ Post-install script executed successfully');
  
  // Check for key elements in output
  const checks = [
    ['version info', /Flow State Dev v\d+\.\d+\.\d+/],
    ['platform info', /Platform:/],
    ['testing section', /Testing installation/],
    ['documentation links', /github\.com\/jezweb\/flow-state-dev/]
  ];

  let passed = 0;
  checks.forEach(([name, pattern]) => {
    if (pattern.test(output)) {
      console.log(`✅ ${name} found`);
      passed++;
    } else {
      console.log(`❌ ${name} missing`);
    }
  });

  if (passed === checks.length) {
    console.log('🎉 All post-install checks passed!');
    process.exit(0);
  } else {
    console.log(`⚠️  ${passed}/${checks.length} checks passed`);
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Post-install script failed:');
  console.error(error.message);
  
  if (error.stdout) {
    console.log('\nOutput:');
    console.log(error.stdout);
  }
  
  if (error.stderr) {
    console.log('\nErrors:');
    console.log(error.stderr);
  }
  
  process.exit(1);
}