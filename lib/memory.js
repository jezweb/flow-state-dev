import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { MemoryScanner } from './memory-scanner.js';
import { MemoryValidator, formatValidationResults } from './memory-validator.js';
import { templateManager } from './memory-templates.js';
import { enhancedSetup } from './memory-enhanced.js';
import { environmentDetector } from './environment-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get user's home directory
const homeDir = os.homedir();
const claudeDir = path.join(homeDir, '.claude');
const userMemoryPath = path.join(claudeDir, 'CLAUDE.md');

/**
 * Check if user memory file exists
 */
export function memoryExists() {
  return fs.existsSync(userMemoryPath);
}

/**
 * Read user memory file
 */
export async function readMemory() {
  if (!memoryExists()) {
    return null;
  }
  return await fs.readFile(userMemoryPath, 'utf-8');
}

/**
 * Write user memory file
 */
export async function writeMemory(content) {
  // Ensure .claude directory exists
  await fs.ensureDir(claudeDir);
  await fs.writeFile(userMemoryPath, content);
}

/**
 * Initialize memory file
 */
export async function initMemory(options = {}) {
  // Check if memory already exists
  if (memoryExists() && !options.force) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Memory file already exists at ${userMemoryPath}. Overwrite?`,
        default: false
      }
    ]);
    
    if (!overwrite) {
      console.log(chalk.yellow('⚠️  Memory initialization cancelled.'));
      return false;
    }
  }

  console.log(chalk.blue('\n🧠 Let\'s set up your Claude Code memory file'));
  console.log(chalk.gray('This will take less than a minute!\n'));

  // Run environment detection unless explicitly disabled
  let detectionResults = null;
  if (!options.skipDetection) {
    const { useDetection } = await inquirer.prompt([{
      type: 'confirm',
      name: 'useDetection',
      message: 'Would you like me to auto-detect your development environment?',
      default: true
    }]);
    
    if (useDetection) {
      detectionResults = await environmentDetector.detect({ silent: false });
      
      // Show detection results
      console.log(chalk.green('\n✅ Detected:\n'));
      console.log(environmentDetector.formatResults(detectionResults));
      
      const { confirmDetection } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirmDetection',
        message: '\nUse these detected values?',
        default: true
      }]);
      
      if (!confirmDetection) {
        detectionResults = null;
      }
    }
  }

  let setupMode = 'quick';
  
  // If minimal flag is set, skip the setup mode question
  if (options.minimal) {
    setupMode = 'minimal';
  } else if (options.enhanced) {
    setupMode = 'enhanced';
  } else {
    // Choose setup mode
    const modeAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'setupMode',
        message: 'Choose setup mode:',
        choices: [
          { name: '⚡ Quick Setup (recommended) - 4 questions', value: 'quick' },
          { name: '🎯 Enhanced Setup - Comprehensive configuration', value: 'enhanced' },
          { name: '📄 Start from Template - Pre-built personas', value: 'template' },
          { name: '🚀 Minimal - Just use defaults', value: 'minimal' }
        ],
        default: 'quick'
      }
    ]);
    setupMode = modeAnswer.setupMode;
  }

  let answers = {};
  let memoryContent = '';
  
  if (setupMode === 'minimal') {
    // Use all defaults, with detection if available
    const detectedStack = detectionResults ? 
      environmentDetector.getSuggestedTechStack(detectionResults) : 
      ['vue3', 'vuetify', 'supabase'];
      
    answers = {
      name: detectionResults?.git?.user?.name || os.userInfo().username,
      role: '',
      techStack: detectedStack.length > 0 ? detectedStack : ['vue3', 'vuetify', 'supabase'],
      workStyle: 'prototype'
    };
    console.log(chalk.blue('\n📝 Using minimal defaults...'));
  } else if (setupMode === 'enhanced') {
    // Enhanced setup mode with detection results
    const enhancedOptions = { ...options, detectionResults };
    const content = await enhancedSetup.run(enhancedOptions);
    if (!content) {
      // User cancelled or saved for later
      return false;
    }
    
    // Write the file directly as enhanced setup handles preview/confirmation
    await writeMemory(content);
    console.log(chalk.green(`\n✅ Memory file created at: ${userMemoryPath}`));
    console.log(chalk.gray('\nYou can update it anytime with: fsd memory edit'));
    return true;
  } else if (setupMode === 'template') {
    // Template-based setup
    const { content, template } = await templateManager.selectTemplate();
    
    // Prepare variables from detection
    const detectedVars = detectionResults ? {
      name: detectionResults.git?.user?.name || detectionResults.system.username,
      os: `${detectionResults.system.os.name} ${detectionResults.system.os.version}`.trim(),
      shell: detectionResults.system.shell.name,
      nodeVersion: detectionResults.system.nodeVersion,
      editor: environmentDetector.formatEditorName(detectionResults.editor.primary) || 'VS Code',
      gitEmail: detectionResults.git?.user?.email || '',
      github: detectionResults.git?.user?.github || ''
    } : {};
    
    // Collect variables for the template
    const variables = await templateManager.collectVariables(content, detectedVars);
    memoryContent = templateManager.applyVariables(content, variables);
    
    // Show preview
    console.log(chalk.blue('\n📄 Preview of your memory file:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(memoryContent.split('\n').slice(0, 15).join('\n'));
    if (memoryContent.split('\n').length > 15) {
      console.log(chalk.gray('... (truncated)'));
    }
    console.log(chalk.gray('─'.repeat(50)));
    
    // Confirm before writing
    const { confirmWrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmWrite',
      message: 'Create this memory file?',
      default: true
    }]);
    
    if (!confirmWrite) {
      console.log(chalk.yellow('\n⚠️  Memory file creation cancelled.'));
      return false;
    }
    
    await writeMemory(memoryContent);
    console.log(chalk.green(`\n✅ Memory file created from template: ${template?.name || 'custom'}`));
    console.log(chalk.gray('\nYou can update it anytime with: fsd memory edit'));
    return true;
  } else {
    // Quick setup - essential questions only
    const detectedStack = detectionResults ? 
      environmentDetector.getSuggestedTechStack(detectionResults) : [];
    
    answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What\'s your name?',
        default: detectionResults?.git?.user?.name || os.userInfo().username,
        validate: (input) => input.trim() ? true : 'Name is required'
      },
      {
        type: 'checkbox',
        name: 'techStack',
        message: 'Select your primary tech stack (space to select, enter to continue):',
        choices: [
          new inquirer.Separator('─── Frontend ───'),
          { name: 'Vue 3', value: 'vue3', checked: detectedStack.includes('vue3') || !detectionResults },
          { name: 'React', value: 'react', checked: detectedStack.includes('react') },
          { name: 'Vuetify', value: 'vuetify', checked: detectedStack.includes('vuetify') || !detectionResults },
          { name: 'Tailwind CSS', value: 'tailwind', checked: detectedStack.includes('tailwind') },
          new inquirer.Separator('─── Backend ───'),
          { name: 'Node.js', value: 'nodejs' },
          { name: 'Supabase', value: 'supabase', checked: detectedStack.includes('supabase') || !detectionResults },
          { name: 'PostgreSQL', value: 'postgresql', checked: detectedStack.includes('postgresql') },
          { name: 'Python', value: 'python' },
          new inquirer.Separator('─── Other ───'),
          { name: 'TypeScript', value: 'typescript', checked: detectedStack.includes('typescript') },
          { name: 'Docker', value: 'docker', checked: detectedStack.includes('docker') }
        ],
        validate: (input) => input.length > 0 ? true : 'Please select at least one technology'
      },
      {
        type: 'list',
        name: 'workStyle',
        message: 'Primary work approach:',
        choices: [
          { name: '⚡ Rapid Prototyping', value: 'prototype' },
          { name: '🏗️  Production Ready', value: 'production' },
          { name: '📚 Learning Focus', value: 'learning' },
          { name: '⚖️  Balanced', value: 'balanced' }
        ],
        default: 'prototype'
      }
    ]);
    
    // Optional role question
    const { includeRole } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'includeRole',
        message: 'Add role/title? (optional)',
        default: false
      }
    ]);
    
    if (includeRole) {
      const { role } = await inquirer.prompt([
        {
          type: 'input',
          name: 'role',
          message: 'Your role/title:',
          default: ''
        }
      ]);
      answers.role = role;
    } else {
      answers.role = '';
    }
  }

  // Use detection results if available, otherwise use basic auto-detect
  const detectedEnv = detectionResults ? {
    os: `${detectionResults.system.os.name} ${detectionResults.system.os.version}`.trim(),
    display: detectionResults.system.display || '4K',
    projectPath: path.join(os.homedir(), 'projects'),
    nodeVersion: detectionResults.system.nodeVersion,
    shell: detectionResults.system.shell.name,
    editor: environmentDetector.formatEditorName(detectionResults.editor.primary) || 'VS Code',
    gitUser: detectionResults.git?.user?.name,
    gitEmail: detectionResults.git?.user?.email,
    github: detectionResults.git?.user?.github
  } : await autoDetectEnvironment();
  
  // Generate memory content if not already set (from template mode)
  if (!memoryContent) {
    memoryContent = generateMemoryContent({
      ...answers,
      ...detectedEnv
    });
  }

  // Show preview before writing
  console.log(chalk.blue('\n📄 Preview of your memory file:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(memoryContent.split('\n').slice(0, 15).join('\n'));
  if (memoryContent.split('\n').length > 15) {
    console.log(chalk.gray('... (truncated)'));
  }
  console.log(chalk.gray('─'.repeat(50)));
  
  // Confirm before writing
  const { confirmWrite } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmWrite',
      message: 'Create this memory file?',
      default: true
    }
  ]);
  
  if (!confirmWrite) {
    console.log(chalk.yellow('\n⚠️  Memory file creation cancelled.'));
    return false;
  }
  
  // Write the file
  await writeMemory(memoryContent);
  
  console.log(chalk.green(`\n✅ Memory file created at: ${userMemoryPath}`));
  console.log(chalk.gray('\nYou can update it anytime with: fsd memory edit'));
  
  return true;
}

/**
 * Auto-detect environment settings
 */
async function autoDetectEnvironment() {
  const platform = process.platform;
  const userInfo = os.userInfo();
  
  // Detect OS with version if possible
  let osName = platform === 'darwin' ? 'macOS' : 
               platform === 'win32' ? 'Windows' : 
               'Linux';
  
  // Try to get more specific OS info
  try {
    if (platform === 'linux') {
      // Try to detect Linux distribution
      if (fs.existsSync('/etc/os-release')) {
        const osRelease = await fs.readFile('/etc/os-release', 'utf-8');
        const match = osRelease.match(/PRETTY_NAME="(.+)"/);
        if (match) {
          osName = match[1];
        }
      }
    } else if (platform === 'darwin') {
      // Get macOS version
      try {
        const { execSync } = await import('child_process');
        const version = execSync('sw_vers -productVersion', { encoding: 'utf-8' }).trim();
        osName = `macOS ${version}`;
      } catch (e) {
        // Fallback to just macOS
      }
    }
  } catch (e) {
    // Use default OS name
  }
  
  // Detect project paths
  const homePath = userInfo.homedir;
  const projectPath = fs.existsSync(path.join(homePath, 'claude')) 
    ? path.join(homePath, 'claude')
    : homePath;
  
  // Detect shell
  let shell = process.env.SHELL || 'unknown';
  if (shell.includes('/')) {
    shell = path.basename(shell);
  }
  
  // Detect Node.js version
  const nodeVersion = process.version;
  
  return {
    os: osName,
    projectPath,
    username: userInfo.username,
    shell,
    nodeVersion
  };
}

/**
 * Generate memory file content from answers
 */
function generateMemoryContent(data) {
  const { name, role, techStack, workStyle, os, projectPath, username, shell, nodeVersion } = data;
  
  let content = `# User Memory for ${name}\n\n`;
  
  // Personal Information
  content += `## Personal Information\n`;
  content += `- **Name**: ${name}\n`;
  if (role) {
    content += `- **Role**: ${role}\n`;
  }
  content += `\n`;
  
  // Development Environment
  content += `## Development Environment\n`;
  content += `- **OS**: ${os}\n`;
  if (shell && shell !== 'unknown') {
    content += `- **Shell**: ${shell}\n`;
  }
  content += `- **Project Location**: \`${projectPath}/\`\n`;
  if (nodeVersion) {
    content += `- **Node.js**: ${nodeVersion}\n`;
  }
  content += `\n`;
  
  // Tech Stack
  if (techStack.length > 0) {
    content += `## Tech Stack Preferences\n`;
    
    const frontendTech = techStack.filter(t => ['vue3', 'react', 'vuetify', 'tailwind'].includes(t));
    const backendTech = techStack.filter(t => ['nodejs', 'python', 'supabase', 'postgresql', 'docker'].includes(t));
    const generalTech = techStack.filter(t => ['typescript'].includes(t));
    
    if (frontendTech.length > 0) {
      content += `### Frontend\n`;
      frontendTech.forEach(tech => {
        const techNames = {
          'vue3': 'Vue 3',
          'react': 'React',
          'vuetify': 'Vuetify 3',
          'tailwind': 'Tailwind CSS'
        };
        content += `- ${techNames[tech] || tech}\n`;
      });
      content += `\n`;
    }
    
    if (backendTech.length > 0) {
      content += `### Backend & Services\n`;
      backendTech.forEach(tech => {
        const techNames = {
          'nodejs': 'Node.js',
          'python': 'Python',
          'supabase': 'Supabase',
          'postgresql': 'PostgreSQL',
          'docker': 'Docker'
        };
        content += `- ${techNames[tech] || tech}\n`;
      });
      content += `\n`;
    }
    
    if (generalTech.length > 0) {
      content += `### General\n`;
      generalTech.forEach(tech => {
        const techNames = {
          'typescript': 'TypeScript'
        };
        content += `- ${techNames[tech] || tech}\n`;
      });
      content += `\n`;
    }
  }
  
  // Work Style
  content += `## Work Style & Preferences\n`;
  const workStyleDescriptions = {
    'prototype': '- **Approach**: Rapid prototyping - build fast, iterate quickly\n- **Focus**: Getting things working quickly\n',
    'production': '- **Approach**: Production-ready code with proper testing\n- **Focus**: Scalability, maintainability, best practices\n',
    'learning': '- **Approach**: Learning-focused with detailed explanations\n- **Focus**: Understanding concepts and best practices\n',
    'balanced': '- **Approach**: Balanced mix of speed and quality\n- **Focus**: Practical solutions with good practices\n'
  };
  content += workStyleDescriptions[workStyle] || '';
  content += `\n`;
  
  // Claude Interaction Preferences
  content += `## Claude Interaction Preferences\n`;
  content += `- **Style**: Clear, concise responses\n`;
  content += `- **Code**: Working examples with minimal boilerplate\n`;
  content += `- **Explanations**: Brief unless asked for details\n`;
  content += `\n`;
  
  // Project Approach
  content += `## Project Approach\n`;
  content += `- Prefer simple, working solutions\n`;
  content += `- Avoid over-engineering\n`;
  content += `- Clear file organization\n`;
  
  return content;
}

