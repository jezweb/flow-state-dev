#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Commit type mappings
const COMMIT_TYPES = {
  feat: '### Added',
  fix: '### Fixed',
  docs: '### Documentation',
  style: '### Style',
  refactor: '### Changed',
  perf: '### Performance',
  test: '### Testing',
  chore: '### Maintenance',
  build: '### Build',
  ci: '### CI/CD'
};

// Get commits since last tag
function getCommitsSinceLastTag() {
  try {
    // Get last tag
    const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    console.log(chalk.gray(`Last tag: ${lastTag}`));
    
    // Get commits since last tag
    const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%H|%s|%b|%an" --no-merges`, { encoding: 'utf8' });
    return { lastTag, commits: commits.trim().split('\n').filter(c => c) };
  } catch (error) {
    // No tags found, get all commits
    console.log(chalk.yellow('No tags found, getting all commits'));
    const commits = execSync('git log --pretty=format:"%H|%s|%b|%an" --no-merges', { encoding: 'utf8' });
    return { lastTag: null, commits: commits.trim().split('\n').filter(c => c) };
  }
}

// Parse conventional commit
function parseCommit(commitLine) {
  const [hash, subject, body, author] = commitLine.split('|');
  
  // Parse conventional commit format
  const conventionalMatch = subject.match(/^(\w+)(\([\w-]+\))?:\s*(.+)$/);
  if (conventionalMatch) {
    const [, type, scope, description] = conventionalMatch;
    return {
      hash: hash.substring(0, 7),
      type,
      scope: scope?.replace(/[()]/g, ''),
      description,
      body,
      author,
      breaking: subject.includes('!') || body.includes('BREAKING CHANGE')
    };
  }
  
  // Non-conventional commit
  return {
    hash: hash.substring(0, 7),
    type: 'other',
    description: subject,
    body,
    author
  };
}

// Group commits by type
function groupCommits(commits) {
  const grouped = {
    breaking: [],
    features: [],
    fixes: [],
    other: {}
  };
  
  commits.forEach(commit => {
    if (commit.breaking) {
      grouped.breaking.push(commit);
    }
    
    if (commit.type === 'feat') {
      grouped.features.push(commit);
    } else if (commit.type === 'fix') {
      grouped.fixes.push(commit);
    } else if (commit.type !== 'other') {
      if (!grouped.other[commit.type]) {
        grouped.other[commit.type] = [];
      }
      grouped.other[commit.type].push(commit);
    }
  });
  
  return grouped;
}

// Format changelog entry
function formatChangelog(grouped, version, date) {
  let output = `## [${version}] - ${date}\n\n`;
  
  // Breaking changes
  if (grouped.breaking.length > 0) {
    output += '### ⚠️ BREAKING CHANGES\n\n';
    grouped.breaking.forEach(commit => {
      output += `- ${commit.description}\n`;
      if (commit.body && commit.body.includes('BREAKING CHANGE')) {
        const breaking = commit.body.split('BREAKING CHANGE:')[1].trim();
        output += `  ${breaking}\n`;
      }
    });
    output += '\n';
  }
  
  // Features
  if (grouped.features.length > 0) {
    output += '### Added\n\n';
    grouped.features.forEach(commit => {
      output += `- ${commit.description}`;
      if (commit.scope) output += ` (${commit.scope})`;
      output += '\n';
    });
    output += '\n';
  }
  
  // Fixes
  if (grouped.fixes.length > 0) {
    output += '### Fixed\n\n';
    grouped.fixes.forEach(commit => {
      output += `- ${commit.description}`;
      if (commit.scope) output += ` (${commit.scope})`;
      output += '\n';
    });
    output += '\n';
  }
  
  // Other types
  Object.entries(grouped.other).forEach(([type, commits]) => {
    if (commits.length > 0 && COMMIT_TYPES[type]) {
      output += `${COMMIT_TYPES[type]}\n\n`;
      commits.forEach(commit => {
        output += `- ${commit.description}`;
        if (commit.scope) output += ` (${commit.scope})`;
        output += '\n';
      });
      output += '\n';
    }
  });
  
  return output;
}

// Update CHANGELOG.md
function updateChangelog(newEntry) {
  const changelogPath = join(rootDir, 'CHANGELOG.md');
  let content = readFileSync(changelogPath, 'utf8');
  
  // Find where to insert (after ## [Unreleased])
  const unreleasedIndex = content.indexOf('## [Unreleased]');
  if (unreleasedIndex === -1) {
    console.error(chalk.red('✗ Could not find ## [Unreleased] section'));
    return false;
  }
  
  // Find the end of unreleased section
  const nextSectionMatch = content.substring(unreleasedIndex).match(/\n## \[/);
  const insertIndex = unreleasedIndex + (nextSectionMatch ? nextSectionMatch.index : content.length - unreleasedIndex);
  
  // Insert new entry
  content = content.substring(0, insertIndex) + '\n' + newEntry + content.substring(insertIndex);
  
  writeFileSync(changelogPath, content);
  return true;
}

// Main function
async function generateChangelog(version) {
  console.log(chalk.bold.blue('\n📝 Generating Changelog Entry\n'));
  
  // Get commits
  const { lastTag, commits: commitLines } = getCommitsSinceLastTag();
  
  if (commitLines.length === 0) {
    console.log(chalk.yellow('⚠️  No commits found since last tag'));
    return;
  }
  
  console.log(chalk.gray(`Found ${commitLines.length} commits\n`));
  
  // Parse commits
  const commits = commitLines.map(parseCommit);
  
  // Group by type
  const grouped = groupCommits(commits);
  
  // Generate changelog entry
  const date = new Date().toISOString().split('T')[0];
  const entry = formatChangelog(grouped, version || 'Unreleased', date);
  
  // Preview
  console.log(chalk.blue('Generated changelog entry:\n'));
  console.log(chalk.gray(entry));
  
  if (version) {
    // Update CHANGELOG.md
    const updated = updateChangelog(entry);
    if (updated) {
      console.log(chalk.green('\n✓ Updated CHANGELOG.md'));
    }
  } else {
    console.log(chalk.yellow('\n💡 Run with version number to update CHANGELOG.md'));
    console.log(chalk.gray('   Example: node scripts/generate-changelog.js 0.9.0'));
  }
  
  // Stats
  console.log(chalk.blue('\n📊 Commit Statistics:'));
  console.log(chalk.gray(`   Features: ${grouped.features.length}`));
  console.log(chalk.gray(`   Fixes: ${grouped.fixes.length}`));
  console.log(chalk.gray(`   Breaking: ${grouped.breaking.length}`));
  
  // Contributors
  const contributors = new Set(commits.map(c => c.author));
  console.log(chalk.gray(`   Contributors: ${contributors.size}`));
}

// CLI
const version = process.argv[2];
generateChangelog(version).catch(error => {
  console.error(chalk.red('✗ Error:'), error.message);
  process.exit(1);
});