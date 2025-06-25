/**
 * Slash commands wrapper - Routes all commands to the modular system
 * Migration complete: 100% of commands now use the new architecture
 */
import chalk from 'chalk';
import { slashCommandExecutor } from './commands/executor.js';

// Track which commands have been migrated
const MIGRATED_COMMANDS = new Set([
  // Utility commands
  '/help',     // Help command
  '/sync',     // Sync with remote
  '/clean',    // Clean project
  
  // Quick action commands  
  '/status',   // Git status command
  '/s',        // Status alias
  '/add',      // Stage files
  '/a',        // Add alias
  '/commit',   // Create commit
  '/c',        // Commit alias
  '/push',     // Push to remote
  '/p',        // Push alias
  '/pr',       // Pull request management
  '/pull-request', // PR alias
  '/build',    // Build project
  '/b',        // Build alias
  '/test',     // Run tests
  '/t',        // Test alias
  '/lint',     // Run linter
  '/l',        // Lint alias
  
  // Project management commands
  '/issues',   // Issue management
  '/i',        // Issues alias
  '/milestones', // Milestone management
  '/m',        // Milestones alias
  '/labels',   // Label management
  
  // Analysis commands
  '/metrics',  // Code and project metrics
  '/dependencies', // Dependency analysis
  '/deps',     // Dependencies alias
  '/quality',  // Code quality analysis
  '/qa',       // Quality alias
  
  // Workflow commands
  '/workflow:status', // CI/CD workflow status
  '/w:s',      // Workflow status alias
  '/deploy',   // Deployment management
  '/release',  // Release alias
  '/pipeline', // Pipeline management
  '/ci',       // Pipeline alias
  '/environments', // Environment management
  '/envs',     // Environments alias
  
  // Sprint management commands
  '/sprint:plan', // Sprint planning
  '/sp:plan',  // Sprint plan alias
  '/sprint:review', // Sprint review
  '/sp:review', // Sprint review alias
  '/sprint:close', // Sprint closure
  '/sp:close', // Sprint close alias
  
  // Issue operations commands
  '/issue:bulk', // Bulk issue operations
  '/i:bulk',   // Issue bulk alias
  '/issue:dependencies', // Issue dependency analysis
  '/i:deps',   // Issue dependencies short alias
  '/i:dependencies', // Issue dependencies alias
  
  // Estimation commands
  '/estimate:bulk', // Bulk issue estimation
  '/est:bulk', // Estimation bulk alias
  '/est:b',    // Estimation bulk short alias
  '/estimate:sprint', // Sprint capacity estimation
  '/est:sprint', // Estimation sprint alias
  '/est:s',    // Estimation sprint short alias
  
  // Analysis & planning commands
  '/breakdown', // Scope breakdown and task creation
  '/epic:breakdown', // Epic breakdown into sub-issues
  '/epic:break', // Epic breakdown alias
  '/epic:split', // Epic breakdown alias
  '/feature:plan', // Complete feature planning
  '/feature:planning', // Feature planning alias
  '/plan:feature', // Feature planning alias
  '/analyze:scope', // Detailed scope analysis
  '/scope:analyze', // Scope analysis alias
  '/scope:analysis', // Scope analysis alias
  
  // Extended thinking commands
  '/plan', // Deep planning with extended thinking
  '/investigate', // Multi-source research and analysis
  '/decide', // Architectural decisions with ADR creation
  '/research', // Deep multi-source research
  '/alternatives' // Alternative solution exploration
]);

/**
 * Execute a slash command using the appropriate system
 */
export async function executeSlashCommand(commandString) {
  console.log(chalk.cyan('🚀 Flow State Dev - Slash Commands\n'));
  
  // All commands now use the new modular system
  try {
    await slashCommandExecutor.execute(commandString);
  } catch (error) {
    console.error(chalk.red('Error executing command:'), error.message);
    process.exit(1);
  }
}

/**
 * Get list of all available commands
 * @deprecated Use slashCommandExecutor.getAllCommands() instead
 */
export function getAllCommands() {
  return Array.from(MIGRATED_COMMANDS);
}

/**
 * Get migration status
 */
export function getMigrationStatus() {
  return {
    migrated: Array.from(MIGRATED_COMMANDS),
    total: 67, // Total commands in legacy system
    percentage: Math.round((MIGRATED_COMMANDS.size / 67) * 100),
    byCategory: {
      utility: 3,
      quickAction: 14,
      project: 5,
      analysis: 5,
      workflow: 8,
      sprint: 6,     // Sprint commands
      issue: 5,      // Issue operations commands
      estimation: 6, // Estimation commands
      planning: 10,  // Analysis & planning commands
      thinking: 5,   // Extended thinking commands
      total: 67      // Total migrated - 100% complete!
    }
  };
}