# Contributing to Flow State Dev

Thank you for your interest in contributing to Flow State Dev! This guide will help you get started with contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Package Verification](#package-verification)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project follows a standard code of conduct. Please be respectful, inclusive, and considerate in all interactions.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/flow-state-dev.git
   cd flow-state-dev
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/jezweb/flow-state-dev.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm 7 or higher
- Git
- GitHub CLI (for label management features)

### Project Structure

```
flow-state-dev/
├── bin/            # CLI entry point
├── lib/            # Core library code
│   ├── onboarding/ # Modular onboarding system
│   └── ...
├── templates/      # Project templates
├── scripts/        # Build and utility scripts
├── test/           # Test files
└── docs/           # Documentation
```

## Making Changes

### Branching Strategy

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the coding standards

3. Commit your changes with clear messages:
   ```bash
   git commit -m "feat: add new feature"
   ```

### Commit Message Format

We follow conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or modifications
- `chore:` Maintenance tasks

## Testing

### Running Tests

```bash
# Run all tests
npm run test:all

# Run quick tests
npm run test:quick

# Run interactive tests
npm run test:interactive

# Test local installation
npm run test:install
```

### Writing Tests

- Add test files to the `test/` directory
- Follow existing test patterns
- Ensure all new features have corresponding tests

## Package Verification

Before submitting a PR or releasing, ensure the package passes all verification checks:

### Pre-publish Verification

Run the verification script to check for common issues:

```bash
npm run verify
```

This checks:
- ✅ Package.json validity
- ✅ Required files exist
- ✅ Dependencies are correct
- ✅ Package size is reasonable
- ✅ Commands work properly
- ✅ Git status is clean

### Local Installation Testing

Test that the package installs correctly:

```bash
npm run test:install
```

This simulates:
- Global installation
- Local installation
- Command execution
- Project creation

### Manual Testing Checklist

Before submitting:

- [ ] All automated tests pass
- [ ] Package verification passes
- [ ] Installation test succeeds
- [ ] Created a test project successfully
- [ ] All commands work as expected
- [ ] No console errors or warnings
- [ ] Documentation is updated

## Submitting Changes

### Pull Request Process

1. Update your branch with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Create a Pull Request on GitHub

4. Fill out the PR template with:
   - Clear description of changes
   - Related issue numbers
   - Testing performed
   - Screenshots if applicable

### PR Requirements

- All CI checks must pass
- Code review approval required
- No merge conflicts
- Updated documentation if needed

## Release Process

Flow State Dev uses automated scripts to streamline releases. See [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) for the complete guide.

### Quick Release Steps

1. **Prepare Release**
   ```bash
   # Update CHANGELOG.md with changes under [Unreleased]
   # Choose release type: patch, minor, or major
   npm run release:minor
   ```

2. **Validate & Publish**
   ```bash
   # Run comprehensive validation
   npm run release:validate

   # Publish to npm and GitHub
   npm run release:publish
   ```

### Automated Features

- ✅ Version bumping across all files
- ✅ CHANGELOG.md updates
- ✅ Git commit and tagging
- ✅ Comprehensive validation
- ✅ npm publishing
- ✅ GitHub release creation

### Manual Release (if needed)

If you need to release manually:

1. **Update Versions**
   - `package.json`
   - `bin/fsd.js` 
   - CHANGELOG.md

2. **Commit & Tag**
   ```bash
   git add -A
   git commit -m "chore: release v0.9.0"
   git tag v0.9.0
   ```

3. **Push & Publish**
   ```bash
   git push origin main --tags
   npm publish
   ```

## Troubleshooting Common Issues

### Package Not Found After Installation

1. Check npm global bin directory:
   ```bash
   npm bin -g
   ```

2. Ensure it's in your PATH

3. Try restarting your terminal

### Verification Failures

- **Missing files**: Ensure all required files are tracked in git
- **Executable permissions**: Run `chmod +x bin/fsd.js`
- **Dependencies**: Run `npm install` to ensure all deps are installed

### Test Failures

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (must be 18+)
- Run tests individually to isolate issues

## Getting Help

- Open an issue for bugs or feature requests
- Join discussions in GitHub Discussions
- Check existing issues before creating new ones

Thank you for contributing to Flow State Dev! 🚀