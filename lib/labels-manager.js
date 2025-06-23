/**
 * GitHub Labels Manager
 * Handles different label collections and emoji options
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LabelsManager {
  constructor() {
    this.collectionsPath = path.join(__dirname, '..', 'setup', 'label-collections.json');
    this.legacyLabelsPath = path.join(__dirname, '..', 'setup', 'github-labels.json');
  }

  /**
   * Load label collections
   */
  async loadCollections() {
    try {
      return await fs.readJson(this.collectionsPath);
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Label collections not found, using legacy labels'));
      // Fall back to legacy labels
      const legacyLabels = await fs.readJson(this.legacyLabelsPath);
      return {
        full: {
          name: 'Full (All Labels)',
          description: 'Complete label set',
          labels: legacyLabels
        }
      };
    }
  }

  /**
   * Get labels for a specific collection
   */
  async getLabelsForCollection(collectionName, collections) {
    const collection = collections[collectionName];
    if (!collection) {
      throw new Error(`Collection '${collectionName}' not found`);
    }

    let labels = [...(collection.labels || [])];

    // Handle inheritance
    if (collection.extends) {
      const parentLabels = await this.getLabelsForCollection(collection.extends, collections);
      // Merge labels, with child collection taking precedence
      const labelNames = new Set(labels.map(l => l.name));
      for (const parentLabel of parentLabels) {
        if (!labelNames.has(parentLabel.name)) {
          labels.push(parentLabel);
        }
      }
    }

    return labels;
  }

  /**
   * Apply emoji options to labels
   */
  applyEmojiOptions(labels, options) {
    if (!options.emoji) return labels;

    return labels.map(label => {
      // Extract emoji from description if present
      const emojiMatch = label.description.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u);
      
      if (emojiMatch && options.emojiPosition === 'name') {
        // Move emoji to name
        const emoji = emojiMatch[0];
        const cleanDescription = label.description.replace(emoji, '').trim();
        
        return {
          ...label,
          name: options.emojiFormat === 'prefix' 
            ? `${emoji} ${label.name}`
            : `${label.name} ${emoji}`,
          description: cleanDescription
        };
      }
      
      return label;
    });
  }

  /**
   * Interactive label setup
   */
  async setupLabels(options = {}) {
    // Check GitHub repo setup
    if (!options.skipChecks) {
      this.checkGitHubSetup();
    }

    const collections = await this.loadCollections();
    
    // Interactive mode if no collection specified
    let selectedCollection = options.collection;
    let emojiOptions = {
      emoji: options.emoji,
      emojiPosition: options.emojiPosition || 'description',
      emojiFormat: options.emojiFormat || 'prefix'
    };

    if (!selectedCollection) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'collection',
          message: 'Select label collection:',
          choices: Object.entries(collections).map(([key, value]) => ({
            name: `${value.name} - ${value.description}`,
            value: key,
            short: value.name
          }))
        },
        {
          type: 'confirm',
          name: 'includeEmoji',
          message: 'Include emojis in label names?',
          default: false
        }
      ]);

      selectedCollection = answers.collection;
      emojiOptions.emoji = answers.includeEmoji;

      if (answers.includeEmoji) {
        const emojiAnswers = await inquirer.prompt([
          {
            type: 'list',
            name: 'emojiFormat',
            message: 'Emoji position in label name:',
            choices: [
              { name: '🐛 bug (prefix)', value: 'prefix' },
              { name: 'bug 🐛 (suffix)', value: 'suffix' }
            ]
          }
        ]);
        emojiOptions.emojiFormat = emojiAnswers.emojiFormat;
        emojiOptions.emojiPosition = 'name';
      }
    }

    // Get labels for selected collection
    let labels = await this.getLabelsForCollection(selectedCollection, collections);
    
    // Apply emoji options
    labels = this.applyEmojiOptions(labels, emojiOptions);

    // Preview if not forced
    if (!options.force) {
      console.log(chalk.blue('\n📋 Labels to create:\n'));
      labels.forEach(label => {
        console.log(`  ${chalk.hex(`#${label.color}`)('●')} ${label.name} - ${label.description}`);
      });
      
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: `\nCreate ${labels.length} labels?`,
          default: true
        }
      ]);

      if (!proceed) {
        console.log(chalk.yellow('❌ Label creation cancelled'));
        return;
      }
    }

    // Create labels
    await this.createLabels(labels, options);
  }

  /**
   * Create labels on GitHub
   */
  async createLabels(labels, options = {}) {
    console.log(chalk.blue('\n🏷️  Creating GitHub labels...\n'));

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const label of labels) {
      try {
        // Try to create the label
        execSync(
          `gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --force`,
          { stdio: 'pipe' }
        );
        console.log(chalk.green(`✅ ${label.name}`));
        created++;
      } catch (error) {
        // Check if it's because label exists
        try {
          // Try to update existing label
          execSync(
            `gh label edit "${label.name}" --color "${label.color}" --description "${label.description}"`,
            { stdio: 'pipe' }
          );
          console.log(chalk.yellow(`📝 ${label.name} (updated)`));
          updated++;
        } catch (updateError) {
          console.log(chalk.red(`❌ ${label.name} (failed)`));
          failed++;
          if (options.verbose) {
            console.log(chalk.gray(`   Error: ${updateError.message}`));
          }
        }
      }
    }

    // Summary
    console.log(chalk.blue('\n📊 Summary:\n'));
    if (created > 0) console.log(chalk.green(`✅ Created: ${created}`));
    if (updated > 0) console.log(chalk.yellow(`📝 Updated: ${updated}`));
    if (failed > 0) console.log(chalk.red(`❌ Failed: ${failed}`));
    
    console.log(chalk.green('\n✅ GitHub labels setup complete!\n'));
  }

  /**
   * Check GitHub setup
   */
  checkGitHubSetup() {
    // Check if we're in a git repo
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    } catch {
      console.error(chalk.red('❌ Not in a git repository!'));
      console.log(chalk.gray('Please run this command from within your project directory.'));
      process.exit(1);
    }

    // Check for GitHub remote
    try {
      const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
      if (!remoteUrl.includes('github.com')) {
        console.error(chalk.red('❌ No GitHub remote found!'));
        console.log(chalk.gray('Please add your GitHub repository as origin first.'));
        process.exit(1);
      }
      
      // Parse repo info
      const match = remoteUrl.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
      if (match) {
        console.log(chalk.gray(`Repository: ${match[1]}/${match[2]}\n`));
      }
    } catch {
      console.error(chalk.red('❌ No remote origin found!'));
      console.log(chalk.gray('Please add your GitHub repository as origin first.'));
      process.exit(1);
    }

    // Check for GitHub CLI
    try {
      execSync('gh --version', { stdio: 'ignore' });
    } catch {
      console.error(chalk.red('❌ GitHub CLI (gh) is not installed!'));
      console.log(chalk.white('\nTo install GitHub CLI:'));
      console.log(chalk.gray('  • Ubuntu/Debian: sudo apt install gh'));
      console.log(chalk.gray('  • macOS: brew install gh'));
      console.log(chalk.gray('  • Or visit: https://cli.github.com/\n'));
      process.exit(1);
    }

    // Check if authenticated
    try {
      execSync('gh auth status', { stdio: 'ignore' });
    } catch {
      console.error(chalk.red('❌ Not authenticated with GitHub!'));
      console.log(chalk.white('\nPlease run:'));
      console.log(chalk.gray('  gh auth login\n'));
      process.exit(1);
    }
  }

  /**
   * List available collections
   */
  async listCollections() {
    const collections = await this.loadCollections();
    
    console.log(chalk.blue('\n📚 Available Label Collections:\n'));
    
    for (const [key, collection] of Object.entries(collections)) {
      const labelCount = await this.getLabelsForCollection(key, collections).then(labels => labels.length);
      console.log(chalk.white(`${key.padEnd(15)} - ${collection.name}`));
      console.log(chalk.gray(`${''.padEnd(15)}   ${collection.description}`));
      console.log(chalk.gray(`${''.padEnd(15)}   ${labelCount} labels\n`));
    }
  }

  /**
   * Export labels from a repository
   */
  async exportLabels(output = 'labels-export.json') {
    console.log(chalk.blue('\n📤 Exporting labels from repository...\n'));
    
    try {
      const labelsJson = execSync('gh label list --json name,color,description --limit 1000', { encoding: 'utf-8' });
      const labels = JSON.parse(labelsJson);
      
      // Format for our structure
      const formatted = labels.map(label => ({
        name: label.name,
        color: label.color.replace('#', ''),
        description: label.description || ''
      }));
      
      await fs.writeJson(output, formatted, { spaces: 2 });
      
      console.log(chalk.green(`✅ Exported ${labels.length} labels to ${output}\n`));
    } catch (error) {
      console.error(chalk.red('❌ Failed to export labels:'), error.message);
      process.exit(1);
    }
  }
}

// Export singleton instance
export const labelsManager = new LabelsManager();