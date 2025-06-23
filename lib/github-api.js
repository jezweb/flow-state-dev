/**
 * GitHub API Integration
 * Provides utilities for interacting with GitHub repositories
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

export class GitHubAPI {
  constructor() {
    this.repoInfo = null;
  }

  /**
   * Check if GitHub CLI is available and authenticated
   */
  async checkCLI() {
    try {
      execSync('gh --version', { stdio: 'ignore' });
      execSync('gh auth status', { stdio: 'ignore' });
      return true;
    } catch {
      throw new Error('GitHub CLI is required. Install: https://cli.github.com/ and run: gh auth login');
    }
  }

  /**
   * Get repository information
   */
  async getRepoInfo() {
    if (this.repoInfo) return this.repoInfo;

    try {
      this.repoInfo = JSON.parse(
        execSync('gh repo view --json owner,name,url,visibility', { encoding: 'utf-8' })
      );
      return this.repoInfo;
    } catch (error) {
      throw new Error('Not in a GitHub repository or GitHub CLI not authenticated');
    }
  }

  /**
   * Get issues with optional filtering
   */
  async getIssues(options = {}) {
    const {
      state = 'open',
      milestone = null,
      labels = null,
      assignee = null,
      author = null,
      limit = 50
    } = options;

    let cmd = `gh issue list --state ${state} --limit ${limit}`;
    cmd += ' --json number,title,state,labels,milestone,assignees,author,createdAt,updatedAt,body';

    if (milestone) cmd += ` --milestone "${milestone}"`;
    if (labels) cmd += ` --label "${labels}"`;
    if (assignee) cmd += ` --assignee "${assignee}"`;
    if (author) cmd += ` --author "${author}"`;

    try {
      return JSON.parse(execSync(cmd, { encoding: 'utf-8' }));
    } catch (error) {
      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }

  /**
   * Get milestones
   */
  async getMilestones(state = 'open') {
    try {
      const milestones = JSON.parse(
        execSync(`gh api repos/:owner/:repo/milestones?state=${state}`, { encoding: 'utf-8' })
      );
      return milestones;
    } catch (error) {
      throw new Error(`Failed to fetch milestones: ${error.message}`);
    }
  }

  /**
   * Create a new milestone
   */
  async createMilestone(title, description = '', dueDate = null) {
    let cmd = `gh api repos/:owner/:repo/milestones -f title="${title}"`;
    if (description) cmd += ` -f description="${description}"`;
    if (dueDate) cmd += ` -f due_on="${dueDate}"`;

    try {
      const result = JSON.parse(execSync(cmd, { encoding: 'utf-8' }));
      return result;
    } catch (error) {
      throw new Error(`Failed to create milestone: ${error.message}`);
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(title, body = '', labels = [], assignees = [], milestone = null) {
    let cmd = `gh issue create --title "${title}" --body "${body}"`;
    
    if (labels.length > 0) {
      cmd += ` --label "${labels.join(',')}"`;
    }
    
    if (assignees.length > 0) {
      cmd += ` --assignee "${assignees.join(',')}"`;
    }
    
    if (milestone) {
      cmd += ` --milestone "${milestone}"`;
    }

    try {
      const output = execSync(cmd, { encoding: 'utf-8' });
      const issueUrl = output.trim();
      const issueNumber = issueUrl.split('/').pop();
      return { number: issueNumber, url: issueUrl };
    } catch (error) {
      throw new Error(`Failed to create issue: ${error.message}`);
    }
  }

  /**
   * Update an issue
   */
  async updateIssue(issueNumber, updates = {}) {
    let cmd = `gh issue edit ${issueNumber}`;
    
    if (updates.title) cmd += ` --title "${updates.title}"`;
    if (updates.body) cmd += ` --body "${updates.body}"`;
    if (updates.labels) cmd += ` --add-label "${updates.labels.join(',')}"`;
    if (updates.assignees) cmd += ` --add-assignee "${updates.assignees.join(',')}"`;
    if (updates.milestone) cmd += ` --milestone "${updates.milestone}"`;

    try {
      execSync(cmd, { stdio: 'inherit' });
      return true;
    } catch (error) {
      throw new Error(`Failed to update issue: ${error.message}`);
    }
  }

  /**
   * Close an issue
   */
  async closeIssue(issueNumber, reason = '') {
    try {
      let cmd = `gh issue close ${issueNumber}`;
      if (reason) cmd += ` --reason "${reason}"`;
      
      execSync(cmd, { stdio: 'inherit' });
      return true;
    } catch (error) {
      throw new Error(`Failed to close issue: ${error.message}`);
    }
  }

  /**
   * Get pull requests
   */
  async getPullRequests(state = 'open', limit = 20) {
    try {
      const prs = JSON.parse(
        execSync(`gh pr list --state ${state} --limit ${limit} --json number,title,state,author,createdAt,mergeable`, 
          { encoding: 'utf-8' })
      );
      return prs;
    } catch (error) {
      throw new Error(`Failed to fetch pull requests: ${error.message}`);
    }
  }

  /**
   * Get workflow runs
   */
  async getWorkflowRuns(limit = 10) {
    try {
      const runs = JSON.parse(
        execSync(`gh run list --limit ${limit} --json status,conclusion,workflowName,createdAt,url`, 
          { encoding: 'utf-8' })
      );
      return runs;
    } catch (error) {
      throw new Error(`Failed to fetch workflow runs: ${error.message}`);
    }
  }

  /**
   * Get repository labels
   */
  async getLabels() {
    try {
      const labels = JSON.parse(
        execSync('gh api repos/:owner/:repo/labels', { encoding: 'utf-8' })
      );
      return labels;
    } catch (error) {
      throw new Error(`Failed to fetch labels: ${error.message}`);
    }
  }

  /**
   * Create a label
   */
  async createLabel(name, color, description = '') {
    try {
      const result = JSON.parse(
        execSync(`gh api repos/:owner/:repo/labels -f name="${name}" -f color="${color}" -f description="${description}"`, 
          { encoding: 'utf-8' })
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to create label: ${error.message}`);
    }
  }

  /**
   * Bulk update issues
   */
  async bulkUpdateIssues(issueNumbers, updates = {}) {
    const results = [];
    
    for (const number of issueNumbers) {
      try {
        await this.updateIssue(number, updates);
        results.push({ number, success: true });
        console.log(chalk.green(`✅ Updated issue #${number}`));
      } catch (error) {
        results.push({ number, success: false, error: error.message });
        console.log(chalk.red(`❌ Failed to update issue #${number}: ${error.message}`));
      }
    }
    
    return results;
  }

  /**
   * Calculate sprint velocity
   */
  async calculateVelocity(sprintMilestones = []) {
    const velocityData = [];
    
    for (const milestone of sprintMilestones) {
      const issues = await this.getIssues({ 
        state: 'all', 
        milestone: milestone.title 
      });
      
      const completedIssues = issues.filter(issue => issue.state === 'closed');
      const totalStoryPoints = this.calculateStoryPoints(completedIssues);
      
      velocityData.push({
        milestone: milestone.title,
        totalIssues: issues.length,
        completedIssues: completedIssues.length,
        storyPoints: totalStoryPoints,
        completionRate: issues.length > 0 ? (completedIssues.length / issues.length) * 100 : 0
      });
    }
    
    return velocityData;
  }

  /**
   * Calculate story points from issues (based on labels)
   */
  calculateStoryPoints(issues) {
    let totalPoints = 0;
    
    issues.forEach(issue => {
      const pointsLabel = issue.labels.find(label => 
        /points?[:\-\s]*(\d+)/i.test(label.name) || 
        /(\d+)[:\-\s]*points?/i.test(label.name)
      );
      
      if (pointsLabel) {
        const match = pointsLabel.name.match(/(\d+)/);
        if (match) {
          totalPoints += parseInt(match[1]);
        }
      } else {
        // Default to 1 point if no points label found
        totalPoints += 1;
      }
    });
    
    return totalPoints;
  }

  /**
   * Analyze issue dependencies (based on body content and linked issues)
   */
  async analyzeDependencies(issueNumber) {
    try {
      const issue = JSON.parse(
        execSync(`gh issue view ${issueNumber} --json number,title,body,state`, 
          { encoding: 'utf-8' })
      );

      // Find referenced issues in the body
      const issueReferences = [];
      const issueRegex = /#(\d+)/g;
      let match;
      
      while ((match = issueRegex.exec(issue.body)) !== null) {
        const referencedNumber = parseInt(match[1]);
        if (referencedNumber !== issue.number) {
          issueReferences.push(referencedNumber);
        }
      }

      // Get details for referenced issues
      const dependencies = [];
      for (const refNumber of issueReferences) {
        try {
          const refIssue = JSON.parse(
            execSync(`gh issue view ${refNumber} --json number,title,state`, 
              { encoding: 'utf-8' })
          );
          dependencies.push(refIssue);
        } catch {
          // Issue might not exist or be inaccessible
          dependencies.push({ 
            number: refNumber, 
            title: 'Unknown Issue', 
            state: 'unknown' 
          });
        }
      }

      return {
        issue,
        dependencies,
        blockedBy: dependencies.filter(dep => dep.state === 'open'),
        dependsOn: dependencies
      };
    } catch (error) {
      throw new Error(`Failed to analyze dependencies for issue #${issueNumber}: ${error.message}`);
    }
  }

  /**
   * Generate progress report
   */
  async generateProgressReport(period = 'week') {
    const now = new Date();
    const startDate = new Date(now);
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    const repoInfo = await this.getRepoInfo();
    const issues = await this.getIssues({ state: 'all', limit: 100 });
    const prs = await this.getPullRequests('all', 50);
    const workflows = await this.getWorkflowRuns(20);

    // Filter by date range
    const periodIssues = issues.filter(issue => 
      new Date(issue.updatedAt) >= startDate
    );
    
    const periodPRs = prs.filter(pr => 
      new Date(pr.createdAt) >= startDate
    );

    const report = {
      repository: `${repoInfo.owner.login}/${repoInfo.name}`,
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      issues: {
        total: periodIssues.length,
        closed: periodIssues.filter(i => i.state === 'closed').length,
        opened: periodIssues.filter(i => new Date(i.createdAt) >= startDate).length
      },
      pullRequests: {
        total: periodPRs.length,
        merged: periodPRs.filter(pr => pr.state === 'merged').length,
        open: periodPRs.filter(pr => pr.state === 'open').length
      },
      workflows: {
        total: workflows.length,
        successful: workflows.filter(w => w.conclusion === 'success').length,
        failed: workflows.filter(w => w.conclusion === 'failure').length,
        successRate: workflows.length > 0 ? 
          Math.round((workflows.filter(w => w.conclusion === 'success').length / workflows.length) * 100) : 0
      }
    };

    return report;
  }
}

// Export singleton instance
export const githubAPI = new GitHubAPI();