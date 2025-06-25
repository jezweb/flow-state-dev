/**
 * Auth Provider Module Type
 * 
 * Specialized module type for authentication providers like Auth0, Clerk, NextAuth, etc.
 * Handles user authentication, authorization, and session management.
 */
import { BaseStackModule } from './base-stack-module.js';

export class AuthProviderModule extends BaseStackModule {
  constructor(name, description, options = {}) {
    super(name, description, {
      ...options,
      moduleType: 'auth-provider',
      category: 'auth',
      provides: ['auth', ...(options.provides || [])],
      requires: ['frontend', ...(options.requires || [])]
    });

    // Auth provider specific properties
    this.authMethods = options.authMethods || ['email', 'social'];
    this.socialProviders = options.socialProviders || [];
    this.mfa = options.mfa || false;
    this.sso = options.sso || false;
    this.passwordless = options.passwordless || false;
    this.customization = options.customization || 'full';
    this.sessionManagement = options.sessionManagement || 'jwt';
    this.userManagement = options.userManagement !== false;
    this.rbac = options.rbac || false; // Role-based access control
    this.webhooks = options.webhooks || false;
    this.sdkType = options.sdkType || 'hosted'; // 'hosted', 'embedded', 'hybrid'
    this.compliance = options.compliance || []; // ['gdpr', 'soc2', 'hipaa']
  }

  /**
   * Get auth provider metadata
   * @returns {Object} Extended metadata
   */
  getMetadata() {
    return {
      ...super.getMetadata(),
      authMethods: this.authMethods,
      socialProviders: this.socialProviders,
      features: {
        mfa: this.mfa,
        sso: this.sso,
        passwordless: this.passwordless,
        rbac: this.rbac,
        webhooks: this.webhooks,
        userManagement: this.userManagement
      },
      sessionManagement: this.sessionManagement,
      sdkType: this.sdkType,
      compliance: this.compliance
    };
  }

  /**
   * Get auth provider dependencies
   * @returns {Object} Dependencies
   */
  getDependencies() {
    const deps = {};

    // Provider-specific SDKs
    switch (this.name.toLowerCase()) {
      case 'auth0':
        deps['@auth0/auth0-spa-js'] = '^2.0.0';
        break;
      case 'clerk':
        deps['@clerk/clerk-js'] = '^4.0.0';
        break;
      case 'supertokens':
        deps['supertokens-auth-react'] = '^0.35.0';
        deps['supertokens-web-js'] = '^0.7.0';
        break;
      case 'firebase-auth':
        deps['firebase'] = '^10.0.0';
        break;
      case 'aws-cognito':
        deps['amazon-cognito-identity-js'] = '^6.0.0';
        break;
    }

    // Additional dependencies for features
    if (this.sessionManagement === 'jwt') {
      deps['jwt-decode'] = '^4.0.0';
    }

    return deps;
  }

  /**
   * Get environment variables for auth provider
   * @returns {Array} Environment variable definitions
   */
  getEnvironmentVariables() {
    const vars = [];

    switch (this.name.toLowerCase()) {
      case 'auth0':
        vars.push(
          { key: 'VITE_AUTH0_DOMAIN', description: 'Auth0 domain' },
          { key: 'VITE_AUTH0_CLIENT_ID', description: 'Auth0 client ID' },
          { key: 'VITE_AUTH0_REDIRECT_URI', description: 'Auth0 redirect URI' }
        );
        break;
      case 'clerk':
        vars.push(
          { key: 'VITE_CLERK_PUBLISHABLE_KEY', description: 'Clerk publishable key' }
        );
        break;
      case 'supertokens':
        vars.push(
          { key: 'VITE_SUPERTOKENS_API_DOMAIN', description: 'SuperTokens API domain' },
          { key: 'VITE_SUPERTOKENS_WEBSITE_DOMAIN', description: 'Your website domain' }
        );
        break;
    }

    return vars;
  }

