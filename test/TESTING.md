# Flow State Dev Testing Guide

## Automated Tests

### Quick Tests (run before commits)
```bash
npm run test:quick
```
- Basic init functionality
- Version check
- Help command
- Error handling

### Full Test Suite
```bash
npm test
```
- All quick tests
- Project structure verification
- Git initialization
- File content checks
- npm install and build

### Interactive Tests
```bash
npm run test:interactive
```
- Full interactive setup flow
- Supabase configuration
- GitHub setup
- Input validation

### All Tests
```bash
npm run test:all
```

## Manual Testing Checklist

Before each release, manually verify:

### 1. Installation
- [ ] `npm install -g flow-state-dev` works
- [ ] `fsd --version` shows correct version
- [ ] `fsd help` displays all commands

### 2. Project Creation
- [ ] `fsd init my-app` starts interactive mode
- [ ] Project name validation works
- [ ] Supabase configuration creates .env correctly
- [ ] GitHub remote setup works
- [ ] Labels setup (if GitHub CLI installed)

### 3. Non-Interactive Mode
- [ ] `fsd init my-app --no-interactive` works
- [ ] Creates all expected files
- [ ] Git repository initialized

### 4. Generated Project
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts development server
- [ ] No console errors in browser
- [ ] Supabase warning shows if not configured
- [ ] `npm run build` creates dist folder
- [ ] `npm run lint` passes

### 5. Claude Code Integration
- [ ] `.claude/settings.json` exists
- [ ] Common commands don't require approval
- [ ] File operations work smoothly

### 6. GitHub Labels
- [ ] `fsd labels` creates all labels
- [ ] Handles existing labels gracefully
- [ ] Error messages are helpful

### 7. Edge Cases
- [ ] Invalid project names rejected
- [ ] Existing directory error handled
- [ ] Missing git/gh CLI handled gracefully
- [ ] Interrupted process doesn't leave broken state

## CI/CD Testing

GitHub Actions runs tests on:
- Ubuntu, macOS, Windows
- Node.js 18.x and 20.x
- Both interactive and non-interactive modes

## Adding New Tests

1. Add to `test/test-runner.js` for automated tests
2. Add to `test/interactive-test.js` for interactive flows
3. Update this checklist for manual verification
4. Consider adding to GitHub Actions workflow

## Known Issues

- Interactive tests may be flaky on Windows
- GitHub CLI tests require authentication
- Some tests require internet connection