/**
 * GitHub API
 * 
 * API for GitHub integration features
 */

// TODO: Import GitHubLabelsCommand when implemented
// import { GitHubLabelsCommand } from '../../commands/github-labels.js';
import { GitHubService } from '../../services/github.js';
import EventEmitter from 'events';

export class GitHubAPI extends EventEmitter {
  constructor(flowStateAPI) {
    super();
    this.api = flowStateAPI;
    this.githubService = null;
  }
  
  /**
   * Initialize GitHub API with token
   * @param {string} token - GitHub personal access token
   */
  async initialize(token) {
    if (!token) {
      throw new Error('GitHub token is required');
    }
    
    this.githubService = new GitHubService(token);
    
    // Test authentication
    const user = await this.githubService.getCurrentUser();
    
    this.emit('progress', {
      step: 'github:authenticated',
      message: `Authenticated as ${user.login}`
    });
    
    return {
      authenticated: true,
      user: {
        login: user.login,
        name: user.name,
        email: user.email
      }
    };
  }
  
  /**
   * Create standard labels for a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} options - Label creation options
   * @returns {Object} Creation result
   */
  async createLabels(owner, repo, options = {}) {
    if (!this.githubService) {
      throw new Error('GitHub API not initialized. Call initialize() first.');
    }
    
    try {
      this.emit('progress', {
        step: 'labels:start',
        message: `Creating labels for ${owner}/${repo}...`
      });
      
      // Get label configuration
      const labelConfig = this.getLabelConfiguration(options.preset || 'standard');
      
      // Create labels
      const results = {
        created: [],
        updated: [],
        errors: [],
        skipped: []
      };
      
      for (const label of labelConfig) {
        try {
          const existing = await this.githubService.getLabel(owner, repo, label.name);
          
          if (existing && !options.update) {
            results.skipped.push(label.name);
            continue;
          }
          
          if (existing) {
            await this.githubService.updateLabel(owner, repo, label.name, {
              color: label.color,
              description: label.description
            });
            results.updated.push(label.name);
          } else {
            await this.githubService.createLabel(owner, repo, label);
            results.created.push(label.name);
          }
          
          this.emit('progress', {
            step: 'labels:progress',
            message: `Processed ${label.name}`
          });
          
        } catch (error) {
          results.errors.push({
            label: label.name,
            error: error.message
          });
        }
      }
      
      this.emit('progress', {
        step: 'labels:complete',
        message: 'Label creation complete'
      });
      
      return {
        success: results.errors.length === 0,
        summary: {
          total: labelConfig.length,
          created: results.created.length,
          updated: results.updated.length,
          skipped: results.skipped.length,
          errors: results.errors.length
        },
        results
      };
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
  
  /**
   * Get repository information
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Object} Repository information
   */
  async getRepository(owner, repo) {
    if (!this.githubService) {
      throw new Error('GitHub API not initialized');
    }
    
    const repository = await this.githubService.getRepository(owner, repo);
    
    return {
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      private: repository.private,
      defaultBranch: repository.default_branch,
      language: repository.language,
      topics: repository.topics,
      homepage: repository.homepage,
      hasIssues: repository.has_issues,
      hasProjects: repository.has_projects,
      hasWiki: repository.has_wiki,
      createdAt: repository.created_at,
      updatedAt: repository.updated_at,
      pushedAt: repository.pushed_at,
      stats: {
        stars: repository.stargazers_count,
        watchers: repository.watchers_count,
        forks: repository.forks_count,
        openIssues: repository.open_issues_count
      }
    };
  }
  
  /**
   * Create an issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} issue - Issue data
   * @returns {Object} Created issue
   */
  async createIssue(owner, repo, issue) {
    if (!this.githubService) {
      throw new Error('GitHub API not initialized');
    }
    
    const created = await this.githubService.createIssue(owner, repo, {
      title: issue.title,
      body: issue.body,
      labels: issue.labels || [],
      assignees: issue.assignees || [],
      milestone: issue.milestone
    });
    
    return {
      number: created.number,
      title: created.title,
      state: created.state,
      url: created.html_url,
      createdAt: created.created_at
    };
  }
  
  /**
   * Get issues
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} filters - Issue filters
   * @returns {Array} Issues
   */
  async getIssues(owner, repo, filters = {}) {
    if (!this.githubService) {
      throw new Error('GitHub API not initialized');
    }
    
    const issues = await this.githubService.listIssues(owner, repo, filters);
    
    return issues.map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      labels: issue.labels.map(l => l.name),
      assignees: issue.assignees.map(a => a.login),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      url: issue.html_url
    }));
  }
  
  /**
   * Get label configuration
   */
  getLabelConfiguration(preset) {
    const configs = {
      standard: [
        // Type labels
        { name: 'bug', color: 'd73a4a', description: 'Something isn\'t working' },
        { name: 'enhancement', color: 'a2eeef', description: 'New feature or request' },
        { name: 'documentation', color: '0075ca', description: 'Improvements or additions to documentation' },
        { name: 'question', color: 'd876e3', description: 'Further information is requested' },
        
        // Priority labels
        { name: 'priority:high', color: 'e11d21', description: 'High priority issue' },
        { name: 'priority:medium', color: 'eb6420', description: 'Medium priority issue' },
        { name: 'priority:low', color: 'fbca04', description: 'Low priority issue' },
        
        // Status labels
        { name: 'status:in-progress', color: '0e8a16', description: 'Work in progress' },
        { name: 'status:blocked', color: 'e99695', description: 'Blocked by another issue' },
        { name: 'status:review-needed', color: 'c2e0c6', description: 'Needs review' },
        
        // Other labels
        { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
        { name: 'help wanted', color: '008672', description: 'Extra attention is needed' },
        { name: 'invalid', color: 'e4e669', description: 'This doesn\'t seem right' },
        { name: 'duplicate', color: 'cfd3d7', description: 'This issue or pull request already exists' },
        { name: 'wontfix', color: 'ffffff', description: 'This will not be worked on' }
      ],
      
      flowstate: [
        // Epic and feature labels
        { name: 'epic', color: '3e4b9e', description: 'Large feature or initiative' },
        { name: 'feature', color: '0052cc', description: 'New feature implementation' },
        { name: 'task', color: '0e8a16', description: 'Individual task or work item' },
        
        // Module labels
        { name: 'module:vue', color: '42b883', description: 'Vue.js related' },
        { name: 'module:react', color: '61dafb', description: 'React related' },
        { name: 'module:supabase', color: '3ecf8e', description: 'Supabase related' },
        { name: 'module:deployment', color: 'f81ce5', description: 'Deployment related' },
        
        // Area labels
        { name: 'area:cli', color: 'bfd4f2', description: 'CLI functionality' },
        { name: 'area:api', color: 'd4c5f9', description: 'API related' },
        { name: 'area:docs', color: '84b6eb', description: 'Documentation' },
        { name: 'area:testing', color: '1d76db', description: 'Testing related' }
      ]
    };
    
    // Merge standard with specific preset
    if (preset === 'flowstate') {
      return [...configs.standard, ...configs.flowstate];
    }
    
    return configs[preset] || configs.standard;
  }
}