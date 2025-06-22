# Flow State Dev Doctor Command

The `fsd doctor` command runs comprehensive diagnostics on your Flow State Dev project to identify and fix common issues.

## Usage

```bash
# Run diagnostics
fsd doctor

# Auto-fix issues
fsd doctor --fix
```

## What It Checks

### 1. Flow State Dev Project
- Verifies CLAUDE.md exists
- Checks for .claude/settings.json
- Confirms it's a valid FSD project

### 2. Node.js Version
- Ensures Node.js 18+ is installed
- Reports current version

### 3. Dependencies
- Checks if node_modules exists
- Verifies dependencies are up to date
- Can auto-install missing dependencies

### 4. Environment Variables
- Looks for .env file
- Checks Supabase credentials are configured
- Can auto-create .env from template

### 5. Git Repository
- Verifies Git is initialized
- Checks for remote repository
- Can auto-initialize Git

### 6. Linting Configuration
- Checks for ESLint config files
- Ensures code quality tools are set up

### 7. Build Configuration
- Verifies build scripts exist
- Checks Vite configuration
- Ensures project can build

### 8. Port Availability
- Checks if development port (5173) is available
- Helps identify conflicts

## Understanding Results

### Status Icons
- ✅ **Pass** - Everything is working correctly
- ⚠️ **Warning** - Non-critical issue that should be addressed
- ❌ **Fail** - Critical issue that needs fixing

### Auto-Fix Feature

When you run `fsd doctor --fix`, it will:
1. Show you each fixable issue
2. Ask for confirmation before applying fixes
3. Run the appropriate commands to resolve issues

**Auto-fixable issues:**
- Missing npm dependencies
- Missing .env file (copies from .env.example)
- Uninitialized Git repository

## Example Output

```
🩺 Running Flow State Dev diagnostics...

Checking Flow State Dev Project... ✅ Valid Flow State Dev project
Checking Node.js Version... ✅ Node.js v20.11.0
Checking Dependencies... ❌ Dependencies not installed
   └─ Run "npm install" to install project dependencies

Checking Environment Variables... ⚠️ Missing Supabase credentials: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
   └─ Add your Supabase project URL and anon key to .env

Checking Git Repository... ✅ Connected to https://github.com/user/project.git
Checking Linting Configuration... ✅ ESLint configured
Checking Build Configuration... ✅ Build configuration found
Checking Port Availability... ✅ Port 5173 is available

📊 Diagnostic Summary

   Passed: 6
   Warnings: 1
   Failed: 1

💡 1 issue(s) can be fixed automatically.
   Run "fsd doctor --fix" to apply fixes.
```

## Troubleshooting

### Doctor command not working
1. Ensure you're in a Flow State Dev project directory
2. Check that Flow State Dev is installed globally
3. Try running with verbose output

### Auto-fix not working
1. Some issues require manual intervention
2. Ensure you have proper permissions
3. Check error messages for specific requirements

### Port conflicts
If port 5173 is in use:
1. Stop other development servers
2. Or configure Vite to use a different port

## CI/CD Integration

The doctor command returns appropriate exit codes:
- `0` - All checks passed or only warnings
- `1` - One or more critical failures

Use in CI/CD pipelines:
```yaml
- name: Run diagnostics
  run: fsd doctor
```

## Best Practices

1. Run `fsd doctor` after cloning a project
2. Use it to debug issues before asking for help
3. Include doctor output when reporting bugs
4. Run periodically to catch configuration drift