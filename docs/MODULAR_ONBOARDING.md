# Modular Onboarding System

The Flow State Dev CLI features a modular, plugin-based onboarding system that allows for extensible project initialization workflows while maintaining backward compatibility.

## Overview

The modular onboarding system breaks down the project creation process into discrete, composable steps that can be:

- **Reordered** based on priority and dependencies
- **Extended** with custom plugins
- **Configured** through JSON schemas
- **Validated** before execution
- **Rolled back** if failures occur

## Architecture

### Core Components

1. **OnboardingStep** - Base class for all onboarding steps
2. **OnboardingOrchestrator** - Manages step execution and dependency resolution  
3. **OnboardingPluginLoader** - Discovers and loads external plugins

### 🔒 Security Integration

The modular onboarding system includes comprehensive security features:

- **Repository Visibility Detection** - Automatically detects public/private GitHub repositories
- **Security Mode Selection** - Adapts configuration based on repository visibility
- **Credential Protection** - Prevents real secrets in public repositories
- **Security Templates** - Creates appropriate .gitignore, security docs, and validation
- **Secret Detection** - Validates against common secret patterns

### Built-in Steps

| Step | Priority | Dependencies | Description |
|------|----------|--------------|-------------|
| `project-name` | 1 | none | Collect and normalize project name |
| `framework-selection` | 2 | project-name | Choose framework (Vue, React, etc.) |
| `directory-selection` | 3 | project-name | Choose target directory with safety checks |
| `repository-security` | 4 | directory-selection | **🔒 Analyze repository visibility and security** |
| `template-processing` | 10 | project-name, framework-selection, directory-selection | Copy and customize template files |
| `security-validation` | 12 | template-processing, repository-security | **🔍 Set up security templates and validation** |
| `git-initialization` | 15 | template-processing | Initialize git repository |
| `supabase-config` | 20 | template-processing, repository-security | **🛡️ Configure Supabase with security-aware prompts** |
| `github-config` | 25 | git-initialization | Configure GitHub repository and labels |

## Creating Custom Steps

### Basic Step Structure

```javascript
import { OnboardingStep } from '@jezweb/flow-state-dev/lib/onboarding/base.js';

export class MyCustomStep extends OnboardingStep {
  constructor() {
    super('my-step', 'Description of what this step does', {
      priority: 50,        // Execution order (lower runs first)
      required: false,     // Whether failure stops the process
      dependencies: ['template-processing'] // Steps that must run first
    });
  }

  // Optional: Control when this step runs
  shouldRun(context) {
    return context.interactive || this.hasConfig(context);
  }

  // Optional: Validate prerequisites
  async validate(context) {
    if (!context.targetDir) {
      return { valid: false, message: 'Target directory required' };
    }
    return { valid: true };
  }

  // Required: Main execution logic
  async execute(context) {
    // Your implementation here
    console.log('Executing my custom step...');
    
    // Return updated context
    return {
      ...context,
      myStepCompleted: true
    };
  }

  // Optional: Cleanup on failure
  async rollback(context, error) {
    // Cleanup logic here
  }

  // Optional: Configuration schema
  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        myOption: {
          type: 'string',
          description: 'Custom configuration option'
        }
      }
    };
  }
}
```

### Step Context

The context object is passed between steps and contains:

```javascript
{
  // Core properties
  projectName: string,
  framework: object,
  targetDir: string,
  useCurrentDir: boolean,
  interactive: boolean,
  
  // Configuration
  options: object,      // CLI options
  config: object,       // External configuration
  
  // Results tracking
  results: {
    'step-name': { success: boolean, error?: string }
  },
  
  // Custom properties added by steps
  // ...
}
```

## Creating Plugins

### Plugin Structure

```javascript
// my-plugin.js
import { OnboardingStep } from '@jezweb/flow-state-dev/lib/onboarding/base.js';

class DockerStep extends OnboardingStep {
  // ... implementation
}

class TestingStep extends OnboardingStep {
  // ... implementation  
}

// Required: Export function to get all steps
export function getSteps() {
  return [
    new DockerStep(),
    new TestingStep()
  ];
}

// Optional: Plugin metadata
export default {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom onboarding plugin',
  getSteps
};
```

### Loading Plugins

#### Environment Variable
```bash
export FSD_PLUGIN_PATH=/path/to/my-plugin.js
fsd init my-project
```

#### Programmatic Usage
```javascript
import { runOnboarding, OnboardingPluginLoader } from '@jezweb/flow-state-dev';

const context = await runOnboarding({
  projectName: 'my-project',
  interactive: true
}, {
  pluginFilter: ['/path/to/my-plugin.js']
});
```

## Advanced Usage

### Custom Orchestrator

```javascript
import { OnboardingOrchestrator } from '@jezweb/flow-state-dev';
import { MyCustomStep } from './my-steps.js';

const orchestrator = new OnboardingOrchestrator();

// Register custom steps
orchestrator.registerStep(new MyCustomStep());

// Execute with custom context
const result = await orchestrator.execute({
  projectName: 'my-project',
  config: {
    myStep: {
      myOption: 'value'
    }
  }
});
```

