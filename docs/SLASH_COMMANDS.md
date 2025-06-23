# Slash Commands

Flow State Dev includes a comprehensive set of slash commands for project management and GitHub integration. These commands streamline sprint planning, issue management, and team collaboration.

## Prerequisites

- GitHub CLI (`gh`) must be installed and authenticated
- Must be run in a GitHub repository directory
- Appropriate repository permissions for the operations you want to perform

## Quick Start

```bash
# View all available commands
fsd slash "/help"

# Plan a new sprint
fsd slash "/sprint:plan --capacity 40 --weeks 2"

# Review current sprint
fsd slash "/sprint:review"

# Create an epic
fsd slash "/epic:create --title 'User Authentication System'"

# Generate progress report
fsd slash "/progress:report --period week --format markdown"

# Analyze issue dependencies
fsd slash "/issue:dependencies --issue 123"

# Bulk operations on issues
fsd slash "/issue:bulk --action label --filter state:open"

# Check workflow status
fsd slash "/workflow:status"
```

## Command Categories

### Sprint Management

#### `/sprint:plan`
Plan your next sprint with intelligent capacity management.

**Options:**
- `--weeks <number>` - Sprint duration in weeks (default: 2)
- `--capacity <number>` - Team capacity in story points (default: 40)

**Features:**
- Shows backlog issues with story point estimates
- Creates sprint milestones automatically
- Interactive issue assignment to sprints
- Capacity tracking and warnings

**Example:**
```bash
fsd slash "/sprint:plan --capacity 60 --weeks 3"
```

#### `/sprint:review`
Review sprint progress and calculate velocity metrics.

**Options:**
- `--milestone <name>` - Specific milestone to review (interactive selection if not provided)

**Features:**
- Progress tracking (issues and story points)
- Completion rate analysis
- Velocity calculations
- Blocker identification

**Example:**
```bash
fsd slash "/sprint:review --milestone 'Sprint 2024-01-15'"
```

#### `/sprint:close`
Close completed sprints and move remaining issues.

**Options:**
- `--milestone <name>` - Sprint to close
- `--next-milestone <name>` - Target for moved issues

*Note: Full implementation coming soon*

### Epic Management

#### `/epic:create`
Generate comprehensive epic templates with sub-issues.

**Options:**
- `--title <string>` - Epic title (required)
- `--template <type>` - Template type (default: 'feature')

**Features:**
- Pre-structured epic templates
- Automatic epic label assignment
- User story frameworks
- Acceptance criteria templates

**Example:**
```bash
fsd slash "/epic:create --title 'Mobile App Development' --template feature"
```

#### `/epic:status`
Track epic progress and identify blockers.

**Options:**
- `--epic <number>` - Epic issue number

*Note: Full implementation coming soon*

### Progress Reporting

#### `/progress:report`
Generate detailed progress reports for any time period.

**Options:**
- `--period <string>` - Report period: week, month, quarter (default: week)
- `--format <string>` - Output format: markdown, json (default: markdown)

**Features:**
- Issue activity analysis
- Pull request metrics
- Workflow success rates
- Markdown report generation

**Example:**
```bash
fsd slash "/progress:report --period month --format markdown"
```

#### `/progress:team`
Analyze team performance and capacity.

**Options:**
- `--members <list>` - Filter by specific team members

*Note: Full implementation coming soon*

### Issue Operations

#### `/issue:bulk`
Perform bulk operations on multiple issues efficiently.

**Options:**
- `--action <string>` - Action to perform: label, milestone, assign, close (required)
- `--filter <string>` - Issue filter: label:name, assignee:user, state:open

**Supported Actions:**
- **label** - Add labels to issues
- **milestone** - Assign milestone to issues
- **assign** - Assign issues to users
- **close** - Close multiple issues

**Filter Examples:**
- `label:bug` - Issues with "bug" label
- `assignee:username` - Issues assigned to user
- `state:open` - Open issues

**Example:**
```bash
fsd slash "/issue:bulk --action label --filter state:open"
fsd slash "/issue:bulk --action milestone --filter label:enhancement"
fsd slash "/issue:bulk --action close --filter label:duplicate"
```

#### `/issue:dependencies`
Map and analyze issue dependencies and blockers.

**Options:**
- `--issue <number>` - Issue number to analyze
- `--format <string>` - Output format: tree, graph (default: tree)

**Features:**
- Dependency detection from issue references
- Blocker identification
- Visual dependency mapping
- Risk assessment

**Example:**
```bash
fsd slash "/issue:dependencies --issue 456 --format tree"
```

### Estimation Commands

#### `/estimate:bulk`
Analyze issue complexity and suggest story point estimates.

**Options:**
- `--filter <string>` - Filter issues to estimate
- `--scale <string>` - Estimation scale: fibonacci, linear (default: fibonacci)

*Note: Full implementation coming soon*

#### `/estimate:sprint`
Calculate sprint capacity and team velocity.

**Options:**
- `--milestone <string>` - Sprint milestone name
- `--history <number>` - Number of past sprints to analyze (default: 3)

