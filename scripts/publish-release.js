#!/usr/bin/env node

import { execSync } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';

console.log(chalk.bold.blue('\n📦 Flow State Dev - Publish Release\n'));

// Check current branch
function checkBranch() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (branch !== 'main') {
      console.log(chalk.yellow(`⚠️  Warning: You're on branch '${branch}', not 'main'`));
      return false;
    }
    return true;
  } catch (error) {
    console.error(chalk.red('✗ Failed to check git branch'));
    return false;
  }
}

// Check for unpushed commits
function checkUnpushed() {
  try {
    const unpushed = execSync('git log origin/main..HEAD --oneline', { encoding: 'utf8' }).trim();
    if (unpushed) {
      console.log(chalk.yellow('📤 Unpushed commits:'));
      console.log(chalk.gray(unpushed.split('\n').map(l => '   ' + l).join('\n')));
      return true;
    }
    return false;
  } catch (error) {
    // No upstream branch or other error
    return true;
  }
}

// Check for tags
function checkTags() {
  try {
    const tags = execSync('git tag --points-at HEAD', { encoding: 'utf8' }).trim();
    if (tags) {
      console.log(chalk.green(`✓ Tagged as: ${tags.split('\n').join(', ')}`));
      return tags.split('\n')[0]; // Return first tag
    }
    console.log(chalk.yellow('⚠️  No tags on current commit'));
    return null;
  } catch (error) {
    console.error(chalk.red('✗ Failed to check tags'));
    return null;
  }
}

// Main publish flow
async function publish() {
  // Pre-flight checks
  console.log(chalk.blue('🔍 Pre-flight checks...\n'));
  
  const onMain = checkBranch();
  const hasUnpushed = checkUnpushed();
  const currentTag = checkTags();
  
  if (!onMain) {
    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: 'Continue publishing from non-main branch?',
      default: false
    }]);
    if (!proceed) {
      console.log(chalk.yellow('\n✗ Publishing cancelled'));
      process.exit(0);
    }
  }
  
  // Push to GitHub if needed
  if (hasUnpushed) {
    const { push } = await inquirer.prompt([{
      type: 'confirm',
      name: 'push',
      message: 'Push commits and tags to GitHub?',
      default: true
    }]);
    
    if (push) {
      try {
        console.log(chalk.blue('\n📤 Pushing to GitHub...'));
        execSync('git push origin main --follow-tags', { stdio: 'inherit' });
        console.log(chalk.green('✓ Pushed successfully'));
      } catch (error) {
        console.error(chalk.red('✗ Push failed'));
        process.exit(1);
      }
    }
  }
  
  // Run final validation
  console.log(chalk.blue('\n🔍 Running release validation...\n'));
  try {
    execSync('node scripts/validate-release.js', { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red('\n✗ Validation failed'));
    const { force } = await inquirer.prompt([{
      type: 'confirm',
      name: 'force',
      message: 'Force publish despite validation failures?',
      default: false
    }]);
    if (!force) {
      process.exit(1);
    }
  }
  
  // Confirm npm publish
  console.log(chalk.blue('\n📦 Ready to publish to npm\n'));
  
  try {
    // Check npm login status
    execSync('npm whoami', { stdio: 'pipe' });
  } catch (error) {
    console.error(chalk.red('✗ Not logged in to npm'));
    console.log(chalk.gray('Run: npm login'));
    process.exit(1);
  }
  
  const { confirmPublish } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirmPublish',
    message: 'Publish to npm registry?',
    default: true
  }]);
  
  if (!confirmPublish) {
    console.log(chalk.yellow('\n✗ Publishing cancelled'));
    process.exit(0);
  }
  
  // Publish to npm
  try {
    console.log(chalk.blue('\n🚀 Publishing to npm...\n'));
    execSync('npm publish', { stdio: 'inherit' });
    console.log(chalk.bold.green('\n✅ Successfully published to npm!\n'));
    
    // Post-publish tasks
    if (currentTag) {
      console.log(chalk.cyan('📋 Post-publish checklist:'));
      console.log(chalk.gray(`1. Create GitHub release: https://github.com/jezweb/flow-state-dev/releases/new?tag=${currentTag}`));
      console.log(chalk.gray('2. Announce in Discord/Slack'));
      console.log(chalk.gray('3. Update documentation site'));
      console.log(chalk.gray('4. Tweet about the release'));
    }
    
  } catch (error) {
    console.error(chalk.red('\n✗ npm publish failed'));
    console.log(chalk.yellow('\nTroubleshooting:'));
    console.log(chalk.gray('- Check npm login: npm whoami'));
    console.log(chalk.gray('- Check package.json is valid'));
    console.log(chalk.gray('- Try: npm publish --dry-run'));
    process.exit(1);
  }
}

// Run
publish().catch(error => {
  console.error(chalk.red('\n✗ Unexpected error:'), error);
  process.exit(1);
});