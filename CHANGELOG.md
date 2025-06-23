# Changelog

All notable changes to Flow State Dev will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.13.0] - 2025-06-23

### Added
- **Quick Action Slash Commands** - Level 1 commands for daily development workflow
  - `/build` - Run project build with environment options and watch mode
  - `/test` - Run tests with coverage, watch mode, and file-specific testing
  - `/lint` - Code linting with auto-fix and formatting options
  - `/fix` - Combined auto-fix for linting and formatting issues
  - `/typecheck` - TypeScript type checking with watch mode
  - `/status` - Enhanced git status with categorized changes and branch information
  - `/commit` - Interactive conventional commit with suggested messages
  - `/push` - Push to current branch with upstream and force options
  - Smart package.json script detection for build, test, lint, and typecheck commands
  - Single-letter aliases for quick access (b, t, l, tc, st, c, p)

- **Extended Thinking Slash Commands** - Level 3 commands for deep analysis and planning
  - `/plan` - Comprehensive planning with explicit extended thinking mode and ADR generation
  - `/investigate` - Multi-source research and analysis with gap identification
  - `/decide` - Architectural decision making with multi-criteria evaluation and ADR creation
  - `/estimate` - Complex estimation with risk analysis and multiple estimation methods
  - `/debug:strategy` - Systematic debugging approach with hypothesis generation
  - `/optimize:plan` - Performance optimization strategy with bottleneck analysis
  - `/refactor:plan` - Incremental refactoring planning with risk assessment
  - `/research` - Deep multi-source research with synthesis and recommendations
  - `/alternatives` - Alternative solution exploration with constraint analysis
  - All commands include explicit `<extended-thinking>` mode demonstration
  - Automatic ADR (Architecture Decision Record) generation for decisions
  - Comprehensive analysis reports with multiple output formats

### Enhanced
- **Slash Command Framework** - Now supports 67+ commands across 6 categories
  - Quick Actions category for immediate workflow tasks
  - Extended Thinking category for complex analysis and planning
  - Enhanced help system with categorized command listings
  - Improved argument parsing and validation
  - Better error handling and user guidance

### Developer Experience
- **Daily Workflow Integration** - Quick commands for build, test, lint, git operations
- **AI-Assisted Analysis** - Extended thinking commands demonstrate deep analytical processes
- **Decision Documentation** - Automatic ADR creation for architectural decisions
- **Planning Reports** - Comprehensive reports saved as markdown files
- **Intelligent Detection** - Automatic detection of project scripts and configurations

## [0.12.0] - 2025-06-23

### Added
- **Project Retrofit System** - Safely add Flow State Dev features to existing projects
  - `fsd upgrade` command for interactive feature addition to existing projects
  - Comprehensive project analysis engine that detects current Flow State Dev version and missing features
  - Automatic backup system with timestamped backups and complete rollback capability
  - Modular feature system allowing selective upgrade of specific components
  - Change preview system showing exactly what will be modified before applying changes
  - Enhanced safety checks with conflict detection and file preservation
  - Documentation retrofit module with 21+ comprehensive templates
  - CLI options for preview (`--preview`), feature selection (`--features`), and rollback (`--rollback`)

### Enhanced
- **Enhanced Safety Checks** - Improved directory analysis for existing project detection
  - Comprehensive file pattern detection (60+ patterns) for source code, config files, and build artifacts
  - Git repository intelligence with commit and branch analysis
  - Risk-based categorization (blocking issues, warnings, notices) with specific solutions
  - Better error messages and user guidance for unsafe operations

### Infrastructure
- **Modular Architecture** - Extensible plugin-based retrofit system
  - Abstract base class for retrofit modules with standard interface
  - Module registry with dependency resolution and conflict detection
  - Template system with variable substitution for project-specific content
  - Safe file operations with backup and validation capabilities

## [0.11.1] - 2025-01-23

### Added
- **Analysis & Planning Slash Commands** - Transform high-level ideas into trackable GitHub issues
  - `/breakdown` command for comprehensive scope analysis and issue creation
  - `/epic:breakdown` command for breaking large epics into user stories and technical tasks
  - `/feature:plan` command for complete feature planning from concept to implementation
  - `/analyze:scope` command for detailed scope analysis with dependency mapping
  - Smart analysis engine that recognizes authentication, dashboard, and generic feature patterns
  - Automatic GitHub issue creation with proper templates, labels, and milestones
  - Effort estimation and timeline recommendations
  - AI-powered component identification and risk assessment

