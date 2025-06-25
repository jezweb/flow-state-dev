# Enhanced Module Registry Documentation

The Enhanced Module Registry is a central system for discovering, loading, and managing all stack modules in Flow State Dev. It provides advanced features like versioning, search, caching, and multi-source module loading.

## Overview

The registry system consists of several components:

1. **Enhanced Module Registry** - Core registry with version management
2. **Version Manager** - Semantic versioning and conflict resolution
3. **Search Engine** - Fuzzy search with relevance scoring
4. **Cache Manager** - Performance optimization with memory/disk caching
5. **CLI Commands** - User interface for module management

## Features

### Multiple Module Sources

Modules can be loaded from various sources in priority order:

1. **Project Modules** (`./fsd-modules/`) - Project-specific modules
2. **User Modules** (`~/.fsd/modules/`) - User-installed modules
3. **Installed Modules** (`./node_modules/@fsd/`) - npm packages
4. **Built-in Modules** (`./lib/modules/implementations/`) - Core modules
5. **Legacy Modules** (`./modules/`) - Directory-based modules

### Version Management

- Semantic versioning support (^1.0.0, ~1.2.3, etc.)
- Version conflict resolution
- Pre-release version handling
- Compatible version detection

### Advanced Search

- Fuzzy matching with Fuse.js
- Relevance scoring based on multiple factors
- Search suggestions
- Filter by type, category, tags
- Find similar modules

### Performance Optimization

- In-memory caching with LRU eviction
- Disk cache persistence
- Module lazy loading
- Performance metrics tracking
- Cache warming strategies

## CLI Commands

### List Modules

```bash
# List all modules
fsd modules list

# Filter by type
fsd modules list --type frontend-framework

# Filter by category
fsd modules list --category ui

# JSON output
fsd modules list --json
```

### Search Modules

```bash
# Search for modules
fsd modules search vue

# Search with type filter
fsd modules search auth --type auth-provider

# Limit results
fsd modules search ui --limit 5
```

### Module Information

```bash
# Get detailed module info
fsd modules info vue3

# Verbose output
fsd modules info supabase --verbose

# JSON output
fsd modules info tailwind --json
```

### Check Compatibility

```bash
# Check if two modules are compatible
fsd modules check-compat vue3 vuetify

# Will show compatibility status and alternatives
```

### Registry Statistics

```bash
# Show registry stats
fsd modules stats

# Shows:
# - Total modules and versions
# - Modules by type and category
# - Cache performance metrics
# - Load time statistics
```

### Cache Management

```bash
# Clear module cache
fsd modules cache-clear
```

## Module Structure

### Implementation Module Example

```javascript
import { FrontendFrameworkModule } from '../types/frontend-framework-module.js';
import { MODULE_TYPES, MODULE_PROVIDES } from '../types/index.js';

export class Vue3Module extends FrontendFrameworkModule {
  constructor() {
    super('vue3', 'Vue 3 Frontend Framework', {
      version: '3.4.0',
      moduleType: MODULE_TYPES.FRONTEND_FRAMEWORK,
      category: 'frontend',
      provides: [
        MODULE_PROVIDES.FRONTEND,
        MODULE_PROVIDES.ROUTING,
        MODULE_PROVIDES.STATE_MANAGEMENT
      ],
      compatibleWith: ['vuetify', 'tailwind', 'pinia'],
      incompatibleWith: ['react', 'angular', 'svelte'],
      tags: ['spa', 'reactive', 'component-based']
    });
  }
}
```

### Directory Module Example

```json
{
  "id": "custom-ui",
  "name": "Custom UI Library",
  "version": "1.0.0",
  "moduleType": "ui-library",
  "category": "ui",
  "provides": ["ui-components", "styling"],
  "compatibleWith": ["vue3", "react"],
  "templatePath": "./templates"
}
```

## Performance Benchmarks

The enhanced registry is designed for speed:

- **Module Discovery**: < 25ms
- **Search Operations**: < 50ms
- **Module Loading**: < 100ms per module
- **Cache Hit Rate**: > 80% in typical usage

## Extending the Registry

### Adding a New Module Source

```javascript
registry.sources.push({
  path: './custom-modules',
  type: 'custom',
  priority: 0 // Higher priority than built-in
});
```

### Creating Custom Module Types

```javascript
export class CustomModule extends BaseStackModule {
  constructor() {
    super('custom', 'Custom Module', {
      moduleType: 'custom-type',
      category: 'other',
      // ... configuration
    });
  }
}
```

### Search Customization

```javascript
// Add custom scoring factors
searchEngine.applyScoring = function(results, query, options) {
  // Custom scoring logic
  return results;
};
```

## Best Practices

1. **Module Naming**: Use lowercase, hyphen-separated names
2. **Versioning**: Follow semantic versioning strictly
3. **Compatibility**: Explicitly define compatible/incompatible modules
4. **Performance**: Implement lazy loading for large modules
5. **Documentation**: Include comprehensive module descriptions

## Troubleshooting

### Module Not Found

```bash
# Check if module is registered
fsd modules list | grep module-name

# Search for similar names
fsd modules search module
```

### Compatibility Issues

```bash
# Check specific compatibility
fsd modules check-compat module1 module2

# Find compatible alternatives
fsd modules search --type ui-library --compatible-with vue3
```

### Performance Issues

```bash
# Check cache statistics
fsd modules stats

# Clear cache if needed
fsd modules cache-clear

# Re-initialize registry
fsd modules list --force-refresh
```

## Future Enhancements

- Community module repository
- Module popularity tracking
- Automatic updates
- Module security scanning
- GraphQL API for module queries
- Module dependency visualization