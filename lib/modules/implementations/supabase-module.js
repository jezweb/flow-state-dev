/**
 * Supabase Backend Service Module for Flow State Dev
 * 
 * Provides Supabase integration with authentication, database,
 * storage, and real-time features for modern web applications.
 */
import { BackendServiceModule } from '../types/backend-service-module.js';
import { MODULE_TYPES, MODULE_CATEGORIES, MODULE_PROVIDES, MERGE_STRATEGIES } from '../types/index.js';

export class SupabaseModule extends BackendServiceModule {
  constructor() {
    super('supabase', 'Supabase - Open Source Firebase Alternative', {
      version: '1.0.0',
      moduleType: MODULE_TYPES.BACKEND_SERVICE,
      category: MODULE_CATEGORIES.BACKEND,
      provides: [
        MODULE_PROVIDES.BACKEND,
        MODULE_PROVIDES.DATABASE,
        MODULE_PROVIDES.AUTH,
        MODULE_PROVIDES.STORAGE,
        MODULE_PROVIDES.REALTIME,
        MODULE_PROVIDES.API
      ],
      requires: [MODULE_PROVIDES.FRONTEND],
      compatibleWith: ['vue3', 'react', 'angular'],
      incompatibleWith: ['firebase'],
      priority: 'high',
      templatePath: 'templates/supabase'
    });

    // Backend Service specific properties
    this.serviceType = 'baas';
    this.features = {
      database: true,
      auth: true,
      storage: true,
      realtime: true,
      functions: true
    };
    this.localDevelopment = true;
    this.cloudProvider = 'supabase';
    this.pricing = 'Free tier + usage-based';
    this.sdkLanguages = ['javascript', 'typescript', 'python', 'dart', 'swift', 'kotlin'];
    this.envVarsRequired = [
      { key: 'VITE_SUPABASE_URL', description: 'Your Supabase project URL' },
      { key: 'VITE_SUPABASE_ANON_KEY', description: 'Your Supabase project anon key' }
    ];
    this.setupCommands = [
      { command: 'npm install @supabase/supabase-js', description: 'Install Supabase client' },
      { command: 'npx supabase init', description: 'Initialize Supabase project' },
      { command: 'npx supabase start', description: 'Start local Supabase stack' }
    ];
    this.configPath = 'src/lib/supabase.js';
    this.servicesPath = 'src/services';

    this.defaultConfig = {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      database: {
        schema: 'public'
      },
      realtime: {
        enabled: true
      },
      storage: {
        enabled: true
      }
    };

    this.mergeStrategies = {
      'package.json': MERGE_STRATEGIES.MERGE_JSON,
      'src/main.js': MERGE_STRATEGIES.MERGE_ENTRY,
      'src/main.ts': MERGE_STRATEGIES.MERGE_ENTRY,
      '.env.local': MERGE_STRATEGIES.APPEND_UNIQUE,
      '.env.example': MERGE_STRATEGIES.APPEND_UNIQUE,
      'src/lib/supabase.js': MERGE_STRATEGIES.REPLACE,
      'src/lib/supabase.ts': MERGE_STRATEGIES.REPLACE
    };

    this.setupInstructions = [
      '1. Create a Supabase project at https://supabase.com',
      '2. Copy your project URL and anon key to .env.local',
      '3. Use the provided auth and database services',
      '4. Run migrations with: npx supabase db push'
    ];

    this.postInstallSteps = [
      'npm install',
      'cp .env.example .env.local',
      'echo "Add your Supabase credentials to .env.local"'
    ];

    this.gitignoreItems = [
      '.env.local',
      'supabase/.temp',
      'supabase/logs'
    ];
  }

  /**
   * Get NPM dependencies for Supabase
   * @returns {Object} Dependencies object
   */
  getDependencies() {
    return {
      '@supabase/supabase-js': '^2.38.0'
    };
  }

