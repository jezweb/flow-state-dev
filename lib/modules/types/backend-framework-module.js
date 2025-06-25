/**
 * Backend Framework Module Type
 * 
 * Specialized module type for backend frameworks like Express, Fastify, NestJS, etc.
 * Handles API server setup, middleware, routing, and backend architecture.
 */
import { BaseStackModule } from './base-stack-module.js';

export class BackendFrameworkModule extends BaseStackModule {
  constructor(name, description, options = {}) {
    super(name, description, {
      ...options,
      moduleType: 'backend-framework',
      category: 'backend',
      provides: ['backend-api', 'api', ...(options.provides || [])],
      requires: options.requires || []
    });

    // Backend framework specific properties
    this.framework = options.framework || name.toLowerCase();
    this.serverType = options.serverType || 'http'; // 'http', 'websocket', 'graphql'
    this.typescript = options.typescript !== false;
    this.middleware = options.middleware || [];
    this.cors = options.cors !== false;
    this.helmet = options.helmet !== false;
    this.compression = options.compression !== false;
    this.rateLimit = options.rateLimit !== false;
    this.validation = options.validation || 'joi'; // 'joi', 'yup', 'zod'
    this.orm = options.orm || null; // 'prisma', 'typeorm', 'sequelize'
    this.testing = options.testing || ['jest', 'supertest'];
    this.monitoring = options.monitoring || [];
    this.deployment = options.deployment || 'node'; // 'node', 'serverless', 'docker'
    this.apiPath = options.apiPath || 'src/api';
    this.routesPath = options.routesPath || 'src/routes';
  }

  /**
   * Get backend framework metadata
   * @returns {Object} Extended metadata
   */
  getMetadata() {
    return {
      ...super.getMetadata(),
      framework: this.framework,
      serverType: this.serverType,
      typescript: this.typescript,
      features: {
        cors: this.cors,
        helmet: this.helmet,
        compression: this.compression,
        rateLimit: this.rateLimit,
        validation: this.validation,
        orm: this.orm,
        monitoring: this.monitoring
      },
      deployment: this.deployment
    };
  }

  /**
   * Get backend dependencies
   * @returns {Object} Dependencies
   */
  getDependencies() {
    const deps = {};

    // Framework dependencies
    switch (this.framework) {
      case 'express':
        deps['express'] = '^4.18.0';
        break;
      case 'fastify':
        deps['fastify'] = '^4.0.0';
        break;
      case 'nestjs':
        deps['@nestjs/core'] = '^10.0.0';
        deps['@nestjs/common'] = '^10.0.0';
        deps['@nestjs/platform-express'] = '^10.0.0';
        deps['reflect-metadata'] = '^0.1.13';
        deps['rxjs'] = '^7.8.0';
        break;
      case 'koa':
        deps['koa'] = '^2.14.0';
        deps['koa-router'] = '^12.0.0';
        deps['koa-bodyparser'] = '^4.4.0';
        break;
    }

    // Middleware dependencies
    if (this.cors) {
      deps['cors'] = '^2.8.5';
    }
    if (this.helmet) {
      deps['helmet'] = '^7.0.0';
    }
    if (this.compression) {
      deps['compression'] = '^1.7.4';
    }
    if (this.rateLimit) {
      if (this.framework === 'express') {
        deps['express-rate-limit'] = '^7.0.0';
      } else if (this.framework === 'fastify') {
        deps['@fastify/rate-limit'] = '^8.0.0';
      }
    }

    // Validation dependencies
    if (this.validation === 'joi') {
      deps['joi'] = '^17.0.0';
    } else if (this.validation === 'yup') {
      deps['yup'] = '^1.0.0';
    } else if (this.validation === 'zod') {
      deps['zod'] = '^3.0.0';
    }

    // ORM dependencies
    if (this.orm === 'prisma') {
      deps['@prisma/client'] = '^5.0.0';
    } else if (this.orm === 'typeorm') {
      deps['typeorm'] = '^0.3.0';
    } else if (this.orm === 'sequelize') {
      deps['sequelize'] = '^6.0.0';
    }

    // Common utilities
    deps['dotenv'] = '^16.0.0';
    deps['body-parser'] = '^1.20.0';

    return deps;
  }

