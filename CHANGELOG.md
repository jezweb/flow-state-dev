# Changelog

All notable changes to Flow State Dev will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Enhanced
- Memory quick setup now has minimal mode option (--minimal flag)
- Setup reduced to essential questions only with smart defaults
- Auto-detection now includes OS version, shell, Node.js version
- Preview of memory file before creation with confirmation
- Better organized tech stack selection with categories
- Improved work style descriptions with emoji indicators

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

[0.2.0]: https://github.com/jezweb/flow-state-dev/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/jezweb/flow-state-dev/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/jezweb/flow-state-dev/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/jezweb/flow-state-dev/releases/tag/v0.1.0