  /**
   * Get development dependencies
   * @returns {Object} Dev dependencies object
   */
  getDevDependencies() {
    return {
      'supabase': '^1.123.0'
    };
  }

  /**
   * Get environment variables required
   * @returns {Array} Environment variables
   */
  getEnvironmentVariables() {
    return [
      {
        key: 'VITE_SUPABASE_URL',
        description: 'Your Supabase project URL (e.g., https://xyzcompany.supabase.co)'
      },
      {
        key: 'VITE_SUPABASE_ANON_KEY',
        description: 'Your Supabase project anon/public key'
      },
      {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        description: 'Service role key for admin operations (keep secret)'
      }
    ];
  }

  /**
   * Get Supabase client configuration
   * @returns {string} Client config content
   */
  getClientConfig() {
    return `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types (generate with: npx supabase gen types typescript --local)
export type Database = {
  public: {
    Tables: {
      // Add your table types here
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}`;
  }

  /**
   * Get authentication service
   * @returns {Object} Auth service file
   */
  getAuthService() {
    return {
      path: 'src/services/auth.ts',
      content: `import { supabase } from '@/lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  user_metadata: any
  app_metadata: any
}

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: AuthError | null
}

class AuthService {
  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, metadata?: any): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    return {
      user: data.user,
      session: data.session,
      error
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return {
      user: data.user,
      session: data.session,
      error
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(provider: 'google' | 'github' | 'facebook' | 'apple') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: \`\${window.location.origin}/auth/callback\`
      }
    })
    
    return { data, error }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: \`\${window.location.origin}/auth/reset-password\`
    })
    
    return { data, error }
  }

  /**
   * Update password
   */
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    
    return { data, error }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession()
    return !!session
  }
}

export const authService = new AuthService()
export default authService`
    };
  }

  /**
   * Get database service
   * @returns {Object} Database service file
   */
  getDatabaseService() {
    return {
      path: 'src/services/database.ts',
      content: `import { supabase } from '@/lib/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

export interface DatabaseResponse<T = any> {
  data: T | null
  error: PostgrestError | null
  count?: number
}

class DatabaseService {
  /**
   * Insert a single record
   */
  async insert<T = any>(table: string, data: any): Promise<DatabaseResponse<T>> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()
    
    return { data: result, error }
  }

  /**
   * Insert multiple records
   */
  async insertMany<T = any>(table: string, data: any[]): Promise<DatabaseResponse<T[]>> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    
    return { data: result, error }
  }

  /**
   * Update records
   */
  async update<T = any>(
    table: string, 
    data: any, 
    filters: Record<string, any>
  ): Promise<DatabaseResponse<T[]>> {
    let query = supabase.from(table).update(data)
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data: result, error } = await query.select()
    
    return { data: result, error }
  }

  /**
   * Delete records
   */
  async delete<T = any>(
    table: string, 
    filters: Record<string, any>
  ): Promise<DatabaseResponse<T[]>> {
    let query = supabase.from(table).delete()
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data: result, error } = await query.select()
    
    return { data: result, error }
  }

  /**
   * Find records with optional filters, sorting, and pagination
   */
  async find<T = any>(
    table: string,
    options: {
      filters?: Record<string, any>
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
      offset?: number
      select?: string
    } = {}
  ): Promise<DatabaseResponse<T[]>> {
    const { filters = {}, orderBy, limit, offset, select = '*' } = options
    
    let query = supabase.from(table).select(select, { count: 'exact' })
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value)
      } else {
        query = query.eq(key, value)
      }
    })
    
    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
    }
    
    // Apply pagination
    if (limit) {
      query = query.limit(limit)
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1)
    }
    
    const { data, error, count } = await query
    
    return { data, error, count: count || 0 }
  }

  /**
   * Find a single record by ID
   */
  async findById<T = any>(
    table: string, 
    id: string | number,
    select = '*'
  ): Promise<DatabaseResponse<T>> {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq('id', id)
      .single()
    
    return { data, error }
  }

  /**
   * Count records
   */
  async count(
    table: string, 
    filters: Record<string, any> = {}
  ): Promise<DatabaseResponse<number>> {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { count, error } = await query
    
    return { data: count || 0, error }
  }

  /**
   * Execute a raw SQL query (requires RLS bypass)
   */
  async query<T = any>(sql: string): Promise<DatabaseResponse<T[]>> {
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    return { data, error }
  }

  /**
   * Subscribe to real-time changes
   */
  subscribe(
    table: string,
    callback: (payload: any) => void,
    filters?: Record<string, any>
  ) {
    let channel = supabase
      .channel(\`realtime:\${table}\`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter: filters ? Object.entries(filters).map(([key, value]) => \`\${key}=eq.\${value}\`).join('&') : undefined
      }, callback)
      .subscribe()
    
    return channel
  }
}

export const databaseService = new DatabaseService()
export default databaseService`
    };
  }