/**
 * Show memory file content
 */
export async function showMemory() {
  const content = await readMemory();
  
  if (!content) {
    console.log(chalk.yellow('⚠️  No memory file found.'));
    console.log(chalk.gray(`Expected location: ${userMemoryPath}`));
    console.log(chalk.gray('\nRun "fsd memory init" to create one.'));
    return;
  }
  
  console.log(chalk.blue('\n📄 Current memory file:\n'));
  console.log(chalk.gray(`Location: ${userMemoryPath}\n`));
  console.log(content);
}

/**
 * Validate memory file
 * @param {string} filePath - Path to memory file  
 * @param {Object} options - Validation options
 */
export async function validateMemory(filePath, options = {}) {
  // Use provided path or default user memory path
  const targetPath = filePath || userMemoryPath;
  
  // Check if file exists
  if (!await fs.pathExists(targetPath)) {
    console.log(chalk.red(`❌ Memory file not found: ${targetPath}`));
    return { valid: false, summary: { errors: 1, warnings: 0, suggestions: 0 } };
  }
  
  const validator = new MemoryValidator(options);
  const results = await validator.validate(targetPath);
  
  console.log(formatValidationResults(results, targetPath));
  
  if (options.fix && !results.valid) {
    const { confirmFix } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmFix',
        message: 'Would you like to auto-fix the issues?',
        default: true
      }
    ]);
    
    if (confirmFix) {
      console.log(chalk.blue('\n🔧 Fixing issues...'));
      const fixed = await validator.fix(targetPath);
      
      // Backup original file
      const backupPath = targetPath + '.backup';
      await fs.copy(targetPath, backupPath);
      console.log(chalk.gray(`Backup saved to: ${backupPath}`));
      
      // Write fixed content
      await fs.writeFile(targetPath, fixed);
      console.log(chalk.green('✅ Issues fixed!'));
      
      // Re-validate
      console.log(chalk.blue('\n📋 Re-validating...\n'));
      const newResults = await validator.validate(targetPath);
      console.log(formatValidationResults(newResults, targetPath));
      
      return newResults;
    }
  }
  
  return results;
}

