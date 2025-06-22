#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fsdPath = path.join(__dirname, '..', 'bin', 'fsd.js');

console.log('Testing memory import functionality...\n');

async function testMemoryImport() {
  const testDir = path.join(__dirname, 'test-import');
  const homeDir = os.homedir();
  const memoryPath = path.join(homeDir, '.claude', 'CLAUDE.md');
  const backupPath = path.join(homeDir, '.claude', 'CLAUDE.md.backup');

  try {
    // Setup test environment
    await fs.ensureDir(testDir);
    
    // Backup existing memory if it exists
    if (fs.existsSync(memoryPath)) {
      console.log('Backing up existing memory file...');
      await fs.copy(memoryPath, backupPath);
    }

    // Create a test memory file to import
    const testMemoryContent = `# User Memory for Test User

## Personal Information
- **Name**: Test User
- **Role**: Test Developer

## Development Environment
- **OS**: Test OS
- **Project Location**: \`/test/projects/\`

## Tech Stack Preferences
### Frontend
- Vue 3
- React

### Backend
- Node.js
- Express

## Work Style & Preferences
- **Approach**: Test-driven development
- **Focus**: Quality over speed

## Test Section
- This is a test section for import testing
- Should appear in selective import
`;

    const testMemoryPath = path.join(testDir, 'test-memory.md');
    await fs.writeFile(testMemoryPath, testMemoryContent);

    // Test 1: Check if import command works
    console.log('1. Testing memory import help...');
    const help = spawn('node', [fsdPath, 'memory', 'import', '--help']);
    
    let helpOutput = '';
    help.stdout.on('data', (data) => {
      helpOutput += data.toString();
    });
    
    help.on('close', (code) => {
      if (code === 0 && helpOutput.includes('Import memory from another file')) {
        console.log('✅ Import help works correctly\n');
      } else {
        console.log('❌ Import help failed\n');
      }
    });

    // Test 2: Test import with specific file path
    console.log('2. Testing import with specific file path...');
    console.log(`   Importing from: ${testMemoryPath}`);
    
    const importTest = spawn('node', [fsdPath, 'memory', 'import', testMemoryPath]);
    
    importTest.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      // Auto-respond to prompts for testing
      if (output.includes('Import this memory file?')) {
        setTimeout(() => importTest.stdin.write('y\n'), 100);
      }
    });
    
    importTest.on('close', async (code) => {
      if (code === 0) {
        console.log('✅ Import with file path completed\n');
        
        // Verify the file was imported
        if (fs.existsSync(memoryPath)) {
          const importedContent = await fs.readFile(memoryPath, 'utf-8');
          if (importedContent.includes('Test User') && importedContent.includes('Test Section')) {
            console.log('✅ File was imported correctly\n');
          } else {
            console.log('❌ File import verification failed\n');
          }
        }
      } else {
        console.log('❌ Import with file path failed\n');
      }
      
      // Cleanup and restore
      await cleanup();
    });

  } catch (error) {
    console.error('Test error:', error);
    await cleanup();
  }

  async function cleanup() {
    console.log('Cleaning up test files...');
    
    // Remove test directory
    if (fs.existsSync(testDir)) {
      await fs.remove(testDir);
    }
    
    // Restore backup if it exists
    if (fs.existsSync(backupPath)) {
      await fs.move(backupPath, memoryPath, { overwrite: true });
      console.log('Original memory file restored');
    }
    
    console.log('Cleanup complete');
  }
}

testMemoryImport().catch(console.error);