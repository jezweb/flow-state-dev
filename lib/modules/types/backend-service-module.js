/**
 * Backend Service Module Type
 * 
 * Specialized module type for backend services like Supabase, Firebase, AWS Amplify, etc.
 * Handles database, authentication, storage, and serverless functions.
 */
import { BaseStackModule } from './base-stack-module.js';
import fs from 'fs-extra';
import path from 'path';

export class BackendServiceModule extends BaseStackModule {
  constructor(name, description, options = {}) {
    super(name, description, {
      ...options,
      moduleType: 'backend-service',
      category: 'backend',
      provides: ['backend', 'database', ...(options.provides || [])],
      requires: options.requires || []
    });

    // Backend service specific properties
    this.serviceType = options.serviceType || 'baas'; // 'baas', 'database', 'auth', 'storage'
    this.features = options.features || {
      database: true,
      auth: true,
      storage: false,
      realtime: false,
      functions: false
    };
    this.localDevelopment = options.localDevelopment !== false;
    this.cloudProvider = options.cloudProvider || null;
    this.pricing = options.pricing || 'freemium';
    this.sdkLanguages = options.sdkLanguages || ['javascript'];
    this.envVarsRequired = options.envVarsRequired || [];
    this.setupCommands = options.setupCommands || [];
    this.configPath = options.configPath || 'src/config';
    this.servicesPath = options.servicesPath || 'src/services';
  }

  /**
   * Get backend service metadata
   * @returns {Object} Extended metadata
   */
  getMetadata() {
    return {
      ...super.getMetadata(),
      serviceType: this.serviceType,
      features: this.features,
      localDevelopment: this.localDevelopment,
      cloudProvider: this.cloudProvider,
      pricing: this.pricing,
      sdkLanguages: this.sdkLanguages
    };
  }

  /**
   * Get service dependencies
   * @returns {Object} Dependencies
   */
  getDependencies() {
    const deps = {};

    // Service-specific SDKs
    switch (this.name.toLowerCase()) {
      case 'supabase':
        deps['@supabase/supabase-js'] = '^2.0.0';
        break;
      case 'firebase':
        deps['firebase'] = '^10.0.0';
        break;
      case 'aws-amplify':
        deps['aws-amplify'] = '^6.0.0';
        break;
      case 'appwrite':
        deps['appwrite'] = '^13.0.0';
        break;
      case 'pocketbase':
        deps['pocketbase'] = '^0.20.0';
        break;
    }

    // Additional feature dependencies
    if (this.features.realtime) {
      deps['socket.io-client'] = '^4.0.0';
    }

    return deps;
  }

  /**
   * Get development dependencies
   * @returns {Object} Dev dependencies
   */
  getDevDependencies() {
    const deps = {};

    // Local development tools
    if (this.localDevelopment) {
      switch (this.name.toLowerCase()) {
        case 'supabase':
          deps['supabase'] = '^1.0.0';
          break;
        case 'firebase':
          deps['firebase-tools'] = '^13.0.0';
          break;
      }
    }

    // Environment variable validation
    if (this.envVarsRequired.length > 0) {
      deps['dotenv'] = '^16.0.0';
    }

    return deps;
  }

