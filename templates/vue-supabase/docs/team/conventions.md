# Team Conventions & Standards

This document outlines our team's coding standards, conventions, and best practices to ensure consistency across the codebase.

## Code Review Process

### Pull Request Guidelines
1. **PR Size**: Keep PRs small and focused (< 400 lines changed)
2. **Description**: Include what, why, and how
3. **Testing**: Include test results or screenshots
4. **Labels**: Use appropriate labels (feature, bug, chore)

### Review Checklist
- [ ] Code follows project style guide
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.logs or debug code
- [ ] Performance impact considered
- [ ] Security implications reviewed

## Git Conventions

### Branch Naming
```
feature/add-user-authentication
fix/login-error-handling
chore/update-dependencies
docs/api-documentation
```

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add user profile page
fix: resolve login timeout issue
docs: update README with new setup steps
chore: upgrade Vue to 3.4.0
refactor: simplify auth service logic
test: add unit tests for user store
```

### Git Workflow
1. Create feature branch from `main`
2. Make changes and commit regularly
3. Push branch and create PR
4. Address review feedback
5. Squash and merge when approved

## Coding Standards

### General Principles
- **DRY** (Don't Repeat Yourself)
- **KISS** (Keep It Simple, Stupid)
- **YAGNI** (You Aren't Gonna Need It)
- **SOLID** principles where applicable

### File Organization
```
src/
├── components/
│   ├── common/        # Shared components
│   ├── layout/        # Layout components
│   └── features/      # Feature-specific
├── composables/       # Shared logic
├── services/          # API/external services
├── stores/            # State management
├── utils/             # Helper functions
└── views/             # Page components
```

### Import Order
```javascript
// 1. External imports
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

// 2. Internal imports - absolute paths
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/user'

// 3. Internal imports - relative paths
import UserCard from './UserCard.vue'

// 4. Static assets
import logo from '@/assets/logo.svg'
```

## Testing Standards

### Test File Naming
- Unit tests: `ComponentName.spec.js`
- Integration tests: `feature.integration.spec.js`
- E2E tests: `user-flow.e2e.js`

### Test Structure
```javascript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Test setup
  })

  describe('feature/method', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Coverage Requirements
- Minimum 80% coverage for new code
- Critical paths must have 100% coverage
- UI components: focus on logic, not markup

## Documentation Standards

### Code Comments
```javascript
// Use single-line comments for brief notes

/**
 * Use JSDoc for functions and classes
 * @param {string} userId - The user's ID
 * @returns {Promise<User>} The user object
 */

/*
 * Use block comments for longer explanations
 * that need multiple lines
 */
```

### README Files
Each major feature should have a README:
- Purpose and overview
- How to use
- API reference
- Examples

## Communication

### Daily Standups
- What I did yesterday
- What I'm doing today
- Any blockers

### Slack/Discord Channels
- `#general` - Team announcements
- `#development` - Technical discussions
- `#random` - Non-work chat
- `#help` - Ask for assistance

### Meeting Etiquette
- Be on time
- Come prepared
- Keep on topic
- Document decisions

## Definition of Done

A task is "done" when:
- [ ] Code is written and working
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Code review is approved
- [ ] Changes are merged to main
- [ ] Deployed to staging (if applicable)

## Performance Standards

### Page Load Goals
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse score: > 90

### Bundle Size Limits
- Initial JS: < 200KB (gzipped)
- Initial CSS: < 50KB (gzipped)
- Lazy-loaded chunks: < 50KB each

## Security Practices

### Never Do
- Commit secrets or API keys
- Use eval() or innerHTML with user input
- Disable ESLint security rules
- Store sensitive data in localStorage

### Always Do
- Validate all user inputs
- Use environment variables for secrets
- Keep dependencies updated
- Follow OWASP guidelines

## Accessibility Standards

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader friendly
- Color contrast ratios met
- Alt text for images

## Technology Decisions

### Preferred Libraries
- **State**: Pinia (not Vuex)
- **HTTP**: Native fetch or Axios
- **Dates**: date-fns or dayjs
- **Forms**: VeeValidate
- **Testing**: Vitest + Vue Test Utils

### Avoid
- jQuery or similar DOM libraries
- Moment.js (too large)
- Lodash (use native methods)
- Deprecated Vue 2 patterns

---

> 🤝 These conventions ensure we work efficiently as a team. Discuss any proposed changes in team meetings!