import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BackendFrameworkModule } from '../../lib/modules/types/backend-framework-module.js';

describe('BackendFrameworkModule', () => {
  let expressModule;
  let fastifyModule;
  let nestjsModule;

  beforeEach(() => {
    expressModule = new BackendFrameworkModule('express', 'Express.js Framework', {
      framework: 'express',
      serverType: 'http',
      typescript: true,
      middleware: ['cors', 'helmet', 'compression'],
      cors: true,
      helmet: true,
      compression: true,
      rateLimit: true,
      validation: 'joi',
      orm: 'prisma',
      testing: ['jest', 'supertest'],
      deployment: 'node'
    });

    fastifyModule = new BackendFrameworkModule('fastify', 'Fastify Framework', {
      framework: 'fastify',
      serverType: 'http',
      typescript: true,
      cors: true,
      helmet: true,
      compression: true,
      rateLimit: true,
      validation: 'joi',
      testing: ['jest', 'supertest'],
      deployment: 'serverless'
    });

    nestjsModule = new BackendFrameworkModule('nestjs', 'NestJS Framework', {
      framework: 'nestjs',
      serverType: 'http',
      typescript: true,
      validation: 'class-validator',
      orm: 'typeorm',
      testing: ['jest'],
      deployment: 'docker'
    });
  });

  describe('constructor', () => {
    it('should create a backend framework module with correct defaults', () => {
      expect(expressModule.name).toBe('express');
      expect(expressModule.moduleType).toBe('backend-framework');
      expect(expressModule.category).toBe('backend');
      expect(expressModule.provides).toContain('backend-api');
      expect(expressModule.provides).toContain('api');
      expect(expressModule.framework).toBe('express');
      expect(expressModule.serverType).toBe('http');
      expect(expressModule.typescript).toBe(true);
    });

    it('should set default values correctly', () => {
      const defaultModule = new BackendFrameworkModule('test-backend', 'Test Backend Framework');
      expect(defaultModule.framework).toBe('test-backend');
      expect(defaultModule.serverType).toBe('http');
      expect(defaultModule.typescript).toBe(true);
      expect(defaultModule.cors).toBe(true);
      expect(defaultModule.helmet).toBe(true);
      expect(defaultModule.compression).toBe(true);
      expect(defaultModule.rateLimit).toBe(true);
      expect(defaultModule.validation).toBe('joi');
      expect(defaultModule.deployment).toBe('node');
    });
  });

  describe('getMetadata', () => {
    it('should return extended metadata', () => {
      const metadata = expressModule.getMetadata();
      
      expect(metadata).toHaveProperty('framework', 'express');
      expect(metadata).toHaveProperty('serverType', 'http');
      expect(metadata).toHaveProperty('typescript', true);
      expect(metadata.features).toHaveProperty('cors', true);
      expect(metadata.features).toHaveProperty('helmet', true);
      expect(metadata.features).toHaveProperty('compression', true);
      expect(metadata.features).toHaveProperty('rateLimit', true);
      expect(metadata.features).toHaveProperty('validation', 'joi');
      expect(metadata.features).toHaveProperty('orm', 'prisma');
      expect(metadata).toHaveProperty('deployment', 'node');
    });
  });

  describe('getDependencies', () => {
    it('should return correct dependencies for Express', () => {
      const deps = expressModule.getDependencies();
      
      expect(deps).toHaveProperty('express');
      expect(deps).toHaveProperty('cors');
      expect(deps).toHaveProperty('helmet');
      expect(deps).toHaveProperty('compression');
      expect(deps).toHaveProperty('express-rate-limit');
      expect(deps).toHaveProperty('joi');
      expect(deps).toHaveProperty('@prisma/client');
      expect(deps).toHaveProperty('dotenv');
      expect(deps).toHaveProperty('body-parser');
    });

    it('should return correct dependencies for Fastify', () => {
      const deps = fastifyModule.getDependencies();
      
      expect(deps).toHaveProperty('fastify');
      expect(deps).toHaveProperty('cors');
      expect(deps).toHaveProperty('helmet');
      expect(deps).toHaveProperty('compression');
      expect(deps).toHaveProperty('@fastify/rate-limit');
    });

    it('should return correct dependencies for NestJS', () => {
      const deps = nestjsModule.getDependencies();
      
      expect(deps).toHaveProperty('@nestjs/core');
      expect(deps).toHaveProperty('@nestjs/common');
      expect(deps).toHaveProperty('@nestjs/platform-express');
      expect(deps).toHaveProperty('reflect-metadata');
      expect(deps).toHaveProperty('rxjs');
      expect(deps).toHaveProperty('typeorm');
    });

    it('should include validation dependencies', () => {
      const yupModule = new BackendFrameworkModule('express-yup', 'Express with Yup', {
        validation: 'yup'
      });
      
      const deps = yupModule.getDependencies();
      expect(deps).toHaveProperty('yup');
    });

    it('should include ORM dependencies', () => {
      const sequelizeModule = new BackendFrameworkModule('express-sequelize', 'Express with Sequelize', {
        orm: 'sequelize'
      });
      
      const deps = sequelizeModule.getDependencies();
      expect(deps).toHaveProperty('sequelize');
    });
  });

  describe('getDevDependencies', () => {
    it('should return correct dev dependencies for TypeScript', () => {
      const deps = expressModule.getDevDependencies();
      
      expect(deps).toHaveProperty('typescript');
      expect(deps).toHaveProperty('@types/node');
      expect(deps).toHaveProperty('ts-node');
      expect(deps).toHaveProperty('ts-node-dev');
      expect(deps).toHaveProperty('@types/express');
      expect(deps).toHaveProperty('@types/cors');
      expect(deps).toHaveProperty('@types/compression');
    });

    it('should include testing dependencies', () => {
      const deps = expressModule.getDevDependencies();
      
      expect(deps).toHaveProperty('jest');
      expect(deps).toHaveProperty('@types/jest');
      expect(deps).toHaveProperty('ts-jest');
      expect(deps).toHaveProperty('supertest');
      expect(deps).toHaveProperty('@types/supertest');
      expect(deps).toHaveProperty('nodemon');
    });

    it('should include ORM dev dependencies', () => {
      const deps = expressModule.getDevDependencies();
      
      expect(deps).toHaveProperty('prisma');
    });

    it('should not include TypeScript dependencies when disabled', () => {
      const jsModule = new BackendFrameworkModule('express-js', 'Express without TypeScript', {
        typescript: false
      });
      
      const deps = jsModule.getDevDependencies();
      
      expect(deps).not.toHaveProperty('typescript');
      expect(deps).not.toHaveProperty('@types/node');
      expect(deps).not.toHaveProperty('ts-node');
    });
  });

  describe('getScripts', () => {
    it('should return correct scripts for TypeScript project', () => {
      const scripts = expressModule.getScripts();
      
      expect(scripts.start).toBe('node dist/index.js');
      expect(scripts.build).toBe('tsc');
      expect(scripts.dev).toBe('ts-node-dev --respawn --transpile-only src/index.ts');
      expect(scripts.test).toBe('jest');
      expect(scripts['test:watch']).toBe('jest --watch');
      expect(scripts['test:coverage']).toBe('jest --coverage');
      expect(scripts.lint).toContain('eslint');
      expect(scripts['lint:fix']).toContain('eslint');
    });

    it('should return correct scripts for JavaScript project', () => {
      const jsModule = new BackendFrameworkModule('express-js', 'Express without TypeScript', {
        typescript: false
      });
      
      const scripts = jsModule.getScripts();
      
      expect(scripts.build).toBe('echo "No build step required"');
      expect(scripts.dev).toBe('nodemon src/index.js');
    });

    it('should include Prisma scripts when ORM is configured', () => {
      const scripts = expressModule.getScripts();
      
      expect(scripts['db:migrate']).toBe('prisma migrate dev');
      expect(scripts['db:generate']).toBe('prisma generate');
      expect(scripts['db:studio']).toBe('prisma studio');
    });
  });

  describe('getServerCode', () => {
    it('should generate valid Express server code', () => {
      const code = expressModule.getServerCode();
      
      expect(code).toContain("import express from 'express'");
      expect(code).toContain("import cors from 'cors'");
      expect(code).toContain("import helmet from 'helmet'");
      expect(code).toContain("import compression from 'compression'");
      expect(code).toContain("import rateLimit from 'express-rate-limit'");
      expect(code).toContain('const app = express()');
      expect(code).toContain('app.use(helmet())');
      expect(code).toContain('app.use(cors({');
      expect(code).toContain('app.use(compression())');
      expect(code).toContain('app.listen(PORT');
      expect(code).toContain('export default app');
    });

    it('should include TypeScript types in Express code', () => {
      const code = expressModule.getServerCode();
      
      expect(code).toContain('Request, Response, NextFunction');
      expect(code).toContain('req: Request');
      expect(code).toContain('res: Response');
      expect(code).toContain('next: NextFunction');
    });

    it('should generate valid Fastify server code', () => {
      const code = fastifyModule.getServerCode();
      
      expect(code).toContain("import Fastify from 'fastify'");
      expect(code).toContain("import cors from '@fastify/cors'");
      expect(code).toContain("import helmet from '@fastify/helmet'");
      expect(code).toContain('const fastify = Fastify({');
      expect(code).toContain('fastify.register(helmet)');
      expect(code).toContain('fastify.register(cors');
      expect(code).toContain('await fastify.listen');
      expect(code).toContain('export default fastify');
    });

    it('should generate valid NestJS server code', () => {
      const code = nestjsModule.getServerCode();
      
      expect(code).toContain("import { NestFactory } from '@nestjs/core'");
      expect(code).toContain("import { AppModule } from './app.module'");
      expect(code).toContain('const app = await NestFactory.create(AppModule)');
      expect(code).toContain("app.setGlobalPrefix('api')");
      expect(code).toContain('app.enableCors');
      expect(code).toContain('await app.listen(PORT)');
    });

    it('should handle rate limiting correctly', () => {
      const code = expressModule.getServerCode();
      
      expect(code).toContain('const limiter = rateLimit({');
      expect(code).toContain('windowMs: 15 * 60 * 1000');
      expect(code).toContain('max: 100');
      expect(code).toContain("app.use('/api', limiter)");
    });

    it('should handle unknown frameworks gracefully', () => {
      const unknownModule = new BackendFrameworkModule('unknown', 'Unknown Framework', {
        framework: 'unknown-framework'
      });
      
      const code = unknownModule.getServerCode();
      
      expect(code).toContain('// unknown-framework server implementation');
      expect(code).toContain('TODO: Implement server setup');
    });
  });

  describe('getRouterCode', () => {
    it('should generate Express router code', () => {
      const code = expressModule.getRouterCode();
      
      expect(code).toContain("import { Router } from 'express'");
      expect(code).toContain('const router = Router()');
      expect(code).toContain("router.use('/auth', authRoutes)");
      expect(code).toContain("router.use('/users', userRoutes)");
      expect(code).toContain('export default router');
    });

    it('should generate Fastify router code', () => {
      const code = fastifyModule.getRouterCode();
      
      expect(code).toContain("import { FastifyPluginAsync } from 'fastify'");
      expect(code).toContain('const routes: FastifyPluginAsync');
      expect(code).toContain("fastify.register(authRoutes, { prefix: '/auth' })");
      expect(code).toContain('export default routes');
    });

    it('should generate NestJS app module', () => {
      const code = nestjsModule.getRouterCode();
      
      expect(code).toContain("import { Module } from '@nestjs/common'");
      expect(code).toContain("import { ConfigModule } from '@nestjs/config'");
      expect(code).toContain('@Module({');
      expect(code).toContain('export class AppModule');
    });
  });

  describe('getExampleRoute', () => {
    it('should generate Express example route', () => {
      const route = expressModule.getExampleRoute();
      
      expect(route.path).toBe('src/routes/users.js');
      expect(route.content).toContain("import { Router } from 'express'");
      expect(route.content).toContain("import Joi from 'joi'");
      expect(route.content).toContain("router.get('/'");
      expect(route.content).toContain("router.get('/:id'");
      expect(route.content).toContain("router.post('/'");
      expect(route.content).toContain('const schema = Joi.object({');
      expect(route.content).toContain('export default router');
    });

    it('should generate NestJS example controller', () => {
      const route = nestjsModule.getExampleRoute();
      
      expect(route.path).toBe('src/users/users.controller.ts');
      expect(route.content).toContain("import { Controller, Get, Post");
      expect(route.content).toContain("@Controller('users')");
      expect(route.content).toContain('export class UsersController');
      expect(route.content).toContain('@Get()');
      expect(route.content).toContain('@Post()');
    });

    it('should handle validation libraries correctly', () => {
      const zodModule = new BackendFrameworkModule('express-zod', 'Express with Zod', {
        framework: 'express',
        validation: 'zod'
      });
      
      const route = zodModule.getExampleRoute();
      
      expect(route.content).not.toContain('import Joi');
      expect(route.content).not.toContain('Joi.object');
    });
  });

  describe('getConfigFiles', () => {
    it('should return TypeScript configuration when enabled', () => {
      const configs = expressModule.getConfigFiles();
      
      const tsConfig = configs.find(c => c.path === 'tsconfig.json');
      expect(tsConfig).toBeDefined();
      
      const parsedConfig = JSON.parse(tsConfig.content);
      expect(parsedConfig.compilerOptions.target).toBe('ES2022');
      expect(parsedConfig.compilerOptions.module).toBe('commonjs');
      expect(parsedConfig.compilerOptions.strict).toBe(true);
      expect(parsedConfig.compilerOptions.experimentalDecorators).toBe(false);
    });

    it('should include NestJS-specific TypeScript config', () => {
      const configs = nestjsModule.getConfigFiles();
      
      const tsConfig = configs.find(c => c.path === 'tsconfig.json');
      expect(tsConfig).toBeDefined();
      
      const parsedConfig = JSON.parse(tsConfig.content);
      expect(parsedConfig.compilerOptions.experimentalDecorators).toBe(true);
      expect(parsedConfig.compilerOptions.emitDecoratorMetadata).toBe(true);
    });

    it('should return Jest configuration', () => {
      const configs = expressModule.getConfigFiles();
      
      const jestConfig = configs.find(c => c.path === 'jest.config.js');
      expect(jestConfig).toBeDefined();
      expect(jestConfig.content).toContain("preset: 'ts-jest'");
      expect(jestConfig.content).toContain("testEnvironment: 'node'");
    });

    it('should return Nodemon configuration', () => {
      const configs = expressModule.getConfigFiles();
      
      const nodemonConfig = configs.find(c => c.path === 'nodemon.json');
      expect(nodemonConfig).toBeDefined();
      
      const parsedConfig = JSON.parse(nodemonConfig.content);
      expect(parsedConfig.ext).toBe('ts,json');
      expect(parsedConfig.exec).toBe('ts-node src/index.ts');
    });

    it('should return environment template', () => {
      const configs = expressModule.getConfigFiles();
      
      const envConfig = configs.find(c => c.path === '.env.example');
      expect(envConfig).toBeDefined();
      expect(envConfig.content).toContain('NODE_ENV=development');
      expect(envConfig.content).toContain('PORT=3001');
      expect(envConfig.content).toContain('DATABASE_URL=');
      expect(envConfig.content).toContain('JWT_SECRET=');
    });
  });

  describe('checkCompatibility', () => {
    it('should warn about serverless deployment with backend services', () => {
      const backendService = {
        name: 'supabase',
        moduleType: 'backend-service'
      };
      
      const result = fastifyModule.checkCompatibility([backendService]);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('deployment-mismatch');
      expect(result.warnings[0].message).toContain('fastify serverless deployment may conflict');
    });

    it('should warn about ORM without database', () => {
      const frontendModule = {
        name: 'vue3',
        moduleType: 'frontend-framework',
        provides: []
      };
      
      const result = expressModule.checkCompatibility([frontendModule]);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('missing-database');
      expect(result.warnings[0].message).toContain('prisma ORM configured but no database module selected');
    });

    it('should pass compatibility when database is present', () => {
      const databaseModule = {
        name: 'postgres',
        moduleType: 'database',
        provides: ['database']
      };
      
      const result = expressModule.checkCompatibility([databaseModule]);
      
      expect(result.warnings).toHaveLength(0);
    });

    it('should not warn when no ORM is configured', () => {
      const noOrmModule = new BackendFrameworkModule('express-no-orm', 'Express without ORM', {
        orm: null
      });
      
      const result = noOrmModule.checkCompatibility([]);
      
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('previewChanges', () => {
    it('should return preview of all files for Express', async () => {
      const preview = await expressModule.previewChanges('/test/path', {});
      
      expect(preview.files.length).toBeGreaterThan(0);
      expect(preview.modifications.length).toBeGreaterThan(0);
      
      // Server entry point
      const entryPoint = preview.files.find(f => f.path === 'src/index.ts');
      expect(entryPoint).toBeDefined();
      
      // Router
      const router = preview.files.find(f => f.path.includes('routes/index.ts'));
      expect(router).toBeDefined();
      
      // Example route
      const exampleRoute = preview.files.find(f => f.path === 'src/routes/users.js');
      expect(exampleRoute).toBeDefined();
      
      // Directories
      const middleware = preview.files.find(f => f.path === 'src/middleware/');
      expect(middleware).toBeDefined();
      
      const utils = preview.files.find(f => f.path === 'src/utils/');
      expect(utils).toBeDefined();
    });

    it('should include serverless deployment warning', async () => {
      const preview = await fastifyModule.previewChanges('/test/path', {});
      
      expect(preview.warnings).toContain('Serverless deployment requires additional configuration');
    });

    it('should include ORM configuration warning', async () => {
      const preview = await expressModule.previewChanges('/test/path', {});
      
      expect(preview.warnings).toContain('Remember to configure prisma after installation');
    });
  });

  describe('getPostInstallInstructions', () => {
    it('should return comprehensive instructions for Express', () => {
      const instructions = expressModule.getPostInstallInstructions({});
      
      expect(instructions).toContain('express Backend Setup:');
      expect(instructions).toContain('1. Copy .env.example to .env');
      expect(instructions).toContain('2. Configure your environment variables');
      expect(instructions).toContain('3. Install dependencies: npm install');
      expect(instructions).toContain('4. Start development server: npm run dev');
      
      // Prisma setup
      expect(instructions).toContain('Prisma Setup:');
      expect(instructions).toContain('1. Configure DATABASE_URL in .env');
      expect(instructions).toContain('2. Create schema: npx prisma init');
      expect(instructions).toContain('3. Run migrations: npm run db:migrate');
      
      // Testing
      expect(instructions).toContain('Testing:');
      expect(instructions).toContain('- Run tests: npm test');
      expect(instructions).toContain('- Watch mode: npm run test:watch');
    });

    it('should include Docker deployment instructions', () => {
      const instructions = nestjsModule.getPostInstallInstructions({});
      
      expect(instructions).toContain('Docker Deployment:');
      expect(instructions).toContain('- Build image: docker build -t api .');
      expect(instructions).toContain('- Run container: docker run -p 3001:3001 api');
    });

    it('should not include ORM instructions when no ORM is configured', () => {
      const noOrmModule = new BackendFrameworkModule('express-no-orm', 'Express without ORM', {
        orm: null
      });
      
      const instructions = noOrmModule.getPostInstallInstructions({});
      
      expect(instructions.join(' ')).not.toContain('Prisma Setup');
    });
  });

  describe('edge cases', () => {
    it('should handle modules without metadata', () => {
      const minimalModule = new BackendFrameworkModule('minimal', 'Minimal Backend');
      const metadata = minimalModule.getMetadata();
      
      expect(metadata.name).toBe('minimal');
      expect(metadata.framework).toBe('minimal');
    });

    it('should handle unknown validation libraries', () => {
      const unknownValidationModule = new BackendFrameworkModule('unknown-validation', 'Unknown Validation', {
        validation: 'unknown-validator'
      });
      
      const deps = unknownValidationModule.getDependencies();
      expect(deps).not.toHaveProperty('unknown-validator');
    });

    it('should handle disabled features gracefully', () => {
      const minimalModule = new BackendFrameworkModule('minimal', 'Minimal Backend', {
        cors: false,
        helmet: false,
        compression: false,
        rateLimit: false,
        testing: []
      });
      
      const deps = minimalModule.getDependencies();
      expect(deps).not.toHaveProperty('cors');
      expect(deps).not.toHaveProperty('helmet');
      expect(deps).not.toHaveProperty('compression');
    });

    it('should handle empty middleware array', () => {
      const noMiddlewareModule = new BackendFrameworkModule('no-middleware', 'No Middleware', {
        middleware: []
      });
      
      const metadata = noMiddlewareModule.getMetadata();
      expect(metadata.name).toBe('no-middleware');
    });
  });

  describe('code generation validation', () => {
    it('should generate syntactically valid TypeScript code', () => {
      const code = expressModule.getServerCode();
      
      // Basic syntax checks
      expect(code).toContain('import ');
      expect(code).toContain('export ');
      expect(code.split('import ').length - 1).toBeGreaterThan(0);
      expect(code.split('{').length).toBe(code.split('}').length);
    });

    it('should generate proper async/await patterns', () => {
      const code = fastifyModule.getServerCode();
      
      expect(code).toContain('const start = async () => {');
      expect(code).toContain('await fastify.listen');
      expect(code).toContain('try {');
      expect(code).toContain('} catch (err) {');
    });

    it('should include proper error handling', () => {
      const code = expressModule.getServerCode();
      
      expect(code).toContain('// Error handling middleware');
      expect(code).toContain('(err');
      expect(code).toContain('console.error(err.stack)');
      expect(code).toContain('res.status(500)');
    });
  });
});