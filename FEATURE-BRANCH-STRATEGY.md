# Feature Branch Strategy & PR Workflow

## Overview

This document outlines the branching strategy, pull request workflow, and development practices for the GUI Polish & Production Readiness epic. It ensures consistent development practices, code quality, and smooth collaboration.

## Branch Structure

### Main Branches
- **`main`** - Production-ready code, protected branch
- **`develop`** - Integration branch for features (if used)

### Feature Branches
```
feature/gui-polish-error-handling     # Feature 1: Error Handling & UX Polish
feature/gui-polish-performance        # Feature 2: Performance & Testing  
feature/gui-polish-real-api          # Feature 3: Real API Testing & Integration
```

### Task Branches (Optional)
```
task/error-boundaries                 # Task 1.1: Add Error Boundaries
task/loading-states                   # Task 1.2: Implement Loading States
task/form-validation                  # Task 1.3: Add Form Validation
task/success-feedback                 # Task 1.4: Success Feedback System
task/keyboard-navigation              # Task 1.5: Keyboard Navigation

task/code-splitting                   # Task 2.1: Code Splitting Implementation
task/api-caching                      # Task 2.2: API Caching Layer
task/unit-tests                       # Task 2.3: Component Unit Tests
task/e2e-tests                        # Task 2.4: E2E Test Suite
task/performance-monitoring           # Task 2.5: Performance Monitoring

task/real-api-testing                 # Task 3.1: Real API Mode Testing
task/cli-execution                    # Task 3.2: CLI Command Execution
task/sse-enhancement                  # Task 3.3: Server-Sent Events Enhancement
task/project-operations               # Task 3.4: Project Operations Integration
task/api-error-recovery               # Task 3.5: API Error Recovery
```

## Branching Workflow

### Feature Development
```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/gui-polish-error-handling

# Work on feature
# ... make changes ...

# Regular commits with conventional format
git add .
git commit -m "feat(ui): add error boundary component"

# Push feature branch
git push -u origin feature/gui-polish-error-handling
```

### Task Development (Optional)
```bash
# Create task branch from feature branch
git checkout feature/gui-polish-error-handling
git checkout -b task/error-boundaries

# Work on specific task
# ... make changes ...

# Commit and push
git add .
git commit -m "feat(error-handling): implement global error boundary"
git push -u origin task/error-boundaries

# Merge back to feature branch via PR
# ... create PR: task/error-boundaries → feature/gui-polish-error-handling
```

## Commit Message Convention

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (white-space, formatting)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process or auxiliary tools

### Scopes (for this epic)
- **ui**: User interface components
- **api**: API integration and services
- **performance**: Performance optimizations
- **testing**: Test-related changes
- **error-handling**: Error boundaries and handling
- **validation**: Form and input validation
- **accessibility**: Accessibility improvements

### Examples
```bash
git commit -m "feat(ui): add loading skeleton components"
git commit -m "feat(error-handling): implement component error boundaries"
git commit -m "test(ui): add unit tests for CreateProject component"
git commit -m "perf(api): implement response caching layer"
git commit -m "fix(accessibility): improve keyboard navigation"
```

## Pull Request Workflow

### PR Creation Process

#### 1. Draft PR (Early Feedback)
```bash
# Push work-in-progress
git push origin feature/gui-polish-error-handling

# Create draft PR for early feedback
gh pr create --draft \
  --title "[WIP] Feature 1: Error Handling & UX Polish" \
  --body "Early implementation for feedback. See #XXX for details."
```

#### 2. Ready for Review PR
```bash
# Mark as ready for review
gh pr ready

# Update PR title and description
gh pr edit --title "[FEATURE] Error Handling & UX Polish" \
  --body "$(cat .github/pull_request_template.md)"
```

### PR Template
```markdown
## Summary
Brief description of changes and motivation.

## Related Issues
- Closes #XXX (Feature issue)
- Addresses #XXX, #XXX, #XXX (Task issues)

## Changes Made
- [ ] Error boundaries implemented
- [ ] Loading states added
- [ ] Form validation enhanced
- [ ] Success feedback system
- [ ] Keyboard navigation improved

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests passing
- [ ] Manual testing completed
- [ ] Accessibility testing done

## Performance Impact
- [ ] Bundle size impact assessed
- [ ] Performance benchmarks run
- [ ] No regressions identified

## Screenshots/Demo
(If applicable, add screenshots or demo links)

## Checklist
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No lint/type errors
- [ ] PR title follows conventional format
```