  /**
   * Generate auth provider configuration
   * @returns {string} Configuration code
   */
  getAuthConfig() {
    switch (this.name.toLowerCase()) {
      case 'auth0':
        return `import { createAuth0Client } from '@auth0/auth0-spa-js'

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: 'openid profile email'
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true
}

export let auth0Client = null

export async function initAuth0() {
  auth0Client = await createAuth0Client(auth0Config)
  return auth0Client
}

export function getAuth0Client() {
  if (!auth0Client) {
    throw new Error('Auth0 client not initialized')
  }
  return auth0Client
}`;

      case 'clerk':
        return `import Clerk from '@clerk/clerk-js'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error('Missing Clerk publishable key')
}

export const clerk = new Clerk(clerkPubKey)

export async function initClerk() {
  await clerk.load({
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
    afterSignInUrl: '/dashboard',
    afterSignUpUrl: '/onboarding'
  })
  return clerk
}`;

      case 'supertokens':
        return `import SuperTokens from 'supertokens-web-js'
import Session from 'supertokens-web-js/recipe/session'
import EmailPassword from 'supertokens-web-js/recipe/emailpassword'
import ThirdParty from 'supertokens-web-js/recipe/thirdparty'

export function initSuperTokens() {
  SuperTokens.init({
    appInfo: {
      appName: '${this.name}',
      apiDomain: import.meta.env.VITE_SUPERTOKENS_API_DOMAIN,
      websiteDomain: import.meta.env.VITE_SUPERTOKENS_WEBSITE_DOMAIN,
      apiBasePath: '/auth',
      websiteBasePath: '/auth'
    },
    recipeList: [
      Session.init(),
      EmailPassword.init(),
      ThirdParty.init()
    ]
  })
}`;

      default:
        return `// ${this.name} authentication configuration
// TODO: Add ${this.name} initialization code here

export async function init${this.name}() {
  // Initialize ${this.name}
}`;
    }
  }

  /**
   * Generate auth service implementation
   * @returns {Object} Auth service file
   */
  getAuthService() {
    const fileName = 'auth.js';
    let content = '';

    switch (this.name.toLowerCase()) {
      case 'auth0':
        content = `import { getAuth0Client, initAuth0 } from '../config/auth0'

class AuthService {
  constructor() {
    this.client = null
    this.initialized = false
  }

  async init() {
    if (this.initialized) return
    this.client = await initAuth0()
    this.initialized = true
  }

  async login(options = {}) {
    await this.init()
    await this.client.loginWithRedirect(options)
  }

  async logout(options = {}) {
    await this.init()
    await this.client.logout({
      returnTo: window.location.origin,
      ...options
    })
  }

  async getUser() {
    await this.init()
    try {
      return await this.client.getUser()
    } catch (error) {
      return null
    }
  }

  async getToken() {
    await this.init()
    try {
      return await this.client.getTokenSilently()
    } catch (error) {
      return null
    }
  }

  async isAuthenticated() {
    await this.init()
    return await this.client.isAuthenticated()
  }

  async handleCallback() {
    await this.init()
    await this.client.handleRedirectCallback()
  }

  onAuthStateChange(callback) {
    // Auth0 doesn't have built-in state change listeners
    // Implement polling or use the isAuthenticated method
    let previousState = null
    
    const checkAuth = async () => {
      const isAuth = await this.isAuthenticated()
      if (isAuth !== previousState) {
        previousState = isAuth
        const user = isAuth ? await this.getUser() : null
        callback(user)
      }
    }
    
    // Check immediately and then every second
    checkAuth()
    const interval = setInterval(checkAuth, 1000)
    
    // Return cleanup function
    return () => clearInterval(interval)
  }
}

export const authService = new AuthService()`;
        break;

      case 'clerk':
        content = `import { clerk, initClerk } from '../config/clerk'

class AuthService {
  constructor() {
    this.clerk = clerk
    this.initialized = false
  }

  async init() {
    if (this.initialized) return
    await initClerk()
    this.initialized = true
  }

  async login(options = {}) {
    await this.init()
    await this.clerk.openSignIn(options)
  }

  async logout() {
    await this.init()
    await this.clerk.signOut()
  }

  async getUser() {
    await this.init()
    return this.clerk.user
  }

  async getToken() {
    await this.init()
    const session = this.clerk.session
    if (!session) return null
    return await session.getToken()
  }

  async isAuthenticated() {
    await this.init()
    return !!this.clerk.user
  }

  onAuthStateChange(callback) {
    const handleUserChange = () => {
      callback(this.clerk.user)
    }
    
    // Listen to Clerk user changes
    this.clerk.addListener(handleUserChange)
    
    // Call immediately with current state
    handleUserChange()
    
    // Return cleanup function
    return () => {
      this.clerk.removeListener(handleUserChange)
    }
  }

  // Clerk-specific methods
  async openUserProfile() {
    await this.init()
    this.clerk.openUserProfile()
  }

  async openSignUp(options = {}) {
    await this.init()
    this.clerk.openSignUp(options)
  }
}

export const authService = new AuthService()`;
        break;

      default:
        content = `// ${this.name} authentication service
import { init${this.name} } from '../config/${this.name.toLowerCase()}'

class AuthService {
  constructor() {
    this.initialized = false
  }

  async init() {
    if (this.initialized) return
    await init${this.name}()
    this.initialized = true
  }

  async login(credentials) {
    await this.init()
    // TODO: Implement login
  }

  async logout() {
    await this.init()
    // TODO: Implement logout
  }

  async getUser() {
    await this.init()
    // TODO: Implement get user
  }

  async isAuthenticated() {
    await this.init()
    // TODO: Implement auth check
  }

  onAuthStateChange(callback) {
    // TODO: Implement auth state listener
  }
}

export const authService = new AuthService()`;
    }

    return {
      path: `src/services/${fileName}`,
      content
    };
  }

