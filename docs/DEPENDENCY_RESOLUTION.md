# Module Dependency Resolution System

The Module Dependency Resolution System is a sophisticated engine that validates and resolves module dependencies for Flow State Dev's modular stack selection architecture. It ensures that selected module combinations are compatible and provides intelligent suggestions for resolving conflicts.

## Overview

The dependency system consists of three main components:

1. **ModuleDependencyResolver** - Core validation and resolution engine
2. **ModuleSuggestionEngine** - Intelligent recommendation system
3. **Dependency Graph** - Visual representation of module relationships

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                Module Dependency Resolver                   │
├─────────────────────────────────────────────────────────────┤
│ • Module Registry (Map)                                     │
│ • Compatibility Matrix (Map)                                │
│ • Dependency Graph (Map)                                    │
│ • Resolution Cache (Map)                                    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│               Module Suggestion Engine                      │
├─────────────────────────────────────────────────────────────┤
│ • Popular Combinations (Map)                               │
│ • Recommendation Algorithms                                │
│ • Alternative Finding                                      │
│ • Score Calculation                                        │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Basic Module Registration

```javascript
import { ModuleDependencyResolver } from './lib/modules/dependency-resolver.js';

const resolver = new ModuleDependencyResolver();

// Register a module
const vueModule = {
  name: 'vue3',
  version: '3.4.0',
  moduleType: 'frontend-framework',
  provides: ['frontend', 'routing', 'state-management'],
  requires: [],
  compatibleWith: ['vuetify', 'tailwind', 'supabase'],
  incompatibleWith: ['react', 'angular']
};

resolver.registerModule(vueModule);
```

### Validation

```javascript
// Validate a module selection
const result = await resolver.validate(['vue3', 'vuetify', 'supabase']);

if (result.valid) {
  console.log('✅ Module combination is valid');
} else {
  console.log('❌ Conflicts detected:', result.conflicts);
  console.log('📋 Missing requirements:', result.missing);
  console.log('💡 Suggestions:', result.suggestions);
}
```

### Getting Suggestions

```javascript
import { ModuleSuggestionEngine } from './lib/modules/suggestion-engine.js';

const suggestionEngine = new ModuleSuggestionEngine(resolver);

const suggestions = await suggestionEngine.getSuggestions(['vue3']);

console.log('🎯 Recommended:', suggestions.recommended);
console.log('🌟 Popular combinations:', suggestions.popular);
console.log('🔗 Compatible modules:', suggestions.compatible);
console.log('💡 Alternatives:', suggestions.alternatives);
```

## Module Definition

### Module Properties

```javascript
{
  name: 'module-name',           // Unique identifier
  version: '1.0.0',              // Semantic version
  moduleType: 'frontend-framework', // Module type/category
  provides: [],                  // Capabilities this module provides
  requires: [],                  // Required capabilities or modules
  compatibleWith: [],            // Explicitly compatible modules
  incompatibleWith: [],          // Explicitly incompatible modules
  optional: []                   // Optional dependencies
}
```

### Module Types

The system recognizes these module types:

- `frontend-framework` - Vue, React, Angular, SvelteKit (exclusive)
- `ui-library` - Vuetify, Tailwind, Material-UI
- `backend-service` - Supabase, Firebase, custom APIs
- `authentication` - Better Auth, Auth0, custom auth
- `state-manager` - Pinia, Redux, Zustand
- `build-tool` - Vite, Webpack, Rollup (exclusive)
- `package-manager` - npm, yarn, pnpm (exclusive)

### Capability System

Modules can provide and require capabilities:

```javascript
// Example: React module requires state management
{
  name: 'react',
  requires: ['state-management'],
  provides: ['frontend']
}

// Redux provides state management
{
  name: 'redux',
  provides: ['state-management'],
  compatibleWith: ['react']
}
```

## Conflict Detection

### Types of Conflicts

1. **Direct Conflicts** - Modules explicitly incompatible
   ```javascript
   // Vue and React cannot be used together
   incompatibleWith: ['react']
   ```

2. **Exclusive Type Conflicts** - Only one module of certain types allowed
   ```javascript
   // Only one frontend framework allowed
   moduleType: 'frontend-framework'
   ```

