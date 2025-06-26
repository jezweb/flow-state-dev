import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AuthProviderModule } from '../../lib/modules/types/auth-provider-module.js';

describe('AuthProviderModule', () => {
  let auth0Module;
  let clerkModule;
  let superTokensModule;

  beforeEach(() => {
    auth0Module = new AuthProviderModule('auth0', 'Auth0 Authentication', {
      authMethods: ['email', 'social'],
      socialProviders: ['google', 'github', 'facebook'],
      mfa: true,
      sso: true,
      passwordless: false,
      customization: 'full',
      sessionManagement: 'jwt',
      userManagement: true,
      rbac: true,
      webhooks: true,
      sdkType: 'hosted',
      compliance: ['soc2', 'gdpr']
    });

    clerkModule = new AuthProviderModule('clerk', 'Clerk Authentication', {
      authMethods: ['email', 'social', 'phone'],
      socialProviders: ['google', 'github'],
      mfa: true,
      passwordless: true,
      customization: 'full',
      sessionManagement: 'jwt',
      userManagement: true,
      rbac: false,
      sdkType: 'embedded'
    });

    superTokensModule = new AuthProviderModule('supertokens', 'SuperTokens Authentication', {
      authMethods: ['email', 'social'],
      socialProviders: ['google', 'github'],
      mfa: false,
      sso: false,
      passwordless: false,
      customization: 'full',
      sessionManagement: 'session',
      sdkType: 'hybrid'
    });
  });

  describe('constructor', () => {
    it('should create an auth provider module with correct defaults', () => {
      expect(auth0Module.name).toBe('auth0');
      expect(auth0Module.moduleType).toBe('auth-provider');
      expect(auth0Module.category).toBe('auth');
      expect(auth0Module.provides).toContain('auth');
      expect(auth0Module.requires).toContain('frontend');
      expect(auth0Module.authMethods).toContain('email');
      expect(auth0Module.authMethods).toContain('social');
      expect(auth0Module.socialProviders).toContain('google');
    });

    it('should set default values correctly', () => {
      const defaultModule = new AuthProviderModule('test-auth', 'Test Auth Provider');
      expect(defaultModule.authMethods).toEqual(['email', 'social']);
      expect(defaultModule.socialProviders).toEqual([]);
      expect(defaultModule.mfa).toBe(false);
      expect(defaultModule.sso).toBe(false);
      expect(defaultModule.passwordless).toBe(false);
      expect(defaultModule.customization).toBe('full');
      expect(defaultModule.sessionManagement).toBe('jwt');
      expect(defaultModule.userManagement).toBe(true);
      expect(defaultModule.rbac).toBe(false);
      expect(defaultModule.sdkType).toBe('hosted');
    });
  });

  describe('getMetadata', () => {
    it('should return extended metadata', () => {
      const metadata = auth0Module.getMetadata();
      
      expect(metadata).toHaveProperty('authMethods');
      expect(metadata.authMethods).toContain('email');
      expect(metadata.authMethods).toContain('social');
      expect(metadata).toHaveProperty('socialProviders');
      expect(metadata.socialProviders).toContain('google');
      expect(metadata.features).toHaveProperty('mfa', true);
      expect(metadata.features).toHaveProperty('sso', true);
      expect(metadata.features).toHaveProperty('rbac', true);
      expect(metadata.features).toHaveProperty('webhooks', true);
      expect(metadata).toHaveProperty('sessionManagement', 'jwt');
      expect(metadata).toHaveProperty('sdkType', 'hosted');
      expect(metadata).toHaveProperty('compliance');
      expect(metadata.compliance).toContain('soc2');
    });
  });

  describe('getDependencies', () => {
    it('should return correct dependencies for Auth0', () => {
      const deps = auth0Module.getDependencies();
      
      expect(deps).toHaveProperty('@auth0/auth0-spa-js');
    });

    it('should return correct dependencies for Clerk', () => {
      const deps = clerkModule.getDependencies();
      
      expect(deps).toHaveProperty('@clerk/clerk-js');
    });

    it('should return correct dependencies for SuperTokens', () => {
      const deps = superTokensModule.getDependencies();
      
      expect(deps).toHaveProperty('supertokens-auth-react');
      expect(deps).toHaveProperty('supertokens-web-js');
    });

    it('should include JWT dependencies when JWT session management is used', () => {
      const deps = auth0Module.getDependencies();
      
      expect(deps).toHaveProperty('jwt-decode');
    });

    it('should handle unknown provider gracefully', () => {
      const unknownModule = new AuthProviderModule('unknown-auth', 'Unknown Auth');
      const deps = unknownModule.getDependencies();
      
      // Should include JWT decode but not provider-specific dependencies
      expect(deps).toHaveProperty('jwt-decode');
      expect(Object.keys(deps)).toHaveLength(1);
    });
  });

  describe('getEnvironmentVariables', () => {
    it('should return correct environment variables for Auth0', () => {
      const vars = auth0Module.getEnvironmentVariables();
      
      expect(vars).toHaveLength(3);
      expect(vars.find(v => v.key === 'VITE_AUTH0_DOMAIN')).toBeDefined();
      expect(vars.find(v => v.key === 'VITE_AUTH0_CLIENT_ID')).toBeDefined();
      expect(vars.find(v => v.key === 'VITE_AUTH0_REDIRECT_URI')).toBeDefined();
    });

    it('should return correct environment variables for Clerk', () => {
      const vars = clerkModule.getEnvironmentVariables();
      
      expect(vars).toHaveLength(1);
      expect(vars.find(v => v.key === 'VITE_CLERK_PUBLISHABLE_KEY')).toBeDefined();
    });

    it('should return correct environment variables for SuperTokens', () => {
      const vars = superTokensModule.getEnvironmentVariables();
      
      expect(vars).toHaveLength(2);
      expect(vars.find(v => v.key === 'VITE_SUPERTOKENS_API_DOMAIN')).toBeDefined();
      expect(vars.find(v => v.key === 'VITE_SUPERTOKENS_WEBSITE_DOMAIN')).toBeDefined();
    });

    it('should return empty array for unknown providers', () => {
      const unknownModule = new AuthProviderModule('unknown-auth', 'Unknown Auth');
      const vars = unknownModule.getEnvironmentVariables();
      
      expect(vars).toHaveLength(0);
    });
  });

  describe('getAuthConfig', () => {
    it('should generate valid Auth0 configuration', () => {
      const config = auth0Module.getAuthConfig();
      
      expect(config).toContain("import { createAuth0Client } from '@auth0/auth0-spa-js'");
      expect(config).toContain('VITE_AUTH0_DOMAIN');
      expect(config).toContain('VITE_AUTH0_CLIENT_ID');
      expect(config).toContain('authorizationParams');
      expect(config).toContain('export let auth0Client');
      expect(config).toContain('export async function initAuth0');
      expect(config).toContain('export function getAuth0Client');
    });

    it('should generate valid Clerk configuration', () => {
      const config = clerkModule.getAuthConfig();
      
      expect(config).toContain("import Clerk from '@clerk/clerk-js'");
      expect(config).toContain('VITE_CLERK_PUBLISHABLE_KEY');
      expect(config).toContain('export const clerk');
      expect(config).toContain('export async function initClerk');
      expect(config).toContain('signInUrl');
      expect(config).toContain('afterSignInUrl');
    });

    it('should generate valid SuperTokens configuration', () => {
      const config = superTokensModule.getAuthConfig();
      
      expect(config).toContain("import SuperTokens from 'supertokens-web-js'");
      expect(config).toContain("import Session from 'supertokens-web-js/recipe/session'");
      expect(config).toContain('VITE_SUPERTOKENS_API_DOMAIN');
      expect(config).toContain('export function initSuperTokens');
      expect(config).toContain('recipeList');
    });

    it('should generate fallback configuration for unknown providers', () => {
      const unknownModule = new AuthProviderModule('unknown-auth', 'Unknown Auth');
      const config = unknownModule.getAuthConfig();
      
      expect(config).toContain('// unknown-auth authentication configuration');
      expect(config).toContain('TODO: Add unknown-auth initialization');
    });
  });

  describe('getAuthService', () => {
    it('should generate Auth0 service implementation', () => {
      const service = auth0Module.getAuthService();
      
      expect(service.path).toBe('src/services/auth.js');
      expect(service.content).toContain("import { getAuth0Client, initAuth0 } from '../config/auth0'");
      expect(service.content).toContain('class AuthService');
      expect(service.content).toContain('async login');
      expect(service.content).toContain('async logout');
      expect(service.content).toContain('async getUser');
      expect(service.content).toContain('async getToken');
      expect(service.content).toContain('async isAuthenticated');
      expect(service.content).toContain('onAuthStateChange');
      expect(service.content).toContain('export const authService');
    });

    it('should generate Clerk service implementation', () => {
      const service = clerkModule.getAuthService();
      
      expect(service.path).toBe('src/services/auth.js');
      expect(service.content).toContain("import { clerk, initClerk } from '../config/clerk'");
      expect(service.content).toContain('class AuthService');
      expect(service.content).toContain('openUserProfile');
      expect(service.content).toContain('openSignUp');
      expect(service.content).toContain('this.clerk.addListener');
    });

    it('should generate fallback service for unknown providers', () => {
      const unknownModule = new AuthProviderModule('unknown-auth', 'Unknown Auth');
      const service = unknownModule.getAuthService();
      
      expect(service.content).toContain('// unknown-auth authentication service');
      expect(service.content).toContain('TODO: Implement login');
    });
  });

  describe('getAuthGuard', () => {
    it('should generate Vue auth guard', () => {
      const guard = auth0Module.getAuthGuard('vue');
      
      expect(guard.path).toBe('src/router/guards/auth.js');
      expect(guard.content).toContain("import { authService } from '@/services/auth'");
      expect(guard.content).toContain('export async function requireAuth');
      expect(guard.content).toContain('export async function requireGuest');
      expect(guard.content).toContain('sessionStorage.setItem');
      expect(guard.content).toContain("next('/login')");
    });

    it('should generate React protected route', () => {
      const guard = auth0Module.getAuthGuard('react');
      
      expect(guard.path).toBe('src/components/auth/ProtectedRoute.jsx');
      expect(guard.content).toContain("import { useEffect, useState } from 'react'");
      expect(guard.content).toContain("import { Navigate, useLocation } from 'react-router-dom'");
      expect(guard.content).toContain('export function ProtectedRoute');
      expect(guard.content).toContain('if (loading)');
      expect(guard.content).toContain('<Navigate to="/login"');
    });

    it('should handle unknown frameworks', () => {
      const guard = auth0Module.getAuthGuard('unknown');
      
      expect(guard.path).toBeUndefined();
      expect(guard.content).toBeUndefined();
    });
  });

  describe('getAuthComponents', () => {
    it('should generate Vue auth components', () => {
      const components = auth0Module.getAuthComponents('vue');
      
      expect(components).toHaveLength(2);
      
      const loginForm = components.find(c => c.path.includes('LoginForm.vue'));
      expect(loginForm).toBeDefined();
      expect(loginForm.content).toContain('<template>');
      expect(loginForm.content).toContain('<script setup>');
      expect(loginForm.content).toContain('handleLogin');
      
      const userProfile = components.find(c => c.path.includes('UserProfile.vue'));
      expect(userProfile).toBeDefined();
      expect(userProfile.content).toContain('handleLogout');
    });

    it('should generate React auth components', () => {
      const components = auth0Module.getAuthComponents('react');
      
      expect(components).toHaveLength(1);
      
      const loginForm = components.find(c => c.path.includes('LoginForm.jsx'));
      expect(loginForm).toBeDefined();
      expect(loginForm.content).toContain('export function LoginForm');
      expect(loginForm.content).toContain('async function handleLogin');
    });

    it('should customize component content based on provider', () => {
      const components = clerkModule.getAuthComponents('vue');
      
      const loginForm = components[0];
      expect(loginForm.content).toContain('Sign in with clerk');
    });
  });

  describe('checkCompatibility', () => {
    it('should warn about backend service with auth overlap', () => {
      const backendWithAuth = {
        name: 'supabase',
        moduleType: 'backend-service',
        features: { auth: true }
      };
      
      const result = auth0Module.checkCompatibility([backendWithAuth]);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('auth-duplication');
      expect(result.warnings[0].message).toContain('Both auth0 and supabase provide authentication');
    });

    it('should detect multiple auth providers conflict', () => {
      const otherAuthProvider = {
        name: 'clerk',
        moduleType: 'auth-provider',
        provides: ['auth']
      };
      
      const result = auth0Module.checkCompatibility([otherAuthProvider]);
      
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('multiple-auth');
      expect(result.issues[0].message).toContain('Multiple auth providers selected');
    });

    it('should pass compatibility with non-auth modules', () => {
      const frontendModule = {
        name: 'vue3',
        moduleType: 'frontend-framework',
        provides: ['frontend']
      };
      
      const result = auth0Module.checkCompatibility([frontendModule]);
      
      expect(result.issues).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should not warn when backend service does not provide auth', () => {
      const backendWithoutAuth = {
        name: 'custom-api',
        moduleType: 'backend-service',
        features: { auth: false },
        provides: ['backend', 'database']
      };
      
      const result = auth0Module.checkCompatibility([backendWithoutAuth]);
      
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('previewChanges', () => {
    it('should return preview of all files for Vue project', async () => {
      const preview = await auth0Module.previewChanges('/test/path', { 
        framework: { name: 'vue' } 
      });
      
      expect(preview.files.length).toBeGreaterThan(0);
      expect(preview.modifications.length).toBeGreaterThan(0);
      
      // Configuration file
      const configFile = preview.files.find(f => f.path.includes('config/auth0.js'));
      expect(configFile).toBeDefined();
      
      // Auth service
      const authService = preview.files.find(f => f.path.includes('services/auth.js'));
      expect(authService).toBeDefined();
      
      // Auth guard
      const authGuard = preview.files.find(f => f.path.includes('router/guards/auth.js'));
      expect(authGuard).toBeDefined();
      
      // Auth components
      const loginForm = preview.files.find(f => f.path.includes('LoginForm.vue'));
      expect(loginForm).toBeDefined();
      
      // Environment files
      const envExample = preview.files.find(f => f.path === '.env.example');
      expect(envExample).toBeDefined();
    });

    it('should include React-specific modifications', async () => {
      const preview = await clerkModule.previewChanges('/test/path', { 
        framework: { name: 'react' } 
      });
      
      const protectedRoute = preview.files.find(f => f.path.includes('ProtectedRoute.jsx'));
      expect(protectedRoute).toBeDefined();
    });

    it('should include warnings for hosted SDK type', async () => {
      const preview = await auth0Module.previewChanges('/test/path', {});
      
      expect(preview.warnings).toContain('auth0 uses hosted authentication pages');
    });

    it('should include compliance warnings', async () => {
      const preview = await auth0Module.previewChanges('/test/path', {});
      
      expect(preview.warnings).toContain('auth0 compliance: soc2, gdpr');
    });

    it('should not include compliance warnings when no compliance specified', async () => {
      const preview = await clerkModule.previewChanges('/test/path', {});
      
      const complianceWarning = preview.warnings.find(w => w.includes('compliance'));
      expect(complianceWarning).toBeUndefined();
    });
  });

  describe('getPostInstallInstructions', () => {
    it('should return comprehensive instructions for Auth0', () => {
      const instructions = auth0Module.getPostInstallInstructions({});
      
      expect(instructions).toContain('auth0 Setup:');
      expect(instructions).toContain('1. Create an account at auth0');
      expect(instructions).toContain('2. Create a new application');
      expect(instructions).toContain('3. Copy credentials to .env.local');
      
      // Auth0-specific configuration
      expect(instructions).toContain('Auth0 Configuration:');
      expect(instructions.join(' ')).toContain('Add allowed callback URLs');
      expect(instructions).toContain('- Add allowed logout URLs');
      expect(instructions).toContain('- Add allowed web origins');
      
      // Social providers
      expect(instructions).toContain('Social Login Providers:');
      expect(instructions).toContain('- Configure google in auth0 dashboard');
      expect(instructions).toContain('- Configure github in auth0 dashboard');
      
      // MFA
      expect(instructions).toContain('Multi-Factor Authentication:');
      expect(instructions).toContain('- Enable MFA in provider dashboard');
    });

    it('should return Clerk-specific instructions', () => {
      const instructions = clerkModule.getPostInstallInstructions({});
      
      expect(instructions).toContain('clerk Setup:');
      expect(instructions).toContain('Clerk Configuration:');
      expect(instructions).toContain('- Set up sign-in/sign-up URLs in Clerk dashboard');
      expect(instructions).toContain('- Configure social providers if needed');
    });

    it('should not include MFA instructions when MFA is disabled', () => {
      const instructions = superTokensModule.getPostInstallInstructions({});
      
      expect(instructions.join(' ')).not.toContain('Multi-Factor Authentication');
    });

    it('should not include social provider instructions when none specified', () => {
      const noSocialModule = new AuthProviderModule('no-social', 'No Social Auth', {
        socialProviders: []
      });
      
      const instructions = noSocialModule.getPostInstallInstructions({});
      
      expect(instructions.join(' ')).not.toContain('Social Login Providers');
    });
  });

  describe('edge cases', () => {
    it('should handle modules without metadata', () => {
      const minimalModule = new AuthProviderModule('minimal', 'Minimal Auth');
      const metadata = minimalModule.getMetadata();
      
      expect(metadata.name).toBe('minimal');
      expect(metadata.authMethods).toEqual(['email', 'social']);
    });

    it('should handle empty social providers array', () => {
      const noSocialModule = new AuthProviderModule('no-social', 'No Social Auth', {
        socialProviders: []
      });
      
      const metadata = noSocialModule.getMetadata();
      expect(metadata.socialProviders).toEqual([]);
    });

    it('should handle unknown session management types', () => {
      const customSessionModule = new AuthProviderModule('custom-session', 'Custom Session', {
        sessionManagement: 'custom'
      });
      
      const deps = customSessionModule.getDependencies();
      expect(deps).not.toHaveProperty('jwt-decode'); // Should not include JWT for custom session management
    });

    it('should handle missing framework in auth guard generation', () => {
      const guard = auth0Module.getAuthGuard(null);
      
      expect(guard.path).toBeUndefined();
      expect(guard.content).toBeUndefined();
    });
  });

  describe('configuration generation', () => {
    it('should include proper error handling in Auth0 config', () => {
      const config = auth0Module.getAuthConfig();
      
      expect(config).toContain('throw new Error');
      expect(config).toContain('Auth0 client not initialized');
    });

    it('should include proper validation in Clerk config', () => {
      const config = clerkModule.getAuthConfig();
      
      expect(config).toContain('Missing Clerk publishable key');
    });

    it('should generate proper async/await patterns', () => {
      const service = auth0Module.getAuthService();
      
      expect(service.content).toContain('async init()');
      expect(service.content).toContain('await this.init()');
      expect(service.content).toContain('try {');
      expect(service.content).toContain('} catch (error) {');
    });
  });
});