#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chalk from 'chalk';
import semver from 'semver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Files that need version updates
const VERSION_FILES = {
  'package.json': (content, version) => {
    const pkg = JSON.parse(content);
    pkg.version = version;
    return JSON.stringify(pkg, null, 2) + '\n';
  },
  'bin/fsd.js': (content, version) => {
    return content.replace(
      /\.version\('[0-9]+\.[0-9]+\.[0-9]+'\)/,
      `.version('${version}')`
    );
  }
};

// Get current version from package.json
function getCurrentVersion() {
  const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  return pkg.version;
}

// Update version in all files
function updateVersion(newVersion) {
  console.log(chalk.blue(`📝 Updating version to ${newVersion}...`));
  
  for (const [file, updater] of Object.entries(VERSION_FILES)) {
    const filePath = join(rootDir, file);
    try {
      const content = readFileSync(filePath, 'utf8');
      const updated = updater(content, newVersion);
      writeFileSync(filePath, updated);
      console.log(chalk.green(`✓ Updated ${file}`));
    } catch (error) {
      console.error(chalk.red(`✗ Failed to update ${file}: ${error.message}`));
      throw error;
    }
  }
}

// Update CHANGELOG.md
function updateChangelog(version, releaseType) {
  const changelogPath = join(rootDir, 'CHANGELOG.md');
  const content = readFileSync(changelogPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  
  // Check if there are unreleased changes
  if (!content.includes('## [Unreleased]')) {
    console.log(chalk.yellow('⚠️  No unreleased changes found in CHANGELOG.md'));
    console.log(chalk.yellow('   Please add your changes under ## [Unreleased] section'));
    return false;
  }
  
  // Convert Unreleased section to new version
  const updated = content.replace(
    '## [Unreleased]',
    `## [Unreleased]\n\n## [${version}] - ${today}`
  );
  
  writeFileSync(changelogPath, updated);
  console.log(chalk.green('✓ Updated CHANGELOG.md'));
  return true;
}

// Git operations
function gitOperations(version, releaseType) {
  console.log(chalk.blue('\n📦 Preparing git commit...'));
  
  try {
    // Check for uncommitted changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const changedFiles = status.trim().split('\n').filter(line => line.trim());
    
    // Only stage version-related files
    const versionFiles = ['package.json', 'bin/fsd.js', 'CHANGELOG.md'];
    const filesToStage = changedFiles
      .map(line => line.substring(3))
      .filter(file => versionFiles.includes(file));
    
    if (filesToStage.length === 0) {
      console.log(chalk.yellow('⚠️  No version files to commit'));
      return;
    }
    
    // Stage files
    for (const file of filesToStage) {
      execSync(`git add ${file}`);
    }
    
    // Commit
    const commitMessage = `chore: release v${version}`;
    execSync(`git commit -m "${commitMessage}"`);
    console.log(chalk.green('✓ Created release commit'));
    
    // Create tag
    execSync(`git tag v${version} -m "Release v${version}"`);
    console.log(chalk.green(`✓ Created tag v${version}`));
    
  } catch (error) {
    console.error(chalk.red('✗ Git operations failed:'), error.message);
    throw error;
  }
}

// Main release function
async function release(releaseType) {
  console.log(chalk.bold.blue(`\n🚀 Flow State Dev Release (${releaseType})\n`));
  
  // Get current version
  const currentVersion = getCurrentVersion();
  console.log(chalk.gray(`Current version: ${currentVersion}`));
  
  // Calculate new version
  const newVersion = semver.inc(currentVersion, releaseType);
  if (!newVersion) {
    console.error(chalk.red(`✗ Invalid release type: ${releaseType}`));
    process.exit(1);
  }
  
  console.log(chalk.green(`New version: ${newVersion}\n`));
  
  try {
    // Update version in files
    updateVersion(newVersion);
    
    // Update changelog
    const changelogUpdated = updateChangelog(newVersion, releaseType);
    if (!changelogUpdated) {
      console.log(chalk.red('\n✗ Release aborted: Please update CHANGELOG.md'));
      process.exit(1);
    }
    
    // Git operations
    gitOperations(newVersion, releaseType);
    
    console.log(chalk.bold.green('\n✅ Release prepared successfully!\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray('1. Review the changes: git show'));
    console.log(chalk.gray('2. Push to GitHub: git push origin main --tags'));
    console.log(chalk.gray('3. Publish to npm: npm publish'));
    console.log(chalk.gray('\nOr use: npm run release:publish'));
    
  } catch (error) {
    console.error(chalk.red('\n✗ Release failed:'), error.message);
    console.log(chalk.yellow('\nTo undo changes:'));
    console.log(chalk.gray('git reset --hard HEAD~1'));
    console.log(chalk.gray(`git tag -d v${newVersion}`));
    process.exit(1);
  }
}

// CLI handling
const args = process.argv.slice(2);
const releaseType = args[0] || 'patch';

if (!['patch', 'minor', 'major'].includes(releaseType)) {
  console.error(chalk.red(`✗ Invalid release type: ${releaseType}`));
  console.log(chalk.gray('Usage: node scripts/release.js [patch|minor|major]'));
  process.exit(1);
}

// Check if we're on main branch
try {
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  if (branch !== 'main') {
    console.log(chalk.yellow(`⚠️  Warning: You're on branch '${branch}', not 'main'`));
    console.log(chalk.yellow('   Releases should typically be done from the main branch'));
  }
} catch (error) {
  // Git command failed, continue anyway
}

// Run release
release(releaseType);