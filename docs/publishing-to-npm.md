# Publishing Flow State Dev to npm

This guide walks through publishing Flow State Dev to npm so users can install it with `npm install -g flow-state-dev`.

## Prerequisites

1. **npm Account**: Create a free account at [npmjs.com](https://www.npmjs.com/)
2. **Package Name**: Verify "flow-state-dev" is available (it appears to be!)
3. **Version**: Start with 0.1.0 (already set in package.json)

## Steps to Publish

### 1. Login to npm

```bash
npm login
# Enter your username, password, and email
```

### 2. Test Package Locally

Before publishing, test that everything works:

```bash
# From the flow-state-dev directory
npm link
fsd help
# Test creating a project
fsd init test-project
```

### 3. Check What Will Be Published

```bash
npm pack --dry-run
# This shows all files that will be included
```

### 4. Publish to npm

```bash
npm publish
```

If the package name is taken, you can:
- Use a scoped name: `@jezweb/flow-state-dev`
- Choose a different name

### 5. Verify Publication

```bash
# Wait a minute for npm to update
npm info flow-state-dev
```

Visit: https://www.npmjs.com/package/flow-state-dev

### 6. Test Installation

```bash
# Unlink local version first
npm unlink -g flow-state-dev

# Install from npm
npm install -g flow-state-dev

# Test it works
fsd help
```

## Updating the Package

When you make changes:

1. Update version in package.json:
   - Patch: 0.1.0 → 0.1.1 (bug fixes)
   - Minor: 0.1.0 → 0.2.0 (new features)
   - Major: 0.1.0 → 1.0.0 (breaking changes)

2. Commit changes:
   ```bash
   git add .
   git commit -m "Version 0.1.1: Fix XYZ"
   git push
   ```

3. Publish update:
   ```bash
   npm publish
   ```

## Best Practices

1. **Test Before Publishing**: Always test locally first
2. **Semantic Versioning**: Follow semver.org guidelines
3. **Changelog**: Document changes for each version
4. **Git Tags**: Tag releases in git
   ```bash
   git tag v0.1.0
   git push --tags
   ```

## After Publishing

Update README.md:
- Remove the GitHub installation instructions
- Keep just `npm install -g flow-state-dev`
- Update any documentation that mentions installation

## Troubleshooting

### "Package name unavailable"
- Try `@jezweb/flow-state-dev` (scoped package)
- Or choose alternative name like `flowstate-dev`

### "You must be logged in"
- Run `npm login` again
- Check with `npm whoami`

### "Cannot publish over existing version"
- Bump version number in package.json
- You can't republish the same version

## npm Package Settings

Consider adding to package.json:

```json
{
  "keywords": ["vue", "supabase", "cli", "template", "scaffold"],
  "files": [
    "bin/",
    "templates/",
    "setup/",
    "README.md",
    "LICENSE"
  ]
}
```

This ensures only necessary files are published.