  /**
   * Generate auth guard/middleware
   * @param {string} framework - Frontend framework
   * @returns {Object} Auth guard file
   */
  getAuthGuard(framework) {
    let path, content;

    if (framework === 'vue') {
      path = 'src/router/guards/auth.js';
      content = `import { authService } from '@/services/auth'

export async function requireAuth(to, from, next) {
  await authService.init()
  const isAuthenticated = await authService.isAuthenticated()
  
  if (!isAuthenticated) {
    // Store the intended destination
    sessionStorage.setItem('redirectAfterLogin', to.fullPath)
    next('/login')
  } else {
    next()
  }
}

export async function requireGuest(to, from, next) {
  await authService.init()
  const isAuthenticated = await authService.isAuthenticated()
  
  if (isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
}`;
    } else if (framework === 'react') {
      path = 'src/components/auth/ProtectedRoute.jsx';
      content = `import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authService } from '@/services/auth'

export function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      await authService.init()
      const auth = await authService.isAuthenticated()
      setIsAuthenticated(auth)
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    // Store the intended destination
    sessionStorage.setItem('redirectAfterLogin', location.pathname)
    return <Navigate to="/login" replace />
  }

  return children
}`;
    }

    return { path, content };
  }

  /**
   * Generate auth components
   * @param {string} framework - Frontend framework
   * @returns {Array} Auth component files
   */
  getAuthComponents(framework) {
    const components = [];
    const ext = framework === 'vue' ? 'vue' : 'jsx';

    // Login component
    if (framework === 'vue') {
      components.push({
        path: `src/components/auth/LoginForm.${ext}`,
        description: 'Login form component',
        content: `<template>
  <div class="login-form">
    <h2>Sign In</h2>
    <button @click="handleLogin" class="login-button">
      Sign in with ${this.name}
    </button>
  </div>
</template>

<script setup>
import { authService } from '@/services/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

async function handleLogin() {
  try {
    await authService.login()
    // Redirect handled by auth provider
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>`
      });
    } else {
      components.push({
        path: `src/components/auth/LoginForm.${ext}`,
        description: 'Login form component',
        content: `import { authService } from '@/services/auth'
import { useNavigate } from 'react-router-dom'

export function LoginForm() {
  const navigate = useNavigate()

  async function handleLogin() {
    try {
      await authService.login()
      // Redirect handled by auth provider
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="login-form">
      <h2>Sign In</h2>
      <button onClick={handleLogin} className="login-button">
        Sign in with ${this.name}
      </button>
    </div>
  )
}`
      });
    }

    // User profile component
    if (framework === 'vue') {
      components.push({
        path: `src/components/auth/UserProfile.${ext}`,
        description: 'User profile display component',
        content: `<template>
  <div v-if="user" class="user-profile">
    <img v-if="user.picture" :src="user.picture" :alt="user.name" />
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    <button @click="handleLogout">Sign Out</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authService } from '@/services/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

onMounted(async () => {
  user.value = await authService.getUser()
})

async function handleLogout() {
  await authService.logout()
  router.push('/')
}
</script>`
      });
    }

    return components;
  }

