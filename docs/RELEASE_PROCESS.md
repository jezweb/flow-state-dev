# Release Process Guide

> Complete guide for releasing new versions of Flow State Dev

## Table of Contents

- [Overview](#overview)
- [Quick Release](#quick-release)
- [Detailed Process](#detailed-process)
- [Version Guidelines](#version-guidelines)
- [Pre-release Checklist](#pre-release-checklist)
- [Release Scripts](#release-scripts)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)
- [Communication](#communication)

## Overview

Flow State Dev uses automated scripts to streamline the release process. The entire process can be completed in under 5 minutes with proper preparation.

### Release Types

- **Patch Release** (0.8.0 → 0.8.1): Bug fixes, documentation updates
- **Minor Release** (0.8.0 → 0.9.0): New features, backwards compatible
- **Major Release** (0.8.0 → 1.0.0): Breaking changes

## Quick Release

For experienced maintainers, here's the streamlined process:

```bash
# 1. Ensure you're on main branch with latest changes
git checkout main
git pull origin main

# 2. Run release script (patch/minor/major)
npm run release:minor

# 3. Validate and publish
npm run release:publish
```

## Detailed Process

### 1. Pre-release Preparation

#### Update Documentation
- [ ] Update README.md with new features
- [ ] Add/update examples in docs/
- [ ] Update CLI help text if commands changed

#### Update CHANGELOG
- [ ] Add all changes under `## [Unreleased]` section
- [ ] Use conventional commit format
- [ ] Group by: Added, Fixed, Changed, Removed, Security

Example:
```markdown
## [Unreleased]

### Added
- New `fsd analyze` command for code analysis
- Support for TypeScript projects
- Auto-detection of package manager (npm/yarn/pnpm)

### Fixed
- Memory leak in watch mode
- Incorrect path resolution on Windows

### Changed
- Improved error messages for missing dependencies
- Updated minimum Node.js version to 18
```

### 2. Create Release

#### Choose Version Type
```bash
# Bug fixes only
npm run release:patch

# New features (backwards compatible)
npm run release:minor

# Breaking changes
npm run release:major
```

The release script will:
- ✅ Update version in package.json
- ✅ Update version in bin/fsd.js
- ✅ Convert [Unreleased] to versioned section in CHANGELOG
- ✅ Create git commit and tag
- ✅ Show next steps

### 3. Validation

Run comprehensive validation:
```bash
npm run release:validate
```

This checks:
- Version consistency across files
- Git working directory status
- Dependencies and security
- Test suite passes
- Documentation is updated
- Package size is reasonable

### 4. Publish

```bash
npm run release:publish
```

This will:
1. Verify you're on the main branch
2. Push commits and tags to GitHub
3. Run final validation
4. Publish to npm registry
5. Provide post-publish checklist

### 5. Create GitHub Release

After npm publish succeeds:

1. Go to [GitHub Releases](https://github.com/jezweb/flow-state-dev/releases/new)
2. Select the new tag (e.g., v0.9.0)
3. Set release title: "v0.9.0 - [Feature Name]"
4. Copy changelog section for release notes
5. Add migration guide if breaking changes
6. Publish release (not draft)

### 6. Post-release Tasks

- [ ] Verify npm package: `npm view flow-state-dev`
- [ ] Test installation: `npx flow-state-dev@latest init test-project`
- [ ] Update project roadmap/milestones
- [ ] Announce release (see [Communication](#communication))

## Version Guidelines

### Patch Version (0.0.X)
Increment for:
- Bug fixes
- Documentation updates
- Dependency updates (non-breaking)
- Performance improvements
- Typo fixes

### Minor Version (0.X.0)
Increment for:
- New features
- New commands
- New options to existing commands
- Significant improvements
- New templates or frameworks

### Major Version (X.0.0)
Increment for:
- Breaking changes to CLI interface
- Removal of commands or options
- Major architectural changes
- Node.js version requirement changes
- Template structure changes

## Pre-release Checklist

Before running release scripts:

### Code Quality
- [ ] All tests pass: `npm run test:all`
- [ ] No linting errors: `npm run lint` (if configured)
- [ ] Security scan clean: `npm run security:scan`
- [ ] Dependencies updated: `npm update`

### Documentation
- [ ] README.md reflects new features
- [ ] CHANGELOG.md has all changes documented
- [ ] Command help text is accurate
- [ ] Examples work correctly

### Testing
- [ ] Manual test of all new features
- [ ] Test on different OS (Windows, macOS, Linux)
- [ ] Test with different Node.js versions
- [ ] Test npx usage

## Release Scripts

### `npm run release:patch`
Bumps version from 0.8.0 → 0.8.1

### `npm run release:minor`
Bumps version from 0.8.0 → 0.9.0

### `npm run release:major`
Bumps version from 0.8.0 → 1.0.0

### `npm run release:validate`
Runs all pre-release checks

### `npm run release:publish`
Interactive publish process with safety checks

### Manual Changelog Generation
```bash
# Preview changelog for next version
node scripts/generate-changelog.js

# Generate and update CHANGELOG.md
node scripts/generate-changelog.js 0.9.0
```

## Troubleshooting

### Version Mismatch Error
If versions don't match across files:
```bash
# Manually fix version in bin/fsd.js
# Then commit the fix
git add bin/fsd.js
git commit -m "fix: sync version numbers"
```

### Failed npm Publish
Common issues:

1. **Not logged in**
   ```bash
   npm login
   npm whoami  # Verify login
   ```

2. **Version already exists**
   - Check npm: `npm view flow-state-dev versions`
   - Bump version again if needed

3. **Network issues**
   - Try: `npm publish --registry https://registry.npmjs.org/`

### Git Push Failed
```bash
# If tags already exist remotely
git push origin main --force-with-lease
git push origin --tags --force
```

## Rollback Procedures

If a release has critical issues:

### 1. Unpublish from npm (within 72 hours)
```bash
# Deprecate instead of unpublish
npm deprecate flow-state-dev@0.9.0 "Critical bug, use 0.9.1"
```

### 2. Git Rollback
```bash
# Delete remote tag
git push origin :refs/tags/v0.9.0

# Delete local tag
git tag -d v0.9.0

# Revert commits
git revert <commit-hash>
git push origin main
```

### 3. Release Patch Fix
```bash
# Fix the issue
# Then release patch
npm run release:patch
npm run release:publish
```

## Communication

### Release Announcement Template

**Discord/Slack:**
```
🚀 Flow State Dev v0.9.0 Released!

✨ Highlights:
• New `fsd analyze` command for code quality checks
• TypeScript project support
• 30% faster project initialization

📦 Install/Update:
npm install -g flow-state-dev@latest

📚 Full changelog: https://github.com/jezweb/flow-state-dev/releases/tag/v0.9.0

🐛 Report issues: https://github.com/jezweb/flow-state-dev/issues
```

**Twitter/X:**
```
🚀 Flow State Dev v0.9.0 is out!

✨ New features:
• Code analysis command
• TypeScript support
• Faster project setup

Get it now:
npm install -g flow-state-dev

#webdev #vue #cli #opensource
```

### Where to Announce

1. **GitHub Release** - Primary announcement
2. **Discord/Slack** - Community channels
3. **Twitter/X** - Broader reach
4. **Dev.to Article** - For major releases
5. **Reddit** - r/vuejs, r/webdev (for major releases)

## Release Schedule

While we don't follow a strict schedule, general guidelines:

- **Patch releases**: As needed for bug fixes
- **Minor releases**: Every 2-4 weeks with new features
- **Major releases**: Carefully planned, with migration guides

## Security Releases

For security fixes:

1. Don't disclose vulnerability details in public commits
2. Release patch immediately
3. Add security notice to release notes
4. Email maintainers of dependent projects if critical

## Maintainer Notes

### Access Required
- npm publish access to `flow-state-dev`
- GitHub write access to repository
- GitHub token for automated workflows

### Best Practices
1. Always release from main branch
2. Never skip validation steps
3. Test the published package immediately
4. Keep release notes user-focused
5. Include migration guides for breaking changes

---

Last updated: v0.8.0

Questions? Open an issue or discuss in [GitHub Discussions](https://github.com/jezweb/flow-state-dev/discussions).