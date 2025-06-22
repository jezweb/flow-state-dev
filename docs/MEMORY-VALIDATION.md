# Memory File Validation

Flow State Dev includes powerful validation and linting capabilities for Claude Code memory files to ensure they're effective and well-structured.

## Overview

The memory validation system helps you:
- ✅ Ensure proper markdown syntax
- ✅ Validate required sections are present
- ✅ Check for sensitive information
- ✅ Identify vague or contradictory instructions
- ✅ Verify tech stack versions are current
- ✅ Auto-fix common issues

## Commands

### Validate Memory File

```bash
# Validate your default memory file
fsd memory validate

# Validate a specific file
fsd memory validate ./CLAUDE.md

# Strict validation mode (includes suggestions)
fsd memory validate --strict

# Auto-fix common issues
fsd memory validate --fix
```

### Quick Fix

```bash
# Directly fix issues without validation first
fsd memory fix

# Fix a specific file
fsd memory fix ./path/to/CLAUDE.md
```

## Validation Checks

### 1. Structure Validation
- ✅ Proper markdown syntax
- ✅ Sequential heading hierarchy (no level jumps)
- ✅ Valid internal links
- ✅ File size < 10KB for optimal performance

### 2. Content Validation
- ✅ Required sections present:
  - Personal Information
  - Development Environment
  - Tech Stack Preferences
  - Work Style & Preferences
- ✅ No empty sections
- ✅ Clear, specific instructions (no vague language)
- ✅ No contradicting preferences

### 3. Security Checks
- 🔒 No passwords or API keys
- 🔒 No social security numbers
- 🔒 No credit card numbers
- ⚠️  Warnings for email addresses

### 4. Version Checks
- 📦 Node.js version current
- 📦 Framework versions up to date
- 📦 Tool versions not outdated

### 5. Best Practices
- 💡 Actionable instructions present
- 💡 Specific tool preferences listed
- 💡 Well-organized with bullet points
- 💡 Recommended sections included

## Understanding Results

### Status Icons
- ❌ **Error** - Must be fixed for valid memory file
- ⚠️  **Warning** - Should be addressed but not critical
- 💡 **Suggestion** - Recommended improvements

### Example Output

```
📋 Validating: /home/user/.claude/CLAUDE.md

❌ Errors:
   Missing required section: "Development Environment"
   → Add a "## Development Environment" section

⚠️  Warnings:
   Line 23: Email address detected - consider if this should be public
   → Remove or redact sensitive information
   
   Duplicate section found: "Tech Stack Preferences"
   → Merge duplicate sections

💡 Suggestions:
   Node.js version 18.0.0 is outdated
   → Latest stable version is 20.11.0
   
   Consider adding section: "Claude Interaction Preferences"
   → Add a "## Claude Interaction Preferences" section for better context

📊 Summary:
   ❌ Invalid memory file
   Errors: 1
   Warnings: 2
   Suggestions: 2
```

## Auto-Fix Capabilities

The `--fix` flag can automatically resolve:

### Fixed Automatically
- ✅ Heading hierarchy issues
- ✅ Missing required sections (adds placeholders)
- ✅ Trailing "etc." removal
- ✅ Extra empty lines in sections
- ✅ Basic formatting issues

### Manual Fix Required
- ❌ Sensitive information (security risk)
- ❌ Vague instructions (needs user input)
- ❌ Contradictions (needs clarification)
- ❌ Outdated versions (needs testing)

## Best Practices for Memory Files

### 1. Be Specific
```markdown
# ❌ Vague
I like modern frameworks

# ✅ Specific
**Frontend Framework**: Vue 3.4+ with Composition API
**UI Library**: Vuetify 3 for Material Design components
```

### 2. Use Actionable Language
```markdown
# ❌ Passive
React is nice for some projects

# ✅ Actionable
Prefer Vue 3 over React for new projects
Use React only when specifically requested
```

### 3. Organize with Structure
```markdown
## Tech Stack Preferences

### Frontend
- **Framework**: Vue 3
- **State Management**: Pinia
- **Styling**: Tailwind CSS

### Backend
- **Database**: Supabase
- **API**: REST with Express
```

### 4. Keep Current
```markdown
## Development Environment
- **OS**: Ubuntu 22.04 LTS
- **Node.js**: v20.11.0
- **Package Manager**: npm 10.2.4
```

### 5. Avoid Contradictions
```markdown
# ❌ Contradicting
Prefer minimal dependencies
Always use the latest cutting-edge libraries

# ✅ Clear
Prefer stable, well-maintained dependencies
Only adopt new libraries after they reach v1.0
```

## Integration with CI/CD

You can integrate memory validation into your workflow:

```yaml
# GitHub Actions example
- name: Validate Memory File
  run: |
    npm install -g flow-state-dev
    fsd memory validate --strict
```

## Troubleshooting

### Validation fails after auto-fix
Some issues require manual intervention:
1. Review the specific errors
2. Edit the file manually: `fsd memory edit`
3. Re-run validation: `fsd memory validate`

### File too large warning
1. Remove verbose explanations
2. Use bullet points instead of paragraphs
3. Focus on preferences, not tutorials

### Version check failures
1. Verify you're using stable versions
2. Update version numbers in your memory file
3. Or disable version checks with manual review

## Tips

1. **Run validation regularly** - After major updates to your memory file
2. **Use strict mode** - When creating a new memory file
3. **Keep backups** - Auto-fix creates `.backup` files
4. **Review suggestions** - They improve Claude's understanding
5. **Be concise** - Shorter, clearer instructions work better