3. **Circular Dependencies** - Modules depend on each other
   ```javascript
   moduleA.requires = ['moduleB']
   moduleB.requires = ['moduleA']
   ```

4. **Version Conflicts** - Incompatible version requirements
   ```javascript
   // Module A requires vue@^3.0.0
   // Module B requires vue@^2.0.0
   ```

### Conflict Resolution

The system provides several resolution strategies:

1. **Priority-based** - Higher priority modules win
2. **Interactive** - Ask user to choose
3. **Merge** - Attempt intelligent merging
4. **Suggest alternatives** - Recommend compatible replacements

## Suggestion Engine

### Popular Combinations

Pre-defined popular stack combinations:

```javascript
'vue-material': {
  modules: ['vue3', 'vuetify', 'supabase'],
  name: 'Classic Vue Stack',
  popularity: 95,
  tags: ['beginner-friendly', 'full-stack']
}
```

### Recommendation Algorithm

The engine scores modules based on:

1. **Base Score** (50 points)
2. **Popular Combination Bonus** (+20 points)
3. **Explicit Compatibility Bonus** (+10 points)
4. **Required Capability Bonus** (+15 points)

### Suggestion Types

1. **Recommended** - Fill missing module types
2. **Popular** - Matching popular combinations
3. **Compatible** - All compatible modules by type
4. **Alternatives** - Resolve conflicts

## Performance Optimization

### Caching System

```javascript
// Results are cached by selection signature
const cacheKey = selection.sort().join(',');
if (this.resolutionCache.has(cacheKey)) {
  return this.resolutionCache.get(cacheKey);
}
```

### Performance Metrics

The system tracks:
- Validation duration
- Module count processed
- Cache hit rate
- Memory usage

### Optimization Features

1. **Lazy Loading** - Modules loaded on demand
2. **Parallel Processing** - Concurrent validation
3. **Result Caching** - LRU cache for repeated queries
4. **Early Exit** - Stop on first conflict when possible

## API Reference

### ModuleDependencyResolver

#### Methods

```javascript
// Register a module
registerModule(module: Module): void

// Validate module selection
async validate(selection: string[] | object): Promise<ValidationResult>

// Find modules providing capability
async findModulesProviding(capability: string): Promise<string[]>

// Find alternative modules
async findAlternatives(moduleName: string, selection: string[]): Promise<string[]>

// Get installation order (topological sort)
getInstallationOrder(modules: string[]): string[]

// Get compatibility report
getCompatibilityReport(moduleName: string): CompatibilityReport

// Clear validation cache
clearCache(): void
```

#### Data Structures

```typescript
interface ValidationResult {
  valid: boolean;
  conflicts: Conflict[];
  missing: MissingRequirement[];
  suggestions: Suggestion[];
  warnings: Warning[];
}

interface Conflict {
  type: 'direct' | 'exclusive' | 'circular' | 'version';
  module: string;
  conflictsWith?: string;
  modules?: string[]; // For circular conflicts
  reason: string;
}

interface MissingRequirement {
  module: string;
  requires: string;
  type: 'module' | 'capability';
}
```

### ModuleSuggestionEngine

#### Methods

```javascript
// Get comprehensive suggestions
async getSuggestions(selection: string[], context?: object): Promise<Suggestions>

// Get recommended modules
async getRecommendedModules(selection: string[], context?: object): Promise<Recommendation[]>

// Get popular combinations
getPopularCombinations(selection: string[]): PopularCombination[]

// Get compatible modules
async getCompatibleModules(selection: string[]): Promise<CompatibleModules>

// Format suggestions for display
formatSuggestions(suggestions: Suggestions): string
```

#### Data Structures

```typescript
interface Suggestions {
  recommended: Recommendation[];
  popular: PopularCombination[];
  compatible: CompatibleModules;
  alternatives: Alternative[];
}

interface Recommendation {
  module: string;
  reason: string;
  score: number;
  type: 'missing-type' | 'requirement';
}

interface PopularCombination {
  id: string;
  name: string;
  description: string;
  modules: string[];
  popularity: number;
  tags: string[];
  matchCount: number;
  missingModules: string[];
}
```

## Examples

### Basic Validation

