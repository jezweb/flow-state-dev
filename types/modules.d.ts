/**
 * TypeScript definitions for Flow State Dev Module System
 */

export type ModuleType = 
  | 'frontend-framework'
  | 'ui-library'
  | 'backend-service'
  | 'auth-provider'
  | 'backend-framework'
  | 'database'
  | 'deployment'
  | 'testing'
  | 'monitoring'
  | 'custom';

export type ModuleCategory = 
  | 'frontend'
  | 'backend'
  | 'ui'
  | 'auth'
  | 'data'
  | 'devops'
  | 'tooling'
  | 'other';

export type ModulePriority = 'low' | 'medium' | 'high';

export type MergeStrategy = 
  | 'replace'
  | 'append'
  | 'append-unique'
  | 'prepend'
  | 'merge-json'
  | 'merge-json-shallow'
  | 'merge-routes'
  | 'merge-stores'
  | 'merge-entry'
  | 'merge-config'
  | 'merge-eslint'
  | 'merge-vite-config'
  | 'custom';

export interface ModuleMetadata {
  name: string;
  description: string;
  version: string;
  moduleType: ModuleType;
  category: ModuleCategory;
  provides: string[];
  requires: string[];
  compatibleWith: string[];
  incompatibleWith: string[];
  author?: string;
  keywords?: string[];
  homepage?: string;
  repository?: string;
}

export interface CompatibilityIssue {
  type: 'incompatible' | 'missing-requirement' | 'framework-ui-mismatch' | 'multiple-backends' | 'multiple-auth';
  module?: string;
  requirement?: string;
  message: string;
}

export interface CompatibilityWarning {
  type: 'recommended' | 'missing-state-management' | 'auth-overlap' | 'deployment-mismatch' | 'missing-database';
  module?: string;
  message: string;
}

export interface CompatibilityResult {
  compatible: boolean;
  issues: CompatibilityIssue[];
  warnings: CompatibilityWarning[];
}

export interface TemplateFile {
  path: string;
  absolute: string;
  size: number;
  isTemplate: boolean;
}

export interface TemplateInfo {
  files: TemplateFile[];
  directories: string[];
}

export interface PreviewFile {
  path: string;
  description: string;
}

export interface PreviewModification {
  path: string;
  description: string;
}

export interface PreviewResult {
  files: PreviewFile[];
  modifications: PreviewModification[];
  warnings: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigSchema {
  type: 'object';
  properties: Record<string, any>;
}

export interface ProjectAnalysis {
  isNewProject?: boolean;
  framework?: {
    name: string;
    version?: string;
  };
  [key: string]: any;
}

// Base Stack Module Interface
export interface IBaseStackModule {
  name: string;
  description: string;
  version: string;
  moduleType: ModuleType;
  category: ModuleCategory;
  templatePath: string | null;
  compatibleWith: string[];
  incompatibleWith: string[];
  provides: string[];
  requires: string[];
  defaultConfig: Record<string, any>;
  mergeStrategies: Record<string, MergeStrategy>;
  setupInstructions: string[];
  postInstallSteps: string[];

  // Methods
  getMetadata(): ModuleMetadata;
  checkCompatibility(otherModules: IBaseStackModule[]): CompatibilityResult;
  getTemplateFiles(): Promise<TemplateInfo>;
  isTemplateFile(filePath: string): boolean;
  getMergeStrategy(filePath: string): MergeStrategy;
  getConfigSchema(): ConfigSchema;
  transformTemplate(content: string, variables: Record<string, any>): string;
  getPostInstallInstructions(context: Record<string, any>): string[];
  validateConfig(config: Record<string, any>): ValidationResult;
  canApply(projectAnalysis: ProjectAnalysis): Promise<{ canApply: boolean; reason?: string; requirements?: string[] }>;
  previewChanges(projectPath: string, projectAnalysis: ProjectAnalysis): Promise<PreviewResult>;
  applyFeature(projectPath: string, projectAnalysis: ProjectAnalysis, options?: Record<string, any>): Promise<{ success: boolean; changes: any[]; errors?: any[] }>;
  validateApplication(projectPath: string): Promise<{ valid: boolean; issues?: string[] }>;
  formatDisplay(options?: { selected?: boolean; showDetails?: boolean }): string;
}

// Frontend Framework Module Interface
export interface IFrontendFrameworkModule extends IBaseStackModule {
  framework: string;
  buildTool: string;
  typescript: boolean;
  packageManager: string;
  stateManagement: string | null;
  routing: boolean;
  testing: string[];
  linting: boolean;
  formatting: boolean;

