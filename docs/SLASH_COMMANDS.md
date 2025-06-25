# Slash Commands

Flow State Dev includes a comprehensive set of slash commands for project management, development workflow, and GitHub integration. With 67+ commands across 6 categories, these commands streamline everything from daily coding tasks to complex project planning.

## ✨ What's New in v0.13.0

### Quick Action Commands
8 new commands for instant access to daily development tasks:
- **`/build`** (`/b`) - Run your project's build command
- **`/test`** (`/t`) - Execute tests with optional coverage
- **`/lint`** (`/l`) - Run linter with auto-fix support
- **`/fix`** (`/f`) - Auto-fix all linting and formatting issues
- **`/typecheck`** (`/tc`) - Run TypeScript type checking
- **`/status`** (`/s`) - Enhanced git status with categorization
- **`/commit`** (`/c`) - Interactive conventional commit helper
- **`/push`** (`/p`) - Push changes to remote repository

### Extended Thinking Commands
9 new commands for deep analysis with explicit extended thinking mode:
- **`/plan`** (`/pl`) - Comprehensive planning with ADR generation
- **`/investigate`** (`/inv`) - Multi-source technical investigation
- **`/decide`** (`/dec`) - Structured decision-making with alternatives
- **`/estimate`** (`/est`) - Complex work estimation with confidence intervals
- **`/debug:strategy`** - Strategic debugging approach
- **`/optimize:plan`** - Performance optimization planning
- **`/refactor:plan`** - Refactoring strategy development
- **`/research`** (`/res`) - In-depth technical research
- **`/alternatives`** (`/alt`) - Generate and evaluate alternatives

These commands demonstrate extended thinking processes and generate comprehensive reports saved as markdown files in your project.

## Prerequisites

- GitHub CLI (`gh`) must be installed and authenticated
- Must be run in a GitHub repository directory
- Appropriate repository permissions for the operations you want to perform

## Quick Start

```bash
# View all available commands
fsd slash "/help"

# Quick Action Commands (NEW in v0.13.0)
fsd slash "/build"              # Run project build
fsd slash "/test --coverage"    # Run tests with coverage
fsd slash "/lint --fix"         # Lint with auto-fix
fsd slash "/b"                  # Alias for build

# Extended Thinking Commands (NEW in v0.13.0)
fsd slash "/plan --topic 'microservices architecture'"
fsd slash "/investigate --question 'performance issues'"
fsd slash "/decide --decision 'database choice' --alternatives 3"

# Sprint Management
fsd slash "/sprint:plan --capacity 40 --weeks 2"
fsd slash "/sprint:review"

# Issue Management
fsd slash "/epic:create --title 'User Authentication System'"
fsd slash "/issue:bulk --action label --filter state:open"
fsd slash "/issue:dependencies --issue 123"

# Reporting
fsd slash "/progress:report --period week --format markdown"
fsd slash "/workflow:status"
```

## Command Categories

### Quick Action Commands (NEW in v0.13.0)

Quick Action Commands provide instant access to common development tasks. These commands are designed for rapid execution during your daily workflow.

#### `/build`
Run your project's build command.

**Aliases:** `/b`

**Options:**
- `--watch` - Run in watch mode (if supported)
- `--prod` - Build for production

**Example:**
```bash
fsd slash "/build"
fsd slash "/b --prod"
```

#### `/test`
Execute your project's test suite.

**Aliases:** `/t`

**Options:**
- `--coverage` - Generate coverage report
- `--watch` - Run in watch mode
- `--filter <pattern>` - Filter tests by pattern

**Example:**
```bash
fsd slash "/test --coverage"
fsd slash "/t --filter user"
```

#### `/lint`
Run your project's linter.

**Aliases:** `/l`

**Options:**
- `--fix` - Auto-fix issues where possible

**Example:**
```bash
fsd slash "/lint --fix"
fsd slash "/l"
```

#### `/fix`
Auto-fix linting and formatting issues.

**Aliases:** `/f`

**Example:**
```bash
fsd slash "/fix"
```

#### `/typecheck`
Run TypeScript type checking.

**Aliases:** `/tc`

**Example:**
```bash
fsd slash "/typecheck"
```

#### `/status`
Enhanced git status with file categorization.

**Aliases:** `/s`

**Features:**
- Groups files by status (modified, added, deleted, untracked)
- Shows current branch and upstream status
- Displays last commit information

**Example:**
```bash
fsd slash "/status"
fsd slash "/s"
```

#### `/commit`
Interactive conventional commit helper.

**Aliases:** `/c`

**Features:**
- Guided commit message creation
- Conventional commit format
- Optional scope and breaking change flags

**Example:**
```bash
fsd slash "/commit"
fsd slash "/c"
```

#### `/push`
Push changes to remote repository.

**Aliases:** `/p`

**Options:**
- `--force` - Force push (use with caution)
- `--set-upstream` - Set upstream branch

**Example:**
```bash
fsd slash "/push"
fsd slash "/p --set-upstream"
```

### Extended Thinking Commands (NEW in v0.13.0)

Extended Thinking Commands enable deep analysis and planning with explicit extended thinking mode. These commands generate comprehensive reports and Architecture Decision Records (ADRs).

#### `/plan`
Comprehensive planning with extended analysis.

**Aliases:** `/pl`

**Options:**
- `--topic <string>` - Planning topic (required)
- `--depth <string>` - Analysis depth: quick, normal, deep (default: normal)
- `--create-adr` - Generate an Architecture Decision Record

**Features:**
- Multi-perspective analysis
- Risk assessment
- Implementation roadmap
- Resource estimation

