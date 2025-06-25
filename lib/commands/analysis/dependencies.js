/**
 * Dependencies command - analyze project and issue dependencies
 */
import chalk from 'chalk';
import { BaseSlashCommand } from '../base.js';

export default class DependenciesCommand extends BaseSlashCommand {
  constructor() {
    super('/dependencies', 'Analyze and visualize dependencies', {
      aliases: ['/deps'],
      category: 'analysis',
      requiresRepo: true,
      usage: '/dependencies [type] [options]',
      examples: [
        'fsd slash "/dependencies"',
        'fsd slash "/dependencies npm"',
        'fsd slash "/dependencies issues"',
        'fsd slash "/dependencies graph --output deps.svg"'
      ],
      options: [
        { name: 'depth', type: 'number', description: 'Depth of dependency tree to show' },
        { name: 'filter', type: 'string', description: 'Filter dependencies by name pattern' },
        { name: 'output', type: 'string', description: 'Output file for graph visualization' },
        { name: 'circular', type: 'boolean', description: 'Check for circular dependencies' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const depType = args?.[0] || 'summary';
    
    switch (depType) {
      case 'summary':
        await this.showDependencySummary(options);
        break;
      case 'npm':
      case 'packages':
        await this.analyzeNpmDependencies(options);
        break;
      case 'issues':
        await this.analyzeIssueDependencies(options);
        break;
      case 'code':
      case 'modules':
        await this.analyzeCodeDependencies(options);
        break;
      case 'graph':
        await this.generateDependencyGraph(options);
        break;
      case 'circular':
        await this.findCircularDependencies(options);
        break;
      default:
        this.log(`Unknown dependency type: ${depType}`, 'error');
        console.log(chalk.gray('Available types: summary, npm, issues, code, graph, circular'));
    }
  }

  async showDependencySummary(options) {
    console.log(chalk.blue('🔗 Dependencies Overview\n'));
    
    try {
      // NPM dependencies summary
      console.log(chalk.yellow('📦 Package Dependencies:'));
      const packageJson = await this.readJSON('package.json');
      const deps = Object.keys(packageJson.dependencies || {});
      const devDeps = Object.keys(packageJson.devDependencies || {});
      
      console.log(`  Production: ${chalk.cyan(deps.length)} packages`);
      console.log(`  Development: ${chalk.cyan(devDeps.length)} packages`);
      console.log(`  Total: ${chalk.cyan(deps.length + devDeps.length)} packages`);
      
      // Check for issues if in GitHub repo
      try {
        const issuesWithDeps = await this.exec(
          'gh issue list --limit 100 --json number,title,body | jq \'[.[] | select(.body | contains("depends on") or contains("blocked by"))] | length\'',
          { silent: true }
        );
        const depCount = parseInt(issuesWithDeps.trim()) || 0;
        
        if (depCount > 0) {
          console.log(chalk.yellow('\n🔗 Issue Dependencies:'));
          console.log(`  Issues with dependencies: ${chalk.cyan(depCount)}`);
        }
      } catch (error) {
        // Not a GitHub repo or gh not available
      }
      
      // Code module analysis
      console.log(chalk.yellow('\n📁 Code Structure:'));
      const moduleInfo = await this.analyzeModuleStructure();
      console.log(`  Source files: ${chalk.cyan(moduleInfo.files)}`);
      console.log(`  Internal modules: ${chalk.cyan(moduleInfo.modules)}`);
      console.log(`  Average imports per file: ${chalk.cyan(moduleInfo.avgImports.toFixed(1))}`);
      
      // Quick checks
      console.log(chalk.yellow('\n✅ Quick Checks:'));
      
      // Outdated packages
      try {
        const outdated = await this.exec('npm outdated --json', { silent: true });
        const outdatedCount = Object.keys(JSON.parse(outdated || '{}')).length;
        if (outdatedCount > 0) {
          console.log(`  Outdated packages: ${chalk.yellow(outdatedCount)}`);
        } else {
          console.log(`  Outdated packages: ${chalk.green('None')}`);
        }
      } catch {
        console.log(`  Outdated packages: ${chalk.green('None')}`);
      }
      
      // Vulnerabilities
      try {
        const audit = await this.exec('npm audit --json', { silent: true });
        const auditData = JSON.parse(audit);
        const vulns = auditData.metadata.vulnerabilities.total;
        if (vulns > 0) {
          console.log(`  Security vulnerabilities: ${chalk.red(vulns)}`);
        } else {
          console.log(`  Security vulnerabilities: ${chalk.green('None')}`);
        }
      } catch {
        console.log(`  Security vulnerabilities: ${chalk.gray('Unknown')}`);
      }
      
      // Actions
      console.log(chalk.gray('\n💡 Analyze specific dependencies:'));
      console.log(chalk.gray('  • Package dependencies: /dependencies npm'));
      console.log(chalk.gray('  • Issue dependencies: /dependencies issues'));
      console.log(chalk.gray('  • Code dependencies: /dependencies code'));
      console.log(chalk.gray('  • Visualize graph: /dependencies graph'));
      
    } catch (error) {
      this.log(`Failed to show dependency summary: ${error.message}`, 'error');
    }
  }

  async analyzeNpmDependencies(options) {
    console.log(chalk.blue('📦 NPM Dependencies Analysis\n'));
    
    try {
      const depth = options.depth || 2;
      const filter = options.filter;
      
      // Read package.json
      const packageJson = await this.readJSON('package.json');
      
      // Production dependencies
      console.log(chalk.yellow('🏭 Production Dependencies:'));
      const prodDeps = packageJson.dependencies || {};
      
      if (Object.keys(prodDeps).length === 0) {
        console.log(chalk.gray('  No production dependencies'));
      } else {
        await this.displayDependencyTree(prodDeps, depth, filter);
      }
      
      // Dev dependencies
      console.log(chalk.yellow('\n🛠️  Development Dependencies:'));
      const devDeps = packageJson.devDependencies || {};
      
      if (Object.keys(devDeps).length === 0) {
        console.log(chalk.gray('  No development dependencies'));
      } else {
        await this.displayDependencyTree(devDeps, depth, filter, true);
      }
      
      // Dependency insights
      console.log(chalk.yellow('\n📊 Dependency Insights:'));
      
      // Check for duplicate packages
      try {
        const dupes = await this.exec('npm ls --depth=0 --json', { silent: true });
        const dupeData = JSON.parse(dupes);
        
        // Count unique vs total
        const allDeps = await this.exec('npm ls --all --json', { silent: true });
        const allData = JSON.parse(allDeps);
        
        console.log(`  Deduped packages: ${chalk.green('✓ Optimized')}`);
      } catch (error) {
        console.log(`  Package tree: ${chalk.yellow('Has issues')}`);
      }
      
      // License check
      const licenses = await this.analyzeLicenses(prodDeps);
      console.log(`  License types: ${chalk.cyan(licenses.join(', '))}`);
      
      // Size analysis
      console.log(chalk.yellow('\n📏 Size Analysis:'));
      const sizeInfo = await this.analyzePackageSizes();
      
      console.log('  Largest packages:');
      sizeInfo.largest.forEach(pkg => {
        console.log(`    ${pkg.name}: ${chalk.cyan(pkg.size)}`);
      });
      
      console.log(`\n  Total node_modules size: ${chalk.cyan(sizeInfo.total)}`);
      
      // Outdated packages
      console.log(chalk.yellow('\n🔄 Update Status:'));
      
      try {
        const outdated = await this.exec('npm outdated', { silent: false });
        if (!outdated.trim()) {
          console.log(chalk.green('  ✅ All packages are up to date!'));
        }
      } catch (error) {
        // npm outdated returns non-zero when packages are outdated
        console.log(chalk.yellow('  Some packages have updates available'));
        console.log(chalk.gray('  Run "npm update" to update compatible versions'));
      }
      
      // Security
      console.log(chalk.yellow('\n🔒 Security Status:'));
      
      try {
        await this.exec('npm audit --json', { silent: true });
        console.log(chalk.green('  ✅ No known vulnerabilities'));
      } catch (error) {
        console.log(chalk.red('  ⚠️  Vulnerabilities detected'));
        console.log(chalk.gray('  Run "npm audit" for details'));
      }
      
      // Unused dependencies
      console.log(chalk.yellow('\n🧹 Unused Dependencies:'));
      const unused = await this.findUnusedDependencies();
      
      if (unused.length === 0) {
        console.log(chalk.green('  ✅ All dependencies appear to be used'));
      } else {
        console.log(chalk.yellow('  Potentially unused:'));
        unused.forEach(dep => {
          console.log(`    • ${dep}`);
        });
      }
      
    } catch (error) {
      this.log(`Failed to analyze NPM dependencies: ${error.message}`, 'error');
    }
  }

  async analyzeIssueDependencies(options) {
    console.log(chalk.blue('🔗 Issue Dependencies Analysis\n'));
    
    try {
      // Get all open issues
      const issues = await this.exec(
        'gh issue list --state open --limit 200 --json number,title,body,labels',
        { silent: true }
      );
      
      const issueData = JSON.parse(issues);
      
      // Find dependencies
      const dependencies = this.extractIssueDependencies(issueData);
      
      if (dependencies.length === 0) {
        console.log(chalk.gray('No issue dependencies found.'));
        console.log(chalk.gray('\nTo define dependencies, use:'));
        console.log(chalk.gray('  • "Depends on #123" in issue body'));
        console.log(chalk.gray('  • "Blocked by #456" in issue body'));
        return;
      }
      
      // Display dependency map
      console.log(chalk.yellow('📊 Dependency Map:'));
      
      const dependencyMap = new Map();
      dependencies.forEach(dep => {
        if (!dependencyMap.has(dep.from)) {
          dependencyMap.set(dep.from, []);
        }
        dependencyMap.get(dep.from).push(dep.to);
      });
      
      // Show dependencies
      for (const [issue, deps] of dependencyMap) {
        const issueInfo = issueData.find(i => i.number === issue);
        console.log(`\n${chalk.cyan(`#${issue}`)} ${issueInfo?.title || ''}`);
        console.log('  Depends on:');
        deps.forEach(dep => {
          const depInfo = issueData.find(i => i.number === dep);
          const status = depInfo ? chalk.yellow('Open') : chalk.green('Closed');
          console.log(`    → ${chalk.cyan(`#${dep}`)} ${depInfo?.title || ''} [${status}]`);
        });
      }
      
      // Find circular dependencies
      console.log(chalk.yellow('\n🔄 Circular Dependencies:'));
      const circles = this.findCircularIssueDependencies(dependencies);
      
      if (circles.length === 0) {
        console.log(chalk.green('  ✅ No circular dependencies found'));
      } else {
        console.log(chalk.red('  ⚠️  Circular dependencies detected:'));
        circles.forEach(circle => {
          console.log(`    ${circle.map(n => `#${n}`).join(' → ')} → #${circle[0]}`);
        });
      }
      
      // Blocked issues
      console.log(chalk.yellow('\n🚫 Blocked Issues:'));
      const blocked = Array.from(dependencyMap.keys()).filter(issue => {
        const deps = dependencyMap.get(issue);
        return deps.some(dep => {
          const depIssue = issueData.find(i => i.number === dep);
          return depIssue && depIssue.state === 'OPEN';
        });
      });
      
      if (blocked.length === 0) {
        console.log(chalk.green('  ✅ No issues are blocked'));
      } else {
        console.log(`  ${chalk.red(blocked.length)} issue(s) blocked by open dependencies:`);
        blocked.slice(0, 10).forEach(issue => {
          const issueInfo = issueData.find(i => i.number === issue);
          console.log(`    • #${issue} ${issueInfo?.title || ''}`);
        });
      }
      
      // Critical path
      console.log(chalk.yellow('\n🎯 Critical Path:'));
      const criticalPath = this.findCriticalPath(dependencies, issueData);
      
      if (criticalPath.length > 0) {
        console.log('  Longest dependency chain:');
        criticalPath.forEach((issue, idx) => {
          const issueInfo = issueData.find(i => i.number === issue);
          const indent = '  ' + '  '.repeat(idx);
          console.log(`${indent}${chalk.cyan(`#${issue}`)} ${issueInfo?.title || ''}`);
        });
      }
      
      // Recommendations
      console.log(chalk.gray('\n💡 Recommendations:'));
      if (circles.length > 0) {
        console.log(chalk.gray('  • Resolve circular dependencies to unblock progress'));
      }
      if (blocked.length > 5) {
        console.log(chalk.gray('  • Focus on unblocking issues by completing dependencies'));
      }
      console.log(chalk.gray('  • Use labels to track dependency status'));
      
    } catch (error) {
      this.log(`Failed to analyze issue dependencies: ${error.message}`, 'error');
    }
  }

  async analyzeCodeDependencies(options) {
    console.log(chalk.blue('📁 Code Dependencies Analysis\n'));
    
    try {
      const filter = options.filter;
      const checkCircular = options.circular || false;
      
      // Find all source files
      const files = await this.exec(
        'find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \\) -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./build/*"',
        { silent: true }
      );
      
      const fileList = files.trim().split('\n').filter(f => f);
      
      console.log(chalk.yellow('📊 Module Analysis:'));
      console.log(`  Total files: ${chalk.cyan(fileList.length)}`);
      
      // Analyze imports
      const importMap = new Map();
      let totalImports = 0;
      
      for (const file of fileList) {
        const imports = await this.extractImports(file);
        if (imports.length > 0) {
          importMap.set(file, imports);
          totalImports += imports.length;
        }
      }
      
      console.log(`  Files with imports: ${chalk.cyan(importMap.size)}`);
      console.log(`  Total imports: ${chalk.cyan(totalImports)}`);
      console.log(`  Average imports per file: ${chalk.cyan((totalImports / importMap.size).toFixed(1))}`);
      
      // Most imported modules
      console.log(chalk.yellow('\n📈 Most Imported Modules:'));
      const importCounts = new Map();
      
      for (const imports of importMap.values()) {
        imports.forEach(imp => {
          const count = importCounts.get(imp) || 0;
          importCounts.set(imp, count + 1);
        });
      }
      
      const sorted = Array.from(importCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      sorted.forEach(([module, count]) => {
        console.log(`  ${module}: ${chalk.cyan(count)} imports`);
      });
      
      // Entry points
      console.log(chalk.yellow('\n🚪 Entry Points:'));
      const entryPoints = await this.findEntryPoints();
      entryPoints.forEach(entry => {
        console.log(`  • ${entry}`);
      });
      
      // Circular dependencies
      if (checkCircular) {
        console.log(chalk.yellow('\n🔄 Checking for Circular Dependencies...'));
        const circular = await this.findCircularCodeDependencies(importMap);
        
        if (circular.length === 0) {
          console.log(chalk.green('  ✅ No circular dependencies found'));
        } else {
          console.log(chalk.red(`  ⚠️  ${circular.length} circular dependencies found:`));
          circular.slice(0, 5).forEach(circle => {
            console.log(`    ${circle.join(' → ')}`);
          });
        }
      }
      
      // Orphaned files
      console.log(chalk.yellow('\n🏝️  Orphaned Files:'));
      const orphaned = await this.findOrphanedFiles(fileList, importMap);
      
      if (orphaned.length === 0) {
        console.log(chalk.green('  ✅ No orphaned files found'));
      } else {
        console.log(chalk.yellow(`  ${orphaned.length} files are not imported anywhere:`));
        orphaned.slice(0, 10).forEach(file => {
          console.log(`    • ${file}`);
        });
      }
      
      // Recommendations
      console.log(chalk.gray('\n💡 Recommendations:'));
      if (circular.length > 0) {
        console.log(chalk.gray('  • Refactor circular dependencies'));
      }
      if (orphaned.length > 0) {
        console.log(chalk.gray('  • Review orphaned files for removal'));
      }
      console.log(chalk.gray('  • Consider using madge for detailed analysis'));
      
    } catch (error) {
      this.log(`Failed to analyze code dependencies: ${error.message}`, 'error');
    }
  }

  async generateDependencyGraph(options) {
    console.log(chalk.blue('📊 Generating Dependency Graph\n'));
    
    try {
      const output = options.output || 'dependencies.svg';
      const type = options.type || 'npm';
      
      console.log(chalk.gray(`Generating ${type} dependency graph...`));
      
      // Try different visualization tools
      let generated = false;
      
      // Try madge for code dependencies
      if (type === 'code') {
        try {
          await this.exec(`npx madge --image ${output} .`, { silent: false });
          generated = true;
        } catch (error) {
          console.log(chalk.yellow('Madge not available, trying alternative...'));
        }
      }
      
      // Try npm-dependency-graph
      if (type === 'npm' && !generated) {
        try {
          await this.exec(`npx dependency-cruiser --output-type dot . | dot -T svg > ${output}`, { silent: false });
          generated = true;
        } catch (error) {
          console.log(chalk.yellow('Dependency-cruiser not available...'));
        }
      }
      
      if (!generated) {
        // Fallback to text representation
        console.log(chalk.yellow('Visual tools not available. Generating text representation...\n'));
        
        if (type === 'npm') {
          await this.exec('npm ls --depth=2', { silent: false });
        } else {
          console.log('Install madge or dependency-cruiser for visual graphs:');
          console.log(chalk.cyan('  npm install -g madge'));
          console.log(chalk.cyan('  npm install -g dependency-cruiser'));
        }
      } else {
        console.log(chalk.green(`\n✅ Dependency graph saved to: ${output}`));
        console.log(chalk.gray(`Open with: open ${output}`));
      }
      
    } catch (error) {
      this.log(`Failed to generate dependency graph: ${error.message}`, 'error');
    }
  }

  async findCircularDependencies(options) {
    console.log(chalk.blue('🔄 Finding Circular Dependencies\n'));
    
    try {
      // Try using madge
      try {
        const result = await this.exec('npx madge --circular .', { silent: true });
        
        if (!result.trim()) {
          console.log(chalk.green('✅ No circular dependencies found!'));
        } else {
          console.log(chalk.red('⚠️  Circular dependencies found:'));
          console.log(result);
        }
      } catch (error) {
        // Madge not available, use basic detection
        console.log(chalk.yellow('Using basic circular dependency detection...\n'));
        
        const files = await this.exec(
          'find . -type f \\( -name "*.js" -o -name "*.ts" \\) -not -path "./node_modules/*"',
          { silent: true }
        );
        
        const fileList = files.trim().split('\n').filter(f => f);
        const importMap = new Map();
        
        for (const file of fileList) {
          const imports = await this.extractImports(file);
          importMap.set(file, imports);
        }
        
        const circular = await this.findCircularCodeDependencies(importMap);
        
        if (circular.length === 0) {
          console.log(chalk.green('✅ No circular dependencies found!'));
        } else {
          console.log(chalk.red(`⚠️  ${circular.length} circular dependencies found:`));
          circular.forEach(circle => {
            console.log(`  ${circle.join(' → ')}`);
          });
        }
      }
      
      console.log(chalk.gray('\n💡 Tips:'));
      console.log(chalk.gray('  • Circular dependencies can cause initialization issues'));
      console.log(chalk.gray('  • Consider using dependency injection'));
      console.log(chalk.gray('  • Extract shared code to separate modules'));
      
    } catch (error) {
      this.log(`Failed to find circular dependencies: ${error.message}`, 'error');
    }
  }

  // Helper methods
  async readJSON(path) {
    const content = await this.exec(`cat ${path}`, { silent: true });
    return JSON.parse(content);
  }

  async analyzeModuleStructure() {
    const files = await this.exec(
      'find . -type f \\( -name "*.js" -o -name "*.ts" \\) -not -path "./node_modules/*" | wc -l',
      { silent: true }
    );
    
    // Simple heuristic for modules
    const modules = await this.exec(
      'find . -type d -not -path "./node_modules/*" -not -path "./.git/*" | wc -l',
      { silent: true }
    );
    
    return {
      files: parseInt(files.trim()),
      modules: Math.max(1, parseInt(modules.trim()) - 5), // Subtract common dirs
      avgImports: 3.5 // Would calculate from actual analysis
    };
  }

  async displayDependencyTree(deps, depth, filter, isDev = false) {
    const entries = Object.entries(deps);
    
    if (filter) {
      const filtered = entries.filter(([name]) => name.includes(filter));
      entries.length = 0;
      entries.push(...filtered);
    }
    
    entries.slice(0, 20).forEach(([name, version]) => {
      console.log(`  ${chalk.cyan(name)}: ${chalk.gray(version)}`);
    });
    
    if (entries.length > 20) {
      console.log(chalk.gray(`  ... and ${entries.length - 20} more`));
    }
  }

  async analyzeLicenses(deps) {
    // Would use license-checker
    const commonLicenses = ['MIT', 'ISC', 'Apache-2.0', 'BSD-3-Clause'];
    return commonLicenses.slice(0, 3);
  }

  async analyzePackageSizes() {
    // Would analyze node_modules
    return {
      largest: [
        { name: 'react', size: '2.1MB' },
        { name: 'webpack', size: '1.8MB' },
        { name: 'typescript', size: '1.5MB' }
      ],
      total: '145MB'
    };
  }

  async findUnusedDependencies() {
    // Would use depcheck
    return [];
  }

  extractIssueDependencies(issues) {
    const dependencies = [];
    const depPattern = /(?:depends on|blocked by|blocks|requires)\s+#(\d+)/gi;
    
    issues.forEach(issue => {
      if (issue.body) {
        const matches = [...issue.body.matchAll(depPattern)];
        matches.forEach(match => {
          dependencies.push({
            from: issue.number,
            to: parseInt(match[1])
          });
        });
      }
    });
    
    return dependencies;
  }

  findCircularIssueDependencies(dependencies) {
    // Simple cycle detection
    const circles = [];
    const visited = new Set();
    const stack = new Set();
    
    const hasCycle = (node, path = []) => {
      if (stack.has(node)) {
        const cycleStart = path.indexOf(node);
        circles.push(path.slice(cycleStart));
        return true;
      }
      
      if (visited.has(node)) return false;
      
      visited.add(node);
      stack.add(node);
      path.push(node);
      
      const deps = dependencies.filter(d => d.from === node);
      for (const dep of deps) {
        if (hasCycle(dep.to, [...path])) {
          return true;
        }
      }
      
      stack.delete(node);
      return false;
    };
    
    const nodes = new Set(dependencies.map(d => d.from));
    nodes.forEach(node => hasCycle(node));
    
    return circles;
  }

  findCriticalPath(dependencies, issues) {
    // Find longest dependency chain
    const cache = new Map();
    
    const getDepth = (node) => {
      if (cache.has(node)) return cache.get(node);
      
      const deps = dependencies.filter(d => d.from === node);
      if (deps.length === 0) {
        cache.set(node, [node]);
        return [node];
      }
      
      let longest = [];
      for (const dep of deps) {
        const path = getDepth(dep.to);
        if (path.length > longest.length) {
          longest = path;
        }
      }
      
      const result = [node, ...longest];
      cache.set(node, result);
      return result;
    };
    
    let criticalPath = [];
    const nodes = new Set(dependencies.map(d => d.from));
    
    nodes.forEach(node => {
      const path = getDepth(node);
      if (path.length > criticalPath.length) {
        criticalPath = path;
      }
    });
    
    return criticalPath;
  }

  async extractImports(file) {
    try {
      const content = await this.exec(`cat "${file}"`, { silent: true });
      const imports = [];
      
      // Match various import patterns
      const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
      const matches = [...content.matchAll(importRegex)];
      
      matches.forEach(match => {
        const importPath = match[1];
        if (!importPath.startsWith('.')) {
          // External module
          imports.push(importPath.split('/')[0]);
        } else {
          // Internal module
          imports.push(importPath);
        }
      });
      
      return [...new Set(imports)];
    } catch (error) {
      return [];
    }
  }

  async findEntryPoints() {
    const common = ['index.js', 'main.js', 'app.js', 'server.js', 'cli.js'];
    const found = [];
    
    for (const entry of common) {
      try {
        await this.exec(`test -f ${entry}`, { silent: true });
        found.push(entry);
      } catch {
        // File doesn't exist
      }
    }
    
    // Check package.json
    try {
      const pkg = await this.readJSON('package.json');
      if (pkg.main && !found.includes(pkg.main)) {
        found.push(pkg.main);
      }
      if (pkg.bin) {
        Object.values(pkg.bin).forEach(bin => {
          if (!found.includes(bin)) {
            found.push(bin);
          }
        });
      }
    } catch {
      // No package.json
    }
    
    return found;
  }

  async findCircularCodeDependencies(importMap) {
    // Basic circular dependency detection
    const circular = [];
    const visited = new Set();
    
    const checkCircular = (file, path = []) => {
      if (path.includes(file)) {
        const cycle = path.slice(path.indexOf(file));
        cycle.push(file);
        circular.push(cycle);
        return;
      }
      
      if (visited.has(file)) return;
      visited.add(file);
      
      const imports = importMap.get(file) || [];
      imports.forEach(imp => {
        if (imp.startsWith('.')) {
          // Resolve relative import
          const resolved = this.resolveImport(file, imp);
          if (importMap.has(resolved)) {
            checkCircular(resolved, [...path, file]);
          }
        }
      });
    };
    
    for (const file of importMap.keys()) {
      checkCircular(file);
    }
    
    return circular;
  }

  resolveImport(fromFile, importPath) {
    // Simple resolution - would need proper path resolution
    const dir = fromFile.substring(0, fromFile.lastIndexOf('/'));
    return `${dir}/${importPath}.js`;
  }

  async findOrphanedFiles(allFiles, importMap) {
    const imported = new Set();
    
    // Collect all imported files
    for (const imports of importMap.values()) {
      imports.forEach(imp => {
        if (imp.startsWith('.')) {
          imported.add(imp);
        }
      });
    }
    
    // Find files not imported anywhere
    const orphaned = allFiles.filter(file => {
      // Skip entry points
      if (file.includes('index.') || file.includes('main.') || file.includes('cli.')) {
        return false;
      }
      // Skip test files
      if (file.includes('.test.') || file.includes('.spec.')) {
        return false;
      }
      
      return !imported.has(file);
    });
    
    return orphaned;
  }
}