#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fsdPath = path.join(__dirname, '..', 'bin', 'fsd.js');

console.log('Testing memory quick setup...\n');

// Backup existing memory file if it exists
const homeDir = os.homedir();
const memoryPath = path.join(homeDir, '.claude', 'CLAUDE.md');
const backupPath = path.join(homeDir, '.claude', 'CLAUDE.md.backup');

async function testMemoryQuickSetup() {
  // Backup existing file
  if (fs.existsSync(memoryPath)) {
    console.log('Backing up existing memory file...');
    await fs.copy(memoryPath, backupPath);
  }

  // Test 1: Test minimal flag
  console.log('1. Testing minimal setup with --minimal flag...');
  const minimal = spawn('node', [fsdPath, 'memory', 'init', '--minimal', '--force']);
  
  minimal.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  minimal.on('close', async (code) => {
    if (code === 0) {
      console.log('✅ Minimal setup completed\n');
      
      // Check if file was created
      if (fs.existsSync(memoryPath)) {
        const content = await fs.readFile(memoryPath, 'utf-8');
        console.log('Created memory file preview:');
        console.log('---');
        console.log(content.split('\n').slice(0, 10).join('\n'));
        console.log('...');
        console.log('---\n');
      }
      
      // Test 2: Test help
      console.log('2. Testing memory init help...');
      const help = spawn('node', [fsdPath, 'memory', 'init', '--help']);
      
      help.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('--minimal') && output.includes('--force')) {
          console.log('✅ Help shows new options correctly\n');
        }
        console.log(output);
      });
      
      // Restore backup
      if (fs.existsSync(backupPath)) {
        console.log('\nRestoring original memory file...');
        await fs.move(backupPath, memoryPath, { overwrite: true });
      }
    } else {
      console.error('❌ Minimal setup failed');
    }
  });
}

testMemoryQuickSetup().catch(console.error);