# Changelog

All notable changes to Flow State Dev will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.1] - 2025-06-26

### Fixed
- Add missing `glob` dependency to fix npm installation error
- Resolve ERR_MODULE_NOT_FOUND when installing from npm registry

## [2.1.0] - 2025-06-26

### Added

#### Module Dependency Resolver System (#80)
- **ModuleDependencyResolver Class** - Advanced dependency resolution with conflict detection
- **Dependency Graph Construction** - Build and validate complex module relationships
- **Conflict Detection** - Identify direct, exclusive, circular, and version conflicts
- **Capability-based Dependencies** - Smart resolution based on module capabilities (provides/requires)
- **Suggestion Engine** - Recommend compatible modules and alternatives
- **Performance Optimization** - LRU caching and topological sorting for fast resolution
- **Comprehensive Testing** - 62 tests covering all dependency scenarios
- **Complete Documentation** - Detailed guide with architecture overview and examples

#### Specialized Module Types (#79)
- **FrontendFrameworkModule** - Vue, React, Svelte framework modules with build tool integration
- **UILibraryModule** - Component and utility library modules (Vuetify, Tailwind, Material UI)
- **BackendServiceModule** - BaaS integration modules (Supabase, Firebase) with service generation
- **AuthProviderModule** - Authentication provider modules (Auth0, Clerk, SuperTokens)
- **BackendFrameworkModule** - Server framework modules (Express, Fastify) with middleware setup
- **204 Comprehensive Tests** - Full test coverage for all module types and edge cases
- **Complete Documentation** - Detailed guide with usage examples and integration patterns

### Fixed

#### Critical ES Module Import Resolution
- **Fixed fs-extra imports** - Resolved CommonJS module import issues across 3 core files
- **Fixed glob imports** - Updated template generator and registry for proper ES module compatibility  
- **Fixed DependencyResolver naming** - Corrected import/export mismatches across 8 test files
- **All tests now executable** - Resolved blocking syntax errors preventing development work

#### Template Generator for Modular Stacks (#81)
- **TemplateGenerator Class** - Sophisticated engine for merging multiple module templates
- **Merge Strategies** - Intelligent file merging (replace, merge, append, prepend, custom)
- **Package.json Merging** - Smart dependency and script merging with conflict resolution
- **Environment File Handling** - Proper .env file merging with duplicate detection
- **Conflict Resolution** - Priority-based and interactive conflict resolution
- **Variable Substitution** - Comprehensive Handlebars helpers for templates
- **Performance Optimization** - Template caching and parallel processing
- **Extensive Testing** - Full test coverage for all features
- **Complete Documentation** - Detailed guide with examples and best practices

#### Performance Monitoring System (#132)
- **Performance Monitor** - Comprehensive tracking of command discovery, execution, and memory usage
- **Performance Benchmarks** - Automated test suite ensuring no regression from monolithic version
- **Lazy Loading** - Commands loaded on-demand to reduce startup time and memory usage
- **Performance CLI Command** - `/performance` command for real-time monitoring and reporting
- **Historical Tracking** - Performance reports saved with trend analysis
- **Threshold Alerts** - Configurable thresholds with violation warnings
- **Performance Utilities** - Helper functions for measurement, caching, and optimization
- **Comprehensive Documentation** - Performance guide with best practices and troubleshooting

#### Enhanced Module Registry System (#90)
- **Multi-Source Module Loading** - Load modules from project, user, npm, and built-in sources
- **Advanced Version Management** - Semantic versioning with conflict resolution
- **Fuzzy Search Engine** - Fast module search with relevance scoring and suggestions
- **Performance Caching** - Memory and disk caching with LRU eviction
- **CLI Module Commands** - New `fsd modules` command group for module management
- **Module Statistics** - Track registry performance and module usage
- **Compatibility Checking** - Verify module compatibility before installation
- **Module Hot Reloading** - Reload modules during development without restart

### Closed Issues
- Closed #141 - SvelteKit + Better Auth (fully implemented)
- Closed #130 - Integration tests for modular slash commands (comprehensive test suite created)
- Closed #132 - Performance monitoring for modular slash commands (complete monitoring system implemented)

#### SvelteKit & Better Auth Support (#141)
- **SvelteKit Module** - Complete SvelteKit 2.0 framework integration with TypeScript
- **Better Auth Module** - Modern authentication system with email/OAuth providers
- **Full Stack Presets** - New SvelteKit presets for full-stack, frontend, and minimal setups
- **Authentication Routes** - Pre-configured auth pages and API routes
- **Testing Setup** - Vitest for unit tests, Playwright for E2E tests out of the box
- **Server-Side Rendering** - Full SSR/SSG support with SvelteKit's architecture
- **File-based Routing** - SvelteKit's powerful routing system configured
- **Better Auth Features** - Email/password, OAuth providers, session management
- **Integration Tests** - Comprehensive test suite for SvelteKit module

#### React & Tailwind CSS Support
- **React Module** - Complete React 18 framework integration with TypeScript and modern tooling
- **Tailwind CSS Module** - Utility-first CSS framework with PostCSS integration and custom components
- **Modern React Stack** - React + Tailwind + Vercel deployment stack now fully functional
- **Component Libraries** - Pre-built Tailwind components for both React and Vue frameworks
- **TypeScript Support** - Full TypeScript configuration for React projects with ESLint integration
- **Testing Setup** - Vitest and React Testing Library configuration out of the box
- **State Management** - Multiple options including Context API, Redux Toolkit, and Zustand
- **Dark Mode Support** - Built-in dark mode configuration with class-based strategy
- **Custom Design System** - Extended color palette and theme customization in Tailwind config

