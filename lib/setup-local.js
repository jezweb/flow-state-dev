/**
 * Local Supabase development setup utilities
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';

export class LocalSetupManager {
  constructor() {
    this.platform = os.platform();
    this.arch = os.arch();
    this.homeDir = os.homedir();
    this.results = {
      detected: {},
      installed: {},
      errors: []
    };
  }

  /**
   * Main setup flow
   */
  async setup() {
    console.log(chalk.blue('\n🚀 Local Supabase Development Setup\n'));
    
    // Detect current environment
    await this.detectEnvironment();
    
    // Check prerequisites
    const checks = await this.checkPrerequisites();
    
    // Show current status
    this.displayStatus(checks);
    
    // Determine what needs installation
    const needed = this.determineNeededInstallations(checks);
    
    if (needed.length === 0) {
      console.log(chalk.green('\n✅ All prerequisites are already installed!'));
      await this.verifySetup();
      return;
    }
    
    // Ask for confirmation
    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: `Would you like to install the missing components? (${needed.join(', ')})`,
      default: true
    }]);
    
    if (!proceed) {
      console.log(chalk.yellow('\n⚠️  Setup cancelled. You can run this again anytime.'));
      return;
    }
    
    // Install missing components
    await this.installMissingComponents(needed, checks);
    
    // Verify setup
    await this.verifySetup();
    
    // Initialize local Supabase if requested
    await this.offerSupabaseInit();
  }

  /**
   * Detect current environment
   */
  async detectEnvironment() {
    console.log(chalk.gray(`Platform: ${this.platform} (${this.arch})`));
    console.log(chalk.gray(`Home directory: ${this.homeDir}`));
    
    // Check if running in WSL
    if (this.platform === 'linux') {
      try {
        const wslCheck = fs.readFileSync('/proc/version', 'utf8');
        if (wslCheck.toLowerCase().includes('microsoft')) {
          this.isWSL = true;
          console.log(chalk.gray('Environment: WSL (Windows Subsystem for Linux)'));
        }
      } catch {}
    }
  }

  /**
   * Check for prerequisites
   */
  async checkPrerequisites() {
    console.log(chalk.blue('\n🔍 Checking prerequisites...\n'));
    
    const checks = {
      packageManager: await this.checkPackageManager(),
      docker: await this.checkDocker(),
      supabase: await this.checkSupabaseCLI(),
      node: await this.checkNode()
    };
    
    return checks;
  }

  /**
   * Check for package manager (Homebrew/Scoop)
   */
  async checkPackageManager() {
    if (this.platform === 'darwin' || this.platform === 'linux') {
      // Check for Homebrew
      try {
        const version = execSync('brew --version', { encoding: 'utf8' }).trim();
        return {
          installed: true,
          type: 'homebrew',
          version: version.split('\n')[0],
          command: 'brew'
        };
      } catch {
        return { installed: false, type: 'homebrew' };
      }
    } else if (this.platform === 'win32') {
      // Check for Scoop
      try {
        const version = execSync('scoop --version', { encoding: 'utf8' }).trim();
        return {
          installed: true,
          type: 'scoop',
          version,
          command: 'scoop'
        };
      } catch {
        // Also check for Chocolatey as alternative
        try {
          const chocoVersion = execSync('choco --version', { encoding: 'utf8' }).trim();
          return {
            installed: true,
            type: 'chocolatey',
            version: chocoVersion,
            command: 'choco'
          };
        } catch {
          return { installed: false, type: 'scoop' };
        }
      }
    }
    
    return { installed: false, type: 'unknown' };
  }

  /**
   * Check for Docker
   */
  async checkDocker() {
    const dockerOptions = [];
    
    // Check Docker Desktop
    try {
      const version = execSync('docker --version', { encoding: 'utf8' }).trim();
      const running = await this.isDockerRunning();
      dockerOptions.push({
        type: 'docker-desktop',
        installed: true,
        version,
        running,
        command: 'docker'
      });
    } catch {}
    
    // Check for alternatives on macOS
    if (this.platform === 'darwin') {
      // Check OrbStack
      try {
        execSync('orbctl version', { encoding: 'utf8' });
        dockerOptions.push({
          type: 'orbstack',
          installed: true,
          command: 'orbctl'
        });
      } catch {}
      
      // Check Colima
      try {
        const version = execSync('colima version', { encoding: 'utf8' }).trim();
        dockerOptions.push({
          type: 'colima',
          installed: true,
          version,
          command: 'colima'
        });
      } catch {}
    }
    
    // Check Podman (Linux/WSL)
    if (this.platform === 'linux') {
      try {
        const version = execSync('podman --version', { encoding: 'utf8' }).trim();
        dockerOptions.push({
          type: 'podman',
          installed: true,
          version,
          command: 'podman'
        });
      } catch {}
    }
    
    if (dockerOptions.length > 0) {
      // Return the first working option
      const running = dockerOptions.find(opt => opt.running);
      return running || dockerOptions[0];
    }
    
    return { installed: false, type: 'docker' };
  }

  /**
   * Check if Docker daemon is running
   */
  async isDockerRunning() {
    try {
      execSync('docker ps', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check for Supabase CLI
   */
  async checkSupabaseCLI() {
    try {
      const version = execSync('supabase --version', { encoding: 'utf8' }).trim();
      return {
        installed: true,
        version: version.replace('supabase version', '').trim(),
        command: 'supabase'
      };
    } catch {
      return { installed: false };
    }
  }

  /**
   * Check Node.js version
   */
  async checkNode() {
    try {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0]);
      return {
        installed: true,
        version,
        supported: major >= 18
      };
    } catch {
      return { installed: false };
    }
  }

  /**
   * Display current status
   */
  displayStatus(checks) {
    console.log(chalk.blue('\n📊 Current Status:\n'));
    
    // Package Manager
    const pm = checks.packageManager;
    if (pm.installed) {
      console.log(chalk.green(`✅ Package Manager: ${pm.type} ${pm.version || ''}`));
    } else {
      console.log(chalk.red(`❌ Package Manager: Not found (${pm.type} recommended)`));
    }
    
    // Docker
    const docker = checks.docker;
    if (docker.installed) {
      const status = docker.running ? 'running' : 'not running';
      console.log(chalk.green(`✅ Docker: ${docker.type} ${docker.version || ''} (${status})`));
    } else {
      console.log(chalk.red('❌ Docker: Not found'));
    }
    
    // Supabase CLI
    const supabase = checks.supabase;
    if (supabase.installed) {
      console.log(chalk.green(`✅ Supabase CLI: v${supabase.version}`));
    } else {
      console.log(chalk.red('❌ Supabase CLI: Not found'));
    }
    
    // Node.js
    const node = checks.node;
    if (node.installed && node.supported) {
      console.log(chalk.green(`✅ Node.js: ${node.version}`));
    } else if (node.installed) {
      console.log(chalk.yellow(`⚠️  Node.js: ${node.version} (18+ required)`));
    }
  }

  /**
   * Determine what needs installation
   */
  determineNeededInstallations(checks) {
    const needed = [];
    
    if (!checks.packageManager.installed) {
      needed.push('package-manager');
    }
    
    if (!checks.docker.installed) {
      needed.push('docker');
    }
    
    if (!checks.supabase.installed) {
      needed.push('supabase-cli');
    }
    
    return needed;
  }

  /**
   * Install missing components
   */
  async installMissingComponents(needed, checks) {
    console.log(chalk.blue('\n🔧 Installing missing components...\n'));
    
    for (const component of needed) {
      switch (component) {
        case 'package-manager':
          await this.installPackageManager();
          break;
        case 'docker':
          await this.installDocker(checks.packageManager);
          break;
        case 'supabase-cli':
          await this.installSupabaseCLI(checks.packageManager);
          break;
      }
    }
  }

  /**
   * Install package manager
   */
  async installPackageManager() {
    console.log(chalk.blue('📦 Installing package manager...\n'));
    
    if (this.platform === 'darwin' || this.platform === 'linux') {
      console.log(chalk.white('Installing Homebrew...'));
      console.log(chalk.gray('\nRun this command in your terminal:'));
      console.log(chalk.cyan('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'));
      
      console.log(chalk.yellow('\n⚠️  After installation, follow the instructions to add Homebrew to your PATH'));
      console.log(chalk.yellow('Then run `fsd setup-local` again.'));
      
      process.exit(0);
    } else if (this.platform === 'win32') {
      console.log(chalk.white('Installing Scoop...'));
      console.log(chalk.gray('\nRun this command in PowerShell:'));
      console.log(chalk.cyan('iwr -useb get.scoop.sh | iex'));
      
      console.log(chalk.yellow('\n⚠️  After installation, restart your terminal'));
      console.log(chalk.yellow('Then run `fsd setup-local` again.'));
      
      process.exit(0);
    }
  }

  /**
   * Install Docker
   */
  async installDocker(packageManager) {
    console.log(chalk.blue('🐳 Docker installation guide...\n'));
    
    if (!packageManager.installed) {
      console.log(chalk.red('❌ Package manager required to install Docker'));
      return;
    }
    
    if (this.platform === 'darwin') {
      console.log(chalk.white('Options for macOS:'));
      console.log(chalk.gray('\n1. Docker Desktop (recommended):'));
      console.log(chalk.cyan('   brew install --cask docker'));
      
      console.log(chalk.gray('\n2. OrbStack (lightweight alternative):'));
      console.log(chalk.cyan('   brew install --cask orbstack'));
      
      console.log(chalk.gray('\n3. Colima (free alternative):'));
      console.log(chalk.cyan('   brew install colima docker'));
      console.log(chalk.gray('   Then start with: colima start'));
    } else if (this.platform === 'win32') {
      if (packageManager.type === 'scoop') {
        console.log(chalk.gray('Install Docker Desktop:'));
        console.log(chalk.cyan('scoop install docker-desktop'));
      } else {
        console.log(chalk.gray('Install Docker Desktop:'));
        console.log(chalk.cyan('choco install docker-desktop'));
      }
    } else if (this.platform === 'linux') {
      console.log(chalk.gray('Install Docker:'));
      console.log(chalk.cyan('sudo apt-get update'));
      console.log(chalk.cyan('sudo apt-get install docker.io docker-compose'));
      console.log(chalk.gray('\nAdd your user to docker group:'));
      console.log(chalk.cyan('sudo usermod -aG docker $USER'));
      console.log(chalk.yellow('\n⚠️  Log out and back in for group changes to take effect'));
    }
    
    console.log(chalk.yellow('\n⚠️  After installing Docker, make sure it\'s running'));
    console.log(chalk.yellow('Then run `fsd setup-local` again.'));
  }

  /**
   * Install Supabase CLI
   */
  async installSupabaseCLI(packageManager) {
    console.log(chalk.blue('⚡ Installing Supabase CLI...\n'));
    
    if (!packageManager.installed) {
      console.log(chalk.red('❌ Package manager required to install Supabase CLI'));
      return;
    }
    
    try {
      if (packageManager.type === 'homebrew') {
        console.log(chalk.gray('Installing via Homebrew...'));
        execSync('brew install supabase/tap/supabase', { stdio: 'inherit' });
      } else if (packageManager.type === 'scoop') {
        console.log(chalk.gray('Installing via Scoop...'));
        execSync('scoop bucket add supabase https://github.com/supabase/scoop-bucket.git', { stdio: 'inherit' });
        execSync('scoop install supabase', { stdio: 'inherit' });
      } else {
        console.log(chalk.yellow('⚠️  Manual installation required'));
        console.log(chalk.gray('\nDownload from: https://github.com/supabase/cli/releases'));
      }
      
      console.log(chalk.green('\n✅ Supabase CLI installed successfully!'));
    } catch (error) {
      console.log(chalk.red('\n❌ Installation failed:'), error.message);
    }
  }

  /**
   * Verify the setup is working
   */
  async verifySetup() {
    console.log(chalk.blue('\n🧪 Verifying setup...\n'));
    
    // Re-check everything
    const checks = await this.checkPrerequisites();
    
    const allGood = checks.packageManager.installed && 
                    checks.docker.installed && 
                    checks.supabase.installed;
    
    if (allGood) {
      console.log(chalk.green('✅ All prerequisites installed!'));
      
      // Check if Docker is running
      if (!checks.docker.running) {
        console.log(chalk.yellow('\n⚠️  Docker is installed but not running'));
        console.log(chalk.gray('Please start Docker and then you can use local Supabase'));
      }
    } else {
      console.log(chalk.yellow('\n⚠️  Some components are still missing'));
      console.log(chalk.gray('Please install them manually and run setup again'));
    }
  }

  /**
   * Offer to initialize Supabase
   */
  async offerSupabaseInit() {
    const { initSupabase } = await inquirer.prompt([{
      type: 'confirm',
      name: 'initSupabase',
      message: 'Would you like to initialize Supabase in the current project?',
      default: false
    }]);
    
    if (initSupabase) {
      await this.initializeSupabase();
    }
  }

  /**
   * Initialize Supabase in current project
   */
  async initializeSupabase() {
    console.log(chalk.blue('\n🚀 Initializing Supabase...\n'));
    
    try {
      // Check if already initialized
      if (fs.existsSync('supabase')) {
        console.log(chalk.yellow('⚠️  Supabase already initialized in this project'));
        return;
      }
      
      // Initialize Supabase
      execSync('supabase init', { stdio: 'inherit' });
      
      console.log(chalk.green('\n✅ Supabase initialized!'));
      console.log(chalk.gray('\nNext steps:'));
      console.log(chalk.gray('1. Start Supabase: supabase start'));
      console.log(chalk.gray('2. Access Studio: http://localhost:54323'));
      console.log(chalk.gray('3. Stop Supabase: supabase stop'));
    } catch (error) {
      console.log(chalk.red('❌ Failed to initialize Supabase:'), error.message);
    }
  }
}

/**
 * Run the setup
 */
export async function runSetupLocal() {
  const manager = new LocalSetupManager();
  await manager.setup();
}