  getDevDependencies(): Record<string, string>;
  getScripts(): Record<string, string>;
  getConfigFiles(): Array<{ path: string; content: string }>;
  getEntryPoint(): { path: string; template: string };
  getViteConfig(): string;
  getTsConfig(): string;
  getEslintConfig(): string;
  getPrettierConfig(): string;
  getMergeStrategies(): Record<string, MergeStrategy>;
}

// UI Library Module Interface
export interface IUILibraryModule extends IBaseStackModule {
  libraryType: 'component' | 'utility';
  compatibleFrameworks: string[];
  themeSupport: boolean;
  darkModeSupport: boolean;
  customization: 'full' | 'limited' | 'none';
  iconSet: string | null;
  responsiveDesign: boolean;
  accessibility: string;
  cssFramework: string | null;
  componentsPath: string;
  stylesPath: string;

  getDependencies(): Record<string, string>;
  getDevDependencies(): Record<string, string>;
  getConfigFiles(): Array<{ path: string; content: string }>;
  getStyleImports(): string[];
  getFrameworkSetup(framework: string): {
    imports: string[];
    plugins: string[];
    config: string[];
  };
  getTailwindConfig(): string;
  getPostCSSConfig(): string;
  getThemeConfig(): string;
  getComponentExamples(framework: string): PreviewFile[];
}

// Backend Service Module Interface
export interface IBackendServiceModule extends IBaseStackModule {
  serviceType: 'baas' | 'database' | 'auth' | 'storage';
  features: {
    database: boolean;
    auth: boolean;
    storage: boolean;
    realtime: boolean;
    functions: boolean;
  };
  localDevelopment: boolean;
  cloudProvider: string | null;
  pricing: string;
  sdkLanguages: string[];
  envVarsRequired: Array<string | { key: string; description: string }>;
  setupCommands: Array<{ command: string; description: string }>;
  configPath: string;
  servicesPath: string;

  getDependencies(): Record<string, string>;
  getDevDependencies(): Record<string, string>;
  getEnvironmentVariables(): Array<{ key: string; description: string }>;
  getClientConfig(): string;
  getAuthService(): { path: string; content: string };
  getDatabaseService(): { path: string; content: string };
  getStorageService(): { path: string; content: string } | null;
  getSetupCommands(): Array<{ command: string; description: string }>;
}

// Auth Provider Module Interface
export interface IAuthProviderModule extends IBaseStackModule {
  authMethods: string[];
  socialProviders: string[];
  mfa: boolean;
  sso: boolean;
  passwordless: boolean;
  customization: string;
  sessionManagement: string;
  userManagement: boolean;
  rbac: boolean;
  webhooks: boolean;
  sdkType: 'hosted' | 'embedded' | 'hybrid';
  compliance: string[];

  getDependencies(): Record<string, string>;
  getEnvironmentVariables(): Array<{ key: string; description: string }>;
  getAuthConfig(): string;
  getAuthService(): { path: string; content: string };
  getAuthGuard(framework: string): { path: string; content: string };
  getAuthComponents(framework: string): Array<{ path: string; description: string; content: string }>;
}

// Backend Framework Module Interface
export interface IBackendFrameworkModule extends IBaseStackModule {
  framework: string;
  serverType: 'http' | 'websocket' | 'graphql';
  typescript: boolean;
  middleware: string[];
  cors: boolean;
  helmet: boolean;
  compression: boolean;
  rateLimit: boolean;
  validation: string;
  orm: string | null;
  testing: string[];
  monitoring: string[];
  deployment: string;
  apiPath: string;
  routesPath: string;

  getDependencies(): Record<string, string>;
  getDevDependencies(): Record<string, string>;
  getScripts(): Record<string, string>;
  getServerCode(): string;
  getRouterCode(): string;
  getExampleRoute(): { path: string; content: string };
  getConfigFiles(): Array<{ path: string; content: string }>;
}

// Stack Preset Interface
export interface StackPreset {
  name: string;
  description: string;
  modules: string[];
  tags: string[];
  recommended: boolean;
}

// Validation Result for Stack
export interface StackValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: Array<{
    type: 'missing-requirement' | 'recommendation';
    requirement?: string;
    message?: string;
    suggestions: string[];
  }>;
}

