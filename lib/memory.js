import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';

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

  let setupMode = 'quick';
  
  // If minimal flag is set, skip the setup mode question
  if (options.minimal) {
    setupMode = 'minimal';
  } else {
    // Quick or minimal setup?
    const modeAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'setupMode',
        message: 'Choose setup mode:',
        choices: [
          { name: '⚡ Quick Setup (recommended) - 4 questions', value: 'quick' },
          { name: '🚀 Minimal - Just use defaults', value: 'minimal' }
        ],
        default: 'quick'
      }
    ]);
    setupMode = modeAnswer.setupMode;
  }

  let answers = {};
  
  if (setupMode === 'minimal') {
    // Use all defaults
    answers = {
      name: os.userInfo().username,
      role: '',
      techStack: ['vue3', 'vuetify', 'supabase'], // Flow State Dev defaults
      workStyle: 'prototype'
    };
    console.log(chalk.blue('\n📝 Using minimal defaults...'));
  } else {
    // Quick setup - essential questions only
    answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What\'s your name?',
        default: os.userInfo().username,
        validate: (input) => input.trim() ? true : 'Name is required'
      },
      {
        type: 'checkbox',
        name: 'techStack',
        message: 'Select your primary tech stack (space to select, enter to continue):',
        choices: [
          new inquirer.Separator('─── Frontend ───'),
          { name: 'Vue 3', value: 'vue3', checked: true },
          { name: 'React', value: 'react' },
          { name: 'Vuetify', value: 'vuetify', checked: true },
          { name: 'Tailwind CSS', value: 'tailwind' },
          new inquirer.Separator('─── Backend ───'),
          { name: 'Node.js', value: 'nodejs' },
          { name: 'Supabase', value: 'supabase', checked: true },
          { name: 'PostgreSQL', value: 'postgresql' },
          { name: 'Python', value: 'python' },
          new inquirer.Separator('─── Other ───'),
          { name: 'TypeScript', value: 'typescript' },
          { name: 'Docker', value: 'docker' }
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

  // Auto-detect environment
  const detectedEnv = await autoDetectEnvironment();
  
  // Generate memory content
  const memoryContent = generateMemoryContent({
    ...answers,
    ...detectedEnv
  });

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
            name: `${f.path} (${f.type})`,
            value: f.path
          })),
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
  
  // Read source file
  const sourceContent = await fs.readFile(sourcePath, 'utf-8');
  
  // Check if user memory already exists
  if (memoryExists()) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'User memory already exists. What would you like to do?',
        choices: [
          { name: 'Replace existing memory', value: 'replace' },
          { name: 'Merge with existing memory', value: 'merge' },
          { name: 'Cancel', value: 'cancel' }
        ]
      }
    ]);
    
    if (action === 'cancel') {
      console.log(chalk.yellow('⚠️  Import cancelled.'));
      return;
    }
    
    if (action === 'merge') {
      // TODO: Implement merge functionality in a future iteration
      console.log(chalk.yellow('⚠️  Merge functionality coming soon. Using replace for now.'));
    }
  }
  
  // Write the imported content
  await writeMemory(sourceContent);
  
  console.log(chalk.green(`\n✅ Memory imported from: ${sourcePath}`));
  console.log(chalk.green(`✅ Written to: ${userMemoryPath}`));
}

/**
 * Find memory files in common locations
 */
async function findMemoryFiles() {
  const files = [];
  const homeDir = os.homedir();
  
  // Locations to check
  const locations = [
    { path: path.join(process.cwd(), 'CLAUDE.md'), type: 'Current directory' },
    { path: path.join(process.cwd(), '.claude', 'CLAUDE.md'), type: 'Current .claude' },
    { path: path.join(homeDir, 'CLAUDE.md'), type: 'Home directory' },
    { path: path.join(homeDir, '.claude', 'CLAUDE.md'), type: 'User memory' }
  ];
  
  // Check for claude projects directory
  const claudeProjectsDir = path.join(homeDir, 'claude');
  if (fs.existsSync(claudeProjectsDir)) {
    try {
      const projects = await fs.readdir(claudeProjectsDir);
      for (const project of projects) {
        const projectMemory = path.join(claudeProjectsDir, project, 'CLAUDE.md');
        if (fs.existsSync(projectMemory)) {
          locations.push({ 
            path: projectMemory, 
            type: `Project: ${project}` 
          });
        }
      }
    } catch (error) {
      // Ignore errors reading claude directory
    }
  }
  
  // Check each location
  for (const location of locations) {
    if (fs.existsSync(location.path)) {
      // Skip the current user memory file
      if (location.path !== userMemoryPath) {
        files.push(location);
      }
    }
  }
  
  return files;
}