  /**
   * Get storage service
   * @returns {Object} Storage service file or null
   */
  getStorageService() {
    return {
      path: 'src/services/storage.ts',
      content: `import { supabase } from '@/lib/supabase'
import type { FileObject, StorageError } from '@supabase/supabase-js'

export interface UploadResponse {
  data: FileObject | null
  error: StorageError | null
}

export interface DownloadResponse {
  data: Blob | null
  error: StorageError | null
}

class StorageService {
  /**
   * Upload a file to a bucket
   */
  async upload(
    bucket: string,
    path: string,
    file: File,
    options?: {
      cacheControl?: string
      contentType?: string
      upsert?: boolean
    }
  ): Promise<UploadResponse> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options)
    
    return { data, error }
  }

  /**
   * Download a file from a bucket
   */
  async download(bucket: string, path: string): Promise<DownloadResponse> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)
    
    return { data, error }
  }

  /**
   * Get a public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  /**
   * Create a signed URL for a file
   */
  async createSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<{ signedUrl: string | null; error: StorageError | null }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)
    
    return { signedUrl: data?.signedUrl || null, error }
  }

  /**
   * List files in a bucket
   */
  async list(
    bucket: string,
    path?: string,
    options?: {
      limit?: number
      offset?: number
      sortBy?: { column: string; order: 'asc' | 'desc' }
    }
  ): Promise<{ data: FileObject[] | null; error: StorageError | null }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, options)
    
    return { data, error }
  }

  /**
   * Delete files from a bucket
   */
  async remove(
    bucket: string,
    paths: string[]
  ): Promise<{ data: FileObject[] | null; error: StorageError | null }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths)
    
    return { data, error }
  }

  /**
   * Move a file to a new location
   */
  async move(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<{ data: { message: string } | null; error: StorageError | null }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath)
    
    return { data, error }
  }

  /**
   * Copy a file to a new location
   */
  async copy(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<{ data: { path: string } | null; error: StorageError | null }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .copy(fromPath, toPath)
    
    return { data, error }
  }

  /**
   * Create a new bucket
   */
  async createBucket(
    id: string,
    options?: {
      public?: boolean
      allowedMimeTypes?: string[]
      fileSizeLimit?: number
    }
  ) {
    const { data, error } = await supabase.storage.createBucket(id, options)
    return { data, error }
  }

  /**
   * Get bucket details
   */
  async getBucket(id: string) {
    const { data, error } = await supabase.storage.getBucket(id)
    return { data, error }
  }

  /**
   * List all buckets
   */
  async listBuckets() {
    const { data, error } = await supabase.storage.listBuckets()
    return { data, error }
  }

  /**
   * Update bucket configuration
   */
  async updateBucket(
    id: string,
    options: {
      public?: boolean
      allowedMimeTypes?: string[]
      fileSizeLimit?: number
    }
  ) {
    const { data, error } = await supabase.storage.updateBucket(id, options)
    return { data, error }
  }

  /**
   * Delete a bucket
   */
  async deleteBucket(id: string) {
    const { data, error } = await supabase.storage.deleteBucket(id)
    return { data, error }
  }
}

export const storageService = new StorageService()
export default storageService`
    };
  }