```javascript
// Valid combination
const result = await resolver.validate(['vue3', 'vuetify', 'supabase']);
console.log(result.valid); // true

// Invalid combination (React requires state management)
const result = await resolver.validate(['react']);
console.log(result.valid); // false
console.log(result.missing); // [{ module: 'react', requires: 'state-management' }]
```

### Getting Suggestions

```javascript
const suggestions = await suggestionEngine.getSuggestions(['vue3']);

// Recommended modules to complete the stack
console.log(suggestions.recommended);
// [{ module: 'vuetify', reason: 'Complete your stack with a ui-library' }]

// Popular combinations including Vue
console.log(suggestions.popular);
// [{ name: 'Classic Vue Stack', missingModules: ['vuetify', 'supabase'] }]
```

### Conflict Resolution

```javascript
// Detect conflicts
const result = await resolver.validate(['vue3', 'react']);
console.log(result.conflicts);
// [{ type: 'exclusive', module: 'vue3', conflictsWith: 'react' }]

// Get alternatives
const alternatives = await suggestionEngine.getAlternativeSuggestions(result);
console.log(alternatives);
// [{ type: 'replace', remove: 'react', add: 'sveltekit' }]
```

### Installation Order

```javascript
// Get topological sort for installation
const order = resolver.getInstallationOrder(['vuetify', 'vue3', 'supabase']);
console.log(order);
// ['vue3', 'supabase', 'vuetify'] - dependencies first
```

## Best Practices

### Module Design

1. **Clear Dependencies** - Explicitly declare requirements
2. **Minimal Conflicts** - Only mark truly incompatible modules
3. **Wildcard Compatibility** - Use '*' for widely compatible modules
4. **Semantic Versioning** - Follow semver for version constraints

### Performance

1. **Cache Results** - Enable caching for repeated validations
2. **Batch Operations** - Validate multiple selections together
3. **Early Validation** - Check simple conflicts first
4. **Memory Management** - Clear cache when memory constrained

### Error Handling

1. **Graceful Degradation** - Continue on non-critical errors
2. **User Feedback** - Provide clear error messages
3. **Recovery Suggestions** - Offer ways to fix issues
4. **Logging** - Track resolution patterns for optimization

## Testing

### Test Coverage

The system includes comprehensive tests for:

- Module registration and validation
- All conflict detection types
- Suggestion generation algorithms
- Performance and caching
- Edge cases and error conditions

### Running Tests

```bash
# Run dependency resolver tests
npm test test/modules/dependency-resolver.test.js

# Run suggestion engine tests
npm test test/modules/suggestion-engine.test.js

# Run all module tests
npm test test/modules/
```

## Migration Guide

### From Simple Dependencies

If upgrading from a simple dependency system:

1. Convert string dependencies to capability-based system
2. Add compatibility matrices
3. Implement conflict detection
4. Add suggestion engine integration

### Integration with Existing Systems

The dependency resolver can be integrated with:

1. **CLI Tools** - Interactive module selection
2. **Web UIs** - Visual dependency graphs
3. **Build Systems** - Validate before generation
4. **Documentation** - Generate compatibility reports

## Troubleshooting

### Common Issues

1. **Circular Dependencies**
   ```
   Error: Circular dependency detected: moduleA -> moduleB -> moduleA
   Solution: Remove or restructure dependencies
   ```

2. **Missing Requirements**
   ```
   Error: Module 'react' requires 'state-management'
   Solution: Add Redux, Zustand, or another state manager
   ```

3. **Version Conflicts**
   ```
   Error: Incompatible version requirements for vue
   Solution: Update modules to compatible versions
   ```

### Debug Mode

Enable debug logging:

```javascript
const resolver = new ModuleDependencyResolver({ debug: true });
```

### Performance Issues

If validation is slow:

1. Enable result caching
2. Reduce module count
3. Optimize dependency graphs
4. Use parallel validation

## Future Enhancements

### Planned Features

1. **Visual Dependency Graph** - Interactive module relationships
2. **Machine Learning** - Learn from user preferences
3. **Community Ratings** - User-driven popularity scores
4. **Auto-resolution** - Automatic conflict resolution
5. **Plugin System** - Custom validation rules

### Contributing

To contribute to the dependency system:

1. Add new module types in the type registry
2. Implement custom conflict detection rules
3. Create new suggestion algorithms
4. Add popular combinations
5. Improve performance optimizations

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.