/**
 * Edit memory file
 */
export async function editMemory() {
  if (!memoryExists()) {
    console.log(chalk.yellow('⚠️  No memory file found.'));
    const { create } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'create',
        message: 'Would you like to create one now?',
        default: true
      }
    ]);
    
    if (create) {
      await initMemory();
    }
    return;
  }
  
  // Try to open in default editor
  const editor = process.env.EDITOR || 'nano';
  console.log(chalk.blue(`\n📝 Opening memory file in ${editor}...\n`));
  console.log(chalk.gray(`File: ${userMemoryPath}`));
  
  try {
    const { spawn } = await import('child_process');
    const child = spawn(editor, [userMemoryPath], { stdio: 'inherit' });
    
    child.on('exit', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✅ Memory file updated!'));
      } else {
        console.log(chalk.yellow('\n⚠️  Editor closed with errors.'));
      }
    });
  } catch (error) {
    console.log(chalk.red('❌ Could not open editor.'));
    console.log(chalk.gray(`Please edit the file manually: ${userMemoryPath}`));
  }
}

/**
 * Import memory from another file
 */
export async function importMemory(sourcePath) {
  // If no source path provided, scan for memory files
  if (!sourcePath) {
    console.log(chalk.blue('\n🔍 Scanning for existing memory files...\n'));
    
    const foundFiles = await findMemoryFiles();
    
    if (foundFiles.length === 0) {
      console.log(chalk.yellow('⚠️  No memory files found in common locations.'));
      console.log(chalk.gray('\nChecked locations:'));
      console.log(chalk.gray('  • Current directory (./CLAUDE.md)'));
      console.log(chalk.gray('  • Home directory (~/CLAUDE.md)'));
      console.log(chalk.gray('  • Claude projects (~/claude/*/CLAUDE.md)'));
      console.log(chalk.gray('  • Recent git repositories'));
      console.log(chalk.gray('\nYou can specify a file path directly:'));
      console.log(chalk.gray('  fsd memory import /path/to/CLAUDE.md'));
      return;
    }
    
    // Let user select from found files
    const { selectedFile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFile',
        message: 'Select a memory file to import:',
        choices: [
          ...foundFiles.map(f => ({
            name: `${path.basename(f.path)} - ${f.type}`,
            value: f.path,
            short: f.path
          })),
          new inquirer.Separator(),
          { name: 'Cancel', value: null }
        ]
      }
    ]);
    
    if (!selectedFile) {
      console.log(chalk.yellow('⚠️  Import cancelled.'));
      return;
    }
    
    sourcePath = selectedFile;
  }
  
  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.log(chalk.red(`❌ File not found: ${sourcePath}`));
    return;
  }
  
  // Read and preview source file
  console.log(chalk.blue(`\n📄 Preview of ${path.basename(sourcePath)}:`));
  console.log(chalk.gray('─'.repeat(60)));
  
  const sourceContent = await fs.readFile(sourcePath, 'utf-8');
  const previewLines = sourceContent.split('\n').slice(0, 12);
  console.log(previewLines.join('\n'));
  if (sourceContent.split('\n').length > 12) {
    console.log(chalk.gray(`... (${sourceContent.split('\n').length - 12} more lines)`));
  }
  console.log(chalk.gray('─'.repeat(60)));
  
  // Confirm import
  const { confirmImport } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmImport',
      message: 'Import this memory file?',
      default: true
    }
  ]);
  
  if (!confirmImport) {
    console.log(chalk.yellow('⚠️  Import cancelled.'));
    return;
  }
  
  // Check if user memory already exists
  if (memoryExists()) {
    const currentContent = await readMemory();
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'User memory already exists. How would you like to proceed?',
        choices: [
          { name: '🔄 Replace completely (overwrite existing)', value: 'replace' },
          { name: '🧩 Selective import (choose sections)', value: 'selective' },
          { name: '📋 View differences first', value: 'diff' },
          { name: '❌ Cancel', value: 'cancel' }
        ]
      }
    ]);
    
    if (action === 'cancel') {
      console.log(chalk.yellow('⚠️  Import cancelled.'));
      return;
    }
    
    if (action === 'diff') {
      await showMemoryDiff(currentContent, sourceContent);
      
      // Ask again after showing diff
      const { finalAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'finalAction',
          message: 'How would you like to proceed?',
          choices: [
            { name: '🔄 Replace completely', value: 'replace' },
            { name: '🧩 Selective import', value: 'selective' },
            { name: '❌ Cancel', value: 'cancel' }
          ]
        }
      ]);
      
      if (finalAction === 'cancel') {
        console.log(chalk.yellow('⚠️  Import cancelled.'));
        return;
      }
      
      if (finalAction === 'selective') {
        await selectiveImport(currentContent, sourceContent);
        return;
      }
    } else if (action === 'selective') {
      await selectiveImport(currentContent, sourceContent);
      return;
    }
  }
  
  // Full replace
  await writeMemory(sourceContent);
  
  console.log(chalk.green(`\n✅ Memory imported from: ${sourcePath}`));
  console.log(chalk.green(`✅ Written to: ${userMemoryPath}`));
  console.log(chalk.gray('\nRun "fsd memory show" to view the imported content.'));
}

