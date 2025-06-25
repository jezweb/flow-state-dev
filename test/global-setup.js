/**
 * Global setup for Jest tests
 * Runs once before all test suites
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import { join } from 'path';

export default async function globalSetup() {
  console.log(chalk.blue('\n🧪 Flow State Dev Test Suite - Global Setup\n'));
  
  // Create test directories
  const testDir = join(process.cwd(), 'test');
  const tempDir = join(testDir, 'temp');
  const fixturesDir = join(testDir, 'fixtures');
  
  await fs.ensureDir(tempDir);
  await fs.ensureDir(fixturesDir);
  
  // Set up environment variables
  process.env.FSD_TEST_MODE = 'true';
  process.env.FSD_DISABLE_TELEMETRY = 'true';
  
  console.log(chalk.gray('✓ Test directories created'));
  console.log(chalk.gray('✓ Environment variables set'));
  console.log(chalk.green('\n✨ Global setup complete\n'));
};