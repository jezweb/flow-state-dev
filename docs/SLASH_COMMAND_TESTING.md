# Slash Command Integration Testing Guide

This guide documents the comprehensive integration test suite for Flow State Dev's modular slash command system.

## Overview

The integration test suite ensures all 67+ slash commands work correctly in the new modular architecture with no regression from the monolithic v1.x system.

## Test Structure

The test suite is organized into focused test files:

### 1. **slash-commands.test.js** - Main Integration Suite
- Command discovery and registry population
- Execution tests for all command categories
- Cross-command integration scenarios
- Performance benchmarking

### 2. **command-discovery.test.js** - Discovery & Registration
- Filesystem scanning performance (<25ms threshold)
- Command loading and validation
- Alias resolution and conflicts
- Category organization

### 3. **command-categories.test.js** - Category-Specific Tests
- Tests for each of the 10 command categories
- Option validation and defaults
- Expected outputs and behavior
- Real-world usage patterns

### 4. **command-error-handling.test.js** - Error Scenarios
- Invalid command handling
- Missing prerequisites (git, GitHub CLI, etc.)
- Invalid options and edge cases
- Graceful degradation

### 5. **command-performance.test.js** - Performance Testing
- Discovery time benchmarks
- Execution performance metrics
- Memory usage monitoring
- Comparison with v1.x baseline

## Running Tests

### Run All Integration Tests
```bash
npm run test:integration:slash
```

### Run Specific Test Suite
```bash
npm test test/integration/slash-commands.test.js
npm test test/integration/command-discovery.test.js
```

### Run with Performance Monitoring
```bash
NODE_OPTIONS="--expose-gc" npm test test/integration/command-performance.test.js
```

### Run All Tests with Summary
```bash
npm run test:integration:all
```

## Test Categories

### Quick Action Commands
- `/build`, `/test`, `/lint`, `/typecheck`
- `/fix`, `/status`, `/commit`, `/push`
- Tests package.json script detection
- Validates aliases (b, t, l, tc, etc.)

### Extended Thinking Commands
- `/plan`, `/investigate`, `/decide`
- `/research`, `/alternatives`
- Verifies `<extended-thinking>` format
- Tests ADR generation

### Sprint Management
- `/sprint:plan`, `/sprint:review`, `/sprint:close`
- `/sprint:velocity`, `/sprint:burndown`
- Tests capacity planning and tracking

### Epic Management
- `/epic:create`, `/epic:breakdown`, `/epic:list`
- Tests user story generation
- Validates task breakdown

### Analysis & Planning
- `/breakdown`, `/analyze:scope`, `/feature:plan`
- Tests comprehensive analysis
- Validates issue creation

### Other Categories
- Issue Operations
- Progress Reporting
- Workflow Automation
- Estimation
- Utility

## Performance Benchmarks

The test suite enforces these performance thresholds:

- **Command Discovery**: < 25ms
- **First Execution**: < 100ms
- **Average Execution**: < 50ms
- **Help Command**: < 10ms
- **Complex Commands**: < 200ms
- **Memory Increase**: < 10MB

## Error Handling Tests

The suite tests various error scenarios:

1. **Invalid Commands**
   - Non-existent commands
   - Malformed syntax
   - Typo suggestions

2. **Missing Prerequisites**
   - No git repository
   - Missing GitHub CLI
   - No package.json

3. **Invalid Options**
   - Type validation
   - Required options
   - Conflicting options

4. **Edge Cases**
   - Very long inputs
   - Special characters
   - Concurrent execution

## CI/CD Integration

The GitHub Actions workflow runs these tests:

```yaml
- name: Run integration tests
  run: npm test -- test/integration/
  env:
    NODE_OPTIONS: --expose-gc

- name: Run slash command tests
  run: |
    npm test -- test/integration/slash-commands.test.js
    npm test -- test/integration/command-discovery.test.js
    npm test -- test/integration/command-categories.test.js
    npm test -- test/integration/command-error-handling.test.js
    npm test -- test/integration/command-performance.test.js
```

## Test Coverage Goals

- ✅ All 67+ commands have basic execution tests
- ✅ All 10 categories have dedicated test coverage
- ✅ Error handling for common scenarios
- ✅ Performance benchmarks and monitoring
- ✅ Cross-command integration scenarios

## Writing New Tests

When adding new slash commands:

1. Add execution test in `command-categories.test.js`
2. Add error cases in `command-error-handling.test.js`
3. Update performance benchmarks if needed
4. Ensure CI/CD passes before merging

## Troubleshooting

### Tests Failing Locally
- Ensure you have Node.js 18+ installed
- Run `npm install` to get all dependencies
- Some tests require git to be initialized
- GitHub CLI tests may skip if `gh` is not installed

### Performance Tests
- Run with `--expose-gc` flag for memory tests
- Performance may vary on different hardware
- CI/CD uses consistent hardware for benchmarks

### Mock Data
- Tests use mock console output
- Git commands run in temporary directories
- Network requests are mocked where appropriate

## Future Improvements

- [ ] Add code coverage reporting
- [ ] Create visual performance dashboard
- [ ] Add regression detection
- [ ] Implement continuous benchmarking
- [ ] Add integration with real GitHub API