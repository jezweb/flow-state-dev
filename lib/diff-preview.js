/**
 * Diff Preview System for Flow State Dev Retrofit
 * 
 * Generates and displays file differences before applying changes,
 * helping users understand what will be modified.
 */
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export class DiffPreview {
  constructor(projectPath = process.cwd()) {
    this.projectPath = path.resolve(projectPath);
  }

  /**
   * Generate preview for a set of changes
   * @param {Array} changes - Array of change objects
   * @returns {Object} Preview results
   */
  async generatePreview(changes) {
    const preview = {
      newFiles: [],
      modifiedFiles: [],
      deletedFiles: [],
      summary: {
        newCount: 0,
        modifiedCount: 0,
        deletedCount: 0,
        totalChanges: 0
      }
    };

    for (const change of changes) {
      switch (change.type) {
        case 'create':
          preview.newFiles.push(await this.previewNewFile(change));
          preview.summary.newCount++;
          break;
        case 'modify':
          preview.modifiedFiles.push(await this.previewModifiedFile(change));
          preview.summary.modifiedCount++;
          break;
        case 'delete':
          preview.deletedFiles.push(await this.previewDeletedFile(change));
          preview.summary.deletedCount++;
          break;
      }
    }

    preview.summary.totalChanges = preview.summary.newCount + 
                                  preview.summary.modifiedCount + 
                                  preview.summary.deletedCount;

    return preview;
  }

  /**
   * Preview a new file creation
   * @param {Object} change - Change object
   * @returns {Object} New file preview
   */
  async previewNewFile(change) {
    const filePath = path.resolve(this.projectPath, change.path);
    const relativePath = path.relative(this.projectPath, filePath);
    
    let content = '';
    let preview = '';
    let size = 0;

    if (change.content) {
      content = change.content;
      size = content.length;
      preview = this.generateContentPreview(content);
    } else if (change.templatePath) {
      try {
        content = await fs.readFile(change.templatePath, 'utf8');
        size = content.length;
        preview = this.generateContentPreview(content);
      } catch (error) {
        preview = `Error reading template: ${error.message}`;
      }
    }

    return {
      type: 'create',
      path: relativePath,
      size,
      preview,
      lines: content.split('\n').length,
      exists: fs.existsSync(filePath)
    };
  }

  /**
   * Preview a file modification
   * @param {Object} change - Change object
   * @returns {Object} Modified file preview
   */
  async previewModifiedFile(change) {
    const filePath = path.resolve(this.projectPath, change.path);
    const relativePath = path.relative(this.projectPath, filePath);
    
    let originalContent = '';
    let modifiedContent = '';
    
    try {
      if (fs.existsSync(filePath)) {
        originalContent = await fs.readFile(filePath, 'utf8');
      }

      // Apply modification function if provided
      if (change.modifier && typeof change.modifier === 'function') {
        modifiedContent = await change.modifier(originalContent);
      } else if (change.content) {
        modifiedContent = change.content;
      }

      const diff = this.generateLineDiff(originalContent, modifiedContent);

      return {
        type: 'modify',
        path: relativePath,
        originalSize: originalContent.length,
        modifiedSize: modifiedContent.length,
        originalLines: originalContent.split('\n').length,
        modifiedLines: modifiedContent.split('\n').length,
        diff,
        description: change.description || 'File modification'
      };

    } catch (error) {
      return {
        type: 'modify',
        path: relativePath,
        error: error.message
      };
    }
  }

  /**
   * Preview a file deletion
   * @param {Object} change - Change object
   * @returns {Object} Deleted file preview
   */
  async previewDeletedFile(change) {
    const filePath = path.resolve(this.projectPath, change.path);
    const relativePath = path.relative(this.projectPath, filePath);
    
    let content = '';
    let size = 0;
    let lines = 0;

    try {
      if (fs.existsSync(filePath)) {
        const stats = await fs.stat(filePath);
        size = stats.size;
        
        if (stats.isFile()) {
          content = await fs.readFile(filePath, 'utf8');
          lines = content.split('\n').length;
        }
      }

      return {
        type: 'delete',
        path: relativePath,
        size,
        lines,
        preview: content ? this.generateContentPreview(content) : 'Directory or binary file',
        exists: fs.existsSync(filePath)
      };

    } catch (error) {
      return {
        type: 'delete',
        path: relativePath,
        error: error.message
      };
    }
  }

  /**
   * Generate a content preview (first few lines)
   * @param {string} content - File content
   * @param {number} maxLines - Maximum lines to show
   * @returns {string} Preview text
   */
  generateContentPreview(content, maxLines = 10) {
    const lines = content.split('\n');
    
    if (lines.length <= maxLines) {
      return lines.map((line, i) => `${(i + 1).toString().padStart(3)}: ${line}`).join('\n');
    }

    const preview = lines.slice(0, maxLines);
    const remaining = lines.length - maxLines;
    
    const numbered = preview.map((line, i) => `${(i + 1).toString().padStart(3)}: ${line}`);
    numbered.push(`     ... ${remaining} more lines`);
    
    return numbered.join('\n');
  }

  /**
   * Generate a line-by-line diff
   * @param {string} original - Original content
   * @param {string} modified - Modified content
   * @returns {Object} Diff information
   */
  generateLineDiff(original, modified) {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    
    // Simple diff implementation - in production you might want to use a proper diff library
    const diff = {
      added: [],
      removed: [],
      unchanged: [],
      summary: {
        linesAdded: 0,
        linesRemoved: 0,
        linesChanged: 0
      }
    };

    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const modifiedLine = modifiedLines[i] || '';
      
      if (i >= originalLines.length) {
        // Line added
        diff.added.push({ line: i + 1, content: modifiedLine });
        diff.summary.linesAdded++;
      } else if (i >= modifiedLines.length) {
        // Line removed
        diff.removed.push({ line: i + 1, content: originalLine });
        diff.summary.linesRemoved++;
      } else if (originalLine !== modifiedLine) {
        // Line changed
        diff.removed.push({ line: i + 1, content: originalLine });
        diff.added.push({ line: i + 1, content: modifiedLine });
        diff.summary.linesChanged++;
      } else {
        // Line unchanged
        diff.unchanged.push({ line: i + 1, content: originalLine });
      }
    }

    return diff;
  }

  /**
   * Display preview in console with formatting
   * @param {Object} preview - Preview object from generatePreview
   * @param {Object} options - Display options
   */
  displayPreview(preview, options = {}) {
    const { showContent = false, maxFiles = 10 } = options;

    console.log(chalk.blue('\n📋 Change Preview:\n'));
    
    // Summary
    console.log(chalk.white('Summary:'));
    console.log(chalk.green(`  + ${preview.summary.newCount} new files`));
    console.log(chalk.yellow(`  ~ ${preview.summary.modifiedCount} modified files`));
    console.log(chalk.red(`  - ${preview.summary.deletedCount} deleted files`));
    console.log(chalk.gray(`    ${preview.summary.totalChanges} total changes\n`));

    // New files
    if (preview.newFiles.length > 0) {
      console.log(chalk.green('📄 New Files:'));
      preview.newFiles.slice(0, maxFiles).forEach(file => {
        console.log(chalk.green(`  + ${file.path}`));
        if (file.exists) {
          console.log(chalk.yellow(`    ⚠️  File already exists - will be overwritten`));
        }
        console.log(chalk.gray(`    ${file.lines} lines, ${this.formatSize(file.size)}`));
        
        if (showContent && file.preview) {
          console.log(chalk.gray('    Preview:'));
          file.preview.split('\n').slice(0, 5).forEach(line => {
            console.log(chalk.gray(`      ${line}`));
          });
        }
        console.log();
      });
      
      if (preview.newFiles.length > maxFiles) {
        console.log(chalk.gray(`    ... and ${preview.newFiles.length - maxFiles} more\n`));
      }
    }

    // Modified files
    if (preview.modifiedFiles.length > 0) {
      console.log(chalk.yellow('🔧 Modified Files:'));
      preview.modifiedFiles.slice(0, maxFiles).forEach(file => {
        console.log(chalk.yellow(`  ~ ${file.path}`));
        if (file.description) {
          console.log(chalk.gray(`    ${file.description}`));
        }
        
        if (file.diff) {
          const { summary } = file.diff;
          console.log(chalk.gray(`    +${summary.linesAdded} -${summary.linesRemoved} ~${summary.linesChanged}`));
        }
        
        if (showContent && file.diff) {
          this.displayFileDiff(file.diff, 3);
        }
        console.log();
      });
      
      if (preview.modifiedFiles.length > maxFiles) {
        console.log(chalk.gray(`    ... and ${preview.modifiedFiles.length - maxFiles} more\n`));
      }
    }

    // Deleted files
    if (preview.deletedFiles.length > 0) {
      console.log(chalk.red('🗑️  Deleted Files:'));
      preview.deletedFiles.slice(0, maxFiles).forEach(file => {
        console.log(chalk.red(`  - ${file.path}`));
        if (!file.exists) {
          console.log(chalk.gray(`    ⚠️  File doesn't exist`));
        } else {
          console.log(chalk.gray(`    ${file.lines} lines, ${this.formatSize(file.size)}`));
        }
        console.log();
      });
      
      if (preview.deletedFiles.length > maxFiles) {
        console.log(chalk.gray(`    ... and ${preview.deletedFiles.length - maxFiles} more\n`));
      }
    }
  }

  /**
   * Display a file diff with syntax highlighting
   * @param {Object} diff - Diff object
   * @param {number} maxLines - Maximum lines to show
   */
  displayFileDiff(diff, maxLines = 5) {
    let shown = 0;
    
    // Show removed lines
    for (const removed of diff.removed.slice(0, maxLines - shown)) {
      console.log(chalk.red(`      - ${removed.content}`));
      shown++;
      if (shown >= maxLines) break;
    }
    
    // Show added lines
    for (const added of diff.added.slice(0, maxLines - shown)) {
      console.log(chalk.green(`      + ${added.content}`));
      shown++;
      if (shown >= maxLines) break;
    }
    
    const totalChanges = diff.added.length + diff.removed.length;
    if (shown < totalChanges) {
      console.log(chalk.gray(`      ... ${totalChanges - shown} more changes`));
    }
  }

  /**
   * Show detailed file changes
   * @param {string} filePath - Path to file to show
   * @param {Object} change - Change object
   */
  async showFileChanges(filePath, change) {
    console.log(chalk.blue(`\n📄 File: ${filePath}\n`));
    
    if (change.type === 'create') {
      const preview = await this.previewNewFile(change);
      console.log(chalk.green('Content to be created:'));
      console.log(chalk.gray(preview.preview));
    } else if (change.type === 'modify') {
      const preview = await this.previewModifiedFile(change);
      if (preview.diff) {
        console.log(chalk.yellow('Changes:'));
        this.displayFileDiff(preview.diff, 20);
      }
    } else if (change.type === 'delete') {
      const preview = await this.previewDeletedFile(change);
      console.log(chalk.red('Content to be deleted:'));
      console.log(chalk.gray(preview.preview));
    }
  }

  /**
   * Generate a summary of changes
   * @param {Object} preview - Preview object
   * @returns {string} Summary text
   */
  summarizeChanges(preview) {
    const parts = [];
    
    if (preview.summary.newCount > 0) {
      parts.push(`${preview.summary.newCount} new files`);
    }
    
    if (preview.summary.modifiedCount > 0) {
      parts.push(`${preview.summary.modifiedCount} modifications`);
    }
    
    if (preview.summary.deletedCount > 0) {
      parts.push(`${preview.summary.deletedCount} deletions`);
    }
    
    return parts.join(', ') || 'No changes';
  }

  /**
   * Format file size for display
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

/**
 * Convenience function to preview changes
 * @param {Array} changes - Array of change objects
 * @param {string} projectPath - Project path
 * @returns {Object} Preview results
 */
export async function previewChanges(changes, projectPath = process.cwd()) {
  const diff = new DiffPreview(projectPath);
  return diff.generatePreview(changes);
}

/**
 * Convenience function to display preview
 * @param {Array} changes - Array of change objects
 * @param {string} projectPath - Project path
 * @param {Object} options - Display options
 */
export async function displayPreview(changes, projectPath = process.cwd(), options = {}) {
  const diff = new DiffPreview(projectPath);
  const preview = await diff.generatePreview(changes);
  diff.displayPreview(preview, options);
}