// Dependency Graph
export interface DependencyGraph {
  nodes: Array<{
    id: string;
    name: string;
    type: ModuleType;
    category: ModuleCategory;
    provides: string[];
    requires: string[];
  }>;
  edges: Array<{
    from: string;
    to: string;
    label: string;
  }>;
  levels: string[][];
}

// Module Registry Interface
export interface IStackModuleRegistry {
  register(module: IBaseStackModule): void;
  get(name: string): IBaseStackModule | undefined;
  getAll(): IBaseStackModule[];
  getModulesByType(moduleType: ModuleType): IBaseStackModule[];
  getModulesByCategory(category: ModuleCategory): IBaseStackModule[];
  getModulesByProvider(feature: string): IBaseStackModule[];
  getFrontendFrameworks(): IFrontendFrameworkModule[];
  getUILibraries(framework?: string): IUILibraryModule[];
  getBackendServices(): IBackendServiceModule[];
  getAuthProviders(): IAuthProviderModule[];
  getBackendFrameworks(): IBackendFrameworkModule[];
  validateStack(selectedModules: IBaseStackModule[]): StackValidationResult;
  getStackPresets(): StackPreset[];
  resolvePreset(preset: StackPreset): IBaseStackModule[];
  generateDependencyGraph(modules: IBaseStackModule[]): DependencyGraph;
  autoLoadModules(modulesPath?: string): Promise<void>;
  exportState(): Record<string, any>;
  displayStatus(): void;
}

// Module Constants
export declare const MODULE_TYPES: {
  readonly FRONTEND_FRAMEWORK: 'frontend-framework';
  readonly UI_LIBRARY: 'ui-library';
  readonly BACKEND_SERVICE: 'backend-service';
  readonly AUTH_PROVIDER: 'auth-provider';
  readonly BACKEND_FRAMEWORK: 'backend-framework';
  readonly DATABASE: 'database';
  readonly DEPLOYMENT: 'deployment';
  readonly TESTING: 'testing';
  readonly MONITORING: 'monitoring';
  readonly CUSTOM: 'custom';
};

export declare const MODULE_CATEGORIES: {
  readonly FRONTEND: 'frontend';
  readonly BACKEND: 'backend';
  readonly UI: 'ui';
  readonly AUTH: 'auth';
  readonly DATA: 'data';
  readonly DEVOPS: 'devops';
  readonly TOOLING: 'tooling';
  readonly OTHER: 'other';
};

export declare const MODULE_PROVIDES: {
  readonly FRONTEND: 'frontend';
  readonly ROUTING: 'routing';
  readonly STATE_MANAGEMENT: 'state-management';
  readonly UI: 'ui';
  readonly STYLING: 'styling';
  readonly COMPONENTS: 'components';
  readonly THEME: 'theme';
  readonly BACKEND: 'backend';
  readonly API: 'api';
  readonly DATABASE: 'database';
  readonly AUTH: 'auth';
  readonly STORAGE: 'storage';
  readonly REALTIME: 'realtime';
  readonly DEPLOYMENT: 'deployment';
  readonly MONITORING: 'monitoring';
  readonly LOGGING: 'logging';
  readonly CI_CD: 'ci-cd';
};

export declare const MERGE_STRATEGIES: {
  readonly REPLACE: 'replace';
  readonly APPEND: 'append';
  readonly APPEND_UNIQUE: 'append-unique';
  readonly PREPEND: 'prepend';
  readonly MERGE_JSON: 'merge-json';
  readonly MERGE_JSON_SHALLOW: 'merge-json-shallow';
  readonly MERGE_ROUTES: 'merge-routes';
  readonly MERGE_STORES: 'merge-stores';
  readonly MERGE_ENTRY: 'merge-entry';
  readonly MERGE_CONFIG: 'merge-config';
  readonly MERGE_ESLINT: 'merge-eslint';
  readonly MERGE_VITE_CONFIG: 'merge-vite-config';
  readonly CUSTOM: 'custom';
};

// Utility Functions
export declare function isModuleType(module: any, expectedType: ModuleType): module is IBaseStackModule;
export declare function moduleProvides(module: IBaseStackModule, feature: string): boolean;
export declare function moduleRequires(module: IBaseStackModule, feature: string): boolean;