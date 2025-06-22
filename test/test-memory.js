#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fsdPath = path.join(__dirname, '..', 'bin', 'fsd.js');

console.log('Testing memory commands...\n');

// Test 1: Help command
console.log('1. Testing memory help...');
const help = spawn('node', [fsdPath, 'memory', '--help']);
help.stdout.on('data', (data) => {
  console.log(data.toString());
});

help.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Memory help works\n');
    
    // Test 2: Show command
    console.log('2. Testing memory show...');
    const show = spawn('node', [fsdPath, 'memory', 'show']);
    
    show.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Current memory file') || output.includes('No memory file found')) {
        console.log('✅ Memory show works\n');
      }
    });
    
    show.stderr.on('data', (data) => {
      console.error('Error:', data.toString());
    });
  }
});

// Note: Interactive commands (init, import) need manual testing