- **Enhanced Slash Command Infrastructure** - Robust framework for command development
  - Command aliases for faster access (`/bd` → `/breakdown`, `/e:b` → `/epic:breakdown`)
  - Comprehensive help system with command categories and detailed options
  - Advanced argument parsing with validation and defaults
  - Template generation system for consistent issue creation
  - Integration with GitHub CLI for seamless issue management

### Enhanced
- **Issue Creation Workflow** - Automated generation of properly structured GitHub issues
  - User story templates with acceptance criteria and priority
  - Technical task templates with type classification and effort estimates
  - Feature phase templates with deliverables and dependencies
  - Complexity-based labeling system (effort:small, effort:medium, effort:large)

- **Analysis Capabilities** - Intelligent breakdown of project requirements
  - Authentication system analysis (registration, login, password reset, profile)
  - Dashboard/UI analysis (layout, visualization, responsive design, preferences)
  - Generic feature analysis with component-based breakdown
  - Dependency identification and risk assessment
  - Timeline and effort estimation based on complexity

### Developer Experience
- **"Looks Good, Make GitHub Issues" Workflow** - One command solution for planning
  - Transforms manual analysis process into automated workflow
  - Reduces planning time from hours to minutes
  - Ensures consistent issue structure and completeness
  - Perfect integration with AI-assisted development

- **Comprehensive Documentation** - Updated guides and examples
  - New command examples in README with real-world scenarios
  - Enhanced help system with categorized command listings
  - Usage patterns for different project types and complexities

## [0.11.0] - 2025-01-23

