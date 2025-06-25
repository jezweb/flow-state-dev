import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { ModuleRegistry } from '../../lib/modules/registry.js';
import { DependencyResolver } from '../../lib/modules/dependency-resolver.js';
import { ProjectGenerator } from '../../lib/modules/project-generator.js';

describe('SvelteKit Module Integration', () => {
  const testDir = join(process.cwd(), 'test-output', 'sveltekit');
  let registry;
  let resolver;
  let generator;

  beforeAll(async () => {
    // Initialize module system
    registry = new ModuleRegistry();
    await registry.discover();
    resolver = new DependencyResolver(registry);
    generator = new ProjectGenerator(registry);
  });

  afterEach(() => {
    // Clean up test directory after each test
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    // Final cleanup
    const outputDir = join(process.cwd(), 'test-output');
    if (existsSync(outputDir)) {
      rmSync(outputDir, { recursive: true, force: true });
    }
  });

  describe('Module Registration', () => {
    it('should have SvelteKit module registered', () => {
      const svelteKitModule = registry.getModule('sveltekit');
      expect(svelteKitModule).toBeDefined();
      expect(svelteKitModule.name).toBe('sveltekit');
      expect(svelteKitModule.category).toBe('frontend-framework');
    });

    it('should have Better Auth module registered', () => {
      const betterAuthModule = registry.getModule('better-auth');
      expect(betterAuthModule).toBeDefined();
      expect(betterAuthModule.name).toBe('better-auth');
      expect(betterAuthModule.category).toBe('backend');
    });

    it('should provide correct capabilities', () => {
      const svelteKitModule = registry.getModule('sveltekit');
      expect(svelteKitModule.provides).toContain('frontend');
      expect(svelteKitModule.provides).toContain('routing');
      expect(svelteKitModule.provides).toContain('state-management');
    });
  });

  describe('Module Compatibility', () => {
    it('should be compatible with Tailwind', async () => {
      const resolution = await resolver.resolve(['sveltekit', 'tailwind']);
      expect(resolution.success).toBe(true);
      expect(resolution.errors).toHaveLength(0);
    });

    it('should be compatible with Better Auth', async () => {
      const resolution = await resolver.resolve(['sveltekit', 'better-auth']);
      expect(resolution.success).toBe(true);
      expect(resolution.errors).toHaveLength(0);
    });

    it('should be incompatible with Vue', async () => {
      const resolution = await resolver.resolve(['sveltekit', 'vue-base']);
      expect(resolution.success).toBe(false);
      expect(resolution.errors.length).toBeGreaterThan(0);
    });

    it('should be incompatible with React', async () => {
      const resolution = await resolver.resolve(['sveltekit', 'react']);
      expect(resolution.success).toBe(true); // React exists
      const svelteKit = registry.getModule('sveltekit');
      const react = registry.getModule('react');
      const result = svelteKit.checkCompatibility([react]);
      expect(result.compatible).toBe(false);
    });
  });

  describe('Project Generation', () => {
    it('should generate SvelteKit-only project', async () => {
      const context = {
        projectName: 'test-sveltekit-minimal',
        projectPath: testDir,
        selectedModules: ['sveltekit']
      };

      await generator.generate(context);

      // Check essential files
      expect(existsSync(join(testDir, 'package.json'))).toBe(true);
      expect(existsSync(join(testDir, 'svelte.config.js'))).toBe(true);
      expect(existsSync(join(testDir, 'vite.config.ts'))).toBe(true);
      expect(existsSync(join(testDir, 'tsconfig.json'))).toBe(true);
      expect(existsSync(join(testDir, 'src/app.html'))).toBe(true);
      expect(existsSync(join(testDir, 'src/routes/+page.svelte'))).toBe(true);

      // Check package.json
      const packageJson = JSON.parse(readFileSync(join(testDir, 'package.json'), 'utf-8'));
      expect(packageJson.name).toBe('test-sveltekit-minimal');
      expect(packageJson.devDependencies['@sveltejs/kit']).toBeDefined();
      expect(packageJson.devDependencies['svelte']).toBeDefined();
      expect(packageJson.devDependencies['vite']).toBeDefined();
    });

    it('should generate SvelteKit + Tailwind project', async () => {
      const context = {
        projectName: 'test-sveltekit-tailwind',
        projectPath: testDir,
        selectedModules: ['sveltekit', 'tailwind']
      };

      await generator.generate(context);

      // Check Tailwind files
      expect(existsSync(join(testDir, 'tailwind.config.js'))).toBe(true);
      expect(existsSync(join(testDir, 'postcss.config.js'))).toBe(true);
      expect(existsSync(join(testDir, 'src/app.css'))).toBe(true);

      // Check package.json for Tailwind
      const packageJson = JSON.parse(readFileSync(join(testDir, 'package.json'), 'utf-8'));
      expect(packageJson.devDependencies['tailwindcss']).toBeDefined();
      expect(packageJson.devDependencies['postcss']).toBeDefined();
      expect(packageJson.devDependencies['autoprefixer']).toBeDefined();

      // Check app.css for Tailwind directives
      const appCss = readFileSync(join(testDir, 'src/app.css'), 'utf-8');
      expect(appCss).toContain('@tailwind base;');
      expect(appCss).toContain('@tailwind components;');
      expect(appCss).toContain('@tailwind utilities;');
    });

    it('should generate SvelteKit + Better Auth project', async () => {
      const context = {
        projectName: 'test-sveltekit-auth',
        projectPath: testDir,
        selectedModules: ['sveltekit', 'better-auth']
      };

      await generator.generate(context);

      // Check auth files
      expect(existsSync(join(testDir, 'src/lib/server/auth.ts'))).toBe(true);
      expect(existsSync(join(testDir, 'src/lib/auth/client.ts'))).toBe(true);
      expect(existsSync(join(testDir, 'src/routes/auth/+page.svelte'))).toBe(true);
      expect(existsSync(join(testDir, '.env.example'))).toBe(true);

      // Check package.json for Better Auth
      const packageJson = JSON.parse(readFileSync(join(testDir, 'package.json'), 'utf-8'));
      expect(packageJson.dependencies['better-auth']).toBeDefined();
      expect(packageJson.dependencies['@better-auth/client']).toBeDefined();
    });

    it('should generate full stack SvelteKit project', async () => {
      const context = {
        projectName: 'test-sveltekit-full',
        projectPath: testDir,
        selectedModules: ['sveltekit', 'better-auth', 'tailwind', 'vercel']
      };

      await generator.generate(context);

      // Check all files are present
      expect(existsSync(join(testDir, 'package.json'))).toBe(true);
      expect(existsSync(join(testDir, 'svelte.config.js'))).toBe(true);
      expect(existsSync(join(testDir, 'tailwind.config.js'))).toBe(true);
      expect(existsSync(join(testDir, 'vercel.json'))).toBe(true);
      expect(existsSync(join(testDir, 'src/lib/server/auth.ts'))).toBe(true);

      // Check svelte.config.js uses Vercel adapter
      const svelteConfig = readFileSync(join(testDir, 'svelte.config.js'), 'utf-8');
      expect(svelteConfig).toContain('@sveltejs/adapter-vercel');
    });
  });

  describe('Template Processing', () => {
    it('should process templates with correct variables', async () => {
      const context = {
        projectName: 'my-sveltekit-app',
        projectPath: testDir,
        selectedModules: ['sveltekit']
      };

      await generator.generate(context);

      const packageJson = JSON.parse(readFileSync(join(testDir, 'package.json'), 'utf-8'));
      expect(packageJson.name).toBe('my-sveltekit-app');
    });

    it('should merge package.json correctly', async () => {
      const context = {
        projectName: 'test-merge',
        projectPath: testDir,
        selectedModules: ['sveltekit', 'tailwind', 'better-auth']
      };

      await generator.generate(context);

      const packageJson = JSON.parse(readFileSync(join(testDir, 'package.json'), 'utf-8'));
      
      // Should have scripts from all modules
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
      expect(packageJson.scripts['db:migrate']).toBeDefined(); // From Better Auth

      // Should have dependencies from all modules
      expect(packageJson.devDependencies['@sveltejs/kit']).toBeDefined();
      expect(packageJson.devDependencies['tailwindcss']).toBeDefined();
      expect(packageJson.dependencies['better-auth']).toBeDefined();
    });
  });

  describe('Stack Presets', () => {
    it('should resolve SvelteKit full stack preset', async () => {
      const modules = ['sveltekit', 'better-auth', 'tailwind', 'vercel'];
      const resolution = await resolver.resolve(modules);
      
      expect(resolution.success).toBe(true);
      expect(resolution.modules).toHaveLength(4);
      expect(resolution.modules.map(m => m.name)).toEqual(
        expect.arrayContaining(['sveltekit', 'better-auth', 'tailwind', 'vercel'])
      );
    });

    it('should resolve SvelteKit minimal preset', async () => {
      const modules = ['sveltekit'];
      const resolution = await resolver.resolve(modules);
      
      expect(resolution.success).toBe(true);
      expect(resolution.modules).toHaveLength(1);
      expect(resolution.modules[0].name).toBe('sveltekit');
    });
  });
});