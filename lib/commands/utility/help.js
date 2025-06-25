/**
 * Help command - displays available slash commands
 */
import chalk from 'chalk';
import { BaseSlashCommand } from '../base.js';
import { commandRegistry } from '../registry.js';

export default class HelpCommand extends BaseSlashCommand {
  constructor() {
    super('/help', 'Display available slash commands and their usage', {
      category: 'utility',
      requiresAuth: false,
      requiresRepo: false,
      usage: '/help [command]',
      examples: [
        'fsd slash "/help"',
        'fsd slash "/help sprint:plan"',
        'fsd slash "/help /build"'
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    
    // If specific command requested
    if (args && args.length > 0) {
      const commandName = args[0].startsWith('/') ? args[0] : `/${args[0]}`;
      await this.showCommandHelp(commandName);
      return;
    }
    
    // Show all commands
    await this.showAllCommands();
  }

  async showCommandHelp(commandName) {
    const command = commandRegistry.get(commandName);
    
    if (!command) {
      this.log(`Command not found: ${commandName}`, 'error');
      this.log('Use /help to see all available commands', 'info');
      return;
    }
    
    console.log('\n' + command.getHelp());
  }

  async showAllCommands() {
    console.log(chalk.cyan('\n🚀 Flow State Dev - Slash Commands\n'));
    console.log(chalk.gray('Execute commands with: fsd slash "/command [options]"\n'));
    
    const categories = commandRegistry.getCategories();
    
    for (const category of categories) {
      const commands = commandRegistry.getByCategory(category);
      if (commands.length === 0) continue;
      
      console.log(chalk.yellow(`\n${this.getCategoryTitle(category)}:`));
      console.log(chalk.gray('─'.repeat(50)));
      
      for (const command of commands) {
        let line = chalk.cyan(`  ${command.name}`);
        
        if (command.aliases.length > 0) {
          line += chalk.gray(` (${command.aliases.join(', ')})`);
        }
        
        console.log(line);
        console.log(chalk.gray(`    ${command.description}`));
        
        if (command.usage) {
          console.log(chalk.gray(`    Usage: ${command.usage}`));
        }
      }
    }
    
    console.log(chalk.gray('\n─'.repeat(50)));
    console.log(chalk.blue('\n💡 Tips:'));
    console.log('  • Use aliases for faster access (e.g., /b instead of /build)');
    console.log('  • Add --help to any command for detailed information');
    console.log('  • Commands requiring GitHub are marked with 🔐');
    
    console.log(chalk.gray('\nFor detailed help on a specific command:'));
    console.log(chalk.cyan('  fsd slash "/help [command]"'));
  }

  getCategoryTitle(category) {
    const titles = {
      'quick-action': '⚡ Quick Actions',
      'extended-thinking': '🧠 Extended Thinking',
      'sprint': '🏃 Sprint Management',
      'epic': '📋 Epic Management',
      'progress': '📊 Progress Reporting',
      'issue': '🎯 Issue Operations',
      'estimation': '📏 Estimation',
      'workflow': '⚙️ Workflow',
      'analysis': '🔍 Analysis & Planning',
      'utility': '🛠️ Utility'
    };
    
    return titles[category] || category;
  }
}