**Example:**
```bash
fsd slash "/plan --topic 'microservices migration' --create-adr"
fsd slash "/pl --topic 'authentication system' --depth deep"
```

#### `/investigate`
Deep investigation of technical questions.

**Aliases:** `/inv`

**Options:**
- `--question <string>` - Investigation question (required)
- `--sources <list>` - Focus areas: code, patterns, performance, security

**Features:**
- Multi-source analysis
- Evidence gathering
- Pattern recognition
- Recommendation generation

**Example:**
```bash
fsd slash "/investigate --question 'memory leak in production'"
fsd slash "/inv --question 'slow API response times' --sources performance,code"
```

#### `/decide`
Structured decision-making with alternatives analysis.

**Aliases:** `/dec`

**Options:**
- `--decision <string>` - Decision to make (required)
- `--alternatives <number>` - Number of alternatives to consider (default: 3)
- `--criteria <list>` - Evaluation criteria
- `--create-adr` - Generate an Architecture Decision Record

**Features:**
- Alternative generation
- Criteria-based evaluation
- Trade-off analysis
- Decision matrix

**Example:**
```bash
fsd slash "/decide --decision 'database selection' --alternatives 5 --create-adr"
fsd slash "/dec --decision 'frontend framework' --criteria performance,learning-curve,ecosystem"
```

#### `/estimate`
Complex work estimation with multiple methods.

**Aliases:** `/est`

**Options:**
- `--work <string>` - Work to estimate (required)
- `--method <string>` - Estimation method: story-points, time, complexity
- `--confidence` - Include confidence intervals

**Features:**
- Multiple estimation techniques
- Risk factor analysis
- Confidence intervals
- Historical comparison

**Example:**
```bash
fsd slash "/estimate --work 'user dashboard redesign' --confidence"
fsd slash "/est --work 'API migration' --method story-points"
```

#### `/debug:strategy`
Strategic debugging approach for complex issues.

**Options:**
- `--problem <string>` - Problem description (required)
- `--symptoms <list>` - Observed symptoms
- `--urgency <string>` - Priority level: low, medium, high, critical

**Features:**
- Systematic approach generation
- Root cause analysis
- Debugging checklist
- Tool recommendations

**Example:**
```bash
fsd slash "/debug:strategy --problem 'intermittent crashes' --urgency high"
```

#### `/optimize:plan`
Performance optimization planning.

**Options:**
- `--target <string>` - Optimization target (required)
- `--constraints <list>` - Constraints to consider
- `--metrics <list>` - Success metrics

**Features:**
- Bottleneck analysis
- Optimization strategies
- Implementation plan
- Measurement approach

**Example:**
```bash
fsd slash "/optimize:plan --target 'page load time' --metrics 'LCP,FID,CLS'"
```

#### `/refactor:plan`
Refactoring strategy development.

**Options:**
- `--scope <string>` - Refactoring scope (required)
- `--goals <list>` - Refactoring goals
- `--preserve <list>` - Behaviors to preserve

**Features:**
- Risk assessment
- Step-by-step approach
- Testing strategy
- Rollback planning

**Example:**
```bash
fsd slash "/refactor:plan --scope 'authentication module' --goals 'testability,maintainability'"
```

#### `/research`
In-depth technical research.

**Aliases:** `/res`

**Options:**
- `--topic <string>` - Research topic (required)
- `--depth <string>` - Research depth: surface, moderate, deep
- `--output <string>` - Output format: summary, detailed, academic

**Features:**
- Literature review
- Technology comparison
- Best practices analysis
- Implementation examples

**Example:**
```bash
fsd slash "/research --topic 'event sourcing patterns' --depth deep"
fsd slash "/res --topic 'WebAssembly use cases' --output detailed"
```

#### `/alternatives`
Generate and evaluate alternatives.

**Aliases:** `/alt`

**Options:**
- `--for <string>` - What to find alternatives for (required)
- `--count <number>` - Number of alternatives (default: 5)
- `--criteria <list>` - Evaluation criteria

**Features:**
- Alternative generation
- Comparison matrix
- Pros/cons analysis
- Recommendation

**Example:**
```bash
fsd slash "/alternatives --for 'state management library' --criteria 'bundle-size,api,community'"
fsd slash "/alt --for 'deployment platform' --count 7"
```

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

### Quick Action Command Aliases
| Full Command | Alias | Description |
|--------------|-------|-------------|
| `/build` | `/b` | Run build command |
| `/test` | `/t` | Run tests |
| `/lint` | `/l` | Run linter |
| `/fix` | `/f` | Auto-fix issues |
| `/typecheck` | `/tc` | Type checking |
| `/status` | `/s` | Git status |
| `/commit` | `/c` | Commit helper |
| `/push` | `/p` | Push changes |

### Extended Thinking Command Aliases
| Full Command | Alias | Description |
|--------------|-------|-------------|
| `/plan` | `/pl` | Deep planning |
| `/investigate` | `/inv` | Investigation |
| `/decide` | `/dec` | Decision analysis |
| `/estimate` | `/est` | Work estimation |
| `/research` | `/res` | Technical research |
| `/alternatives` | `/alt` | Find alternatives |

### Sprint & Project Management Aliases
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
# Quick actions
fsd slash "/b"           # Build project
fsd slash "/t --coverage" # Test with coverage
fsd slash "/l --fix"     # Lint and fix

# Extended thinking
fsd slash "/pl --topic 'api design' --create-adr"
fsd slash "/inv --question 'performance bottleneck'"

# Sprint management
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