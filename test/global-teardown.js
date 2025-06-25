/**
 * Global teardown for Jest tests
 * Runs once after all test suites
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import { join } from 'path';

export default async function globalTeardown() {
  console.log(chalk.blue('\n🧪 Flow State Dev Test Suite - Global Teardown\n'));
  
  // Clean up test directories
  const testDir = join(process.cwd(), 'test');
  const tempDir = join(testDir, 'temp');
  
  try {
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
      console.log(chalk.gray('✓ Temporary test directory cleaned'));
    }
  } catch (error) {
    console.error(chalk.red('Failed to clean up test directory:'), error);
  }
  
  console.log(chalk.green('\n✨ Global teardown complete\n'));
};