*Note: Full implementation coming soon*

### Workflow Commands

#### `/workflow:status`
Analyze CI/CD workflow performance and health.

**Options:**
- `--period <string>` - Analysis period: week, month (default: week)

**Features:**
- Recent workflow run analysis
- Success rate calculations
- Failure pattern identification
- Performance trending

**Example:**
```bash
fsd slash "/workflow:status --period week"
```

#### `/milestone:create`
Set up project milestones with templates.

**Options:**
- `--title <string>` - Milestone title (required)
- `--due <date>` - Due date in YYYY-MM-DD format
- `--description <string>` - Milestone description

**Example:**
```bash
fsd slash "/milestone:create --title 'Q1 Release' --due 2024-03-31 --description 'First quarter feature release'"
```

## Command Aliases

For faster usage, all commands support short aliases:

| Full Command | Alias | Description |
|--------------|-------|-------------|
| `/sprint:plan` | `/s:p` | Sprint planning |
| `/sprint:review` | `/s:r` | Sprint review |
| `/sprint:close` | `/s:c` | Sprint close |
| `/epic:create` | `/e:c` | Epic creation |
| `/epic:status` | `/e:s` | Epic status |
| `/progress:report` | `/p:r` | Progress report |
| `/progress:team` | `/p:t` | Team progress |
| `/issue:bulk` | `/i:b` | Bulk operations |
| `/issue:dependencies` | `/i:d` | Dependencies |
| `/estimate:bulk` | `/est:b` | Bulk estimation |
| `/estimate:sprint` | `/est:s` | Sprint estimation |
| `/workflow:status` | `/w:s` | Workflow status |
| `/milestone:create` | `/m:c` | Milestone creation |

**Example using aliases:**
```bash
fsd slash "/s:p --capacity 50"
fsd slash "/i:b --action label"
fsd slash "/p:r --period week"
```

## Story Point Integration

The slash command system automatically calculates story points based on issue labels:

### Supported Label Patterns:
- `points: 5` or `5 points`
- `story-points-3` or `sp-8`
- `estimate: 13` or `13-estimate`

### Default Behavior:
- Issues without point labels default to 1 point
- Fibonacci scale recommended: 1, 2, 3, 5, 8, 13, 21
- Points are used for capacity planning and velocity tracking

## Best Practices

### Sprint Planning
1. **Prepare your backlog** - Ensure issues have proper labels and estimates
2. **Set realistic capacity** - Consider team availability and past velocity
3. **Review dependencies** - Use `/issue:dependencies` before planning
4. **Regular reviews** - Use `/sprint:review` for mid-sprint check-ins

### Issue Management
1. **Use consistent labeling** - Establish team conventions for labels
2. **Document dependencies** - Reference related issues in descriptions
3. **Regular bulk operations** - Clean up stale issues periodically
4. **Track progress** - Generate regular reports with `/progress:report`

### Team Collaboration
1. **Shared conventions** - Agree on estimation scales and labels
2. **Regular reporting** - Weekly progress reports for stakeholders
3. **Dependency awareness** - Check blockers before sprint planning
4. **Continuous improvement** - Use velocity data for better planning

## Troubleshooting

### Common Issues

**GitHub CLI not authenticated:**
```bash
gh auth login
```

**Permission denied:**
- Ensure you have write access to the repository
- Check if you're in the correct repository directory

**Command not found:**
- Verify the command syntax with `/help`
- Check for typos in command names

**No issues found:**
- Verify your filter syntax
- Check if the repository has issues

### Getting Help

```bash
# General help
fsd slash "/help"

# Specific command help
fsd slash "/help sprint:plan"
fsd slash "/help issue:bulk"

# List all commands and aliases
fsd slash "/help"
```

## Integration Examples

### Complete Sprint Workflow

```bash
# 1. Plan the sprint
fsd slash "/sprint:plan --capacity 40 --weeks 2"

# 2. Mid-sprint review
fsd slash "/sprint:review"

# 3. Check for blockers
fsd slash "/issue:dependencies --issue 123"

# 4. Bulk update priorities
fsd slash "/issue:bulk --action label --filter milestone:'Current Sprint'"

# 5. Generate weekly report
fsd slash "/progress:report --period week --format markdown"

# 6. Check CI/CD health
fsd slash "/workflow:status"
```

### Issue Management Workflow

```bash
# 1. Create epic
fsd slash "/epic:create --title 'User Dashboard'"

# 2. Analyze dependencies
fsd slash "/issue:dependencies --issue 456"

# 3. Bulk assign to milestone
fsd slash "/issue:bulk --action milestone --filter label:dashboard"

# 4. Generate progress report
fsd slash "/progress:report --period week"
```

## Future Enhancements

- Advanced filtering with GitHub search syntax
- Integration with external project management tools
- Automated sprint retrospective generation
- Team performance analytics
- Custom command creation
- Slack/Discord notifications
- Time tracking integration

---

For more information, visit the [Flow State Dev repository](https://github.com/jezweb/flow-state-dev) or run `fsd slash "/help"` for interactive help.