# Flow State Dev API

Programmatic API for Flow State Dev CLI functionality. This API wrapper allows GUI applications and other tools to use Flow State Dev features without executing CLI commands directly.

## Installation

```javascript
import { FlowStateAPI } from 'flow-state-dev/lib/api';

// Create API instance
const api = new FlowStateAPI();

// Initialize
await api.initialize();
```

## Usage

### Project Creation

```javascript
// Create a new project
const result = await api.createProject('my-app', {
  preset: 'vue-full-stack',
  skipInstall: false,
  packageManager: 'npm'
});

// Or with specific modules
const result = await api.createProject('my-app', {
  modules: ['vue-base', 'vuetify', 'supabase', 'vercel']
});
```

### Module Management

```javascript
// List all modules
const modules = await api.getModules();

// Filter by category
const uiModules = await api.getModules({ category: 'ui-library' });

// Search modules
const vueModules = await api.modules.search('vue');

// Check compatibility
const compatibility = await api.modules.checkCompatibility([
  'vue-base', 'react' // Will show incompatibility
]);
```

### Diagnostics

```javascript
// Run full system diagnostics
const diagnostics = await api.runDiagnostics();

// Check specific aspects
const doctor = api.doctor;
const nodeCheck = await doctor.checkNode();
const gitCheck = await doctor.checkGit();
```

### Memory Management

```javascript
// Initialize Claude memory
await api.memory.initialize({
  name: 'John Doe',
  role: 'Vue Developer',
  template: 'vue-developer'
});

// Read existing memory
const memory = await api.memory.read();

// Update memory
await api.memory.update(newContent);
```

### GitHub Integration

```javascript
// Initialize with token
await api.github.initialize(process.env.GITHUB_TOKEN);

// Create labels
const labels = await api.github.createLabels('owner', 'repo', {
  preset: 'flowstate',
  update: true
});

// Create issue
const issue = await api.github.createIssue('owner', 'repo', {
  title: 'New feature request',
  body: 'Description here',
  labels: ['enhancement', 'priority:medium']
});
```

## Events

The API emits events for progress tracking:

```javascript
// Listen to progress events
api.on('progress', (data) => {
  console.log(`${data.step}: ${data.message}`);
});

// Listen to errors
api.on('error', (error) => {
  console.error('API Error:', error);
});

// Convenience method
api.onProgress(
  (progress) => console.log(progress),
  (error) => console.error(error)
);
```

## API Reference

### FlowStateAPI

Main API class providing access to all functionality.

#### Methods

- `initialize()` - Initialize the API
- `getVersion()` - Get version information
- `getStatus()` - Get API status
- `createProject(name, options)` - Create new project
- `getPresets()` - List available presets
- `getModules(filters)` - List modules
- `runDiagnostics()` - Run diagnostics
- `cleanup()` - Clean up resources

### Sub-APIs

#### modules
- `list(filters)` - List modules
- `get(name)` - Get module details
- `search(query, options)` - Search modules
- `checkCompatibility(modules)` - Check compatibility
- `getCategories()` - Get categories
- `getStatistics()` - Get statistics

#### project
- `create(name, options)` - Create project
- `getPresets()` - Get presets
- `validateStack(modules)` - Validate stack
- `createPreset(config)` - Create custom preset

#### doctor
- `runDiagnostics()` - Full diagnostics
- `checkSystem()` - System check
- `checkNode()` - Node.js check
- `checkGit()` - Git check
- `checkProject()` - Project check

#### memory
- `initialize(options)` - Create memory file
- `read(path)` - Read memory
- `update(content, path)` - Update memory
- `getTemplates()` - List templates
- `validate(content)` - Validate content

#### github
- `initialize(token)` - Authenticate
- `createLabels(owner, repo, options)` - Create labels
- `getRepository(owner, repo)` - Get repo info
- `createIssue(owner, repo, issue)` - Create issue
- `getIssues(owner, repo, filters)` - List issues

## Error Handling

```javascript
try {
  const result = await api.createProject('my-app', {
    preset: 'invalid-preset'
  });
} catch (error) {
  console.error('Failed to create project:', error.message);
}
```

## Examples

### GUI Integration

```javascript
// In an Electron app
const { FlowStateAPI } = require('flow-state-dev/lib/api');

class ProjectCreator {
  constructor() {
    this.api = new FlowStateAPI({ silent: true });
  }
  
  async createProject(config) {
    // Show loading UI
    this.showLoading();
    
    // Track progress
    this.api.on('progress', (data) => {
      this.updateProgress(data.message);
    });
    
    try {
      const result = await this.api.createProject(config.name, {
        preset: config.preset,
        skipInstall: config.skipInstall
      });
      
      this.showSuccess(result);
    } catch (error) {
      this.showError(error);
    }
  }
}
```

### Automation Script

```javascript
// Batch project creation
const projects = [
  { name: 'app-frontend', preset: 'vue-frontend' },
  { name: 'app-backend', preset: 'backend-only' },
  { name: 'app-admin', preset: 'vue-full-stack' }
];

for (const project of projects) {
  console.log(`Creating ${project.name}...`);
  
  const result = await api.createProject(project.name, {
    preset: project.preset,
    skipInstall: true
  });
  
  console.log(`✓ Created ${project.name} in ${result.duration}ms`);
}
```

## Best Practices

1. **Always initialize**: Call `api.initialize()` before using other methods
2. **Handle errors**: Wrap API calls in try-catch blocks
3. **Clean up**: Call `api.cleanup()` when done
4. **Use events**: Listen to progress events for better UX
5. **Validate input**: Check module compatibility before creating projects

## License

MIT