  /**
   * Check compatibility with other modules
   * @param {Array} otherModules - Other selected modules
   * @returns {Object} Compatibility result
   */
  checkCompatibility(otherModules) {
    const result = super.checkCompatibility(otherModules);
    
    // Check for backend service with auth
    const backendWithAuth = otherModules.find(m => 
      m.moduleType === 'backend-service' && m.features?.auth
    );
    
    if (backendWithAuth) {
      result.warnings.push({
        type: 'auth-duplication',
        message: `Both ${this.name} and ${backendWithAuth.name} provide authentication`
      });
    }

    // Check for multiple auth providers
    const otherAuthProviders = otherModules.filter(m => 
      m.moduleType === 'auth-provider' && m.name !== this.name
    );
    
    if (otherAuthProviders.length > 0) {
      result.issues.push({
        type: 'multiple-auth',
        message: `Multiple auth providers selected: ${this.name} and ${otherAuthProviders.map(m => m.name).join(', ')}`
      });
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

    const framework = projectAnalysis?.framework?.name || 'vue';

    // Configuration file
    preview.files.push({
      path: `src/config/${this.name.toLowerCase()}.js`,
      description: `${this.name} configuration`
    });

    // Auth service
    const authService = this.getAuthService();
    preview.files.push({
      path: authService.path,
      description: 'Authentication service'
    });

    // Auth guard/middleware
    const authGuard = this.getAuthGuard(framework);
    if (authGuard) {
      preview.files.push({
        path: authGuard.path,
        description: 'Authentication guard/middleware'
      });
    }

    // Auth components
    const components = this.getAuthComponents(framework);
    components.forEach(comp => {
      preview.files.push({
        path: comp.path,
        description: comp.description
      });
    });

    // Environment files
    preview.files.push({
      path: '.env.example',
      description: 'Environment variables template'
    });

    // Modifications
    preview.modifications.push({
      path: 'package.json',
      description: `Add ${this.name} SDK`
    });

    if (framework === 'vue') {
      preview.modifications.push({
        path: 'src/router/index.js',
        description: 'Add auth guards to routes'
      });
    }

    preview.modifications.push({
      path: 'src/main.js',
      description: `Initialize ${this.name}`
    });

    // Warnings
    if (this.sdkType === 'hosted') {
      preview.warnings.push(`${this.name} uses hosted authentication pages`);
    }

    if (this.compliance.length > 0) {
      preview.warnings.push(`${this.name} compliance: ${this.compliance.join(', ')}`);
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
    
    instructions.push(
      '',
      `${this.name} Setup:`,
      `1. Create an account at ${this.name}`,
      `2. Create a new application`,
      `3. Copy credentials to .env.local`
    );

    // Provider-specific instructions
    switch (this.name.toLowerCase()) {
      case 'auth0':
        instructions.push(
          '',
          'Auth0 Configuration:',
          '- Add allowed callback URLs: http://localhost:3000/callback',
          '- Add allowed logout URLs: http://localhost:3000',
          '- Add allowed web origins: http://localhost:3000'
        );
        break;
      case 'clerk':
        instructions.push(
          '',
          'Clerk Configuration:',
          '- Set up sign-in/sign-up URLs in Clerk dashboard',
          '- Configure social providers if needed',
          '- Customize the appearance to match your brand'
        );
        break;
    }

    // Feature-specific instructions
    if (this.socialProviders.length > 0) {
      instructions.push(
        '',
        'Social Login Providers:',
        ...this.socialProviders.map(p => `- Configure ${p} in ${this.name} dashboard`)
      );
    }

    if (this.mfa) {
      instructions.push(
        '',
        'Multi-Factor Authentication:',
        '- Enable MFA in provider dashboard',
        '- Configure MFA methods (SMS, TOTP, etc.)'
      );
    }

    return instructions;
  }
}