#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const testDir = join(rootDir, 'test-output');

// Interactive test scenarios
const scenarios = [
  {
    name: 'Full Interactive Setup',
    projectName: 'test-full-interactive',
    inputs: [
      { wait: 'project name', send: 'test-full-interactive\n' },
      { wait: 'configure Supabase', send: 'Y\n' },
      { wait: 'Supabase project URL', send: 'https://myproject.supabase.co\n' },
      { wait: 'Supabase anon key', send: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test\n' },
      { wait: 'GitHub repository', send: 'Y\n' },
      { wait: 'GitHub repository URL', send: '\n' } // Skip
    ],
    verify: async (projectPath) => {
      // Check .env exists and has correct content
      const envContent = await fs.readFile(join(projectPath, '.env'), 'utf-8');
      if (!envContent.includes('https://myproject.supabase.co')) {
        throw new Error('.env missing Supabase URL');
      }
    }
  },
  {
    name: 'Skip All Configuration',
    projectName: 'test-skip-all',
    inputs: [
      { wait: 'project name', send: 'test-skip-all\n' },
      { wait: 'configure Supabase', send: 'N\n' },
      { wait: 'GitHub repository', send: 'N\n' }
    ],
    verify: async (projectPath) => {
      // Check .env does NOT exist
      const envExists = await fs.pathExists(join(projectPath, '.env'));
      if (envExists) {
        throw new Error('.env should not exist when skipping configuration');
      }
    }
  }
];

async function runInteractiveTest(scenario) {
  console.log(chalk.blue(`\nRunning: ${scenario.name}`));
  
  const projectPath = join(testDir, scenario.projectName);
  await fs.remove(projectPath);
  
  return new Promise((resolve, reject) => {
    const fsd = spawn('node', [join(rootDir, 'bin/fsd.js'), 'init'], {
      cwd: testDir,
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    let output = '';
    let currentInput = 0;
    let timeout;
    
    fsd.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(chalk.gray(data.toString()));
      
      // Clear previous timeout
      if (timeout) clearTimeout(timeout);
      
      // Check if we need to send input
      if (currentInput < scenario.inputs.length) {
        const input = scenario.inputs[currentInput];
        if (output.toLowerCase().includes(input.wait.toLowerCase())) {
          setTimeout(() => {
            console.log(chalk.yellow(`Sending: ${input.send.trim()}`));
            fsd.stdin.write(input.send);
            currentInput++;
          }, 200);
        }
      }
      
      // Set timeout for process to complete
      timeout = setTimeout(() => {
        fsd.kill();
      }, 5000);
    });
    
    fsd.stderr.on('data', (data) => {
      console.error(chalk.red(data.toString()));
    });
    
    fsd.on('close', async (code) => {
      if (timeout) clearTimeout(timeout);
      
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
        return;
      }
      
      try {
        // Verify project was created
        const exists = await fs.pathExists(projectPath);
        if (!exists) {
          throw new Error('Project directory was not created');
        }
        
        // Run scenario-specific verification
        if (scenario.verify) {
          await scenario.verify(projectPath);
        }
        
        console.log(chalk.green(`✅ ${scenario.name} passed`));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function runAllInteractiveTests() {
  console.log(chalk.cyan.bold('\n🎭 Interactive Test Suite\n'));
  
  await fs.ensureDir(testDir);
  
  let passed = 0;
  let failed = 0;
  
  for (const scenario of scenarios) {
    try {
      await runInteractiveTest(scenario);
      passed++;
    } catch (error) {
      console.log(chalk.red(`❌ ${scenario.name} failed: ${error.message}`));
      failed++;
    }
  }
  
  console.log(chalk.cyan.bold('\n📊 Interactive Test Summary\n'));
  console.log(chalk.green(`Passed: ${passed}`));
  console.log(chalk.red(`Failed: ${failed}`));
  
  if (failed === 0) {
    console.log(chalk.green.bold('\n✅ All interactive tests passed!'));
    await fs.remove(testDir);
  } else {
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAllInteractiveTests().catch(error => {
    console.error(chalk.red('Interactive test error:'), error);
    process.exit(1);
  });
}