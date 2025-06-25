# Testing Infrastructure

Flow State Dev includes a comprehensive testing infrastructure built on Jest with custom utilities and test patterns designed for modular architecture validation.

## Test Structure

```
test/
├── setup.js                    # Global test setup and custom matchers
├── utils/                      # Test utilities and helpers
│   ├── test-helpers.js         # Common test utilities
│   └── mock-modules.js         # Mock module definitions
├── modules/                    # Unit tests for core modules
│   ├── registry.test.js        # Module registry tests
│   ├── module-loader.test.js   # Module loading tests
│   ├── dependency-resolver.test.js  # Dependency resolution tests
│   ├── template-generator.test.js   # Template generation tests
│   └── validation.test.js      # Module validation tests
├── integration/                # Integration tests
│   ├── module-system.test.js   # End-to-end module system tests
│   ├── onboarding-flow.test.js # Complete onboarding flow tests
│   └── cli-commands.test.js    # CLI command integration tests
├── migration/                  # Migration system tests
│   ├── analyzer.test.js        # Project analysis tests
│   ├── migrator.test.js        # Migration engine tests
│   └── backup.test.js          # Backup system tests
└── performance/                # Performance benchmarks
    └── benchmarks.test.js      # Performance and stress tests
```

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: [
    '<rootDir>/test/**/*.test.js'
  ],
  collectCoverageFrom: [
    'lib/**/*.js',
    'bin/**/*.js',
    '!lib/**/*.test.js',
    '!**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90
    }
  },
  globals: {
    testRootDir: process.cwd()
  }
};
```

### Custom Matchers

The test setup includes custom Jest matchers for domain-specific assertions:

- `toBeValidModule(module)` - Validates module structure
- `toHaveValidDependencyGraph(graph)` - Validates dependency graphs
- `toBeValidTemplate(template)` - Validates template structure

## Test Utilities

### Test Helpers (`test/utils/test-helpers.js`)

```javascript
// Create isolated test directories
await createTestDir('test-name')

// Create mock modules for testing
await createMockModule(dir, moduleConfig)

// Run CLI commands in tests
await runCommand('fsd modules list')

// File assertions
await assertFileExists(path)
await assertFileContains(path, content)
```

### Mock Modules (`test/utils/mock-modules.js`)

Pre-defined mock modules for consistent testing:

- `vue-base` - Vue 3 framework mock
- `vuetify` - Vuetify UI library mock
- `supabase` - Supabase backend mock
- `pinia` - State management mock
- `react-base` - React framework mock

## Test Categories

### Unit Tests

Test individual components in isolation:

```bash
npm run test:unit
```

Coverage targets:
- **Registry**: Module discovery, querying, validation
- **Loader**: Module loading, caching, error handling
- **Resolver**: Dependency resolution, conflict detection
- **Generator**: Template processing, file merging
- **Validator**: Security checks, schema validation

### Integration Tests

Test complete workflows:

```bash
npm run test:integration
```

Coverage areas:
- **Module System**: End-to-end module resolution and generation
- **Onboarding Flow**: Complete project creation workflow
- **CLI Commands**: All command-line interface functions

### Migration Tests

Test project migration functionality:

```bash
npm run test:migration
```

Coverage areas:
- **Analyzer**: Project type detection, complexity assessment
- **Migrator**: Migration execution, rollback, validation
- **Backup**: Backup creation, restoration, cleanup

### Performance Tests

Benchmark system performance:

```bash
npm run test:performance
```

Performance targets:
- Module discovery: < 2 seconds
- Dependency resolution: < 1 second
- Template generation: < 3 seconds
- Full onboarding: < 10 seconds
- Memory usage: < 50MB increase

## Running Tests

### Basic Commands

```bash
# Run all tests (includes custom test runner and Jest)
npm test

# Run Jest test suites specifically
npm run test:jest
npm run test:jest:coverage
npm run test:jest:watch

# Run specific Jest test patterns
npm run test:modules      # Module unit tests
npm run test:integration  # Integration tests
npm run test:migration    # Migration tests
npm run test:performance  # Performance tests

# Quick test runner (custom implementation)
npm run test:quick
```

### Advanced Jest Commands

**Note**: Jest requires ES modules support via NODE_OPTIONS="--experimental-vm-modules"

```bash
# Run specific test file
NODE_OPTIONS="--experimental-vm-modules" npx jest test/modules/registry.test.js

# Run tests matching pattern
NODE_OPTIONS="--experimental-vm-modules" npx jest --testNamePattern="should resolve dependencies"

# Run tests in specific directory
NODE_OPTIONS="--experimental-vm-modules" npx jest test/integration/

# Generate coverage report
NODE_OPTIONS="--experimental-vm-modules" npx jest --coverage --coverageReporters=html
```

### CLI Test Commands

Use the built-in test command for integrated testing:

```bash
# Run all tests via CLI
fsd test

# Run specific test types
fsd test --unit
fsd test --integration
fsd test --migration

# Run with coverage
fsd test --coverage