  /**
   * Get dev dependencies
   * @returns {Object} Dev dependencies
   */
  getDevDependencies() {
    const deps = {};

    // TypeScript
    if (this.typescript) {
      deps['typescript'] = '^5.0.0';
      deps['@types/node'] = '^20.0.0';
      deps['ts-node'] = '^10.0.0';
      deps['ts-node-dev'] = '^2.0.0';
      
      // Framework types
      if (this.framework === 'express') {
        deps['@types/express'] = '^4.17.0';
        deps['@types/cors'] = '^2.8.0';
        deps['@types/compression'] = '^1.7.0';
      }
    }

    // Testing
    if (this.testing.includes('jest')) {
      deps['jest'] = '^29.0.0';
      if (this.typescript) {
        deps['@types/jest'] = '^29.0.0';
        deps['ts-jest'] = '^29.0.0';
      }
    }
    if (this.testing.includes('supertest')) {
      deps['supertest'] = '^6.0.0';
      if (this.typescript) {
        deps['@types/supertest'] = '^2.0.0';
      }
    }

    // Development utilities
    deps['nodemon'] = '^3.0.0';

    // ORM dev dependencies
    if (this.orm === 'prisma') {
      deps['prisma'] = '^5.0.0';
    }

    return deps;
  }

  /**
   * Get backend package.json scripts
   * @returns {Object} npm scripts
   */
  getScripts() {
    const scripts = {
      start: 'node dist/index.js',
      build: this.typescript ? 'tsc' : 'echo "No build step required"'
    };

    // Development script
    if (this.typescript) {
      scripts.dev = 'ts-node-dev --respawn --transpile-only src/index.ts';
    } else {
      scripts.dev = 'nodemon src/index.js';
    }

    // Testing scripts
    if (this.testing.includes('jest')) {
      scripts.test = 'jest';
      scripts['test:watch'] = 'jest --watch';
      scripts['test:coverage'] = 'jest --coverage';
    }

    // ORM scripts
    if (this.orm === 'prisma') {
      scripts['db:migrate'] = 'prisma migrate dev';
      scripts['db:generate'] = 'prisma generate';
      scripts['db:studio'] = 'prisma studio';
    }

    // Linting
    scripts.lint = 'eslint src --ext .js,.ts';
    scripts['lint:fix'] = 'eslint src --ext .js,.ts --fix';

    return scripts;
  }

  /**
   * Generate server entry point
   * @returns {string} Server code
   */
  getServerCode() {
    const ext = this.typescript ? 'ts' : 'js';
    let content = '';

    switch (this.framework) {
      case 'express':
        content = `import express from 'express'${this.typescript ? ", { Request, Response, NextFunction }" : ''}
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
${this.rateLimit ? "import rateLimit from 'express-rate-limit'" : ''}

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

${this.rateLimit ? `// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api', limiter)
` : ''}

// Health check
app.get('/health', (req${this.typescript ? ': Request' : ''}, res${this.typescript ? ': Response' : ''}) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
import routes from './routes'
app.use('/api', routes)

// Error handling middleware
app.use((err${this.typescript ? ': Error' : ''}, req${this.typescript ? ': Request' : ''}, res${this.typescript ? ': Response' : ''}, next${this.typescript ? ': NextFunction' : ''}) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  })
})

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`)
})

export default app`;
        break;

      case 'fastify':
        content = `import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import compress from '@fastify/compress'
${this.rateLimit ? "import rateLimit from '@fastify/rate-limit'" : ''}
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production'
  }
})

// Register plugins
fastify.register(helmet)
fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})
fastify.register(compress)
${this.rateLimit ? `fastify.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes'
})` : ''}

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Register routes
import routes from './routes'
fastify.register(routes, { prefix: '/api' })

