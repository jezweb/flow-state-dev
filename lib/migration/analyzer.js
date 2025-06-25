/**
 * Project Migration Analyzer
 * Analyzes existing projects and determines migration strategy
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import chalk from 'chalk';

export class ProjectAnalyzer {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.analysis = null;
  }

  /**
   * Analyze the project and determine its characteristics
   */
  async analyze() {
    console.log(chalk.blue('🔍 Analyzing project structure...'));
    
    this.analysis = {
      projectPath: this.projectPath,
      projectType: null,
      framework: null,
      uiLibrary: null,
      stateManagement: null,
      backend: null,
      database: null,
      buildTool: null,
      packageManager: null,
      hasGit: false,
      hasNodeModules: false,
      dependencies: {},
      devDependencies: {},
      files: [],
      configFiles: [],
      sourceStructure: {},
      migrationComplexity: 'unknown',
      recommendedModules: [],
      potentialIssues: [],
      migrationStrategy: null
    };

    try {
      await this.analyzePackageJson();
      await this.analyzeFileStructure();
      await this.analyzeSourceCode();
      await this.analyzeBuildConfiguration();
      await this.determineProjectType();
      await this.assessMigrationComplexity();
      await this.generateRecommendations();
      
      console.log(chalk.green('✅ Analysis complete'));
      return this.analysis;
    } catch (error) {
      console.error(chalk.red('❌ Analysis failed:'), error.message);
      throw error;
    }
  }

  /**
   * Analyze package.json for dependencies and scripts
   */
  async analyzePackageJson() {
    const packagePath = join(this.projectPath, 'package.json');
    
    if (!existsSync(packagePath)) {
      this.analysis.potentialIssues.push('No package.json found - not a Node.js project');
      return;
    }

    try {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
      
      this.analysis.dependencies = packageJson.dependencies || {};
      this.analysis.devDependencies = packageJson.devDependencies || {};
      this.analysis.scripts = packageJson.scripts || {};
      this.analysis.projectName = packageJson.name;
      this.analysis.version = packageJson.version;

      // Detect package manager
      if (existsSync(join(this.projectPath, 'yarn.lock'))) {
        this.analysis.packageManager = 'yarn';
      } else if (existsSync(join(this.projectPath, 'pnpm-lock.yaml'))) {
        this.analysis.packageManager = 'pnpm';
      } else if (existsSync(join(this.projectPath, 'package-lock.json'))) {
        this.analysis.packageManager = 'npm';
      }

      // Analyze dependencies
      await this.analyzeDependencies();
      
    } catch (error) {
      this.analysis.potentialIssues.push(`Invalid package.json: ${error.message}`);
    }
  }

  /**
   * Analyze project dependencies to determine stack
   */
  async analyzeDependencies() {
    const allDeps = { ...this.analysis.dependencies, ...this.analysis.devDependencies };

    // Detect frameworks
    if (allDeps.vue) {
      this.analysis.framework = 'vue';
      if (allDeps.vue.startsWith('^3') || allDeps.vue.startsWith('3')) {
        this.analysis.frameworkVersion = '3';
      } else if (allDeps.vue.startsWith('^2') || allDeps.vue.startsWith('2')) {
        this.analysis.frameworkVersion = '2';
      }
    } else if (allDeps.react) {
      this.analysis.framework = 'react';
      this.analysis.frameworkVersion = allDeps.react;
    } else if (allDeps.angular || allDeps['@angular/core']) {
      this.analysis.framework = 'angular';
    } else if (allDeps.svelte) {
      this.analysis.framework = 'svelte';
    }

    // Detect UI libraries
    if (allDeps.vuetify) {
      this.analysis.uiLibrary = 'vuetify';
      this.analysis.uiLibraryVersion = allDeps.vuetify;
    } else if (allDeps.quasar) {
      this.analysis.uiLibrary = 'quasar';
    } else if (allDeps['element-plus']) {
      this.analysis.uiLibrary = 'element-plus';
    } else if (allDeps['ant-design-vue']) {
      this.analysis.uiLibrary = 'ant-design-vue';
    } else if (allDeps['@mui/material']) {
      this.analysis.uiLibrary = 'material-ui';
    }

    // Detect state management
    if (allDeps.pinia) {
      this.analysis.stateManagement = 'pinia';
    } else if (allDeps.vuex) {
      this.analysis.stateManagement = 'vuex';
    } else if (allDeps.redux) {
      this.analysis.stateManagement = 'redux';
    } else if (allDeps.zustand) {
      this.analysis.stateManagement = 'zustand';
    }

    // Detect backend/database services
    if (allDeps['@supabase/supabase-js']) {
      this.analysis.backend = 'supabase';
      this.analysis.database = 'supabase';
    } else if (allDeps.firebase) {
      this.analysis.backend = 'firebase';
      this.analysis.database = 'firebase';
    } else if (allDeps.prisma) {
      this.analysis.database = 'prisma';
    } else if (allDeps.mongoose) {
      this.analysis.database = 'mongodb';
    }

    // Detect build tools
    if (allDeps.vite || allDeps['@vitejs/plugin-vue']) {
      this.analysis.buildTool = 'vite';
    } else if (allDeps.webpack) {
      this.analysis.buildTool = 'webpack';
    } else if (allDeps.rollup) {
      this.analysis.buildTool = 'rollup';
    } else if (allDeps['vue-cli-service']) {
      this.analysis.buildTool = 'vue-cli';
    } else if (allDeps['@angular/cli']) {
      this.analysis.buildTool = 'angular-cli';
    } else if (allDeps['create-react-app']) {
      this.analysis.buildTool = 'create-react-app';
    }

    // Detect testing frameworks
    if (allDeps.jest) {
      this.analysis.testFramework = 'jest';
    } else if (allDeps.vitest) {
      this.analysis.testFramework = 'vitest';
    } else if (allDeps.cypress) {
      this.analysis.e2eFramework = 'cypress';
    } else if (allDeps.playwright) {
      this.analysis.e2eFramework = 'playwright';
    }
  }

  /**
   * Analyze file structure
   */
  async analyzeFileStructure() {
    this.analysis.hasGit = existsSync(join(this.projectPath, '.git'));
    this.analysis.hasNodeModules = existsSync(join(this.projectPath, 'node_modules'));

    // Collect important files
    const importantFiles = [
      'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
      'tsconfig.json', 'jsconfig.json',
      'vite.config.js', 'vite.config.ts',
      'vue.config.js', 'nuxt.config.js',
      'webpack.config.js', 'rollup.config.js',
      '.gitignore', '.env', '.env.example',
      'README.md', 'CHANGELOG.md',
      'tailwind.config.js', 'tailwind.config.ts',
      'eslint.config.js', '.eslintrc.js', '.eslintrc.json',
      'prettier.config.js', '.prettierrc',
      'jest.config.js', 'vitest.config.js'
    ];

    this.analysis.configFiles = importantFiles.filter(file => 
      existsSync(join(this.projectPath, file))
    );

    // Analyze source structure
    this.analyzeSourceStructure();
  }

  /**
   * Analyze source code structure
   */
  analyzeSourceStructure() {
    const commonDirs = ['src', 'components', 'pages', 'views', 'lib', 'utils', 'assets', 'styles'];
    
    for (const dir of commonDirs) {
      const dirPath = join(this.projectPath, dir);
      if (existsSync(dirPath)) {
        this.analysis.sourceStructure[dir] = this.getDirectoryInfo(dirPath);
      }
    }

    // Check for specific file patterns
    this.checkForSpecificPatterns();
  }

  /**
   * Get directory information
   */
  getDirectoryInfo(dirPath) {
    try {
      const files = readdirSync(dirPath);
      const info = {
        fileCount: 0,
        subdirs: [],
        fileTypes: new Set(),
        hasIndex: false
      };

      for (const file of files) {
        const filePath = join(dirPath, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
          info.subdirs.push(file);
        } else {
          info.fileCount++;
          info.fileTypes.add(extname(file));
          
          if (file.startsWith('index.')) {
            info.hasIndex = true;
          }
        }
      }

      return {
        ...info,
        fileTypes: Array.from(info.fileTypes)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Check for specific file patterns that indicate project characteristics
   */
  checkForSpecificPatterns() {
    // Check for Vue-specific patterns
    if (existsSync(join(this.projectPath, 'src/main.js')) || 
        existsSync(join(this.projectPath, 'src/main.ts'))) {
      this.analysis.hasMainFile = true;
    }

    // Check for Vue components
    if (this.analysis.sourceStructure.src || this.analysis.sourceStructure.components) {
      // This would require file scanning which is more complex
      // For now, we'll rely on package.json analysis
    }

    // Check for specific config patterns
    if (existsSync(join(this.projectPath, 'vue.config.js'))) {
      this.analysis.hasVueConfig = true;
    }

    if (existsSync(join(this.projectPath, 'vite.config.js')) || 
        existsSync(join(this.projectPath, 'vite.config.ts'))) {
      this.analysis.hasViteConfig = true;
    }
  }

  /**
   * Analyze source code content for migration hints
   */
  async analyzeSourceCode() {
    // This is a simplified version - in practice, you'd want to parse source files
    // to understand import patterns, API usage, etc.
    
    // Check main.js/main.ts for Vue app creation patterns
    const mainFiles = ['src/main.js', 'src/main.ts'];
    
    for (const mainFile of mainFiles) {
      const mainPath = join(this.projectPath, mainFile);
      if (existsSync(mainPath)) {
        try {
          const content = readFileSync(mainPath, 'utf-8');
          
          if (content.includes('createApp')) {
            this.analysis.vueAppPattern = 'composition-api';
          } else if (content.includes('new Vue')) {
            this.analysis.vueAppPattern = 'options-api';
          }

          if (content.includes('createPinia')) {
            this.analysis.usesPinia = true;
          }

          if (content.includes('createVuetify')) {
            this.analysis.usesVuetify = true;
          }

        } catch (error) {
          this.analysis.potentialIssues.push(`Could not read ${mainFile}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Analyze build configuration
   */
  async analyzeBuildConfiguration() {
    // Check for Vite config
    if (this.analysis.hasViteConfig) {
      this.analysis.buildSystem = 'vite';
    } else if (this.analysis.hasVueConfig) {
      this.analysis.buildSystem = 'vue-cli';
    } else if (existsSync(join(this.projectPath, 'webpack.config.js'))) {
      this.analysis.buildSystem = 'webpack';
    }

    // Check for TypeScript
    if (existsSync(join(this.projectPath, 'tsconfig.json'))) {
      this.analysis.usesTypeScript = true;
    }

    // Check for CSS frameworks
    if (existsSync(join(this.projectPath, 'tailwind.config.js')) || 
        existsSync(join(this.projectPath, 'tailwind.config.ts'))) {
      this.analysis.cssFramework = 'tailwind';
    }
  }

  /**
   * Determine overall project type
   */
  async determineProjectType() {
    if (this.analysis.framework === 'vue') {
      if (this.analysis.uiLibrary === 'vuetify') {
        this.analysis.projectType = 'vue-vuetify';
      } else if (this.analysis.cssFramework === 'tailwind') {
        this.analysis.projectType = 'vue-tailwind';
      } else {
        this.analysis.projectType = 'vue-basic';
      }
    } else if (this.analysis.framework === 'react') {
      this.analysis.projectType = 'react';
    } else if (this.analysis.framework === 'angular') {
      this.analysis.projectType = 'angular';
    } else {
      this.analysis.projectType = 'unknown';
    }

    // Add backend suffix if detected
    if (this.analysis.backend) {
      this.analysis.projectType += `-${this.analysis.backend}`;
    }
  }

  /**
   * Assess migration complexity
   */
  async assessMigrationComplexity() {
    let complexityScore = 0;
    const factors = [];

    // Framework factors
    if (this.analysis.framework === 'vue' && this.analysis.frameworkVersion === '3') {
      complexityScore += 1; // Vue 3 is easier to migrate
      factors.push('Vue 3 (low complexity)');
    } else if (this.analysis.framework === 'vue' && this.analysis.frameworkVersion === '2') {
      complexityScore += 3; // Vue 2 needs more migration work
      factors.push('Vue 2 (medium complexity)');
    } else if (this.analysis.framework === 'react') {
      complexityScore += 5; // Different framework entirely
      factors.push('React framework (high complexity)');
    }

    // Build tool factors
    if (this.analysis.buildTool === 'vite') {
      complexityScore += 1; // Already using Vite
      factors.push('Vite build tool (low complexity)');
    } else if (this.analysis.buildTool === 'vue-cli') {
      complexityScore += 2; // Need to migrate from Vue CLI
      factors.push('Vue CLI (medium complexity)');
    } else if (this.analysis.buildTool === 'webpack') {
      complexityScore += 3; // Custom webpack config
      factors.push('Custom Webpack (medium complexity)');
    }

    // Dependency factors
    const depCount = Object.keys(this.analysis.dependencies).length;
    if (depCount > 20) {
      complexityScore += 2;
      factors.push('Many dependencies (medium complexity)');
    }

    // Custom configuration factors
    if (this.analysis.configFiles.length > 10) {
      complexityScore += 1;
      factors.push('Many config files (slight complexity)');
    }

    // TypeScript factor
    if (this.analysis.usesTypeScript) {
      complexityScore += 1;
      factors.push('TypeScript (slight complexity)');
    }

    // Determine complexity level
    if (complexityScore <= 3) {
      this.analysis.migrationComplexity = 'low';
    } else if (complexityScore <= 6) {
      this.analysis.migrationComplexity = 'medium';
    } else {
      this.analysis.migrationComplexity = 'high';
    }

    this.analysis.complexityFactors = factors;
    this.analysis.complexityScore = complexityScore;
  }

  /**
   * Generate module recommendations based on analysis
   */
  async generateRecommendations() {
    const recommendations = [];

    // Base framework
    if (this.analysis.framework === 'vue') {
      recommendations.push('vue-base');
    }

    // UI Library
    if (this.analysis.uiLibrary === 'vuetify') {
      recommendations.push('vuetify');
    } else if (this.analysis.cssFramework === 'tailwind') {
      recommendations.push('tailwind');
    }

    // State management
    if (this.analysis.stateManagement === 'pinia') {
      recommendations.push('pinia');
    } else if (this.analysis.stateManagement === 'vuex') {
      recommendations.push('pinia'); // Recommend migrating to Pinia
      this.analysis.potentialIssues.push('Consider migrating from Vuex to Pinia');
    }

    // Backend services
    if (this.analysis.backend === 'supabase') {
      recommendations.push('supabase');
    } else if (this.analysis.backend === 'firebase') {
      recommendations.push('firebase');
    }

    // Testing
    if (this.analysis.testFramework === 'jest') {
      recommendations.push('jest');
    } else if (this.analysis.testFramework === 'vitest') {
      recommendations.push('vitest');
    }

    this.analysis.recommendedModules = recommendations;

    // Generate migration strategy
    await this.generateMigrationStrategy();
  }

  /**
   * Generate migration strategy
   */
  async generateMigrationStrategy() {
    const strategy = {
      approach: 'incremental',
      phases: [],
      estimatedTime: 'unknown',
      risks: [],
      backupRequired: true
    };

    // Determine approach based on complexity
    if (this.analysis.migrationComplexity === 'low') {
      strategy.approach = 'direct';
      strategy.estimatedTime = '1-2 hours';
    } else if (this.analysis.migrationComplexity === 'medium') {
      strategy.approach = 'incremental';
      strategy.estimatedTime = '4-8 hours';
    } else {
      strategy.approach = 'careful';
      strategy.estimatedTime = '1-2 days';
      strategy.risks.push('High complexity migration requires careful planning');
    }

    // Define migration phases
    if (this.analysis.framework === 'vue') {
      strategy.phases = [
        'Backup current project',
        'Update package.json dependencies',
        'Migrate build configuration',
        'Update file structure',
        'Test and validate'
      ];
    } else {
      strategy.phases = [
        'Backup current project',
        'Framework migration analysis',
        'Create new project structure',
        'Migrate components and logic',
        'Test and validate'
      ];
      strategy.risks.push('Cross-framework migration is complex');
    }

    this.analysis.migrationStrategy = strategy;
  }

  /**
   * Get analysis summary
   */
  getSummary() {
    if (!this.analysis) {
      throw new Error('Analysis not completed. Run analyze() first.');
    }

    return {
      projectType: this.analysis.projectType,
      framework: this.analysis.framework,
      migrationComplexity: this.analysis.migrationComplexity,
      recommendedModules: this.analysis.recommendedModules,
      estimatedTime: this.analysis.migrationStrategy?.estimatedTime,
      potentialIssues: this.analysis.potentialIssues
    };
  }

  /**
   * Display analysis results
   */
  displayResults() {
    if (!this.analysis) {
      throw new Error('Analysis not completed. Run analyze() first.');
    }

    console.log(chalk.cyan('\n📊 Project Analysis Results\n'));
    
    console.log(chalk.blue('Project Information:'));
    console.log(`  Name: ${this.analysis.projectName || 'Unknown'}`);
    console.log(`  Type: ${this.analysis.projectType || 'Unknown'}`);
    console.log(`  Framework: ${this.analysis.framework || 'Unknown'} ${this.analysis.frameworkVersion || ''}`);
    
    if (this.analysis.uiLibrary) {
      console.log(`  UI Library: ${this.analysis.uiLibrary}`);
    }
    
    if (this.analysis.backend) {
      console.log(`  Backend: ${this.analysis.backend}`);
    }

    console.log(chalk.blue('\nMigration Assessment:'));
    console.log(`  Complexity: ${this.getComplexityColor(this.analysis.migrationComplexity)}`);
    console.log(`  Estimated Time: ${this.analysis.migrationStrategy?.estimatedTime || 'Unknown'}`);
    
    if (this.analysis.complexityFactors?.length > 0) {
      console.log('\n  Complexity Factors:');
      this.analysis.complexityFactors.forEach(factor => {
        console.log(`    • ${factor}`);
      });
    }

    if (this.analysis.recommendedModules?.length > 0) {
      console.log(chalk.blue('\nRecommended Modules:'));
      this.analysis.recommendedModules.forEach(module => {
        console.log(`  ✓ ${module}`);
      });
    }

    if (this.analysis.potentialIssues?.length > 0) {
      console.log(chalk.yellow('\n⚠️  Potential Issues:'));
      this.analysis.potentialIssues.forEach(issue => {
        console.log(`    • ${issue}`);
      });
    }

    if (this.analysis.migrationStrategy?.risks?.length > 0) {
      console.log(chalk.red('\n🚨 Migration Risks:'));
      this.analysis.migrationStrategy.risks.forEach(risk => {
        console.log(`    • ${risk}`);
      });
    }
  }

  /**
   * Get color for complexity level
   */
  getComplexityColor(complexity) {
    switch (complexity) {
      case 'low':
        return chalk.green('Low');
      case 'medium':
        return chalk.yellow('Medium');
      case 'high':
        return chalk.red('High');
      default:
        return chalk.gray('Unknown');
    }
  }
}