  /**
   * Get setup commands for the module
   * @returns {Array} Setup commands
   */
  getSetupCommands() {
    return [
      {
        command: 'npm install @supabase/supabase-js',
        description: 'Install the Supabase JavaScript client'
      },
      {
        command: 'npm install -D supabase',
        description: 'Install Supabase CLI for local development'
      },
      {
        command: 'npx supabase init',
        description: 'Initialize Supabase configuration in your project'
      },
      {
        command: 'npx supabase start',
        description: 'Start local Supabase stack (Docker required)'
      },
      {
        command: 'npx supabase gen types typescript --local',
        description: 'Generate TypeScript types from your database schema'
      }
    ];
  }

  /**
   * Check compatibility with other modules
   * @param {Array} otherModules - Other modules to check against
   * @returns {Object} Compatibility result
   */
  checkCompatibility(otherModules) {
    const result = {
      compatible: true,
      issues: [],
      warnings: []
    };

    for (const module of otherModules) {
      // Check for incompatible backend services
      if (this.incompatibleWith.includes(module.name)) {
        result.compatible = false;
        result.issues.push({
          type: 'incompatible',
          module: module.name,
          message: `Supabase conflicts with ${module.name}`
        });
      }

      // Check for multiple backend services
      if (module.moduleType === MODULE_TYPES.BACKEND_SERVICE && module.name !== this.name) {
        result.warnings.push({
          type: 'multiple-backends',
          module: module.name,
          message: `Having multiple backend services (${this.name} + ${module.name}) may cause conflicts`
        });
      }

      // Check for multiple auth providers
      if (module.provides && module.provides.includes(MODULE_PROVIDES.AUTH) && module.name !== this.name) {
        result.warnings.push({
          type: 'multiple-auth',
          module: module.name,
          message: `Multiple auth providers detected (${this.name} + ${module.name})`
        });
      }
    }

    // Check for frontend framework requirement
    const hasFrontend = otherModules.some(m => 
      m.provides && m.provides.includes(MODULE_PROVIDES.FRONTEND)
    );

    if (!hasFrontend) {
      result.compatible = false;
      result.issues.push({
        type: 'missing-requirement',
        requirement: 'frontend',
        message: 'Supabase requires a frontend framework'
      });
    }

    return result;
  }

  /**
   * Validate module configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  validateConfig(config) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Validate auth config
    if (config.auth) {
      if (typeof config.auth.autoRefreshToken !== 'boolean') {
        result.warnings.push('auth.autoRefreshToken should be a boolean');
      }
      if (typeof config.auth.persistSession !== 'boolean') {
        result.warnings.push('auth.persistSession should be a boolean');
      }
    }

    // Validate database config
    if (config.database) {
      if (config.database.schema && typeof config.database.schema !== 'string') {
        result.errors.push('database.schema must be a string');
        result.valid = false;
      }
    }

    return result;
  }

  /**
   * Format module for display
   * @param {Object} options - Display options
   * @returns {string} Formatted display string
   */
  formatDisplay(options = {}) {
    const { selected = false, showDetails = false } = options;
    
    let display = `${selected ? '✓' : '○'} Supabase - Open Source Firebase Alternative`;
    
    if (showDetails) {
      const features = [];
      if (this.features.auth) features.push('Auth');
      if (this.features.database) features.push('PostgreSQL');
      if (this.features.storage) features.push('Storage');
      if (this.features.realtime) features.push('Realtime');
      if (this.features.functions) features.push('Edge Functions');
      
      display += `\n  Features: ${features.join(', ')}`;
      display += `\n  Pricing: ${this.pricing}`;
      display += `\n  Local Dev: ${this.localDevelopment ? 'Yes' : 'No'}`;
    }
    
    return display;
  }
}

// Export instance
export const supabaseModule = new SupabaseModule();
export default supabaseModule;