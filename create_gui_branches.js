#!/usr/bin/env node

import { execSync } from 'child_process';
import { chdir } from 'process';

// Change to the project directory
chdir('/home/jez/claude/flow-state-dev');

function runCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return null;
  }
}

console.log('=== Current Git Status ===');
runCommand('git status --porcelain');

console.log('\n=== Current Branch ===');
runCommand('git branch --show-current');

console.log('\n=== Creating feature branches ===');

// Ensure we're on main branch
console.log('Ensuring we are on main branch...');
runCommand('git checkout main');

// Create the feature branches
const branches = [
  'feature/gui-polish-error-handling',
  'feature/gui-polish-performance', 
  'feature/gui-polish-real-api'
];

branches.forEach(branchName => {
  console.log(`\nCreating ${branchName}...`);
  runCommand(`git checkout -b ${branchName}`);
  
  console.log(`Pushing ${branchName} to remote...`);
  runCommand(`git push -u origin ${branchName}`);
  
  console.log(`Switching back to main...`);
  runCommand('git checkout main');
});

console.log('\n=== All Branches ===');
runCommand('git branch -a');

console.log('\n=== Final Status ===');
runCommand('git status');

console.log('\n=== Branch Creation Complete ===');
console.log('Created branches:');
branches.forEach(branch => {
  console.log(`  - ${branch}`);
});