/**
 * Show diff between current and source memory files
 */
async function showMemoryDiff(currentContent, sourceContent) {
  console.log(chalk.blue('\n📊 Comparing memory files:\n'));
  
  const currentSections = parseMemorySections(currentContent);
  const sourceSections = parseMemorySections(sourceContent);
  
  // Show sections comparison
  console.log(chalk.white('Sections comparison:'));
  console.log(chalk.gray('─'.repeat(40)));
  
  const allSections = new Set([...Object.keys(currentSections), ...Object.keys(sourceSections)]);
  
  for (const section of allSections) {
    const inCurrent = section in currentSections;
    const inSource = section in sourceSections;
    
    if (inCurrent && inSource) {
      const same = currentSections[section].trim() === sourceSections[section].trim();
      if (same) {
        console.log(chalk.gray(`  ✓ ${section} (unchanged)`));
      } else {
        console.log(chalk.yellow(`  ~ ${section} (modified)`));
      }
    } else if (inSource) {
      console.log(chalk.green(`  + ${section} (new)`));
    } else {
      console.log(chalk.red(`  - ${section} (will be removed)`));
    }
  }
  
  console.log(chalk.gray('─'.repeat(40)));
}

/**
 * Selective import of memory sections
 */
async function selectiveImport(currentContent, sourceContent) {
  console.log(chalk.blue('\n🧩 Selective Import\n'));
  
  const currentSections = parseMemorySections(currentContent);
  const sourceSections = parseMemorySections(sourceContent);
  
  // Create choices for sections to import
  const choices = [];
  
  for (const [sectionName, sectionContent] of Object.entries(sourceSections)) {
    const isNew = !(sectionName in currentSections);
    const isModified = sectionName in currentSections && 
                      currentSections[sectionName].trim() !== sectionContent.trim();
    
    let description = '';
    if (isNew) {
      description = ' (new section)';
    } else if (isModified) {
      description = ' (will replace existing)';
    } else {
      description = ' (unchanged)';
    }
    
    choices.push({
      name: `${sectionName}${description}`,
      value: sectionName,
      checked: isNew || isModified
    });
  }
  
  if (choices.length === 0) {
    console.log(chalk.yellow('⚠️  No sections found in source file.'));
    return;
  }
  
  const { selectedSections } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedSections',
      message: 'Select sections to import:',
      choices
    }
  ]);
  
  if (selectedSections.length === 0) {
    console.log(chalk.yellow('⚠️  No sections selected for import.'));
    return;
  }
  
  // Build merged content
  const mergedSections = { ...currentSections };
  
  // Import selected sections
  for (const sectionName of selectedSections) {
    mergedSections[sectionName] = sourceSections[sectionName];
  }
  
  // Reconstruct the file
  const mergedContent = reconstructMemoryFile(mergedSections);
  
  // Preview the result
  console.log(chalk.blue('\n📄 Preview of merged file:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(mergedContent.split('\n').slice(0, 15).join('\n'));
  if (mergedContent.split('\n').length > 15) {
    console.log(chalk.gray('... (truncated)'));
  }
  console.log(chalk.gray('─'.repeat(50)));
  
  const { confirmMerge } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmMerge',
      message: 'Apply this selective import?',
      default: true
    }
  ]);
  
  if (confirmMerge) {
    await writeMemory(mergedContent);
    console.log(chalk.green(`\n✅ Successfully imported ${selectedSections.length} sections`));
    console.log(chalk.green(`✅ Updated: ${userMemoryPath}`));
  } else {
    console.log(chalk.yellow('⚠️  Selective import cancelled.'));
  }
}