### Review Requirements

#### Automatic Checks (CI)
- [ ] Unit tests passing
- [ ] E2E tests passing  
- [ ] Linting and type checking
- [ ] Build succeeds
- [ ] Performance budgets met
- [ ] Security scans passed

#### Manual Review Requirements
- [ ] **Code Review**: Technical implementation review
- [ ] **UX Review**: User experience and design review (for UI changes)
- [ ] **Accessibility Review**: WCAG compliance check (for UI changes)
- [ ] **Performance Review**: Impact assessment (for performance changes)

### Review Assignments
- **Primary Reviewer**: Technical lead or senior developer
- **UX Reviewer**: Designer or UX specialist (for UI changes)
- **Accessibility Reviewer**: Accessibility expert (for UI changes)
- **Performance Reviewer**: Performance specialist (for perf changes)

## Merge Strategy

### Merge Requirements
- [ ] All CI checks passing
- [ ] Required reviews approved
- [ ] No merge conflicts
- [ ] Feature fully complete
- [ ] Documentation updated

### Merge Method
**Squash and Merge** - Preferred for feature branches
- Creates clean history
- Preserves feature branch work in squash commit
- Easier to revert if needed

```bash
# Example squash commit message
feat(ui): implement error handling and UX polish

- Add global and component error boundaries
- Implement loading states and skeleton screens  
- Add form validation with real-time feedback
- Create success notification system
- Improve keyboard navigation and accessibility

Closes #XXX (Feature 1: Error Handling & UX Polish)
```

## Branch Management

### Branch Lifecycle
1. **Create** feature branch from main
2. **Develop** with regular commits
3. **Push** for backup and collaboration
4. **PR** when ready for review
5. **Review** and iterate based on feedback
6. **Merge** when approved and complete
7. **Delete** feature branch after merge

### Branch Protection Rules
- **main** branch protection:
  - Require PR reviews (minimum 1)
  - Require status checks to pass
  - Require branches to be up to date
  - Restrict pushes to main
  - Include administrators in restrictions

### Cleanup Process
```bash
# After successful merge, clean up branches
git checkout main
git pull origin main
git branch -d feature/gui-polish-error-handling
git push origin --delete feature/gui-polish-error-handling
```

## Development Workflow

### Feature Development Process
1. **Start**: Create feature branch and draft PR
2. **Develop**: Implement tasks with regular commits
3. **Test**: Add tests and ensure quality
4. **Review**: Request early feedback via draft PR
5. **Iterate**: Address feedback and continue development
6. **Complete**: Mark PR ready for final review
7. **Merge**: Squash and merge when approved

### Multi-Feature Coordination
- Features can be developed in parallel
- Regular rebasing against main to stay current
- Cross-feature dependencies managed through issues
- Integration testing before final merges

## Quality Gates

### Before Merge
- [ ] All acceptance criteria met
- [ ] Test coverage maintained/improved
- [ ] Performance benchmarks met
- [ ] Accessibility standards met
- [ ] Security review passed
- [ ] Documentation updated

### After Merge
- [ ] Feature deployed and tested
- [ ] Metrics monitored for regressions
- [ ] User feedback collected
- [ ] Issues updated and closed
- [ ] Sprint progress updated

## Tools & Automation

### GitHub CLI Commands
```bash
# Create feature branch and PR
gh repo fork
gh pr create --draft --title "WIP: Feature Name"

# View PR status
gh pr status
gh pr checks

# Merge when ready
gh pr merge --squash
```

### VS Code Integration
```json
{
  "git.branchPrefix": "feature/gui-polish-",
  "git.defaultCloneDirectory": "./flow-state-dev",
  "conventionalCommits.scopes": [
    "ui", "api", "performance", "testing", 
    "error-handling", "validation", "accessibility"
  ]
}
```

### Git Hooks (Optional)
```bash
#!/bin/sh
# .git/hooks/pre-commit
npm run lint
npm run test:quick
npm run typecheck
```

## Success Metrics

### Development Velocity
- Average time from branch creation to merge
- Number of review iterations required
- CI pipeline success rate
- Code review turnaround time

### Code Quality
- Test coverage maintenance/improvement
- Bug detection rate in review
- Performance regression prevention
- Accessibility compliance rate

### Collaboration Effectiveness
- Review participation rate
- Knowledge sharing through reviews
- Cross-team collaboration success
- Documentation quality improvement

This branching strategy ensures high-quality code delivery while maintaining development velocity and team collaboration effectiveness.