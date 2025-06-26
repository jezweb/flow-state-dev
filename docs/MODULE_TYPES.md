# Module Type System

This document describes the specialized module types implemented for Flow State Dev's modular stack selection system.

## Overview

The module type system provides specialized base classes for different categories of stack modules, each with framework-specific functionality and integration patterns.

## Available Module Types

### FrontendFrameworkModule

**Purpose**: Handles frontend frameworks like Vue, React, Svelte, etc.

**Key Features**:
- Build tool configuration (Vite, Webpack)
- TypeScript support
- Testing framework integration (Vitest, Jest)
- Linting and formatting setup
- Framework-specific entry points
- State management integration
- Routing configuration

**Example Usage**:
```javascript
import { FrontendFrameworkModule } from './lib/modules/types/frontend-framework-module.js';

const vueModule = new FrontendFrameworkModule('vue3', 'Vue 3 Framework', {
  framework: 'vue',
  buildTool: 'vite',
  typescript: true,
  stateManagement: 'pinia',
  compatibleWith: ['vuetify', 'tailwind']
});
```

### UILibraryModule

**Purpose**: Manages UI component libraries and CSS frameworks.

**Key Features**:
- Component vs utility library types
- Theme and dark mode support
- Framework compatibility checking
- Icon set integration
- Responsive design configuration
- Accessibility compliance
- Style import generation

**Example Usage**:
```javascript
import { UILibraryModule } from './lib/modules/types/ui-library-module.js';

const vuetifyModule = new UILibraryModule('vuetify', 'Vuetify Material Design', {
  libraryType: 'component',
  compatibleFrameworks: ['vue'],
  themeSupport: true,
  iconSet: 'material-icons'
});
```

### BackendServiceModule

**Purpose**: Integrates backend-as-a-service providers and APIs.

**Key Features**:
- Service configuration generation
- Authentication service setup
- Database service implementation
- Storage service integration
- Environment variable management
- Local development setup
- Real-time feature support

**Example Usage**:
```javascript
import { BackendServiceModule } from './lib/modules/types/backend-service-module.js';

const supabaseModule = new BackendServiceModule('supabase', 'Supabase Backend', {
  features: {
    database: true,
    auth: true,
    storage: true,
    realtime: true
  },
  localDevelopment: true
});
```

### AuthProviderModule

**Purpose**: Handles authentication providers and user management.

**Key Features**:
- Multiple authentication methods
- Social provider integration
- Multi-factor authentication
- Session management (JWT, sessions)
- User management features
- Role-based access control
- Compliance support (GDPR, SOC2)

**Example Usage**:
```javascript
import { AuthProviderModule } from './lib/modules/types/auth-provider-module.js';

const auth0Module = new AuthProviderModule('auth0', 'Auth0 Authentication', {
  authMethods: ['email', 'social'],
  socialProviders: ['google', 'github'],
  mfa: true,
  sso: true,
  compliance: ['soc2', 'gdpr']
});
```

### BackendFrameworkModule

**Purpose**: Manages backend framework setup and configuration.

**Key Features**:
- Server framework configuration
- Middleware setup
- API routing
- Database ORM integration
- Testing framework setup
- Deployment configuration
- Security middleware (CORS, Helmet)

**Example Usage**:
```javascript
import { BackendFrameworkModule } from './lib/modules/types/backend-framework-module.js';

const expressModule = new BackendFrameworkModule('express', 'Express.js Framework', {
  framework: 'express',
  typescript: true,
  validation: 'joi',
  orm: 'prisma',
  deployment: 'node'
});
```

## Common Base Class Features

All specialized modules extend `BaseStackModule` which provides:

### Core Properties
- **name**: Unique identifier
- **moduleType**: Type classification
- **category**: Organizational category
- **provides**: Capabilities offered
- **requires**: Dependencies needed
- **compatibleWith**: Compatible modules
- **incompatibleWith**: Conflicting modules

### Common Methods
- **getMetadata()**: Extended module information
- **checkCompatibility()**: Validate module combinations
- **getTemplateFiles()**: Template file structure
- **getMergeStrategy()**: File merging approach
- **validateConfig()**: Configuration validation
- **previewChanges()**: Preview generated files
- **getPostInstallInstructions()**: Setup guidance

## Integration with Dependency System

The module types integrate with the dependency resolution system to:

1. **Validate Compatibility**: Check module combinations for conflicts
2. **Resolve Dependencies**: Automatically include required modules
3. **Suggest Alternatives**: Recommend compatible replacements
4. **Order Installation**: Determine optimal installation sequence

## Template Generation

Each module type supports intelligent template generation:

### File Merge Strategies
- **Replace**: Complete file replacement
- **Merge**: Smart content merging
- **Append**: Add content to existing files
- **Custom**: Module-specific logic

### Variable Substitution
- Project metadata (name, description, author)
- Module-specific variables
- Framework configuration
- Environment-specific values

## Testing

Comprehensive test suites validate:
- Module construction and configuration
- Compatibility checking logic
- Template generation
- Service code generation
- Configuration file creation
- Post-install instruction generation

## Development Guidelines

### Adding New Module Types

1. Extend `BaseStackModule`
2. Define type-specific properties
3. Implement required methods
4. Add compatibility logic
5. Create template generators
6. Write comprehensive tests
7. Update documentation

### Best Practices

1. **Clear Dependencies**: Explicitly declare all requirements
2. **Minimal Conflicts**: Only mark truly incompatible modules
3. **Comprehensive Testing**: Cover all features and edge cases
4. **User-Friendly Messages**: Provide clear instructions and errors
5. **Consistent Patterns**: Follow established conventions

## Related Documentation

- [Dependency Resolution System](./DEPENDENCY_RESOLUTION.md)
- [Template Generator Documentation](./TEMPLATE_GENERATOR.md)
- [Module Registry Guide](./MODULE_REGISTRY.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

## Future Enhancements

Planned improvements include:
- Visual module designer
- Community module marketplace
- Advanced conflict resolution
- Performance optimizations
- Plugin system for custom types