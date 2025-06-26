# Project Documentation

Welcome to the project documentation! This folder contains all the technical and business documentation for the project.

## 📁 Documentation Structure

### 🧠 Context
Essential context files for team members and AI assistants:
- [`context/project-overview.md`](context/project-overview.md) - High-level project description
- [`context/architecture.md`](context/architecture.md) - System design and technical decisions
- [`context/business-rules.md`](context/business-rules.md) - Domain logic and requirements
- [`context/user-personas.md`](context/user-personas.md) - Target users and use cases
- [`context/technical-debt.md`](context/technical-debt.md) - Known issues and future improvements

### 📚 Guides
Step-by-step guides for common tasks:
- [`guides/getting-started.md`](guides/getting-started.md) - Quick start for new developers
- [`guides/development.md`](guides/development.md) - Development environment setup
- [`guides/deployment.md`](guides/deployment.md) - How to deploy the application
- [`guides/testing.md`](guides/testing.md) - Testing strategies and how-to
- [`guides/troubleshooting.md`](guides/troubleshooting.md) - Common issues and solutions

### 🔌 API Documentation
- [`api/README.md`](api/README.md) - API overview and conventions
- `api/endpoints/` - Individual endpoint documentation
- [`api/examples/`](api/examples/) - Request/response examples

### 🏗️ Architecture
- [`architecture/decisions/`](architecture/decisions/) - Architecture Decision Records (ADRs)
- [`architecture/patterns.md`](architecture/patterns.md) - Coding patterns and conventions
- `architecture/diagrams/` - System architecture diagrams

### ✨ Features
Documentation for each major feature:
- [`features/authentication.md`](features/authentication.md) - Authentication system
- [`features/user-management.md`](features/user-management.md) - User management features
- Add more feature docs as needed

### 🔬 Research
- `research/investigations/` - Technical research and spikes
- `research/decisions/` - Decision documentation

### 👥 Team
- [`team/onboarding.md`](team/onboarding.md) - New team member guide
- [`team/conventions.md`](team/conventions.md) - Coding standards and conventions
- [`team/workflows.md`](team/workflows.md) - Team processes and workflows

### 🔧 Additional Folders
- `assets/` - Screenshots, diagrams, and other visual assets
- `integrations/` - Third-party integration documentation
- `performance/` - Performance benchmarks and optimization logs
- `security/` - Security policies and checklists
- `data/` - Data models and migration history

## 🤖 AI Assistant Context

The `.claude/` folder in the project root contains AI-specific context and preferences. This helps AI assistants like Claude understand your project better and provide more accurate assistance.

## 📝 Documentation Guidelines

1. **Keep it Current**: Update docs when you change code
2. **Be Specific**: Include examples and code snippets
3. **Think of Your Reader**: Write for someone new to the project
4. **Use Templates**: Follow the provided templates for consistency
5. **Link Liberally**: Cross-reference related documentation

## 🚀 Quick Links

- [Getting Started Guide](guides/getting-started.md)
- [Architecture Overview](context/architecture.md)
- [API Documentation](api/README.md)
- [Team Conventions](team/conventions.md)

## 📅 Documentation Review

Documentation should be reviewed:
- During code reviews (for accuracy)
- Monthly (for completeness)
- Before major releases (for updates)

---

> 💡 **Tip**: Use the `/docs:check` slash command to find undocumented features!