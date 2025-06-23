#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Validation results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Check helper
function check(name, fn) {
  process.stdout.write(chalk.gray(`Checking ${name}...`));
  try {
    const result = fn();
    if (result === true) {
      results.passed.push(name);
      console.log(chalk.green(' ✓'));
    } else if (result === 'warning') {
      results.warnings.push(name);
      console.log(chalk.yellow(' ⚠️'));
    } else {
      results.failed.push(name);
      console.log(chalk.red(' ✗'));
    }
  } catch (error) {
    results.failed.push(`${name}: ${error.message}`);
    console.log(chalk.red(' ✗'));
  }
}

// Validations
console.log(chalk.bold.blue('\n🔍 Flow State Dev Release Validation\n'));

// 1. Version consistency
check('Version consistency', () => {
  const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  const pkgVersion = pkg.version;
  
  // Check bin/fsd.js
  const fsdContent = readFileSync(join(rootDir, 'bin/fsd.js'), 'utf8');
  const fsdVersionMatch = fsdContent.match(/\.version\('([0-9]+\.[0-9]+\.[0-9]+)'\)/);
  if (!fsdVersionMatch || fsdVersionMatch[1] !== pkgVersion) {
    throw new Error(`Version mismatch: package.json (${pkgVersion}) vs bin/fsd.js (${fsdVersionMatch?.[1] || 'not found'})`);
  }
  
  return true;
});

// 2. Git status
check('Git working directory', () => {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    console.log(chalk.yellow('\n  Uncommitted changes:'));
    console.log(chalk.gray(status.trim().split('\n').map(l => '    ' + l).join('\n')));
    return 'warning';
  }
  return true;
});

// 3. Dependencies
check('Dependencies up to date', () => {
  try {
    const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
    const deps = JSON.parse(outdated || '{}');
    const count = Object.keys(deps).length;
    if (count > 0) {
      console.log(chalk.yellow(`\n  ${count} outdated dependencies`));
      return 'warning';
    }
  } catch (error) {
    // npm outdated exits with 1 if there are outdated deps
    if (error.status === 1) {
      return 'warning';
    }
    throw error;
  }
  return true;
});

// 4. Security audit
check('Security vulnerabilities', () => {
  try {
    execSync('npm audit --json', { encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch (error) {
    const output = error.stdout?.toString() || '';
    try {
      const audit = JSON.parse(output);
      const total = audit.metadata?.vulnerabilities?.total || 0;
      if (total > 0) {
        console.log(chalk.yellow(`\n  ${total} vulnerabilities found`));
        return 'warning';
      }
    } catch (parseError) {
      // If we can't parse, assume there's an issue
      return 'warning';
    }
  }
  return true;
});

// 5. Required files
check('Required files exist', () => {
  const required = [
    'README.md',
    'LICENSE',
    'CHANGELOG.md',
    'package.json',
    'bin/fsd.js',
    '.gitignore',
    '.npmignore'
  ];
  
  const missing = required.filter(file => !existsSync(join(rootDir, file)));
  if (missing.length > 0) {
    throw new Error(`Missing files: ${missing.join(', ')}`);
  }
  return true;
});

// 6. Package size
check('Package size', () => {
  const stats = execSync('npm pack --dry-run --json', { encoding: 'utf8' });
  const data = JSON.parse(stats);
  const size = data[0]?.size || 0;
  const sizeMB = (size / 1024 / 1024).toFixed(2);
  
  if (size > 10 * 1024 * 1024) { // 10MB
    throw new Error(`Package too large: ${sizeMB}MB (limit: 10MB)`);
  }
  
  console.log(chalk.gray(` (${sizeMB}MB)`));
  return true;
});

// 7. Test suite
console.log(chalk.blue('\n📋 Running test suite...\n'));

check('Unit tests', () => {
  execSync('npm run test', { stdio: 'pipe' });
  return true;
});

check('Installation test', () => {
  execSync('npm run test:install', { stdio: 'pipe' });
  return true;
});

// 8. Documentation
check('Documentation up to date', () => {
  const readme = readFileSync(join(rootDir, 'README.md'), 'utf8');
  const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  
  // Check if version is mentioned in README
  if (!readme.includes(pkg.version)) {
    console.log(chalk.yellow('\n  Version not found in README'));
    return 'warning';
  }
  
  return true;
});

// 9. CHANGELOG
check('CHANGELOG has unreleased changes', () => {
  const changelog = readFileSync(join(rootDir, 'CHANGELOG.md'), 'utf8');
  if (!changelog.includes('## [Unreleased]')) {
    throw new Error('No [Unreleased] section in CHANGELOG.md');
  }
  
  // Check if there are actual changes
  const unreleasedMatch = changelog.match(/## \[Unreleased\]([\s\S]*?)## \[/);
  if (unreleasedMatch) {
    const content = unreleasedMatch[1].trim();
    if (!content || content.length < 10) {
      throw new Error('No changes documented in [Unreleased] section');
    }
  }
  
  return true;
});

// 10. License year
check('License year current', () => {
  const license = readFileSync(join(rootDir, 'LICENSE'), 'utf8');
  const currentYear = new Date().getFullYear();
  if (!license.includes(currentYear.toString())) {
    return 'warning';
  }
  return true;
});

// Summary
console.log(chalk.bold.blue('\n📊 Validation Summary\n'));

if (results.passed.length > 0) {
  console.log(chalk.green(`✅ Passed: ${results.passed.length}`));
}

if (results.warnings.length > 0) {
  console.log(chalk.yellow(`⚠️  Warnings: ${results.warnings.length}`));
  results.warnings.forEach(w => console.log(chalk.yellow(`   - ${w}`)));
}

if (results.failed.length > 0) {
  console.log(chalk.red(`❌ Failed: ${results.failed.length}`));
  results.failed.forEach(f => console.log(chalk.red(`   - ${f}`)));
}

// Final result
if (results.failed.length > 0) {
  console.log(chalk.bold.red('\n❌ Validation FAILED\n'));
  console.log(chalk.gray('Please fix the issues above before releasing.'));
  process.exit(1);
} else if (results.warnings.length > 0) {
  console.log(chalk.bold.yellow('\n⚠️  Validation passed with warnings\n'));
  console.log(chalk.gray('Consider addressing the warnings before releasing.'));
  process.exit(0);
} else {
  console.log(chalk.bold.green('\n✅ All validations PASSED\n'));
  console.log(chalk.gray('Ready for release!'));
  process.exit(0);
}