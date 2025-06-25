/**
 * Example custom onboarding plugin
 * 
 * This demonstrates how to create custom onboarding steps
 * that can be loaded as plugins into the Flow State Dev CLI.
 * 
 * Usage:
 * 1. Copy this file to your project
 * 2. Modify the steps to suit your needs
 * 3. Set FSD_PLUGIN_PATH environment variable to point to this file
 * 4. Run fsd init to use your custom onboarding flow
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { OnboardingStep } from '../lib/onboarding/base.js';

/**
 * Example: Docker Configuration Step
 */
class DockerConfigurationStep extends OnboardingStep {
  constructor() {
    super('docker-config', 'Configure Docker development environment', {
      priority: 30,
      required: false,
      dependencies: ['template-processing']
    });
  }

  shouldRun(context) {
    // Only run if interactive or docker config provided
    return context.interactive || (context.config && context.config.docker);
  }

  async validate(context) {
    // Check if Docker is available
    try {
      execSync('docker --version', { stdio: 'ignore' });
      return { valid: true };
    } catch (error) {
      return { valid: false, message: 'Docker is not installed or not available in PATH' };
    }
  }

  async execute(context) {
    const { targetDir, projectName, interactive } = context;
    let dockerConfigured = false;

    if (interactive) {
      const { configureDocker } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'configureDocker',
          message: 'Would you like to set up Docker for development?',
          default: false
        }
      ]);

      if (configureDocker) {
        const { services } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'services',
            message: 'Which services would you like to include?',
            pageSize: 10,
            choices: [
              { name: 'PostgreSQL database', value: 'postgres' },
              { name: 'Redis cache', value: 'redis' },
              { name: 'Nginx reverse proxy', value: 'nginx' },
              { name: 'Adminer database admin', value: 'adminer' }
            ]
          }
        ]);

        await this.createDockerFiles(targetDir, projectName, services);
        dockerConfigured = true;
        console.log(chalk.green('✅ Docker configuration created'));
      }
    }

    return {
      ...context,
      dockerConfigured
    };
  }

  async createDockerFiles(targetDir, projectName, services) {
    // Create docker-compose.yml
    const dockerCompose = this.generateDockerCompose(projectName, services);
    await fs.writeFile(path.join(targetDir, 'docker-compose.yml'), dockerCompose);

    // Create Dockerfile for development
    const dockerfile = this.generateDockerfile();
    await fs.writeFile(path.join(targetDir, 'Dockerfile.dev'), dockerfile);

    // Create .dockerignore
    const dockerignore = `node_modules
npm-debug.log
Dockerfile*
docker-compose*
.dockerignore
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.vscode
`;
    await fs.writeFile(path.join(targetDir, '.dockerignore'), dockerignore);
  }

  generateDockerCompose(projectName, services) {
    let compose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
`;

    const serviceConfigs = {
      postgres: `  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${projectName}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
`,
      redis: `  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
`,
      nginx: `  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
`,
      adminer: `  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres
`
    };

    // Add depends_on services
    const dependsOn = services.filter(s => s !== 'nginx').map(s => `      - ${s}`).join('\n');
    compose += dependsOn + '\n\n';

    // Add service configurations
    for (const service of services) {
      if (serviceConfigs[service]) {
        compose += serviceConfigs[service] + '\n';
      }
    }

    // Add volumes section if needed
    if (services.includes('postgres') || services.includes('redis')) {
      compose += 'volumes:\n';
      if (services.includes('postgres')) compose += '  postgres_data:\n';
      if (services.includes('redis')) compose += '  redis_data:\n';
    }

    return compose;
  }

  generateDockerfile() {
    return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
`;
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        docker: {
          type: 'object',
          properties: {
            services: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['postgres', 'redis', 'nginx', 'adminer']
              }
            }
          }
        }
      }
    };
  }
}

/**
 * Example: Testing Setup Step
 */
class TestingSetupStep extends OnboardingStep {
  constructor() {
    super('testing-setup', 'Configure testing framework', {
      priority: 35,
      required: false,
      dependencies: ['template-processing']
    });
  }

  async execute(context) {
    const { targetDir, interactive } = context;
    let testingConfigured = false;

    if (interactive) {
      const { setupTesting } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'setupTesting',
          message: 'Would you like to set up testing?',
          default: true
        }
      ]);

      if (setupTesting) {
        const { testFramework } = await inquirer.prompt([
          {
            type: 'list',
            name: 'testFramework',
            message: 'Choose testing framework:',
            choices: [
              { name: 'Vitest (recommended for Vue)', value: 'vitest' },
              { name: 'Jest', value: 'jest' },
              { name: 'Cypress (E2E)', value: 'cypress' }
            ]
          }
        ]);

        await this.setupTestFramework(targetDir, testFramework);
        testingConfigured = true;
        console.log(chalk.green(`✅ ${testFramework} testing setup created`));
      }
    }

    return {
      ...context,
      testingConfigured
    };
  }

  async setupTestFramework(targetDir, framework) {
    const packageJsonPath = path.join(targetDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    if (framework === 'vitest') {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        'vitest': '^1.0.0',
        '@vue/test-utils': '^2.4.0',
        'happy-dom': '^12.0.0'
      };
      packageJson.scripts = {
        ...packageJson.scripts,
        'test': 'vitest',
        'test:ui': 'vitest --ui',
        'test:coverage': 'vitest --coverage'
      };
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Create test configuration and example
    const testConfig = framework === 'vitest' ? 
      this.generateVitestConfig() : 
      this.generateJestConfig();
    
    const configFile = framework === 'vitest' ? 'vitest.config.js' : 'jest.config.js';
    await fs.writeFile(path.join(targetDir, configFile), testConfig);

    // Create example test
    const testsDir = path.join(targetDir, 'tests');
    await fs.ensureDir(testsDir);
    
    const exampleTest = `import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '../src/components/HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld)
    expect(wrapper.text()).toContain('Hello')
  })
})
`;
    await fs.writeFile(path.join(testsDir, 'HelloWorld.test.js'), exampleTest);
  }

  generateVitestConfig() {
    return `import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true
  }
})
`;
  }

  generateJestConfig() {
    return `module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'json', 'vue'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
`;
  }
}

/**
 * Plugin export function
 * This is the main entry point for the plugin system
 */
export function getSteps() {
  return [
    new DockerConfigurationStep(),
    new TestingSetupStep()
  ];
}

export default {
  name: 'custom-onboarding-plugin',
  version: '1.0.0',
  description: 'Example custom onboarding steps for Flow State Dev',
  getSteps
};