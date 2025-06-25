/**
 * Issue Bulk command - Perform bulk operations on issues
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class IssueBulkCommand extends GitHubSlashCommand {
  constructor() {
    super('/issue:bulk', 'Perform bulk operations on issues', {
      aliases: ['/i:bulk'],
      category: 'issue',
      usage: '/issue:bulk [action] [options]',
      examples: [
        'fsd slash "/issue:bulk label --filter state:open"',
        'fsd slash "/issue:bulk milestone --filter assignee:@me"',
        'fsd slash "/issue:bulk close --filter label:duplicate"',
        'fsd slash "/issue:bulk assign --filter milestone:Sprint-1"'
      ],
      options: [
        { name: 'action', type: 'string', description: 'Bulk action: label, milestone, assign, close, state' },
        { name: 'filter', type: 'string', description: 'Issue filter (state:open, label:bug, assignee:@me, milestone:v1.0)' },
        { name: 'preview', type: 'boolean', description: 'Preview issues without making changes' },
        { name: 'batch-size', type: 'number', description: 'Process issues in batches (default: 10)' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const action = args?.[0] || options.action;
    
    if (!action) {
      console.log(chalk.blue('🔄 Bulk Issue Operations\n'));
      console.log(chalk.gray('Available actions:'));
      console.log(chalk.gray('  • label    - Add or update labels'));
      console.log(chalk.gray('  • milestone - Assign to milestone'));
      console.log(chalk.gray('  • assign   - Assign to user'));
      console.log(chalk.gray('  • close    - Close issues'));
      console.log(chalk.gray('  • state    - Change issue state'));
      console.log(chalk.gray('\nUsage: /issue:bulk <action> [options]'));
      return;
    }

    console.log(chalk.blue('🔄 Bulk Issue Operations\n'));
    
    try {
      // Parse filter and get matching issues
      const issues = await this.getFilteredIssues(options.filter);
      
      if (issues.length === 0) {
        console.log(chalk.yellow('No issues found matching the filter'));
        console.log(chalk.gray('\nExample filters:'));
        console.log(chalk.gray('  --filter "state:open"'));
        console.log(chalk.gray('  --filter "label:bug"'));
        console.log(chalk.gray('  --filter "assignee:@me"'));
        console.log(chalk.gray('  --filter "milestone:v1.0"'));
        return;
      }

      // Show preview of issues
      this.previewIssues(issues, action);

      // Preview mode - just show what would be changed
      if (options.preview) {
        console.log(chalk.yellow('\n🔍 Preview mode - no changes will be made'));
        return;
      }

      // Confirm bulk operation
      const shouldProceed = await this.confirm(
        `Perform ${action} operation on ${issues.length} issue(s)?`,
        false
      );

      if (!shouldProceed) {
        console.log(chalk.yellow('Operation cancelled'));
        return;
      }

      // Execute bulk operation
      await this.executeBulkOperation(action, issues, options);

    } catch (error) {
      this.log(`Failed to perform bulk operation: ${error.message}`, 'error');
    }
  }

  async getFilteredIssues(filter) {
    let queryOptions = {};
    
    if (filter) {
      queryOptions = this.parseFilter(filter);
    } else {
      // Default to open issues
      queryOptions = { state: 'open' };
    }

    try {
      const result = await this.buildIssueQuery(queryOptions);
      return JSON.parse(result);
    } catch (error) {
      this.log('Failed to fetch issues', 'error');
      return [];
    }
  }

  parseFilter(filter) {
    const options = {};
    const parts = filter.split(/\s+/);
    
    for (const part of parts) {
      const [key, value] = part.split(':');
      
      switch (key) {
        case 'state':
          options.state = value;
          break;
        case 'label':
          options.label = value;
          break;
        case 'assignee':
          options.assignee = value;
          break;
        case 'milestone':
          options.milestone = value;
          break;
        case 'author':
          options.author = value;
          break;
        default:
          console.log(chalk.yellow(`Unknown filter: ${key}`));
      }
    }
    
    return options;
  }

  async buildIssueQuery(options) {
    let query = 'gh issue list --json number,title,state,labels,assignees,milestone';
    
    if (options.state) {
      query += ` --state ${options.state}`;
    }
    
    if (options.label) {
      query += ` --label "${options.label}"`;
    }
    
    if (options.assignee) {
      query += ` --assignee "${options.assignee}"`;
    }
    
    if (options.milestone) {
      query += ` --milestone "${options.milestone}"`;
    }
    
    if (options.author) {
      query += ` --author "${options.author}"`;
    }
    
    // Limit to reasonable number for bulk operations
    query += ' --limit 100';
    
    return await this.exec(query, { silent: true });
  }

  previewIssues(issues, action) {
    console.log(chalk.white(`📋 Found ${issues.length} issue(s) for ${action} operation:`));
    console.log('');
    
    // Show preview (first 10 issues)
    const preview = issues.slice(0, 10);
    preview.forEach(issue => {
      const assignees = issue.assignees?.map(a => a.login).join(', ') || 'Unassigned';
      const labels = issue.labels?.map(l => l.name).join(', ') || 'No labels';
      const milestone = issue.milestone?.title || 'No milestone';
      
      console.log(`${chalk.cyan('#' + issue.number)} ${chalk.white(issue.title)}`);
      console.log(chalk.gray(`    State: ${issue.state} | Assignee: ${assignees}`));
      console.log(chalk.gray(`    Labels: ${labels}`));
      console.log(chalk.gray(`    Milestone: ${milestone}`));
      console.log('');
    });
    
    if (issues.length > 10) {
      console.log(chalk.gray(`... and ${issues.length - 10} more issues`));
    }
  }

  async executeBulkOperation(action, issues, options) {
    const batchSize = options['batch-size'] || 10;
    
    switch (action) {
      case 'label':
        await this.bulkLabel(issues, batchSize);
        break;
      case 'milestone':
        await this.bulkMilestone(issues, batchSize);
        break;
      case 'assign':
        await this.bulkAssign(issues, batchSize);
        break;
      case 'close':
        await this.bulkClose(issues, batchSize);
        break;
      case 'state':
        await this.bulkState(issues, batchSize);
        break;
      default:
        this.log(`Unknown action: ${action}`, 'error');
        console.log(chalk.gray('Available actions: label, milestone, assign, close, state'));
    }
  }

  async bulkLabel(issues, batchSize) {
    const { labelAction } = await this.prompt([{
      type: 'list',
      name: 'labelAction',
      message: 'Label operation:',
      choices: [
        { name: 'Add label', value: 'add' },
        { name: 'Remove label', value: 'remove' },
        { name: 'Replace all labels', value: 'replace' }
      ]
    }]);

    const { labelName } = await this.prompt([{
      type: 'input',
      name: 'labelName',
      message: 'Label name:',
      validate: input => input.trim() !== '' || 'Label name is required'
    }]);

    console.log(chalk.gray('\n🏷️ Processing labels...'));
    
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < issues.length; i += batchSize) {
      const batch = issues.slice(i, i + batchSize);
      
      for (const issue of batch) {
        try {
          let command = `gh issue edit ${issue.number}`;
          
          if (labelAction === 'add') {
            command += ` --add-label "${labelName}"`;
          } else if (labelAction === 'remove') {
            command += ` --remove-label "${labelName}"`;
          } else if (labelAction === 'replace') {
            command += ` --label "${labelName}"`;
          }
          
          await this.exec(command, { silent: true });
          console.log(chalk.green(`✅ #${issue.number}: ${labelAction} label "${labelName}"`));
          successful++;
        } catch (error) {
          console.log(chalk.red(`❌ #${issue.number}: Failed - ${error.message}`));
          failed++;
        }
      }
      
      // Brief pause between batches
      if (i + batchSize < issues.length) {
        await this.sleep(1000);
      }
    }

    console.log(chalk.green(`\n✅ Label operation complete: ${successful} successful, ${failed} failed`));
  }

  async bulkMilestone(issues, batchSize) {
    // Get available milestones
    const milestones = await this.getMilestones();
    
    if (milestones.length === 0) {
      console.log(chalk.yellow('No milestones found. Create a milestone first.'));
      return;
    }

    const milestoneChoices = [
      { name: 'Remove milestone', value: null },
      ...milestones.map(m => ({ 
        name: `${m.title} (${m.state})`, 
        value: m.title 
      }))
    ];

    const { selectedMilestone } = await this.prompt([{
      type: 'list',
      name: 'selectedMilestone',
      message: 'Select milestone:',
      choices: milestoneChoices
    }]);

    console.log(chalk.gray('\n🎯 Processing milestones...'));
    
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < issues.length; i += batchSize) {
      const batch = issues.slice(i, i + batchSize);
      
      for (const issue of batch) {
        try {
          let command = `gh issue edit ${issue.number}`;
          
          if (selectedMilestone) {
            command += ` --milestone "${selectedMilestone}"`;
          } else {
            command += ` --remove-milestone`;
          }
          
          await this.exec(command, { silent: true });
          
          const action = selectedMilestone ? `assigned to "${selectedMilestone}"` : 'milestone removed';
          console.log(chalk.green(`✅ #${issue.number}: ${action}`));
          successful++;
        } catch (error) {
          console.log(chalk.red(`❌ #${issue.number}: Failed - ${error.message}`));
          failed++;
        }
      }
      
      if (i + batchSize < issues.length) {
        await this.sleep(1000);
      }
    }

    console.log(chalk.green(`\n✅ Milestone operation complete: ${successful} successful, ${failed} failed`));
  }

  async bulkAssign(issues, batchSize) {
    const { assignAction } = await this.prompt([{
      type: 'list',
      name: 'assignAction',
      message: 'Assignment operation:',
      choices: [
        { name: 'Assign to user', value: 'assign' },
        { name: 'Remove all assignees', value: 'unassign' }
      ]
    }]);

    let assignee = null;
    if (assignAction === 'assign') {
      const { assigneeUsername } = await this.prompt([{
        type: 'input',
        name: 'assigneeUsername',
        message: 'GitHub username to assign:',
        validate: input => input.trim() !== '' || 'Username is required'
      }]);
      assignee = assigneeUsername;
    }

    console.log(chalk.gray('\n👤 Processing assignments...'));
    
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < issues.length; i += batchSize) {
      const batch = issues.slice(i, i + batchSize);
      
      for (const issue of batch) {
        try {
          let command = `gh issue edit ${issue.number}`;
          
          if (assignAction === 'assign') {
            command += ` --assignee "${assignee}"`;
          } else {
            command += ` --remove-assignee @assignees`;
          }
          
          await this.exec(command, { silent: true });
          
          const action = assignAction === 'assign' ? `assigned to ${assignee}` : 'unassigned';
          console.log(chalk.green(`✅ #${issue.number}: ${action}`));
          successful++;
        } catch (error) {
          console.log(chalk.red(`❌ #${issue.number}: Failed - ${error.message}`));
          failed++;
        }
      }
      
      if (i + batchSize < issues.length) {
        await this.sleep(1000);
      }
    }

    console.log(chalk.green(`\n✅ Assignment operation complete: ${successful} successful, ${failed} failed`));
  }

  async bulkClose(issues, batchSize) {
    const { closeReason } = await this.prompt([{
      type: 'list',
      name: 'closeReason',
      message: 'Reason for closing:',
      choices: [
        { name: 'Completed', value: 'completed' },
        { name: 'Not planned', value: 'not_planned' }
      ]
    }]);

    const { addComment } = await this.confirm(
      'Add a comment explaining the bulk closure?',
      true
    );

    let comment = null;
    if (addComment) {
      const { closureComment } = await this.prompt([{
        type: 'input',
        name: 'closureComment',
        message: 'Closure comment:',
        default: `Bulk closed as ${closeReason}`
      }]);
      comment = closureComment;
    }

    console.log(chalk.gray('\n🔒 Closing issues...'));
    
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < issues.length; i += batchSize) {
      const batch = issues.slice(i, i + batchSize);
      
      for (const issue of batch) {
        try {
          let command = `gh issue close ${issue.number} --reason ${closeReason}`;
          
          if (comment) {
            command += ` --comment "${comment}"`;
          }
          
          await this.exec(command, { silent: true });
          console.log(chalk.green(`✅ #${issue.number}: Closed (${closeReason})`));
          successful++;
        } catch (error) {
          console.log(chalk.red(`❌ #${issue.number}: Failed - ${error.message}`));
          failed++;
        }
      }
      
      if (i + batchSize < issues.length) {
        await this.sleep(1000);
      }
    }

    console.log(chalk.green(`\n✅ Close operation complete: ${successful} successful, ${failed} failed`));
  }

  async bulkState(issues, batchSize) {
    const { newState } = await this.prompt([{
      type: 'list',
      name: 'newState',
      message: 'New state:',
      choices: [
        { name: 'Open', value: 'open' },
        { name: 'Closed', value: 'closed' }
      ]
    }]);

    if (newState === 'closed') {
      // Redirect to bulk close for proper closure handling
      await this.bulkClose(issues, batchSize);
      return;
    }

    console.log(chalk.gray('\n🔄 Changing state...'));
    
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < issues.length; i += batchSize) {
      const batch = issues.slice(i, i + batchSize);
      
      for (const issue of batch) {
        try {
          await this.exec(`gh issue reopen ${issue.number}`, { silent: true });
          console.log(chalk.green(`✅ #${issue.number}: Reopened`));
          successful++;
        } catch (error) {
          console.log(chalk.red(`❌ #${issue.number}: Failed - ${error.message}`));
          failed++;
        }
      }
      
      if (i + batchSize < issues.length) {
        await this.sleep(1000);
      }
    }

    console.log(chalk.green(`\n✅ State operation complete: ${successful} successful, ${failed} failed`));
  }

  async getMilestones() {
    try {
      const result = await this.exec('gh api repos/{owner}/{repo}/milestones --jq \'.[] | {title: .title, state: .state}\'', { silent: true });
      return result.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}