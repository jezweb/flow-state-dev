/**
 * Labels command - manage GitHub labels
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class LabelsCommand extends GitHubSlashCommand {
  constructor() {
    super('/labels', 'Manage GitHub labels', {
      category: 'project',
      usage: '/labels [list|create|edit|delete|sync] [options]',
      examples: [
        'fsd slash "/labels"',
        'fsd slash "/labels create --name bug --color FF0000"',
        'fsd slash "/labels sync --preset default"',
        'fsd slash "/labels delete bug"'
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const subcommand = args?.[0] || 'list';
    
    switch (subcommand) {
      case 'list':
        await this.listLabels(options);
        break;
      case 'create':
        await this.createLabel(options);
        break;
      case 'edit':
        await this.editLabel(args[1], options);
        break;
      case 'delete':
        await this.deleteLabel(args[1]);
        break;
      case 'sync':
        await this.syncLabels(options);
        break;
      default:
        this.log(`Unknown subcommand: ${subcommand}`, 'error');
        console.log(chalk.gray('Use /labels list, create, edit, delete, or sync'));
    }
  }

  async listLabels(options) {
    console.log(chalk.blue('🏷️  GitHub Labels\n'));
    
    try {
      const result = await this.exec('gh label list --limit 100', { silent: true });
      
      if (!result.trim()) {
        console.log(chalk.gray('No labels found'));
        console.log(chalk.gray('\nCreate one with: /labels create'));
        return;
      }
      
      // Parse labels
      const lines = result.split('\n').filter(line => line.trim());
      const labels = [];
      
      lines.forEach(line => {
        const parts = line.split('\t');
        if (parts.length >= 2) {
          const [name, description, color] = parts;
          labels.push({ name, description: description || '', color: color || 'ffffff' });
        }
      });
      
      // Group by category (if using conventional naming)
      const categorized = this.categorizeLabels(labels);
      
      // Display labels
      if (Object.keys(categorized.categorized).length > 0) {
        Object.entries(categorized.categorized).forEach(([category, categoryLabels]) => {
          console.log(chalk.yellow(`\n${this.formatCategory(category)}:`));
          categoryLabels.forEach(label => this.displayLabel(label));
        });
      }
      
      if (categorized.uncategorized.length > 0) {
        console.log(chalk.yellow('\nOther:'));
        categorized.uncategorized.forEach(label => this.displayLabel(label));
      }
      
      // Summary
      console.log(chalk.gray(`\n─`.repeat(50)));
      console.log(chalk.blue(`Total: ${labels.length} label(s)`));
      
      // Tips
      console.log(chalk.gray('\n💡 Tips:'));
      console.log(chalk.gray('  • Create standard labels: /labels sync --preset default'));
      console.log(chalk.gray('  • Add to issue: /issues create --label bug'));
      
    } catch (error) {
      this.log(`Failed to list labels: ${error.message}`, 'error');
    }
  }

  categorizeLabels(labels) {
    const categorized = {};
    const uncategorized = [];
    
    labels.forEach(label => {
      const parts = label.name.split(':');
      if (parts.length > 1) {
        const category = parts[0];
        if (!categorized[category]) {
          categorized[category] = [];
        }
        categorized[category].push(label);
      } else {
        uncategorized.push(label);
      }
    });
    
    return { categorized, uncategorized };
  }

  formatCategory(category) {
    const categoryNames = {
      'type': '📝 Type',
      'priority': '🔥 Priority',
      'status': '📊 Status',
      'area': '🗂️ Area',
      'size': '📏 Size'
    };
    
    return categoryNames[category] || category;
  }

  displayLabel(label) {
    const colorPreview = chalk.hex(`#${label.color}`)('●');
    const labelText = chalk.bgHex(`#${label.color}`).black(` ${label.name} `);
    
    console.log(`  ${colorPreview} ${labelText}`);
    if (label.description) {
      console.log(chalk.gray(`     ${label.description}`));
    }
  }

  async createLabel(options) {
    console.log(chalk.blue('✨ Create New Label\n'));
    
    try {
      let name = options.name;
      let color = options.color;
      let description = options.description;
      
      // Interactive mode
      if (!name) {
        const { labelName } = await this.prompt([{
          type: 'input',
          name: 'labelName',
          message: 'Label name:',
          validate: input => input.trim().length > 0 || 'Name is required'
        }]);
        name = labelName;
      }
      
      if (!color) {
        const { labelColor } = await this.prompt([{
          type: 'list',
          name: 'labelColor',
          message: 'Label color:',
          choices: [
            { name: '🔴 Red (bug/error)', value: 'd73a4a' },
            { name: '🟢 Green (feature/enhancement)', value: '0e8a16' },
            { name: '🔵 Blue (documentation)', value: '0052cc' },
            { name: '🟣 Purple (dependencies)', value: '5319e7' },
            { name: '🟡 Yellow (warning)', value: 'fbca04' },
            { name: '🟠 Orange (help wanted)', value: 'd876e3' },
            { name: '⚫ Gray (wontfix/duplicate)', value: 'cfd3d7' },
            { name: '🎨 Custom color', value: 'custom' }
          ]
        }]);
        
        if (labelColor === 'custom') {
          const { customColor } = await this.prompt([{
            type: 'input',
            name: 'customColor',
            message: 'Hex color (without #):',
            validate: input => /^[0-9a-fA-F]{6}$/.test(input) || 'Invalid hex color'
          }]);
          color = customColor;
        } else {
          color = labelColor;
        }
      }
      
      if (!description) {
        const { labelDesc } = await this.prompt([{
          type: 'input',
          name: 'labelDesc',
          message: 'Description (optional):'
        }]);
        description = labelDesc;
      }
      
      // Create label
      console.log(chalk.gray('\nCreating label...'));
      
      let command = `gh label create "${name}" --color ${color}`;
      if (description) {
        command += ` --description "${description}"`;
      }
      
      await this.exec(command);
      
      console.log(chalk.green('\n✅ Label created successfully!'));
      
      // Display the created label
      const label = { name, color, description };
      this.displayLabel(label);
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        this.log('Label already exists', 'error');
      } else {
        this.log(`Failed to create label: ${error.message}`, 'error');
      }
    }
  }

  async editLabel(labelName, options) {
    if (!labelName) {
      this.log('Label name required', 'error');
      console.log(chalk.gray('Usage: /labels edit <name> [options]'));
      return;
    }
    
    console.log(chalk.blue(`✏️  Editing Label: ${labelName}\n`));
    
    try {
      // Build edit command
      let command = `gh label edit "${labelName}"`;
      let hasChanges = false;
      
      if (options.name) {
        command += ` --name "${options.name}"`;
        hasChanges = true;
      }
      
      if (options.color) {
        command += ` --color ${options.color}`;
        hasChanges = true;
      }
      
      if (options.description !== undefined) {
        command += ` --description "${options.description}"`;
        hasChanges = true;
      }
      
      if (!hasChanges) {
        this.log('No changes specified', 'error');
        console.log(chalk.gray('Use --name, --color, or --description'));
        return;
      }
      
      // Edit label
      console.log(chalk.gray('Updating label...'));
      await this.exec(command);
      
      console.log(chalk.green('\n✅ Label updated successfully!'));
      
    } catch (error) {
      this.log(`Failed to edit label: ${error.message}`, 'error');
    }
  }

  async deleteLabel(labelName) {
    if (!labelName) {
      this.log('Label name required', 'error');
      console.log(chalk.gray('Usage: /labels delete <name>'));
      return;
    }
    
    console.log(chalk.blue(`🗑️  Deleting Label: ${labelName}\n`));
    
    try {
      // Confirm deletion
      const shouldDelete = await this.confirm(
        `Delete label "${labelName}"?`,
        false
      );
      
      if (!shouldDelete) {
        console.log(chalk.yellow('Deletion cancelled'));
        return;
      }
      
      // Delete label
      console.log(chalk.gray('Deleting label...'));
      await this.exec(`gh label delete "${labelName}" --yes`);
      
      console.log(chalk.green('\n✅ Label deleted successfully!'));
      
    } catch (error) {
      this.log(`Failed to delete label: ${error.message}`, 'error');
    }
  }

  async syncLabels(options) {
    console.log(chalk.blue('🔄 Sync Labels\n'));
    
    const preset = options.preset || 'default';
    
    try {
      // Get preset labels
      const presetLabels = this.getLabelPreset(preset);
      
      if (!presetLabels) {
        this.log(`Unknown preset: ${preset}`, 'error');
        console.log(chalk.gray('Available presets: default, minimal, comprehensive'));
        return;
      }
      
      console.log(chalk.cyan('Preset:'), preset);
      console.log(chalk.cyan('Labels to create:'), presetLabels.length);
      
      // Show preview
      console.log(chalk.yellow('\nPreview:'));
      presetLabels.slice(0, 10).forEach(label => this.displayLabel(label));
      if (presetLabels.length > 10) {
        console.log(chalk.gray(`  ... and ${presetLabels.length - 10} more`));
      }
      
      // Confirm
      const shouldSync = await this.confirm(
        '\nCreate these labels?',
        true
      );
      
      if (!shouldSync) {
        console.log(chalk.yellow('Sync cancelled'));
        return;
      }
      
      // Create labels
      console.log(chalk.gray('\nCreating labels...'));
      let created = 0;
      let skipped = 0;
      
      for (const label of presetLabels) {
        try {
          let command = `gh label create "${label.name}" --color ${label.color}`;
          if (label.description) {
            command += ` --description "${label.description}"`;
          }
          
          await this.exec(command, { silent: true });
          console.log(chalk.green(`  ✓ Created: ${label.name}`));
          created++;
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(chalk.gray(`  - Skipped: ${label.name} (already exists)`));
            skipped++;
          } else {
            console.log(chalk.red(`  ✗ Failed: ${label.name}`));
          }
        }
      }
      
      console.log(chalk.green(`\n✅ Sync complete: ${created} created, ${skipped} skipped`));
      
    } catch (error) {
      this.log(`Failed to sync labels: ${error.message}`, 'error');
    }
  }

  getLabelPreset(preset) {
    const presets = {
      default: [
        // Type
        { name: 'type:bug', color: 'd73a4a', description: 'Something isn\'t working' },
        { name: 'type:feature', color: '0e8a16', description: 'New feature or request' },
        { name: 'type:enhancement', color: 'a2eeef', description: 'Improvement to existing feature' },
        { name: 'type:documentation', color: '0052cc', description: 'Improvements or additions to documentation' },
        { name: 'type:refactor', color: 'ffd33d', description: 'Code refactoring' },
        { name: 'type:test', color: 'bfd4f2', description: 'Adding or updating tests' },
        
        // Priority
        { name: 'priority:critical', color: 'b60205', description: 'Critical priority' },
        { name: 'priority:high', color: 'd93f0b', description: 'High priority' },
        { name: 'priority:medium', color: 'fbca04', description: 'Medium priority' },
        { name: 'priority:low', color: '0e8a16', description: 'Low priority' },
        
        // Status
        { name: 'status:in-progress', color: 'ededed', description: 'Work in progress' },
        { name: 'status:blocked', color: 'd73a4a', description: 'Blocked by dependencies' },
        { name: 'status:review-needed', color: 'fbca04', description: 'Needs code review' },
        { name: 'status:ready', color: '0e8a16', description: 'Ready for deployment' },
        
        // Other
        { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
        { name: 'help wanted', color: '008672', description: 'Extra attention is needed' },
        { name: 'duplicate', color: 'cfd3d7', description: 'This issue or pull request already exists' },
        { name: 'wontfix', color: 'ffffff', description: 'This will not be worked on' }
      ],
      
      minimal: [
        { name: 'bug', color: 'd73a4a', description: 'Something isn\'t working' },
        { name: 'enhancement', color: 'a2eeef', description: 'New feature or request' },
        { name: 'documentation', color: '0052cc', description: 'Improvements or additions to documentation' },
        { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
        { name: 'help wanted', color: '008672', description: 'Extra attention is needed' }
      ],
      
      comprehensive: [
        // All default labels plus additional ones
        ...this.getLabelPreset('default'),
        
        // Size
        { name: 'size:xs', color: '009900', description: 'Extra small: <1 hour' },
        { name: 'size:s', color: '77bb00', description: 'Small: 1-2 hours' },
        { name: 'size:m', color: 'eebb00', description: 'Medium: 3-5 hours' },
        { name: 'size:l', color: 'ee9900', description: 'Large: 6-10 hours' },
        { name: 'size:xl', color: 'ee5500', description: 'Extra large: >10 hours' },
        
        // Area
        { name: 'area:frontend', color: '5319e7', description: 'Frontend related' },
        { name: 'area:backend', color: '1d76db', description: 'Backend related' },
        { name: 'area:api', color: 'fbca04', description: 'API related' },
        { name: 'area:database', color: 'cc317c', description: 'Database related' },
        { name: 'area:devops', color: '006b75', description: 'DevOps related' }
      ]
    };
    
    return presets[preset];
  }
}