  /**
   * Get required environment variables
   * @returns {Array} Environment variable definitions
   */
  getEnvironmentVariables() {
    const vars = [];

    switch (this.name.toLowerCase()) {
      case 'supabase':
        vars.push(
          { key: 'VITE_SUPABASE_URL', description: 'Your Supabase project URL' },
          { key: 'VITE_SUPABASE_ANON_KEY', description: 'Your Supabase anonymous key' }
        );
        break;
      case 'firebase':
        vars.push(
          { key: 'VITE_FIREBASE_API_KEY', description: 'Firebase API key' },
          { key: 'VITE_FIREBASE_AUTH_DOMAIN', description: 'Firebase auth domain' },
          { key: 'VITE_FIREBASE_PROJECT_ID', description: 'Firebase project ID' },
          { key: 'VITE_FIREBASE_STORAGE_BUCKET', description: 'Firebase storage bucket' },
          { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', description: 'Firebase messaging sender ID' },
          { key: 'VITE_FIREBASE_APP_ID', description: 'Firebase app ID' }
        );
        break;
      case 'appwrite':
        vars.push(
          { key: 'VITE_APPWRITE_ENDPOINT', description: 'Appwrite endpoint URL' },
          { key: 'VITE_APPWRITE_PROJECT_ID', description: 'Appwrite project ID' }
        );
        break;
    }

    // Add custom environment variables
    this.envVarsRequired.forEach(envVar => {
      if (typeof envVar === 'string') {
        vars.push({ key: envVar, description: `${envVar} value` });
      } else {
        vars.push(envVar);
      }
    });

    return vars;
  }

  /**
   * Generate service client configuration
   * @returns {string} Client configuration code
   */
  getClientConfig() {
    switch (this.name.toLowerCase()) {
      case 'supabase':
        return `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'app-auth-token',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})`;

      case 'firebase':
        return `import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)`;

      default:
        return `// ${this.name} client configuration
// TODO: Add ${this.name} initialization code here`;
    }
  }

  /**
   * Generate authentication service
   * @returns {Object} Auth service file
   */
  getAuthService() {
    const fileName = 'auth.js';
    let content = '';

    switch (this.name.toLowerCase()) {
      case 'supabase':
        content = `import { supabase } from '../config/${this.name.toLowerCase()}'

export const authService = {
  // Sign up with email and password
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    if (error) throw error
    return data
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Reset password
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  },

  // Update password
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  }
}`;
        break;

      case 'firebase':
        content = `import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword
} from 'firebase/auth'
import { auth } from '../config/${this.name.toLowerCase()}'

export const authService = {
  // Sign up with email and password
  async signUp(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  },

  // Sign in with email and password
  async signIn(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  },

  // Sign out
  async signOut() {
    await firebaseSignOut(auth)
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback)
  },

  // Reset password
  async resetPassword(email) {
    await sendPasswordResetEmail(auth, email)
  },

  // Update password
  async updatePassword(newPassword) {
    const user = auth.currentUser
    if (!user) throw new Error('No authenticated user')
    await firebaseUpdatePassword(user, newPassword)
  }
}`;
        break;

      default:
        content = `// ${this.name} authentication service
// TODO: Implement authentication methods for ${this.name}

export const authService = {
  async signUp(email, password) {
    // Implement sign up
  },

  async signIn(email, password) {
    // Implement sign in
  },

  async signOut() {
    // Implement sign out
  },

  async getCurrentUser() {
    // Implement get current user
  }
}`;
    }

    return {
      path: `${this.servicesPath}/${fileName}`,
      content
    };
  }

  /**
   * Generate database service
   * @returns {Object} Database service file
   */
  getDatabaseService() {
    const fileName = 'database.js';
    let content = '';

    switch (this.name.toLowerCase()) {
      case 'supabase':
        content = `import { supabase } from '../config/${this.name.toLowerCase()}'

export const databaseService = {
  // Create a new record
  async create(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  // Read records with optional filters
  async read(table, filters = {}) {
    let query = supabase.from(table).select('*')
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Read a single record by ID
  async readById(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Update a record
  async update(table, id, updates) {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete a record
  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Real-time subscription
  subscribe(table, callback, filters = {}) {
    const channel = supabase
      .channel(\`\${table}-changes\`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: Object.entries(filters)
            .map(([key, value]) => \`\${key}=eq.\${value}\`)
            .join(',')
        },
        callback
      )
      .subscribe()
    
    return () => channel.unsubscribe()
  }
}`;
        break;

      case 'firebase':
        content = `import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../config/${this.name.toLowerCase()}'

export const databaseService = {
  // Create a new document
  async create(collectionName, data) {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return { id: docRef.id, ...data }
  },

  // Read documents with optional filters
  async read(collectionName, filters = {}) {
    let q = collection(db, collectionName)
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      const constraints = Object.entries(filters).map(([key, value]) => 
        where(key, '==', value)
      )
      q = query(q, ...constraints)
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Read a single document by ID
  async readById(collectionName, id) {
    const docRef = doc(db, collectionName, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('Document not found')
    }
    
    return { id: docSnap.id, ...docSnap.data() }
  },

  // Update a document
  async update(collectionName, id, updates) {
    const docRef = doc(db, collectionName, id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })
    return { id, ...updates }
  },

  // Delete a document
  async delete(collectionName, id) {
    const docRef = doc(db, collectionName, id)
    await deleteDoc(docRef)
  },

  // Real-time subscription
  subscribe(collectionName, callback, filters = {}) {
    let q = collection(db, collectionName)
    
    if (Object.keys(filters).length > 0) {
      const constraints = Object.entries(filters).map(([key, value]) => 
        where(key, '==', value)
      )
      q = query(q, ...constraints)
    }
    
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(docs)
    })
  }
}`;
        break;

      default:
        content = `// ${this.name} database service
// TODO: Implement database methods for ${this.name}

export const databaseService = {
  async create(table, data) {
    // Implement create
  },

  async read(table, filters = {}) {
    // Implement read
  },

  async update(table, id, updates) {
    // Implement update
  },

  async delete(table, id) {
    // Implement delete
  }
}`;
    }

    return {
      path: `${this.servicesPath}/${fileName}`,
      content
    };
  }

  /**
   * Generate storage service if supported
   * @returns {Object|null} Storage service file or null
   */
  getStorageService() {
    if (!this.features.storage) {
      return null;
    }

    const fileName = 'storage.js';
    let content = '';

    switch (this.name.toLowerCase()) {
      case 'supabase':
        content = `import { supabase } from '../config/${this.name.toLowerCase()}'

export const storageService = {
  // Upload a file
  async upload(bucket, path, file, options = {}) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...options
      })
    
    if (error) throw error
    return data
  },

  // Download a file
  async download(bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)
    
    if (error) throw error
    return data
  },

  // Get public URL
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  // Delete a file
  async delete(bucket, paths) {
    const pathArray = Array.isArray(paths) ? paths : [paths]
    const { error } = await supabase.storage
      .from(bucket)
      .remove(pathArray)
    
    if (error) throw error
  },

  // List files in a folder
  async list(bucket, folder = '', options = {}) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        ...options
      })
    
    if (error) throw error
    return data
  }
}`;
        break;

      case 'firebase':
        content = `import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage'
import { storage } from '../config/${this.name.toLowerCase()}'

export const storageService = {
  // Upload a file
  async upload(path, file, metadata = {}) {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file, metadata)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return {
      path: snapshot.ref.fullPath,
      downloadURL,
      metadata: snapshot.metadata
    }
  },

  // Get download URL
  async getDownloadURL(path) {
    const storageRef = ref(storage, path)
    return await getDownloadURL(storageRef)
  },

  // Delete a file
  async delete(path) {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  },

  // List files in a folder
  async list(folderPath) {
    const folderRef = ref(storage, folderPath)
    const result = await listAll(folderRef)
    
    const files = await Promise.all(
      result.items.map(async (itemRef) => ({
        name: itemRef.name,
        path: itemRef.fullPath,
        downloadURL: await getDownloadURL(itemRef)
      }))
    )
    
    return {
      files,
      folders: result.prefixes.map(prefix => ({
        name: prefix.name,
        path: prefix.fullPath
      }))
    }
  }
}`;
        break;

      default:
        return null;
    }

    return {
      path: `${this.servicesPath}/${fileName}`,
      content
    };
  }

  /**
   * Get local development setup commands
   * @returns {Array} Setup commands
   */
  getSetupCommands() {
    const commands = [];

    switch (this.name.toLowerCase()) {
      case 'supabase':
        commands.push(
          { command: 'npx supabase init', description: 'Initialize Supabase project' },
          { command: 'npx supabase start', description: 'Start local Supabase instance' }
        );
        break;
      case 'firebase':
        commands.push(
          { command: 'firebase init', description: 'Initialize Firebase project' },
          { command: 'firebase emulators:start', description: 'Start Firebase emulators' }
        );
        break;
    }

    // Add custom setup commands
    commands.push(...this.setupCommands);

    return commands;
  }

  /**
   * Check compatibility with other modules
   * @param {Array} otherModules - Other selected modules
   * @returns {Object} Compatibility result
   */
  checkCompatibility(otherModules) {
    const result = super.checkCompatibility(otherModules);
    
    // Check for multiple backend services
    const otherBackends = otherModules.filter(m => 
      m.moduleType === 'backend-service' && m.name !== this.name
    );
    
    if (otherBackends.length > 0) {
      result.issues.push({
        type: 'multiple-backends',
        message: `Multiple backend services selected: ${this.name} and ${otherBackends.map(m => m.name).join(', ')}`
      });
    }

    // Check for auth provider conflicts
    if (this.features.auth) {
      const authProviders = otherModules.filter(m => 
        m.moduleType === 'auth-provider' || m.provides.includes('auth')
      );
      
      if (authProviders.length > 0) {
        result.warnings.push({
          type: 'auth-overlap',
          message: `${this.name} provides auth, but additional auth providers selected`
        });
      }
    }

    return result;
  }

  /**
   * Prepare preview of changes
   * @param {string} projectPath - Project path
   * @param {Object} projectAnalysis - Project analysis
   * @returns {Object} Preview results
   */
  async previewChanges(projectPath, projectAnalysis) {
    const preview = {
      files: [],
      modifications: [],
      warnings: []
    };

    // Configuration file
    preview.files.push({
      path: `${this.configPath}/${this.name.toLowerCase()}.js`,
      description: `${this.name} client configuration`
    });

    // Service files
    if (this.features.auth) {
      const authService = this.getAuthService();
      preview.files.push({
        path: authService.path,
        description: 'Authentication service'
      });
    }

    if (this.features.database) {
      const dbService = this.getDatabaseService();
      preview.files.push({
        path: dbService.path,
        description: 'Database service'
      });
    }

    if (this.features.storage) {
      const storageService = this.getStorageService();
      if (storageService) {
        preview.files.push({
          path: storageService.path,
          description: 'Storage service'
        });
      }
    }

    // Environment files
    preview.files.push({
      path: '.env.example',
      description: 'Environment variables template'
    });

    preview.files.push({
      path: '.env.local',
      description: 'Local environment variables (git-ignored)'
    });

    // Package.json modifications
    preview.modifications.push({
      path: 'package.json',
      description: `Add ${this.name} SDK and dependencies`
    });

    // Git ignore modifications
    preview.modifications.push({
      path: '.gitignore',
      description: 'Add environment files to git ignore'
    });

    // Local development files
    if (this.localDevelopment) {
      switch (this.name.toLowerCase()) {
        case 'supabase':
          preview.files.push({
            path: 'supabase/config.toml',
            description: 'Supabase local configuration'
          });
          break;
        case 'firebase':
          preview.files.push({
            path: 'firebase.json',
            description: 'Firebase configuration'
          });
          break;
      }
    }

    // Warnings
    if (this.pricing === 'paid') {
      preview.warnings.push(`${this.name} is a paid service - check pricing before deploying`);
    }

    if (this.envVarsRequired.length > 0) {
      preview.warnings.push(`Remember to set up environment variables before running the app`);
    }

    return preview;
  }

  /**
   * Get post-installation instructions
   * @param {Object} context - Installation context
   * @returns {Array} Instructions
   */
  getPostInstallInstructions(context) {
    const instructions = super.getPostInstallInstructions(context);
    
    // Environment setup
    instructions.push(
      '',
      `${this.name} Setup:`,
      `1. Copy .env.example to .env.local`,
      `2. Add your ${this.name} credentials to .env.local`
    );

    // Add environment variables
    const envVars = this.getEnvironmentVariables();
    if (envVars.length > 0) {
      instructions.push('', 'Required environment variables:');
      envVars.forEach(envVar => {
        instructions.push(`   ${envVar.key} - ${envVar.description}`);
      });
    }

    // Local development setup
    if (this.localDevelopment) {
      const setupCommands = this.getSetupCommands();
      if (setupCommands.length > 0) {
        instructions.push('', 'Local development setup:');
        setupCommands.forEach((cmd, index) => {
          instructions.push(`   ${index + 1}. ${cmd.description}: ${cmd.command}`);
        });
      }
    }

    // Service-specific instructions
    switch (this.name.toLowerCase()) {
      case 'supabase':
        instructions.push(
          '',
          'Create a Supabase project:',
          '   1. Go to https://supabase.com',
          '   2. Create a new project',
          '   3. Copy the URL and anon key to .env.local'
        );
        break;
      case 'firebase':
        instructions.push(
          '',
          'Set up Firebase:',
          '   1. Go to https://console.firebase.google.com',
          '   2. Create a new project',
          '   3. Add a web app',
          '   4. Copy the config to .env.local'
        );
        break;
    }

    return instructions;
  }
}