#### Vercel Deployment Support (#138)
- **Vercel Module** - Complete Vercel deployment integration with configuration templates
- **Deployment Scripts** - npm scripts for deploy, preview, env management, and logs
- **Security Headers** - Pre-configured security headers in vercel.json
- **Framework Detection** - Automatic configuration for Vue and React projects
- **SPA Routing** - Configured routes for single-page applications
- **Environment Variables** - Template for Supabase and custom env vars
- **Stack Presets** - Updated all presets to include Vercel deployment option
- **Multi-Framework Support** - Specialized configurations for Vue and React
- **Documentation** - Comprehensive README sections for deployment

#### Minimal Setup Option
- **No Framework Pathway** - New option to start without a framework for undecided users
- **Framework Selection Guide** - Comprehensive guide comparing Vue, React, and Svelte
- **Basic Project Structure** - Includes Vite, ESLint, Prettier out of the box
- **Upgrade Path** - Support for `fsd upgrade --add-framework` (implementation pending)
- **Default Selection** - Minimal setup now appears first in framework selection
- **Educational Content** - CHOOSING_A_FRAMEWORK.md guide generated in all minimal projects

### Changed
- **Framework Selection** - Minimal setup is now the default option in interactive mode
- **README Updates** - Added documentation for minimal setup option
- **Stack Presets** - React Full Stack and React Frontend presets now functional with new modular architecture

### Technical
- **Test Suite** - Added minimal-setup.test.js for integration testing
- **Environment Variable** - FSD_DEFAULT_FRAMEWORK for testing non-interactive mode

### Fixed
- **Checkbox Prompt UX** (#135) - Added pageSize to all checkbox prompts for better visibility
  - Tech stack selection now shows 12 items
  - Module selection shows 15 items  
  - Import selection shows 15 items
  - Retrofit feature selection shows 12 items
  - Memory template section selection shows 10 items
- **Context-Relevant Next Steps** (#136) - Project completion messages now adapt to user selections
  - Only shows Supabase setup if Supabase module was selected
  - Skips cd command when using --here flag
  - Shows framework-specific tips and resources
  - Displays relevant module commands
  - Numbered steps adjust dynamically

## [2.1.0] - 2025-06-25

### Added

#### Documentation
- **SLASH_COMMANDS.md** - Complete rewrite documenting modular architecture and all 67+ commands
- **SLASH_COMMAND_DEVELOPMENT.md** - Comprehensive guide for creating custom commands
- **SLASH_COMMAND_PLUGINS.md** - Plugin system documentation for extending FSD
- **SLASH_COMMAND_MIGRATION.md** - Migration guide from v1.x to v2.x
- **SLASH_COMMAND_API.md** - Complete API reference for command development

#### Developer Experience
- **Plugin Support** - npm package exports for creating command plugins
- **CLI Reference Update** - Added slash command details and examples
- **README Updates** - Highlighted v2.0 modular architecture

### Changed

- **Package Exports** - Added exports for command system modules
- **Performance Documentation** - Added metrics showing command discovery <25ms
- **Category Documentation** - Documented all 10 command categories

### Technical Improvements

- **JSDoc Comments** - Enhanced documentation for base classes
- **Code Cleanup** - Removed obsolete files and TODOs
- **Build Process** - Updated entry points for modular system

## [2.0.1] - 2025-06-25

### Fixed
- **GitHub Labels** - Fixed labels creation during init process (was calling wrong command)
- **Linux Documentation** - Added clear guidance for EACCES permission errors on Linux
- **Init Process** - Labels now properly created with ai-enhanced collection during onboarding

### Documentation
- **Linux Troubleshooting** - Added specific section for npm permission errors
- **README** - Added note for Linux users about avoiding sudo with npm

## [2.0.0] - 2025-06-25

### 🚀 Major Architecture Change

This release completes the migration of all slash commands from a monolithic architecture to a modular, maintainable system. This is a breaking change in the internal architecture, though all commands maintain backward compatibility.

### Added

- **Modular Command Architecture** - All 67 commands now live in individual files
- **Command Base Classes** - `BaseSlashCommand` and `GitHubSlashCommand` for consistency
- **Auto-discovery System** - Commands are automatically discovered via filesystem scanning
- **Final Migration Commands** - Completed 100% migration with:
  - `/decide` - Architectural decisions with ADR creation
  - `/research` - Deep multi-source research
  - `/alternatives` - Alternative solution exploration

### Changed

- **Complete Architecture Overhaul** - Migrated from 3000+ line monolithic file to modular system
- **Improved Error Handling** - Consistent error messages across all commands
- **Better User Experience** - Clear feedback and progress indicators
- **Simplified Wrapper** - `slash-commands-wrapper.js` now only routes to the new system

### Removed

- **Legacy System** - Removed `lib/slash-commands.js` (3000+ lines)
- **Migration Logic** - Removed temporary bridging code from wrapper

### Migration Statistics

- **Total Commands**: 67 (100% migrated)
- **Categories**: 10
- **Architecture**: Modular with auto-discovery
- **Breaking Changes**: Internal only - all commands work the same for users

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