# Changelog

All notable changes to Flow State Dev will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[0.4.0]: https://github.com/jezweb/flow-state-dev/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/jezweb/flow-state-dev/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/jezweb/flow-state-dev/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/jezweb/flow-state-dev/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jezweb/flow-state-dev/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/jezweb/flow-state-dev/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/jezweb/flow-state-dev/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/jezweb/flow-state-dev/releases/tag/v0.1.0