/**
 * Parse memory file into sections
 */
function parseMemorySections(content) {
  const sections = {};
  const lines = content.split('\n');
  let currentSection = null;
  let currentContent = [];
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      // Save previous section
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      
      // Start new section
      currentSection = line.substring(3).trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  
  // Save last section
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  
  return sections;
}

/**
 * Reconstruct memory file from sections
 */
function reconstructMemoryFile(sections) {
  let content = '';
  
  // Try to preserve header
  if ('Personal Information' in sections) {
    const name = sections['Personal Information'].match(/- \*\*Name\*\*: (.+)/)?.[1] || 'User';
    content = `# User Memory for ${name}\n\n`;
  } else {
    content = `# User Memory\n\n`;
  }
  
  // Add sections in a logical order
  const sectionOrder = [
    'Personal Information',
    'Development Environment',
    'Tech Stack Preferences',
    'Work Style & Preferences',
    'Claude Interaction Preferences',
    'Project Approach'
  ];
  
  // Add ordered sections first
  for (const sectionName of sectionOrder) {
    if (sectionName in sections) {
      content += `## ${sectionName}\n${sections[sectionName]}\n\n`;
    }
  }
  
  // Add any remaining sections
  for (const [sectionName, sectionContent] of Object.entries(sections)) {
    if (!sectionOrder.includes(sectionName)) {
      content += `## ${sectionName}\n${sectionContent}\n\n`;
    }
  }
  
  return content.trim();
}

