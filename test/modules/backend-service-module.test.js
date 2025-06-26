import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BackendServiceModule } from '../../lib/modules/types/backend-service-module.js';

describe('BackendServiceModule', () => {
  let supabaseModule;
  let firebaseModule;
  let customModule;

  beforeEach(() => {
    supabaseModule = new BackendServiceModule('supabase', 'Supabase Backend', {
      serviceType: 'baas',
      features: {
        database: true,
        auth: true,
        storage: true,
        realtime: true,
        functions: false
      },
      localDevelopment: true,
      cloudProvider: 'supabase',
      pricing: 'freemium',
      envVarsRequired: ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
    });

    firebaseModule = new BackendServiceModule('firebase', 'Firebase Backend', {
      serviceType: 'baas',
      features: {
        database: true,
        auth: true,
        storage: true,
        realtime: true,
        functions: true
      },
      localDevelopment: true,
      cloudProvider: 'google',
      pricing: 'freemium'
    });

    customModule = new BackendServiceModule('custom-api', 'Custom API', {
      serviceType: 'database',
      features: {
        database: true,
        auth: false,
        storage: false,
        realtime: false,
        functions: false
      },
      localDevelopment: false,
      pricing: 'paid'
    });
  });

  describe('constructor', () => {
    it('should create a backend service module with correct defaults', () => {
      expect(supabaseModule.name).toBe('supabase');
      expect(supabaseModule.moduleType).toBe('backend-service');
      expect(supabaseModule.category).toBe('backend');
      expect(supabaseModule.provides).toContain('backend');
      expect(supabaseModule.provides).toContain('database');
      expect(supabaseModule.serviceType).toBe('baas');
      expect(supabaseModule.features.database).toBe(true);
      expect(supabaseModule.features.auth).toBe(true);
    });

    it('should set default values correctly', () => {
      const defaultModule = new BackendServiceModule('test-backend', 'Test Backend');
      expect(defaultModule.serviceType).toBe('baas');
      expect(defaultModule.features.database).toBe(true);
      expect(defaultModule.features.auth).toBe(true);
      expect(defaultModule.features.storage).toBe(false);
      expect(defaultModule.localDevelopment).toBe(true);
      expect(defaultModule.pricing).toBe('freemium');
    });
  });

  describe('getMetadata', () => {
    it('should return extended metadata', () => {
      const metadata = supabaseModule.getMetadata();
      
      expect(metadata).toHaveProperty('serviceType', 'baas');
      expect(metadata).toHaveProperty('features');
      expect(metadata.features).toHaveProperty('database', true);
      expect(metadata.features).toHaveProperty('auth', true);
      expect(metadata.features).toHaveProperty('storage', true);
      expect(metadata.features).toHaveProperty('realtime', true);
      expect(metadata).toHaveProperty('localDevelopment', true);
      expect(metadata).toHaveProperty('cloudProvider', 'supabase');
      expect(metadata).toHaveProperty('pricing', 'freemium');
    });
  });

  describe('getDependencies', () => {
    it('should return correct dependencies for Supabase', () => {
      const deps = supabaseModule.getDependencies();
      
      expect(deps).toHaveProperty('@supabase/supabase-js');
    });

    it('should return correct dependencies for Firebase', () => {
      const deps = firebaseModule.getDependencies();
      
      expect(deps).toHaveProperty('firebase');
    });

    it('should include realtime dependencies when realtime is enabled', () => {
      const realtimeModule = new BackendServiceModule('realtime-service', 'Realtime Service', {
        features: { realtime: true }
      });
      
      const deps = realtimeModule.getDependencies();
      expect(deps).toHaveProperty('socket.io-client');
    });

    it('should handle unknown service gracefully', () => {
      const unknownModule = new BackendServiceModule('unknown-service', 'Unknown Service');
      const deps = unknownModule.getDependencies();
      
      // Should not include service-specific dependencies for unknown services
      expect(deps['socket.io-client']).toBeUndefined();
    });
  });

  describe('getDevDependencies', () => {
    it('should return local development tools for Supabase', () => {
      const deps = supabaseModule.getDevDependencies();
      
      expect(deps).toHaveProperty('supabase');
    });

    it('should return Firebase tools when local development is enabled', () => {
      const deps = firebaseModule.getDevDependencies();
      
      expect(deps).toHaveProperty('firebase-tools');
    });

    it('should include dotenv when environment variables are required', () => {
      const deps = supabaseModule.getDevDependencies();
      
      expect(deps).toHaveProperty('dotenv');
    });

    it('should not include local dev tools when disabled', () => {
      const deps = customModule.getDevDependencies();
      
      expect(deps).not.toHaveProperty('supabase');
      expect(deps).not.toHaveProperty('firebase-tools');
    });
  });

  describe('getEnvironmentVariables', () => {
    it('should return correct environment variables for Supabase', () => {
      const vars = supabaseModule.getEnvironmentVariables();
      
      expect(vars).toHaveLength(4); // 2 default + 2 custom
      expect(vars.find(v => v.key === 'VITE_SUPABASE_URL')).toBeDefined();
      expect(vars.find(v => v.key === 'VITE_SUPABASE_ANON_KEY')).toBeDefined();
      expect(vars.find(v => v.key === 'SUPABASE_URL')).toBeDefined();
      expect(vars.find(v => v.key === 'SUPABASE_ANON_KEY')).toBeDefined();
    });

    it('should return correct environment variables for Firebase', () => {
      const vars = firebaseModule.getEnvironmentVariables();
      
      expect(vars.length).toBeGreaterThan(0);
      expect(vars.find(v => v.key === 'VITE_FIREBASE_API_KEY')).toBeDefined();
      expect(vars.find(v => v.key === 'VITE_FIREBASE_PROJECT_ID')).toBeDefined();
    });

    it('should handle custom environment variables', () => {
      const customEnvModule = new BackendServiceModule('custom-env', 'Custom Env', {
        envVarsRequired: [
          { key: 'CUSTOM_API_KEY', description: 'Custom API key' },
          'SIMPLE_VAR'
        ]
      });
      
      const vars = customEnvModule.getEnvironmentVariables();
      
      expect(vars.find(v => v.key === 'CUSTOM_API_KEY')).toBeDefined();
      expect(vars.find(v => v.key === 'SIMPLE_VAR')).toBeDefined();
    });
  });

  describe('getClientConfig', () => {
    it('should generate valid Supabase client configuration', () => {
      const config = supabaseModule.getClientConfig();
      
      expect(config).toContain("import { createClient } from '@supabase/supabase-js'");
      expect(config).toContain('VITE_SUPABASE_URL');
      expect(config).toContain('VITE_SUPABASE_ANON_KEY');
      expect(config).toContain('export const supabase');
      expect(config).toContain('auth:');
      expect(config).toContain('persistSession: true');
    });

    it('should generate valid Firebase client configuration', () => {
      const config = firebaseModule.getClientConfig();
      
      expect(config).toContain("import { initializeApp } from 'firebase/app'");
      expect(config).toContain("import { getAuth } from 'firebase/auth'");
      expect(config).toContain("import { getFirestore } from 'firebase/firestore'");
      expect(config).toContain('VITE_FIREBASE_API_KEY');
      expect(config).toContain('export const app');
      expect(config).toContain('export const auth');
      expect(config).toContain('export const db');
    });

    it('should generate fallback configuration for unknown services', () => {
      const config = customModule.getClientConfig();
      
      expect(config).toContain('// custom-api client configuration');
      expect(config).toContain('TODO: Add custom-api initialization');
    });
  });

  describe('getAuthService', () => {
    it('should generate Supabase auth service', () => {
      const authService = supabaseModule.getAuthService();
      
      expect(authService.path).toBe('src/services/auth.js');
      expect(authService.content).toContain("import { supabase } from '../config/supabase'");
      expect(authService.content).toContain('export const authService');
      expect(authService.content).toContain('async signUp');
      expect(authService.content).toContain('async signIn');
      expect(authService.content).toContain('async signOut');
      expect(authService.content).toContain('async getCurrentUser');
      expect(authService.content).toContain('onAuthStateChange');
    });

    it('should generate Firebase auth service', () => {
      const authService = firebaseModule.getAuthService();
      
      expect(authService.path).toBe('src/services/auth.js');
      expect(authService.content).toContain("createUserWithEmailAndPassword");
      expect(authService.content).toContain("import { auth } from '../config/firebase'");
      expect(authService.content).toContain('export const authService');
    });

    it('should generate fallback auth service for unknown services', () => {
      const authService = customModule.getAuthService();
      
      expect(authService.content).toContain('// custom-api authentication service');
      expect(authService.content).toContain('TODO: Implement authentication methods');
    });
  });

  describe('getDatabaseService', () => {
    it('should generate Supabase database service', () => {
      const dbService = supabaseModule.getDatabaseService();
      
      expect(dbService.path).toBe('src/services/database.js');
      expect(dbService.content).toContain("import { supabase } from '../config/supabase'");
      expect(dbService.content).toContain('export const databaseService');
      expect(dbService.content).toContain('async create');
      expect(dbService.content).toContain('async read');
      expect(dbService.content).toContain('async update');
      expect(dbService.content).toContain('async delete');
      expect(dbService.content).toContain('subscribe');
    });

    it('should generate Firebase database service', () => {
      const dbService = firebaseModule.getDatabaseService();
      
      expect(dbService.path).toBe('src/services/database.js');
      expect(dbService.content).toContain("collection, doc, addDoc");
      expect(dbService.content).toContain("import { db } from '../config/firebase'");
      expect(dbService.content).toContain('export const databaseService');
    });

    it('should generate fallback database service', () => {
      const dbService = customModule.getDatabaseService();
      
      expect(dbService.content).toContain('// custom-api database service');
      expect(dbService.content).toContain('TODO: Implement database methods');
    });
  });

  describe('getStorageService', () => {
    it('should generate storage service when storage is enabled', () => {
      const storageService = supabaseModule.getStorageService();
      
      expect(storageService).not.toBeNull();
      expect(storageService.path).toBe('src/services/storage.js');
      expect(storageService.content).toContain("import { supabase } from '../config/supabase'");
      expect(storageService.content).toContain('export const storageService');
      expect(storageService.content).toContain('async upload');
      expect(storageService.content).toContain('async download');
      expect(storageService.content).toContain('getPublicUrl');
      expect(storageService.content).toContain('async delete');
    });

    it('should generate Firebase storage service', () => {
      const storageService = firebaseModule.getStorageService();
      
      expect(storageService).not.toBeNull();
      expect(storageService.content).toContain("ref, uploadBytes");
      expect(storageService.content).toContain("import { storage } from '../config/firebase'");
    });

    it('should return null when storage is not enabled', () => {
      const storageService = customModule.getStorageService();
      
      expect(storageService).toBeNull();
    });
  });

  describe('getSetupCommands', () => {
    it('should return Supabase setup commands', () => {
      const commands = supabaseModule.getSetupCommands();
      
      expect(commands).toHaveLength(2);
      expect(commands[0].command).toBe('npx supabase init');
      expect(commands[1].command).toBe('npx supabase start');
    });

    it('should return Firebase setup commands', () => {
      const commands = firebaseModule.getSetupCommands();
      
      expect(commands).toHaveLength(2);
      expect(commands[0].command).toBe('firebase init');
      expect(commands[1].command).toBe('firebase emulators:start');
    });

    it('should include custom setup commands', () => {
      const customSetupModule = new BackendServiceModule('custom-setup', 'Custom Setup', {
        setupCommands: [
          { command: 'custom command', description: 'Custom setup' }
        ]
      });
      
      const commands = customSetupModule.getSetupCommands();
      
      expect(commands.find(c => c.command === 'custom command')).toBeDefined();
    });
  });

  describe('checkCompatibility', () => {
    it('should detect multiple backend services conflict', () => {
      const otherBackend = {
        name: 'firebase',
        moduleType: 'backend-service',
        provides: ['backend', 'database']
      };
      
      const result = supabaseModule.checkCompatibility([otherBackend]);
      
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('multiple-backends');
      expect(result.issues[0].message).toContain('Multiple backend services selected');
    });

    it('should warn about auth provider overlap', () => {
      const authProvider = {
        name: 'auth0',
        moduleType: 'auth-provider',
        provides: ['auth']
      };
      
      const result = supabaseModule.checkCompatibility([authProvider]);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('auth-overlap');
      expect(result.warnings[0].message).toContain('provides auth, but additional auth providers selected');
    });

    it('should pass compatibility with compatible modules', () => {
      const frontendModule = {
        name: 'vue3',
        moduleType: 'frontend-framework',
        provides: ['frontend']
      };
      
      const result = supabaseModule.checkCompatibility([frontendModule]);
      
      expect(result.issues).toHaveLength(0);
    });

    it('should not warn about auth overlap when service does not provide auth', () => {
      const authProvider = {
        name: 'auth0',
        moduleType: 'auth-provider',
        provides: ['auth']
      };
      
      const result = customModule.checkCompatibility([authProvider]);
      
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('previewChanges', () => {
    it('should return preview of all files for full-featured service', async () => {
      const preview = await supabaseModule.previewChanges('/test/path', {});
      
      expect(preview.files.length).toBeGreaterThan(0);
      expect(preview.modifications.length).toBeGreaterThan(0);
      
      // Configuration file
      const configFile = preview.files.find(f => f.path.includes('config/supabase.js'));
      expect(configFile).toBeDefined();
      
      // Service files
      const authService = preview.files.find(f => f.path.includes('services/auth.js'));
      expect(authService).toBeDefined();
      
      const dbService = preview.files.find(f => f.path.includes('services/database.js'));
      expect(dbService).toBeDefined();
      
      const storageService = preview.files.find(f => f.path.includes('services/storage.js'));
      expect(storageService).toBeDefined();
      
      // Environment files
      const envExample = preview.files.find(f => f.path === '.env.example');
      expect(envExample).toBeDefined();
      
      const envLocal = preview.files.find(f => f.path === '.env.local');
      expect(envLocal).toBeDefined();
    });

    it('should include local development files when enabled', async () => {
      const preview = await supabaseModule.previewChanges('/test/path', {});
      
      const supabaseConfig = preview.files.find(f => f.path === 'supabase/config.toml');
      expect(supabaseConfig).toBeDefined();
    });

    it('should include warnings for paid services', async () => {
      const preview = await customModule.previewChanges('/test/path', {});
      
      expect(preview.warnings).toContain('custom-api is a paid service - check pricing before deploying');
    });

    it('should include environment variable warnings', async () => {
      const preview = await supabaseModule.previewChanges('/test/path', {});
      
      expect(preview.warnings).toContain('Remember to set up environment variables before running the app');
    });
  });

  describe('getPostInstallInstructions', () => {
    it('should return comprehensive instructions for Supabase', () => {
      const instructions = supabaseModule.getPostInstallInstructions({});
      
      expect(instructions).toContain('supabase Setup:');
      expect(instructions).toContain('1. Copy .env.example to .env.local');
      expect(instructions).toContain('2. Add your supabase credentials to .env.local');
      
      // Environment variables
      expect(instructions).toContain('Required environment variables:');
      expect(instructions.join(' ')).toContain('VITE_SUPABASE_URL');
      expect(instructions).toContain('VITE_SUPABASE_ANON_KEY');
      
      // Local development
      expect(instructions).toContain('Local development setup:');
      expect(instructions).toContain('Initialize Supabase project: npx supabase init');
      
      // Service-specific instructions
      expect(instructions).toContain('Create a Supabase project:');
      expect(instructions).toContain('1. Go to https://supabase.com');
    });

    it('should return Firebase-specific instructions', () => {
      const instructions = firebaseModule.getPostInstallInstructions({});
      
      expect(instructions).toContain('firebase Setup:');
      expect(instructions).toContain('Set up Firebase:');
      expect(instructions.join(' ')).toContain('console.firebase.google.com');
    });

    it('should not include local development setup when disabled', () => {
      const instructions = customModule.getPostInstallInstructions({});
      
      expect(instructions.join(' ')).not.toContain('Local development setup:');
    });
  });

  describe('edge cases', () => {
    it('should handle modules without features', () => {
      const minimalModule = new BackendServiceModule('minimal', 'Minimal Service', {
        features: {}
      });
      
      const storageService = minimalModule.getStorageService();
      expect(storageService).toBeNull();
    });

    it('should handle empty environment variables array', () => {
      const noEnvModule = new BackendServiceModule('no-env', 'No Env Service', {
        envVarsRequired: []
      });
      
      const vars = noEnvModule.getEnvironmentVariables();
      expect(vars).toHaveLength(0);
    });

    it('should handle unknown service types gracefully', () => {
      const unknownModule = new BackendServiceModule('unknown', 'Unknown Service');
      
      const deps = unknownModule.getDependencies();
      const devDeps = unknownModule.getDevDependencies();
      const config = unknownModule.getClientConfig();
      
      expect(typeof deps).toBe('object');
      expect(typeof devDeps).toBe('object');
      expect(typeof config).toBe('string');
    });
  });

  describe('service configuration generation', () => {
    it('should generate proper error handling in client config', () => {
      const config = supabaseModule.getClientConfig();
      
      expect(config).toContain('if (!supabaseUrl || !supabaseAnonKey)');
      expect(config).toContain('throw new Error');
    });

    it('should include proper imports in service files', () => {
      const authService = supabaseModule.getAuthService();
      const dbService = supabaseModule.getDatabaseService();
      
      expect(authService.content).toContain("import { supabase }");
      expect(dbService.content).toContain("import { supabase }");
    });
  });
});