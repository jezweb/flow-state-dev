# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flow State Dev (FSD) is a CLI tool for scaffolding modern web projects with built-in security, comprehensive documentation, and AI-optimized workflows. It creates Vue 3, React, or SvelteKit projects with Supabase integration and extensive project management features.

## Common Development Commands

### Testing
```bash
npm run test              # Run main test suite (test/test-runner.js)
npm run test:quick        # Quick test via shell script
npm run test:all          # Run all tests
npm run test:modules      # Test module system
npm run test:integration  # Integration tests
npm run test:commands     # Test slash commands
```

### GUI Development
```bash
npm run gui              # Install deps and start GUI dev server
npm run gui:dev          # Start GUI dev server (deps already installed)
npm run gui:build        # Build GUI for production
cd gui-temp && npm run dev  # Direct GUI development
```

### Release & Publishing
```bash
npm run release:patch    # Bump patch version
npm run release:minor    # Bump minor version
npm run release:major    # Bump major version
npm run release:validate # Validate before release
npm run release:publish  # Publish to npm
```

### Security
```bash
npm run security:scan    # Scan for exposed secrets
fsd security check       # Check repository security status
```

## Architecture

### Modular Command System
All CLI commands extend `BaseSlashCommand` (lib/commands/base.js):
- Commands organized in categories: quick-action, sprint, epic, etc.
- Dynamic loading via CommandRegistry
- Each command is a separate ES module
- Consistent interface with execute(), prompt(), and validation

### Module System Architecture
- **ModuleLoader** (lib/modules/module-loader.js): Loads modules dynamically
- **ModuleRegistry** (lib/modules/registry.js): Manages available modules
- **Base Classes** in lib/modules/types/:
  - FrontendFrameworkModule
  - UILibraryModule
  - BackendServiceModule
  - AuthProviderModule
- **Implementations** in lib/modules/implementations/

### API Layer (New)
Located in lib/api/, provides programmatic access:
- **FlowStateAPI**: Main API class
- **ModulesAPI**: Module operations
- **ProjectAPI**: Project creation
- **DoctorAPI**: System diagnostics
- Uses EventEmitter for progress tracking

### Onboarding System
Plugin-based initialization in lib/onboarding/:
- Each step extends OnboardingStep base class
- Steps can have dependencies and validation
- Context passed between steps
- Supports both interactive and non-interactive modes

### Template System
- Handlebars templates with custom helpers
- Template files use .template extension
- Supports conditional rendering and loops
- Custom helpers: isSignUp, loading, year, default

## Key Patterns

### Module Creation Pattern
```javascript
export default class MyModule extends BaseModule {
  constructor() {
    super({
      name: 'my-module',
      displayName: 'My Module',
      category: 'backend-service',
      // ... configuration
    });
  }
}
```

### Command Creation Pattern
```javascript
export default class MyCommand extends BaseSlashCommand {
  constructor() {
    super('/my-command', 'Description', {
      category: 'quick-action',
      aliases: ['/mc'],
      // ... options
    });
  }
  
  async execute(options) {
    // Implementation
  }
}
```

### Error Handling
- All errors should be descriptive and actionable
- Use chalk for colored output
- Provide recovery suggestions when operations fail

## Testing Approach

### Test Structure
- Unit tests for modules in test/modules/
- Integration tests in test/integration/
- Custom test runner in test/test-runner.js
- Mock implementations for external dependencies

### Running Single Tests
```bash
# Run specific test file
node test/test-runner.js --filter "Framework Selection"

# Run module tests with watch
npm run test:modules:watch

# Run with coverage
npm run test:modules:coverage
```

## GUI Development (gui-temp/)

### Tech Stack
- Vue 3 with Composition API
- Vuetify 3 for UI components
- Pinia for state management
- Vite for build tooling

### Mock API
Currently uses mockFlowStateApi.js to avoid Node.js import issues in browser. Real API integration requires:
1. Fixing remaining import paths in lib/api/
2. Creating a build process for browser compatibility
3. Or implementing a backend server

### Key Components
- **CreateProject.vue**: Project creation wizard
- **ModulesView.vue**: Module explorer
- **DiagnosticsView.vue**: System health checks
- **flowStateApi.js**: API service layer

## Current State & Known Issues

### Working Features
- Full CLI functionality with 67+ slash commands
- Module system with dynamic loading
- Project creation with multiple frameworks
- Security scanning and validation
- GUI with mock API

### Areas Needing Work
- API layer has unresolved imports (config-manager, commands/)
- GUI uses mock data instead of real API
- Some test files need updating for modular architecture

## Development Tips

1. When adding new modules, extend appropriate base class from lib/modules/types/
2. New commands go in lib/commands/{category}/{command}.js
3. Always add tests for new functionality
4. Use EventEmitter pattern for progress reporting
5. Keep templates in module directories, not scattered

## File Organization

```
lib/
├── api/              # New API wrapper layer
├── commands/         # All slash commands by category
├── modules/          # Module system core
│   ├── implementations/  # Concrete modules
│   ├── types/           # Base classes
│   └── validation/      # Validators
├── onboarding/       # Project initialization
└── services/         # External service integrations
```