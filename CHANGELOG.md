# Changelog

All notable changes to Flow State Dev will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[0.1.1]: https://github.com/jezweb/flow-state-dev/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/jezweb/flow-state-dev/releases/tag/v0.1.0