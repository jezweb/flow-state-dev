# User Memory for Jez (Jeremy Dawes)

## Personal Information
- **Name**: Jez (Jeremy Dawes)
- **Role**: CEO of Jezweb - Product Manager with technical skills
- **Company Website**: www.jezweb.com.au
- **LinkedIn**: https://www.linkedin.com/in/jeremydawes
- **Location**: Newcastle, Australia (Sydney timezone)
- **Focus**: AI and automation deployment in businesses

## Development Environment
- **OS**: Linux Mint
- **Display**: 4K monitor
- **Browsers**: Chrome, Edge, Firefox
- **Project Location**: `/home/jez/claude/` (separate folders for each project)

## Tech Stack Preferences
### Frontend
- **Framework**: Vue 3 (preferred over React - find it easier)
- **UI Library**: Vuetify 3
- **Styling**: Tailwind CSS, Material UI (current versions)
- **Philosophy**: Easy to build, minimal issues/blockers/errors

### Backend & Services
- **Database**: Supabase
- **Vector DB**: Qdrant
- **AI/Automation**: Flowise, n8n
- **Deployment**: Netlify (easy option)
- **Self-hosting**: Coolify

## Work Style & Preferences
- **Role Context**: Building prototypes/tests to hand over to developers
- **Documentation**: Like all project plans documented
- **Collaboration**: Prefer discussions about best approaches
- **Version Control**: GitHub for all projects
- **Open Source**: Enjoy contributing to projects
- **AI Interest**: Very interested in MCP (Model Context Protocol), context7

## Claude Interaction Preferences
- **Style**: Be proactive - don't assume I know everything
- **Answers**: Concise by default, but detailed explanations for complex topics
- **Formatting**: Use formatting, emojis, and visual elements for readability
- **Milestones**: Use `/compact` command after successful features
- **Error Handling**: Willing to start over rather than get stuck with errors
- **Mindset**: Don't want frustration with non-working things

## Workflow Commands
- `/compact` - After completing milestones or features
- `/issue` - Create GitHub issue with proper labels
- `/milestone` - Create or update project milestones
- `/context7` - Use context7 to verify current library versions and best practices
- `/health` - Check project health (dependencies, errors, TODOs)

## Project Approach
- Single tenant applications
- Prototypes and test projects
- Focus on handover-ready code
- Minimal setup complexity
- Clear documentation

## GitHub Workflow Standards
### Issue Labels (Default Set)
- **Priority**: `priority:high`, `priority:medium`, `priority:low`
- **Type**: `bug`, `feature`, `enhancement`, `documentation`, `refactor`
- **Status**: `in-progress`, `blocked`, `ready-for-review`, `needs-discussion`
- **Component**: `frontend`, `backend`, `database`, `deployment`, `config`

### Milestone Structure
- **MVP** - Core functionality
- **Phase 2** - Enhanced features
- **Backlog** - Future considerations
- **Quick Wins** - Easy improvements

### Issue Template
```markdown
## Description
Brief description of the issue/feature

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Notes
Any implementation details or considerations

## Dependencies
- Related to #[issue number]
```

## Development Standards
### Before Starting Any Task
1. Check current library versions using context7
2. Verify best practices for the chosen stack
3. Create GitHub issue with appropriate labels
4. Add to relevant milestone

### When Encountering Errors
1. First attempt: Try standard debugging
2. If stuck: Use context7 to check for known issues/solutions
3. Consider if library versions might be outdated
4. Document solution in issue comments

### Code Quality Checklist
- [ ] Using current stable versions (verify with context7)
- [ ] Following Vue 3 composition API best practices
- [ ] Proper error handling with user-friendly messages
- [ ] Console.log statements removed
- [ ] Environment variables properly configured
- [ ] README updated with setup instructions

## Project Structure Template
```
/home/jez/claude/[project-name]/
├── README.md           # Setup & deployment instructions
├── claude.md          # Project-specific Claude instructions
├── .env.example       # Environment variable template
├── TODO.md           # Quick task tracking
├── docs/             # Additional documentation
├── src/              # Source code
└── .github/
    └── ISSUE_TEMPLATE/
```

## Communication Style
- Start responses with current task status
- Use ✅ for completed items
- Use 🚧 for in-progress work
- Use ❌ for blockers
- Use 💡 for suggestions
- Provide progress updates at natural breakpoints

## Future Goals
- Deploy more AI and automation into businesses
- Add more MCP integrations
- Reduce errors through better context (like context7)
- Build reusable component libraries
- Create templates for common project types