/**
 * Find memory files in common locations
 */
async function findMemoryFiles() {
  const scanner = new MemoryScanner();
  const foundFiles = await scanner.scan();
  
  // Transform to expected format and filter out current user memory
  return foundFiles
    .filter(file => file.path !== userMemoryPath)
    .map(file => ({
      path: file.path,
      type: file.isProjectFile ? `Project: ${path.basename(path.dirname(file.path))}` : path.dirname(file.path),
      size: formatFileSize(file.size),
      modified: file.modified.toLocaleDateString()
    }));
}

/**
 * Find recent git repositories
 * @deprecated Use MemoryScanner instead
 */
async function findRecentGitRepos() {
  const repos = [];
  const homeDir = os.homedir();
  
  // Common development directories
  const devDirs = [
    path.join(homeDir, 'Developer'),
    path.join(homeDir, 'dev'),
    path.join(homeDir, 'code'),
    path.join(homeDir, 'projects'),
    path.join(homeDir, 'workspace')
  ];
  
  for (const devDir of devDirs) {
    if (fs.existsSync(devDir)) {
      try {
        const entries = await fs.readdir(devDir);
        for (const entry of entries.slice(0, 10)) { // Limit to 10 per directory
          const fullPath = path.join(devDir, entry);
          const gitPath = path.join(fullPath, '.git');
          if (fs.existsSync(gitPath)) {
            repos.push(fullPath);
          }
        }
      } catch (error) {
        // Ignore errors reading directories
      }
    }
  }
  
  return repos.slice(0, 20); // Limit total git repos to check
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}