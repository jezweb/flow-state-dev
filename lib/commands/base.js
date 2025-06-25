/**
 * Base class for all slash commands
 * Provides common functionality and enforces consistent interface
 */
import chalk from 'chalk';
import inquirer from 'inquirer';

export class BaseSlashCommand {
  constructor(name, description, options = {}) {
    this.name = name;
    this.description = description;
    this.aliases = options.aliases || [];
    this.category = options.category || 'general';
    this.usage = options.usage || '';
    this.examples = options.examples || [];
    this.options = options.options || {};
    this.requiresAuth = options.requiresAuth !== false; // Default true
    this.requiresRepo = options.requiresRepo !== false; // Default true
  }

  /**
   * Validate command can be executed in current context
   * @returns {Object} { valid: boolean, error?: string }
   */
  async validate() {
    // Check GitHub CLI authentication if required
    if (this.requiresAuth) {
      try {
        const { execSync } = await import('child_process');
        execSync('gh auth status', { stdio: 'ignore' });
      } catch (error) {
        return {
          valid: false,
          error: 'GitHub CLI not authenticated. Run: gh auth login'
        };
      }
    }

    // Check if in a git repository if required
    if (this.requiresRepo) {
      try {
        const { execSync } = await import('child_process');
        execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      } catch (error) {
        return {
          valid: false,
          error: 'Not in a git repository'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Execute the command - must be implemented by subclasses
   * @param {Object} options - Command options
   * @returns {Promise<void>}
   */
  async execute(options) {
    throw new Error(`Command ${this.name} must implement execute() method`);
  }

  /**
   * Run the command with validation
   * @param {Object} options - Command options
   * @returns {Promise<void>}
   */
  async run(options = {}) {
    // Validate first
    const validation = await this.validate();
    if (!validation.valid) {
      console.error(chalk.red(`❌ ${validation.error}`));
      process.exit(1);
    }

    // Execute command
    try {
      await this.execute(options);
    } catch (error) {
      console.error(chalk.red(`❌ Error executing ${this.name}:`), error.message);
      if (options.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  }

  /**
   * Get help text for this command
   * @returns {string}
   */
  getHelp() {
    let help = `${chalk.cyan(this.name)}`;
    
    if (this.aliases.length > 0) {
      help += ` (aliases: ${this.aliases.join(', ')})`;
    }
    
    help += `\n  ${this.description}`;
    
    if (this.usage) {
      help += `\n  ${chalk.gray('Usage:')} ${this.usage}`;
    }
    
    if (Object.keys(this.options).length > 0) {
      help += '\n  ' + chalk.gray('Options:');
      for (const [option, desc] of Object.entries(this.options)) {
        help += `\n    ${option} - ${desc}`;
      }
    }
    
    if (this.examples.length > 0) {
      help += '\n  ' + chalk.gray('Examples:');
      for (const example of this.examples) {
        help += `\n    ${example}`;
      }
    }
    
    return help;
  }

  /**
   * Common utilities for subclasses
   */
  
  async prompt(questions) {
    return inquirer.prompt(questions);
  }

  log(message, type = 'info') {
    const prefixes = {
      info: chalk.blue('ℹ'),
      success: chalk.green('✅'),
      warning: chalk.yellow('⚠️'),
      error: chalk.red('❌')
    };
    
    console.log(`${prefixes[type] || ''} ${message}`);
  }

  async exec(command, options = {}) {
    const { execSync } = await import('child_process');
    try {
      const result = execSync(command, {
        encoding: 'utf-8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      return result?.toString().trim();
    } catch (error) {
      if (!options.ignoreError) {
        throw error;
      }
      return null;
    }
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  async confirm(message, defaultValue = true) {
    const { confirmed } = await this.prompt([{
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue
    }]);
    return confirmed;
  }
}

/**
 * Base class for commands that interact with GitHub API
 */
export class GitHubSlashCommand extends BaseSlashCommand {
  constructor(name, description, options = {}) {
    super(name, description, {
      requiresAuth: true,
      requiresRepo: true,
      ...options
    });
  }

  async getRepoInfo() {
    const output = await this.exec('gh repo view --json owner,name', { silent: true });
    return JSON.parse(output);
  }

  async getCurrentUser() {
    const output = await this.exec('gh api user', { silent: true });
    return JSON.parse(output);
  }

  async ghAPI(endpoint, options = {}) {
    const args = [`gh api ${endpoint}`];
    
    if (options.method) {
      args.push(`--method ${options.method}`);
    }
    
    if (options.field) {
      for (const [key, value] of Object.entries(options.field)) {
        args.push(`--field ${key}="${value}"`);
      }
    }
    
    if (options.raw) {
      for (const [key, value] of Object.entries(options.raw)) {
        args.push(`--raw-field ${key}='${JSON.stringify(value)}'`);
      }
    }
    
    const command = args.join(' ');
    const output = await this.exec(command, { silent: true });
    
    try {
      return JSON.parse(output);
    } catch {
      return output;
    }
  }

  parseIssueReferences(text) {
    const references = [];
    const patterns = [
      /#(\d+)/g,  // #123
      /(?:depends on|blocked by|blocks|related to|refs?|see)\s+#(\d+)/gi
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const issueNumber = parseInt(match[1]);
        if (!references.includes(issueNumber)) {
          references.push(issueNumber);
        }
      }
    }
    
    return references;
  }

  extractStoryPoints(labels) {
    const pointPatterns = [
      /^(\d+)\s*points?$/i,
      /^points?:\s*(\d+)$/i,
      /^sp[-:]?(\d+)$/i,
      /^story[-_]?points?[-:]?(\d+)$/i,
      /^(\d+)[-_]?points?$/i,
      /^estimate[-:]?\s*(\d+)$/i,
      /^(\d+)[-_]?estimate$/i
    ];
    
    for (const label of labels) {
      for (const pattern of pointPatterns) {
        const match = label.match(pattern);
        if (match) {
          return parseInt(match[1]);
        }
      }
    }
    
    return null;
  }
}