# Run specific pattern
fsd test "dependency resolution"
```

## Coverage Requirements

### Global Thresholds

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 90%
- **Statements**: 90%

### Per-Module Targets

Core modules should aim for 95%+ coverage:
- Module Registry
- Dependency Resolver
- Template Generator
- Module Validator

## Test Patterns

### Module Testing Pattern

```javascript
describe('ModuleName', () => {
  let testDir;
  let moduleInstance;
  
  beforeEach(async () => {
    testDir = await createTestDir('module-test');
    moduleInstance = new ModuleName();
  });
  
  describe('Core Functionality', () => {
    test('should perform primary function', async () => {
      const result = await moduleInstance.primaryMethod();
      expect(result).toBeValidModule();
    });
  });
  
  describe('Error Handling', () => {
    test('should handle invalid input', async () => {
      await expect(moduleInstance.primaryMethod(null))
        .rejects.toThrow('Invalid input');
    });
  });
});
```

### Integration Testing Pattern

```javascript
describe('Integration: Feature Flow', () => {
  let testProject;
  
  beforeEach(async () => {
    testProject = await createTestProject();
  });
  
  test('should complete full workflow', async () => {
    const result = await executeWorkflow(testProject);
    
    expect(result.success).toBe(true);
    await assertProjectStructure(testProject);
  });
});
```

### Performance Testing Pattern

```javascript
describe('Performance: Operation Name', () => {
  test('should complete within threshold', async () => {
    const startTime = Date.now();
    
    await performOperation();
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(2000);
  });
});
```

## Debugging Tests

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with debugging
npx jest --runInBand --no-cache test/modules/registry.test.js
```

### Test Isolation

Each test runs in isolation with:
- Temporary directories
- Clean module registry
- Isolated process environment
- Mock implementations where needed

### Common Issues

1. **File system permissions**: Tests create temporary files
2. **Async operations**: Ensure proper await/async handling
3. **Module caching**: Jest clears module cache between tests
4. **Environment variables**: Tests should not depend on external env vars

## Continuous Integration

Tests are designed to run in CI environments:

- No external dependencies
- Deterministic results
- Parallel execution safe
- Cross-platform compatible
- Comprehensive error reporting

### CI Configuration Example

```yaml
- name: Run Tests
  run: |
    npm run test:coverage
    npm run test:performance
```

## Contributing Tests

When adding new features:

1. **Unit tests**: Test component in isolation
2. **Integration tests**: Test feature end-to-end
3. **Error cases**: Test failure scenarios
4. **Performance**: Add benchmarks for complex operations
5. **Documentation**: Update test documentation

### Test Quality Guidelines

- **Descriptive names**: Clear test descriptions
- **Single responsibility**: One assertion per test
- **Independence**: Tests don't depend on each other
- **Deterministic**: Same input = same output
- **Fast execution**: Tests complete quickly
- **Meaningful assertions**: Test actual behavior, not implementation

## Performance Monitoring

Regular performance benchmarking ensures:

- Module system scales with more modules
- Dependency resolution remains fast
- Template generation is efficient
- Memory usage stays controlled
- Concurrent operations work correctly

Monitor these metrics in CI and development to catch performance regressions early.

## Test Results Documentation

Flow State Dev maintains comprehensive test results documentation to track testing progress and provide historical context for debugging and improvement efforts.

### Test Results System
All test results are documented in the `test-results/` directory with the following structure:

```
test-results/
├── README.md              # Overview and navigation guide
├── INDEX.md               # Searchable index of all test results
├── cli/                   # CLI command testing results
├── modules/               # Module system testing results  
├── user-journeys/         # End-to-end user experience tests
├── integration/           # Integration testing results
└── automated/             # Automated test suite results
```

**Current Status**: ✅ **Operational**
- **Test Results Documented**: 3 comprehensive test sessions
- **Categories Covered**: CLI commands, module system, integration testing
- **Index System**: Fully searchable with statistics and filtering
- **Templates Available**: All categories have standardized templates

### Documentation Categories

#### CLI Testing Results (`test-results/cli/`)
Documents results from testing individual CLI commands:
- Project initialization (`fsd init`)
- Module management (`fsd modules`)
- GitHub integration (`fsd labels`)
- Diagnostic tools (`fsd doctor`)

#### Module System Testing (`test-results/modules/`)
Documents modular architecture validation:
- Module discovery and registry functionality
- Template generation and file merging
- Dependency resolution accuracy
- Configuration validation

#### User Journey Testing (`test-results/user-journeys/`)
Documents end-to-end user experience scenarios:
- First-time setup workflows
- Project creation with various configurations
- Migration from existing projects
- Error recovery and edge cases

#### Integration Testing (`test-results/integration/`)
Documents cross-system integration validation:
- GitHub API integration
- Supabase configuration workflows
- npm package management
- Git repository handling

#### Automated Testing (`test-results/automated/`)
Documents automated test suite execution:
- Jest test results and coverage
- Performance benchmark results
- CI/CD pipeline outcomes
- Regression test tracking

### Using Test Results Documentation

#### Finding Specific Tests
- Browse by category in the `test-results/` directory
- Search across all results using `test-results/INDEX.md`
- Filter by status (pass/fail/issues) or date range

#### Test Result Format
Each documented test follows a consistent structure:
- Test information (date, version, environment)
- Test scenario and objectives
- Detailed test steps taken
- Results with evidence (outputs, screenshots)
- Analysis and follow-up actions

#### Contributing Test Results
When documenting new test results:
1. Use the appropriate category directory
2. Follow naming convention: `YYYY-MM-DD-test-description.md`
3. Use provided templates in each category directory
4. Update the `INDEX.md` file with the new test entry
5. Link to related GitHub issues or documentation

This documentation system provides visibility into testing coverage, helps track quality over time, and assists in debugging by providing historical context of test outcomes.