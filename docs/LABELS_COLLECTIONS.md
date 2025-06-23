# GitHub Labels Collections

Flow State Dev now provides multiple label collections to suit different project needs, with optional emoji support.

## Available Collections

### 1. Minimal (10 labels)
Essential labels for basic project management:
- Basic issue types: bug, feature, enhancement, docs
- Simple priority levels: high, medium, low
- Basic status tracking: in-progress, done
- Good first issue for contributors

### 2. Standard (29 labels)
Comprehensive labels for typical software projects:
- All minimal labels plus:
- Extended issue types: epic, task, refactor, chore, performance, security
- Complete workflow status: planning, ready, in-progress, review, testing, done, blocked
- Needs indicators: review, testing
- Standard GitHub labels: wontfix, duplicate, invalid, question

### 3. AI-Enhanced (37 labels)
Standard labels plus AI-specific workflow labels:
- All standard labels plus:
- AI workflow: generated, assisted, review-needed, prompt-update
- AI quality: needs-validation, optimization-needed
- AI tasks: refactor-candidate, test-generation

### 4. Full (66 labels)
Complete label set including all categories:
- All AI-enhanced labels plus:
- Component labels: frontend, backend, api, database, ui, auth, deployment
- Technology labels: vue, react, typescript, javascript, supabase
- Effort estimation: trivial (<1hr), small (1-4hr), medium (0.5-2d), large (2-5d), xlarge (>5d)
- Impact assessment: breaking, high, medium, low
- Sprint planning: current, next, backlog
- Release tracking: v1.0, next, shipped

## Usage

### Interactive Mode (Recommended)
```bash
fsd labels
```
This will prompt you to:
1. Select a label collection
2. Choose whether to include emojis in label names
3. Preview labels before creating them

### Direct Collection Selection
```bash
# Create minimal label set
fsd labels create --collection minimal

# Create AI-enhanced labels with emojis in names
fsd labels create --collection ai-enhanced --emoji

# Create full label set without preview
fsd labels create --collection full --force
```

### List Available Collections
```bash
fsd labels list
```

### Export Existing Labels
```bash
# Export current repository labels
fsd labels export

# Export to specific file
fsd labels export --output my-labels.json
```

## Emoji Options

### Emojis in Descriptions (Default)
Labels are created with emojis in their descriptions only:
- Label name: `bug`
- Description: `🐛 Something isn't working`

### Emojis in Names
Use `--emoji` flag to include emojis in label names:

```bash
# Prefix format (default)
fsd labels create --emoji
# Creates: "🐛 bug", "✨ feature", etc.

# Suffix format
fsd labels create --emoji --emoji-format suffix
# Creates: "bug 🐛", "feature ✨", etc.
```

## Examples

### For a Small Personal Project
```bash
fsd labels create --collection minimal
```

### For a Team Project
```bash
fsd labels create --collection standard
```

### For an AI-Assisted Development Project
```bash
fsd labels create --collection ai-enhanced --emoji
```

### For a Large Enterprise Project
```bash
fsd labels create --collection full
```

## Customization

You can create custom label collections by:
1. Exporting your current labels: `fsd labels export`
2. Modifying the exported JSON file
3. Saving it to `setup/label-collections.json`
4. Adding your collection to the available options

## Best Practices

1. **Start Small**: Begin with minimal or standard collections and add more as needed
2. **Be Consistent**: Use the same collection across similar projects
3. **Team Agreement**: Discuss and agree on label usage with your team
4. **Documentation**: Document what each label means in your contributing guide
5. **Regular Review**: Periodically review and clean up unused labels

## Label Color Meanings

Our label collections use consistent color coding:
- 🔴 **Red**: Critical, bugs, blockers, high priority
- 🟠 **Orange**: Important, in-progress, high impact
- 🟡 **Yellow**: Medium priority, warnings, needs attention
- 🟢 **Green**: Low priority, completed, good to go
- 🔵 **Blue**: Informational, planning, tasks
- 🟣 **Purple**: Special states (review, refactor, AI-related)
- 🟤 **Brown**: Testing phase
- ⚫ **Gray**: Won't fix, invalid, on hold

## Troubleshooting

### "GitHub CLI not installed"
Install the GitHub CLI:
- Ubuntu/Debian: `sudo apt install gh`
- macOS: `brew install gh`
- Windows: Download from [cli.github.com](https://cli.github.com)

### "Not authenticated with GitHub"
Run: `gh auth login`

### "Label already exists"
The command will automatically update existing labels with the same name.

### "Permission denied"
Ensure you have write access to the repository.