### Step Dependencies

Steps can declare dependencies to ensure proper execution order:

```javascript
class DatabaseStep extends OnboardingStep {
  constructor() {
    super('database', 'Set up database', {
      priority: 20,
      dependencies: ['template-processing', 'docker-config']
    });
  }
}
```

### Configuration Schema

Steps can define JSON schemas for validation:

```javascript
getConfigSchema() {
  return {
    type: 'object',
    properties: {
      database: {
        type: 'object',
        properties: {
          type: { 
            type: 'string', 
            enum: ['postgres', 'mysql', 'sqlite'] 
          },
          host: { type: 'string' },
          port: { type: 'integer' }
        },
        required: ['type']
      }
    }
  };
}
```

## Error Handling

### Step Validation
```javascript
async validate(context) {
  // Check Docker availability
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      message: 'Docker is required but not installed' 
    };
  }
}
```

### Rollback on Failure
```javascript
async rollback(context, error) {
  // Clean up created files
  if (context.dockerFilesCreated) {
    await fs.remove(path.join(context.targetDir, 'docker-compose.yml'));
  }
}
```

### Error Propagation
- **Required steps**: Failure stops the entire process
- **Optional steps**: Failure is logged but process continues
- **Rollback**: Attempted for failed steps in reverse order

## Best Practices

### Step Design
1. **Single Responsibility** - Each step should do one thing well
2. **Idempotent** - Steps should be safe to run multiple times
3. **Configurable** - Support both interactive and config-driven modes
4. **Validatable** - Check prerequisites before execution
5. **Reversible** - Implement rollback for cleanup

### Plugin Development
1. **Clear Dependencies** - Declare all step dependencies
2. **Schema Validation** - Define configuration schemas
3. **Error Handling** - Implement proper validation and rollback
4. **Documentation** - Document configuration options and usage
5. **Testing** - Test with various configurations and error conditions

### Performance
1. **Lazy Loading** - Only import/initialize what's needed
2. **Concurrent Operations** - Use async/await appropriately
3. **Progress Feedback** - Provide clear progress indicators
4. **Resource Cleanup** - Clean up temporary resources

## 🔒 Security Workflow

The security-enhanced onboarding workflow automatically adapts based on repository context:

### Public Repository Flow
```
🔍 Repository Analysis
⚠️  PUBLIC repository detected: github.com/user/my-project

🚨 SECURITY WARNING: This is a PUBLIC repository!
   Anyone can see your code and any secrets you commit.

Recommended actions:
1. Use placeholder values for all credentials
2. Never commit real API keys or passwords
3. Consider making this repository private

🔒 Using placeholder values for security (public repository)
📄 Created .env.example with placeholder values
📖 Created ENVIRONMENT_SETUP.md for configuration instructions
🔍 Created secret detection patterns
📚 Created security documentation
```

### Private Repository Flow
```
🔍 Repository Analysis
🔒 PRIVATE repository detected: github.com/user/my-project

✅ PRIVATE REPOSITORY: SECURE CONFIGURATION
   Safe to configure with real credentials

🔧 Configure Supabase with your real credentials
✅ Supabase configured with security-appropriate settings
🔍 Created secret detection patterns
📚 Created security documentation
```

### Security Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| `public-demo` | Public GitHub repo | Placeholder values, .env.example, security warnings |
| `private-secure` | Private GitHub repo | Real credentials allowed, .env files, team features |
| `unknown-cautious` | Unknown visibility | Placeholder values for safety, GitHub CLI suggestions |
| `local-development` | No git repo | Local development setup, repository guidance |

## Examples

See `/examples/custom-onboarding-plugin.js` for a complete example that demonstrates:

- Docker development environment setup
- Testing framework configuration
- File generation and template processing
- Interactive prompts and validation
- Error handling and rollback

## Migration Guide

### From Legacy CLI

The new modular system is backward compatible. Existing CLI usage continues to work:

```bash
# Still works exactly as before
fsd init my-project --here --no-interactive
```

### Adding Custom Steps

To extend the existing flow:

1. Create custom step classes
2. Export via `getSteps()` function
3. Set `FSD_PLUGIN_PATH` environment variable
4. Run CLI normally

### Configuration Files

Future versions will support configuration files:

```json
// fsd.config.json
{
  "plugins": ["./my-plugin.js"],
  "steps": {
    "docker-config": {
      "services": ["postgres", "redis"]
    },
    "testing-setup": {
      "framework": "vitest"
    }
  }
}
```

## Troubleshooting

### Plugin Not Loading
1. Check `FSD_PLUGIN_PATH` environment variable
2. Verify plugin exports `getSteps()` function
3. Check for syntax errors in plugin file

### Step Dependencies
1. Verify dependency names match step names exactly
2. Check for circular dependencies
3. Ensure required dependencies are available

### Validation Errors
1. Check step validation logic
2. Verify context has required properties
3. Test with minimal configuration

### Performance Issues
1. Use async operations appropriately
2. Avoid blocking the event loop
3. Implement proper error boundaries