# GitHub Label Usage Guidelines

This document describes the label system used in Flow State Dev for issue and PR categorization.

## Priority Labels
Used to indicate urgency and importance:
- **priority:high** (🔴 Red) - Urgent issues requiring immediate attention
- **priority:medium** (🟡 Yellow) - Important but not urgent
- **priority:low** (🟢 Green) - Nice to have, can be addressed later

## Type Labels
Describe the nature of the work:
- **bug** (🔴 Red) - Something isn't working as expected
- **enhancement** (🟢 Green) - Improvement to existing functionality
- **feature** (🟢 Green) - Brand new functionality
- **documentation** (🔵 Blue) - Documentation updates or improvements
- **refactor** (🔵 Blue) - Code restructuring without changing functionality
- **research** (🟣 Purple) - Investigation or exploration needed

## Component/Area Labels
Indicate which part of the project is affected:
- **frontend** (🟣 Purple) - Vue components, UI, client-side code
- **backend** (🟣 Purple) - Server-side logic, APIs, data processing
- **database** (🟣 Purple) - Database schema, queries, migrations
- **cli** (🔵 Blue) - Command line interface, fsd commands
- **templates** (🟣 Purple) - Project templates and boilerplate
- **security** (🔴 Red) - Security vulnerabilities or improvements
- **performance** (🟡 Yellow) - Speed, efficiency, optimization

## Experience Labels
Related to developer/user experience:
- **ux** (🟡 Yellow) - User experience improvements
- **testing** (🟢 Green) - Test suite, test coverage, testing tools
- **automation** (🟢 Green) - Automated workflows and processes
- **integration** (🟣 Purple) - Third-party service integrations
- **import** (🔵 Blue) - Import/export functionality

## Workflow Labels
Track issue status and process:
- **in-progress** (🔵 Blue) - Actively being worked on
- **blocked** (🔴 Red) - Cannot proceed due to dependency
- **ready-for-review** (🟢 Green) - Work complete, needs review
- **needs-discussion** (🟡 Yellow) - Requires team input
- **breaking-change** (🔴 Red) - Will break existing functionality

## Special Labels
For specific scenarios:
- **good first issue** (🟣 Purple) - Standard GitHub label for newcomers
- **good-for-beginners** (🟣 Purple) - Even easier starter issues
- **human-task** (🟡 Yellow) - Requires manual intervention
- **config** (🟡 Yellow) - Configuration changes needed
- **deploy** (🟡 Yellow) - Deployment related

## Best Practices

1. **Always assign a priority** - Every issue should have a priority label
2. **Use multiple labels** - Combine type, component, and workflow labels
3. **Update workflow labels** - Keep status labels current as work progresses
4. **Be specific** - Use the most specific label that applies

## Example Label Combinations

### New Feature Request
- `feature` + `priority:medium` + `frontend` + `ux`

### Critical Bug
- `bug` + `priority:high` + `backend` + `database`

### Documentation Update
- `documentation` + `priority:low` + `templates`

### Research Task
- `research` + `priority:medium` + `integration` + `needs-discussion`

## Color Scheme

The color scheme is designed for clarity and accessibility:
- 🔴 **Red (B60205)** - Urgent, critical, blocking
- 🟡 **Yellow (FBCA04)** - Attention needed, medium priority
- 🟢 **Green (0E8A16)** - Good to go, low priority, positive
- 🔵 **Blue (0075CA)** - Informational, neutral
- 🟣 **Purple (7057FF/D876E3)** - Special categories

## Updating Labels

To update the project's GitHub labels, run:
```bash
fsd labels
```

This will sync your repository with the labels defined in `setup/github-labels.json`.