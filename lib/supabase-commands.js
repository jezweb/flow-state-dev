/**
 * Supabase local development commands
 */

import chalk from 'chalk';
import { execSync, spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';

export class SupabaseCommands {
  constructor() {
    this.projectRoot = process.cwd();
    this.supabaseDir = path.join(this.projectRoot, 'supabase');
  }

  /**
   * Check if Supabase is initialized
   */
  isInitialized() {
    return fs.existsSync(this.supabaseDir);
  }

  /**
   * Check if Supabase is installed
   */
  isInstalled() {
    try {
      execSync('supabase --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Start Supabase local development
   */
  async start() {
    console.log(chalk.blue('🚀 Starting Supabase local development...\n'));
    
    if (!this.isInstalled()) {
      console.log(chalk.red('❌ Supabase CLI is not installed'));
      console.log(chalk.gray('Run: fsd setup-local'));
      return;
    }
    
    if (!this.isInitialized()) {
      const { init } = await inquirer.prompt([{
        type: 'confirm',
        name: 'init',
        message: 'Supabase is not initialized. Initialize now?',
        default: true
      }]);
      
      if (init) {
        await this.init();
      } else {
        return;
      }
    }
    
    try {
      console.log(chalk.gray('Starting Supabase containers...'));
      console.log(chalk.gray('This may take a few minutes on first run.\n'));
      
      // Start Supabase with output
      const supabase = spawn('supabase', ['start'], {
        stdio: 'inherit',
        shell: true
      });
      
      supabase.on('close', (code) => {
        if (code === 0) {
          this.displayConnectionInfo();
        } else {
          console.log(chalk.red('\n❌ Failed to start Supabase'));
          console.log(chalk.gray('Check Docker is running and try again'));
        }
      });
    } catch (error) {
      console.log(chalk.red('❌ Error starting Supabase:'), error.message);
    }
  }

  /**
   * Stop Supabase local development
   */
  async stop() {
    console.log(chalk.blue('🛑 Stopping Supabase...\n'));
    
    if (!this.isInitialized()) {
      console.log(chalk.yellow('⚠️  No Supabase project found'));
      return;
    }
    
    try {
      execSync('supabase stop', { stdio: 'inherit' });
      console.log(chalk.green('\n✅ Supabase stopped'));
    } catch (error) {
      console.log(chalk.red('❌ Error stopping Supabase:'), error.message);
    }
  }

  /**
   * Reset Supabase database
   */
  async reset() {
    console.log(chalk.blue('🔄 Resetting Supabase database...\n'));
    
    if (!this.isInitialized()) {
      console.log(chalk.yellow('⚠️  No Supabase project found'));
      return;
    }
    
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow('⚠️  This will delete all data. Are you sure?'),
      default: false
    }]);
    
    if (!confirm) {
      console.log(chalk.gray('Reset cancelled'));
      return;
    }
    
    try {
      execSync('supabase db reset', { stdio: 'inherit' });
      console.log(chalk.green('\n✅ Database reset complete'));
    } catch (error) {
      console.log(chalk.red('❌ Error resetting database:'), error.message);
    }
  }

  /**
   * Run database migrations
   */
  async migrate() {
    console.log(chalk.blue('📦 Running database migrations...\n'));
    
    if (!this.isInitialized()) {
      console.log(chalk.yellow('⚠️  No Supabase project found'));
      return;
    }
    
    try {
      // Check for pending migrations
      const migrations = await fs.readdir(path.join(this.supabaseDir, 'migrations')).catch(() => []);
      
      if (migrations.length === 0) {
        console.log(chalk.yellow('No migrations found'));
        
        const { create } = await inquirer.prompt([{
          type: 'confirm',
          name: 'create',
          message: 'Would you like to create a new migration?',
          default: true
        }]);
        
        if (create) {
          await this.createMigration();
        }
        return;
      }
      
      // Run migrations
      execSync('supabase db push', { stdio: 'inherit' });
      console.log(chalk.green('\n✅ Migrations applied successfully'));
    } catch (error) {
      console.log(chalk.red('❌ Error running migrations:'), error.message);
    }
  }

  /**
   * Create a new migration
   */
  async createMigration() {
    const { name } = await inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: 'Migration name:',
      validate: (input) => input.trim() !== '' || 'Migration name is required'
    }]);
    
    try {
      execSync(`supabase migration new ${name}`, { stdio: 'inherit' });
      console.log(chalk.green('\n✅ Migration created'));
      console.log(chalk.gray('Edit the migration file in supabase/migrations/'));
    } catch (error) {
      console.log(chalk.red('❌ Error creating migration:'), error.message);
    }
  }

  /**
   * Seed the database
   */
  async seed() {
    console.log(chalk.blue('🌱 Seeding database...\n'));
    
    if (!this.isInitialized()) {
      console.log(chalk.yellow('⚠️  No Supabase project found'));
      return;
    }
    
    // Check for seed file
    const seedFile = path.join(this.supabaseDir, 'seed.sql');
    
    if (!fs.existsSync(seedFile)) {
      console.log(chalk.yellow('No seed file found'));
      
      const { create } = await inquirer.prompt([{
        type: 'confirm',
        name: 'create',
        message: 'Would you like to create a seed file?',
        default: true
      }]);
      
      if (create) {
        await this.createSeedFile();
      }
      return;
    }
    
    try {
      execSync(`supabase db push --include-seed`, { stdio: 'inherit' });
      console.log(chalk.green('\n✅ Database seeded successfully'));
    } catch (error) {
      console.log(chalk.red('❌ Error seeding database:'), error.message);
    }
  }

  /**
   * Create a seed file
   */
  async createSeedFile() {
    const seedContent = `-- Seed data for local development
-- This file is run after migrations when using 'supabase db reset'

-- Example: Insert test users
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'test@example.com', crypt('password123', gen_salt('bf')), now(), now(), now());

-- Example: Insert test data
-- INSERT INTO profiles (id, user_id, username, full_name)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'testuser', 'Test User');

-- Add your seed data below:
`;
    
    const seedFile = path.join(this.supabaseDir, 'seed.sql');
    await fs.writeFile(seedFile, seedContent);
    
    console.log(chalk.green('\n✅ Seed file created: supabase/seed.sql'));
    console.log(chalk.gray('Edit this file to add your seed data'));
  }

  /**
   * Show Supabase status
   */
  async status() {
    console.log(chalk.blue('📊 Supabase Status\n'));
    
    if (!this.isInstalled()) {
      console.log(chalk.red('❌ Supabase CLI: Not installed'));
      console.log(chalk.gray('Run: fsd setup-local'));
      return;
    }
    
    console.log(chalk.green('✅ Supabase CLI: Installed'));
    
    if (!this.isInitialized()) {
      console.log(chalk.yellow('⚠️  Project: Not initialized'));
      console.log(chalk.gray('Run: fsd supabase init'));
      return;
    }
    
    console.log(chalk.green('✅ Project: Initialized'));
    
    // Check if running
    try {
      const status = execSync('supabase status', { encoding: 'utf8' });
      console.log(chalk.green('✅ Status: Running'));
      console.log(chalk.gray('\n' + status));
    } catch {
      console.log(chalk.yellow('⚠️  Status: Not running'));
      console.log(chalk.gray('Run: fsd supabase start'));
    }
  }

  /**
   * Initialize Supabase project
   */
  async init() {
    console.log(chalk.blue('🎯 Initializing Supabase project...\n'));
    
    if (this.isInitialized()) {
      console.log(chalk.yellow('⚠️  Supabase already initialized'));
      return;
    }
    
    try {
      execSync('supabase init', { stdio: 'inherit' });
      console.log(chalk.green('\n✅ Supabase initialized'));
      
      // Create example migration
      const { createExample } = await inquirer.prompt([{
        type: 'confirm',
        name: 'createExample',
        message: 'Create example migration and seed data?',
        default: true
      }]);
      
      if (createExample) {
        await this.createExampleFiles();
      }
      
      console.log(chalk.gray('\nNext: Run `fsd supabase start` to start local development'));
    } catch (error) {
      console.log(chalk.red('❌ Error initializing Supabase:'), error.message);
    }
  }

  /**
   * Create example migration and seed files
   */
  async createExampleFiles() {
    // Example migration
    const migrationContent = `-- Example migration: Create profiles table

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE
  ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create index
CREATE INDEX profiles_user_id_idx ON profiles(user_id);
CREATE INDEX profiles_username_idx ON profiles(username);
`;
    
    // Create migration
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').replace(/\..+/, '');
    const migrationFile = path.join(this.supabaseDir, 'migrations', `${timestamp}_create_profiles.sql`);
    await fs.ensureDir(path.dirname(migrationFile));
    await fs.writeFile(migrationFile, migrationContent);
    
    // Create seed file
    await this.createSeedFile();
    
    console.log(chalk.green('✅ Created example migration and seed file'));
  }

  /**
   * Display connection information
   */
  displayConnectionInfo() {
    console.log(chalk.green('\n✅ Supabase is running!\n'));
    console.log(chalk.white('🔗 Connection URLs:\n'));
    console.log(chalk.gray('   Studio:'), chalk.cyan('http://localhost:54323'));
    console.log(chalk.gray('   API:'), chalk.cyan('http://localhost:54321'));
    console.log(chalk.gray('   Database:'), chalk.cyan('postgresql://postgres:postgres@localhost:54322/postgres'));
    console.log(chalk.gray('   Inbucket:'), chalk.cyan('http://localhost:54324'));
    
    console.log(chalk.white('\n📚 Quick Commands:\n'));
    console.log(chalk.gray('   Stop:'), chalk.cyan('fsd supabase stop'));
    console.log(chalk.gray('   Reset:'), chalk.cyan('fsd supabase reset'));
    console.log(chalk.gray('   Status:'), chalk.cyan('fsd supabase status'));
    
    console.log(chalk.white('\n🔑 Default Credentials:\n'));
    console.log(chalk.gray('   Anon key:'), chalk.cyan('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'));
    console.log(chalk.gray('   Service key:'), chalk.cyan('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'));
  }
}

/**
 * Execute Supabase command
 */
export async function executeSupabaseCommand(command, args) {
  const supabase = new SupabaseCommands();
  
  switch (command) {
    case 'start':
      await supabase.start();
      break;
    case 'stop':
      await supabase.stop();
      break;
    case 'reset':
      await supabase.reset();
      break;
    case 'status':
      await supabase.status();
      break;
    case 'migrate':
      await supabase.migrate();
      break;
    case 'seed':
      await supabase.seed();
      break;
    case 'init':
      await supabase.init();
      break;
    default:
      console.log(chalk.red(`Unknown command: ${command}`));
      console.log(chalk.gray('\nAvailable commands:'));
      console.log(chalk.gray('  start   - Start local Supabase'));
      console.log(chalk.gray('  stop    - Stop local Supabase'));
      console.log(chalk.gray('  reset   - Reset database'));
      console.log(chalk.gray('  status  - Show status'));
      console.log(chalk.gray('  migrate - Run migrations'));
      console.log(chalk.gray('  seed    - Seed database'));
      console.log(chalk.gray('  init    - Initialize Supabase'));
  }
}