// Start server
const start = async () => {
  try {
    const PORT = process.env.PORT || 3001
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
    console.log(\`🚀 Server running on http://localhost:\${PORT}\`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

export default fastify`;
        break;

      case 'nestjs':
        content = `import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import * as compression from 'compression'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // Global prefix
  app.setGlobalPrefix('api')
  
  // Middleware
  app.use(helmet())
  app.use(compression())
  
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  })
  
  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }))
  
  const PORT = process.env.PORT || 3001
  await app.listen(PORT)
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`)
}

bootstrap()`;
        break;

      default:
        content = `// ${this.framework} server implementation
// TODO: Implement server setup for ${this.framework}`;
    }

    return content;
  }

  /**
   * Generate router setup
   * @returns {string} Router code
   */
  getRouterCode() {
    let content = '';

    switch (this.framework) {
      case 'express':
        content = `import { Router } from 'express'
import authRoutes from './auth'
import userRoutes from './users'

const router = Router()

// Mount route modules
router.use('/auth', authRoutes)
router.use('/users', userRoutes)

// API info
router.get('/', (req, res) => {
  res.json({
    message: 'API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users'
    }
  })
})

export default router`;
        break;

      case 'fastify':
        content = `import { FastifyPluginAsync } from 'fastify'
import authRoutes from './auth'
import userRoutes from './users'

const routes: FastifyPluginAsync = async (fastify) => {
  // Mount route modules
  fastify.register(authRoutes, { prefix: '/auth' })
  fastify.register(userRoutes, { prefix: '/users' })
  
  // API info
  fastify.get('/', async () => {
    return {
      message: 'API is running',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users'
      }
    }
  })
}

export default routes`;
        break;

      case 'nestjs':
        content = `import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}`;
        break;

      default:
        content = `// ${this.framework} router implementation`;
    }

    return content;
  }

  /**
   * Generate example route
   * @returns {Object} Example route file
   */
  getExampleRoute() {
    let path, content;

    switch (this.framework) {
      case 'express':
        path = 'src/routes/users.js';
        content = `import { Router } from 'express'
${this.validation === 'joi' ? "import Joi from 'joi'" : ''}

const router = Router()

// Get all users
router.get('/', async (req, res) => {
  try {
    // TODO: Implement user fetching logic
    res.json({ users: [] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    // TODO: Implement user fetching by ID
    res.json({ id, name: 'John Doe' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create user
router.post('/', async (req, res) => {
  try {
    ${this.validation === 'joi' ? `// Validate request body
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required()
    })
    
    const { error, value } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }` : ''}
    
    // TODO: Implement user creation
    res.status(201).json({ id: '123', ...req.body })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router`;
        break;

      case 'nestjs':
        path = 'src/users/users.controller.ts';
        content = `import { Controller, Get, Post, Body, Param, HttpStatus } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return await this.usersService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id)
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto)
  }
}`;
        break;

      default:
        path = `src/routes/users.${this.typescript ? 'ts' : 'js'}`;
        content = `// Example users route for ${this.framework}`;
    }

    return { path, content };
  }

  /**
   * Generate configuration files
   * @returns {Array} Config file definitions
   */
  getConfigFiles() {
    const configs = [];

    // TypeScript config
    if (this.typescript) {
      configs.push({
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'commonjs',
            lib: ['ES2022'],
            outDir: './dist',
            rootDir: './src',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            resolveJsonModule: true,
            moduleResolution: 'node',
            allowSyntheticDefaultImports: true,
            experimentalDecorators: this.framework === 'nestjs',
            emitDecoratorMetadata: this.framework === 'nestjs',
            strictPropertyInitialization: false,
            noImplicitAny: true,
            strictNullChecks: true,
            baseUrl: '.',
            paths: {
              '@/*': ['src/*']
            }
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'dist']
        }, null, 2)
      });
    }

    // Jest config
    if (this.testing.includes('jest')) {
      configs.push({
        path: 'jest.config.js',
        content: `module.exports = {
  preset: ${this.typescript ? "'ts-jest'" : "'jest'"},
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.${this.typescript ? 'ts' : 'js'}'],
  collectCoverageFrom: [
    'src/**/*.${this.typescript ? 'ts' : 'js'}',
    '!src/**/*.d.ts',
    '!src/**/index.${this.typescript ? 'ts' : 'js'}'
  ],
  coverageDirectory: 'coverage',
  ${this.typescript ? `transform: {
    '^.+\\.ts$': 'ts-jest'
  },` : ''}
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}`
      });
    }

    // Nodemon config
    configs.push({
      path: 'nodemon.json',
      content: JSON.stringify({
        watch: ['src'],
        ext: this.typescript ? 'ts,json' : 'js,json',
        ignore: ['src/**/*.test.*'],
        exec: this.typescript ? 'ts-node src/index.ts' : 'node src/index.js',
        env: {
          NODE_ENV: 'development'
        }
      }, null, 2)
    });

    // Environment template
    configs.push({
      path: '.env.example',
      content: `# Server Configuration
NODE_ENV=development
PORT=3001
LOG_LEVEL=info

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=

# JWT Secret
JWT_SECRET=your-secret-key-here

# API Keys
# Add your API keys here`
    });

    return configs;
  }

  /**
   * Check compatibility with other modules
   * @param {Array} otherModules - Other selected modules
   * @returns {Object} Compatibility result
   */
  checkCompatibility(otherModules) {
    const result = super.checkCompatibility(otherModules);
    
    // Check for backend service conflicts
    const backendServices = otherModules.filter(m => 
      m.moduleType === 'backend-service'
    );
    
    if (backendServices.length > 0 && this.deployment === 'serverless') {
      result.warnings.push({
        type: 'deployment-mismatch',
        message: `${this.framework} serverless deployment may conflict with ${backendServices.map(m => m.name).join(', ')}`
      });
    }

    // Check ORM compatibility
    if (this.orm) {
      const hasDatabase = otherModules.some(m => 
        m.provides.includes('database')
      );
      
      if (!hasDatabase) {
        result.warnings.push({
          type: 'missing-database',
          message: `${this.orm} ORM configured but no database module selected`
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

    // Server entry point
    preview.files.push({
      path: `src/index.${this.typescript ? 'ts' : 'js'}`,
      description: `${this.framework} server entry point`
    });

    // Routes
    preview.files.push({
      path: `${this.routesPath}/index.${this.typescript ? 'ts' : 'js'}`,
      description: 'Main router configuration'
    });

    // Example routes
    const exampleRoute = this.getExampleRoute();
    preview.files.push({
      path: exampleRoute.path,
      description: 'Example users route'
    });

    // Configuration files
    const configs = this.getConfigFiles();
    configs.forEach(config => {
      preview.files.push({
        path: config.path,
        description: `${this.framework} configuration`
      });
    });

    // Middleware directory
    preview.files.push({
      path: 'src/middleware/',
      description: 'Custom middleware directory'
    });

    // Utils directory
    preview.files.push({
      path: 'src/utils/',
      description: 'Utility functions directory'
    });

    // Package.json
    preview.modifications.push({
      path: 'package.json',
      description: `Add ${this.framework} backend dependencies and scripts`
    });

    // Warnings
    if (this.deployment === 'serverless') {
      preview.warnings.push('Serverless deployment requires additional configuration');
    }

    if (this.orm) {
      preview.warnings.push(`Remember to configure ${this.orm} after installation`);
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
      `${this.framework} Backend Setup:`,
      '1. Copy .env.example to .env',
      '2. Configure your environment variables',
      '3. Install dependencies: npm install',
      '4. Start development server: npm run dev'
    );

    // ORM setup
    if (this.orm === 'prisma') {
      instructions.push(
        '',
        'Prisma Setup:',
        '1. Configure DATABASE_URL in .env',
        '2. Create schema: npx prisma init',
        '3. Run migrations: npm run db:migrate',
        '4. Generate client: npm run db:generate'
      );
    }

    // Testing setup
    if (this.testing.length > 0) {
      instructions.push(
        '',
        'Testing:',
        '- Run tests: npm test',
        '- Watch mode: npm run test:watch',
        '- Coverage: npm run test:coverage'
      );
    }

    // Deployment notes
    if (this.deployment === 'docker') {
      instructions.push(
        '',
        'Docker Deployment:',
        '- Build image: docker build -t api .',
        '- Run container: docker run -p 3001:3001 api'
      );
    }

    return instructions;
  }
}