### Added
- **Smart Environment Detection** (#21) - Automatically detects development environment and tools
  - System information (OS version, shell, hardware specs)
  - Development tools (package managers, CLI tools, databases)
  - Project patterns (frameworks, testing tools, project structure)
  - Editor/IDE detection (VS Code, WebStorm, etc.)
  - Git configuration (user info, GitHub username)
  - Opt-in detection with transparent results display
  - Smart defaults pre-fill memory setup with detected values

- **Enhanced Memory System** (#16, #17, #19, #20) - Comprehensive memory configuration
  - Enhanced setup mode with section-by-section configuration
  - 6 pre-built persona templates (minimal, standard, vue-developer, full-stack, ai-engineer, comprehensive)
  - Modular section library for custom configurations
  - Template variable substitution system
  - Progress saving and resume functionality
  - Integration with `fsd init` using `--memory` flag

- **Slash Commands for Project Management** (#55) - Powerful project management commands
  - Comprehensive slash command framework with `fsd slash "/command"`
  - Sprint management with capacity tracking
  - Epic creation and management
  - Issue operations and bulk updates
  - Progress reporting (weekly/monthly)
  - Deep GitHub CLI integration
  - Workflow automation commands

- **Pinia Store Generator** (#53) - State management made easy
  - New `fsd store <name>` command for generating stores
  - Multiple templates: default, auth, supabase, minimal
  - Supabase integration with real-time subscriptions
  - Smart imports and type safety
  - Comprehensive documentation

- **Local Supabase Development** (#58) - Complete offline development
  - Automated Docker and Supabase CLI installation
  - New commands: `fsd setup-local`, `fsd supabase start/stop/reset/migrate/seed`
  - Local development environment templates
  - Offline-first development workflow

- **Modular Onboarding System** - Plugin-based architecture
  - Extensible onboarding framework
  - Memory setup integration step
  - Custom onboarding plugins support
  - Dependency resolution

- **Enhanced Labels System** (#69) - Better GitHub issue management
  - Multiple label collections: minimal, standard, ai-enhanced, full
  - Emoji support with prefix/suffix positioning
  - Interactive collection selection with preview
  - Label export functionality
  - 66 labels in full collection

- **Security Documentation Suite** - Comprehensive security guides
  - Main security guide covering all aspects
  - Security checklist for every development stage
  - Best practices quick reference
  - Supabase-specific security configuration

- **Automated Release Process** - Streamlined workflow
  - Release scripts for version management (patch/minor/major)
  - Automated changelog generation from commits
  - Package validation and verification
  - GitHub Actions workflows for CI/CD

### Changed
- **Default project name** now uses the current directory name instead of 'my-app' (#68)
- Enhanced doctor command with better diagnostics
- Improved template defaults and environment variable handling
- Updated GitHub workflows for better automation
- Enhanced .npmignore for smaller package size

### Fixed
- Memory file creation in template mode
- Version consistency validation in release scripts
- Test installation script compatibility


## [0.5.0] - 2025-01-23

### Added
- **Comprehensive documentation structure** for all new projects:
  - `docs/` folder with context, guides, API docs, and architecture decisions
  - `.claude/` folder with AI-specific context files (personality, code style, avoid patterns)
  - 21 pre-filled documentation templates to maintain best practices
  - Architecture Decision Records (ADR) template system
- **GitHub Project Management System guide** for using GitHub Issues as complete PM solution
- **Slash Commands Plan** with 13 detailed GitHub issues for implementing custom commands
- **Project context templates** including:
  - Business rules documentation
  - User personas definitions
  - Technical debt tracking
  - Current development focus
- **AI-optimized documentation** helping Claude and other assistants understand projects immediately
- **Team conventions template** for consistent coding standards

### Enhanced
- New projects now include comprehensive documentation from day one
- Better onboarding experience with pre-filled getting-started guides
- Improved AI assistance through structured context files
- Added development workflow templates and team process documentation

### Documentation
- Created `docs/DEFAULT_DOCS_STRUCTURE.md` explaining the new documentation system
- Added `docs/GITHUB_PROJECT_MANAGEMENT.md` for project management best practices
- Created `docs/SLASH_COMMANDS_PLAN.md` with implementation roadmap
- Updated main CLAUDE.md to reference new documentation structure

## [0.4.0] - 2025-01-23

### Added
- **Directory selection prompt** - Always ask users where to create project files
- **Command-line flags** for directory control:
  - `--here` - Create project in current directory
  - `--subfolder` - Create project in subfolder (default)
  - `--force` - Skip safety confirmations
- **Enhanced directory analysis** showing file counts and important files
- **Safety checks** prevent overwriting existing projects
- **npx support documentation** - Users can run without installation

### Changed
- Directory selection is now explicit rather than "smart"
- Shows full directory path and contents before creating project
- Improved error messages with actionable suggestions

### Fixed
- Hidden files no longer ignored when checking if directory is "empty"
- Clearer behavior about where project files will be created

### Updated
- **Complete label system overhaul** - Now 54 labels optimized for AI-assisted development
- **Prefix-based organization** - Labels grouped by type:, priority:, status:, ai:, component:, tech:, needs:, effort:
- **AI-specific labels** added for Claude Code workflows (ai:generated, ai:review-needed, etc.)
- **Better color coding** - Consistent color scheme by category
- **Comprehensive documentation** - Updated LABELS.md with usage guidelines

## [0.3.2] - 2025-01-23

### Added
- **Post-install verification script** - Automatically tests installation after npm install
- **Comprehensive diagnostic tools** for troubleshooting installation issues
- **Installation success feedback** with version confirmation and next steps
- **Automated fix script** for common installation problems
- **Cross-platform compatibility** for post-install checks (Windows, macOS, Linux)

### Enhanced
- **Installation experience** now provides immediate feedback and guidance
- **Error handling** with specific troubleshooting recommendations
- **Test suite** includes post-install script validation
- **Documentation** with quick diagnostic commands for users

### Fixed
- **Installation verification** helps identify and resolve "command not found" issues
- **PATH configuration** guidance for different shell environments
- **Node version manager** compatibility improvements

### Tools Added
- `debug/diagnose.sh` - Quick system and installation analysis
- `debug/diagnose.js` - Detailed Node.js-based diagnostics
- `debug/test-install.sh` - Complete installation testing
- `debug/fix-install.sh` - Automated installation repair
- `scripts/post-install.cjs` - Post-installation verification

## [0.3.1] - 2025-01-23

### Improved
- Simplified quickstart instructions to just `fsd init`
- Added explanation of `-g` flag meaning "global installation"
- Auto-normalize project names (spaces→hyphens, uppercase→lowercase)
- Smart folder detection - offers to use current directory if empty and matches project name
- Clear messaging about where files will be created
- Suppressed git initialization hints for cleaner output
- Enhanced GitHub CLI missing message with complete setup instructions
- Added comprehensive troubleshooting section to README
- Better error handling and user guidance throughout

### Fixed
- Project name validation now more user-friendly
- Folder creation behavior is now clear and predictable
- GitHub CLI setup instructions include authentication step

## [0.3.0] - 2025-01-23

### Added
- Comprehensive test suite with automated testing
- Quick tests script for basic functionality checks
- Interactive test scenarios for user input flows
- GitHub Actions workflow for CI/CD testing
- Testing documentation and manual test checklist
- Expanded GitHub label set from 15 to 30 labels for better issue categorization
- New label categories: CLI, templates, UX, testing, security, performance
- Label usage documentation in `docs/LABELS.md`
- Additional workflow labels: needs-discussion, breaking-change
- Research and automation labels for better project management
- New `fsd memory` command for managing Claude Code user memory files
- Memory subcommands: init, show, edit, import
- Quick setup mode for memory initialization (< 1 minute)
- Auto-detection of OS and environment
- Smart scanning for existing memory files to import
- Interactive tech stack selection during setup
- Framework selection prompt during `fsd init`
- Support for multiple framework templates (Vue 3 + Vuetify available)
- Framework configuration system for easy template additions
- Coming soon placeholders for React, Vue+Tailwind, and SvelteKit
- New `fsd doctor` command for project diagnostics
- Auto-fix capability with `fsd doctor --fix`
- Enhanced error messages with specific solutions and commands
- Comprehensive error handling system with helpful troubleshooting
- CLAUDE.md template enhanced with Vue 3 best practices
- Added responsive design guidelines and performance tips
- Expanded testing checklist and debugging information
- Common gotchas documentation for authentication and Vuetify
- Memory file validation and linting with `fsd memory validate`
- Auto-fix capability for memory files with `fsd memory fix`
- Structure validation: markdown syntax, heading hierarchy, file size
- Content validation: required sections, clear instructions, no contradictions
- Security checks: detect passwords, API keys, sensitive information
- Version checks: validate tech stack versions are current
- Best practices enforcement: actionable instructions, proper organization
- Strict validation mode for comprehensive checks
- Memory validation documentation in `docs/MEMORY-VALIDATION.md`

### Enhanced
- Memory quick setup now has minimal mode option (--minimal flag)
- Setup reduced to essential questions only with smart defaults
- Auto-detection now includes OS version, shell, Node.js version
- Preview of memory file before creation with confirmation
- Better organized tech stack selection with categories
- Improved work style descriptions with emoji indicators
- Memory import now supports selective section import
- Enhanced file scanning includes recent git repositories
- Import preview shows file content before confirmation
- Diff view for comparing memory files before import
- Smart merge conflict resolution with multiple import modes
- File validation ensures only valid memory files are imported

## [0.2.0] - 2025-01-22

### Added
- Interactive setup mode for `fsd init` command
- Prompts for Supabase configuration during project creation
- Automatic .env file creation with credentials
- GitHub repository connection during setup
- Option to run GitHub labels setup immediately
- `--no-interactive` flag to skip interactive setup
- `.claude/settings.json` with pre-approved commands for smoother Claude Code experience
- Comprehensive permissions for common development commands
- WebFetch permissions for documentation sites

### Changed
- Simplified project setup - no manual .env configuration needed
- Better onboarding experience for new users
- Expanded Claude Code permissions to cover most development scenarios

## [0.1.2] - 2025-01-22

### Fixed
- Enhanced .gitignore file in template with comprehensive ignore patterns
- Now properly ignores all environment files, temporary files, and build artifacts
- Added .eslintrc.cjs configuration file to prevent linting errors on fresh projects
- Configured ESLint for Vue 3 with sensible defaults (allows single-word component names)
- Made Supabase initialization graceful - app runs without crashing when not configured
- Added offline mode support with clear warnings when Supabase is not configured
- Created SupabaseStatus component to notify users about missing configuration

## [0.1.1] - 2025-01-22

### Changed
- Updated README with npm installation as primary method
- Added npm version badge and MIT license badge
- Improved installation instructions
- Fixed package.json bin path warning

## [0.1.0] - 2025-01-22

### Added
- Initial release of Flow State Dev 🎉
- CLI tool (`fsd`) with commands:
  - `fsd init [project-name]` - Create new Vue 3 + Supabase project
  - `fsd labels` - Set up standardized GitHub labels
  - `fsd help` - Show available commands
- Vue 3 + Vuetify 3 + Supabase project template
- Pre-configured authentication system
- Pinia state management setup
- Vue Router with navigation guards
- Sample components and views
- `CLAUDE.md` file for AI assistant context
- GitHub labels configuration
- Comprehensive documentation

### Features
- Zero-configuration project setup
- Claude Code optimized project structure
- Supabase integration with auth helpers
- Material Design UI with Vuetify 3
- TypeScript-ready configuration
- Netlify deployment ready

[0.5.0]: https://github.com/jezweb/flow-state-dev/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/jezweb/flow-state-dev/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/jezweb/flow-state-dev/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/jezweb/flow-state-dev/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/jezweb/flow-state-dev/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jezweb/flow-state-dev/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/jezweb/flow-state-dev/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/jezweb/flow-state-dev/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/jezweb/flow-state-dev/releases/tag/v0.1.0