# GitHub Issues for GUI Project Discovery

## Epic: GUI Project Discovery System

**Title:** Epic: GUI Project Discovery System
**Labels:** epic, enhancement, gui
**Body:**

### Overview
Implement a comprehensive project discovery and management system in the Flow State Dev GUI to help users easily find and manage their existing projects.

### Features
- Automatic project scanning and discovery
- Project management interface with quick actions
- User preferences for project locations
- Integration with VS Code and other editors

### User Stories
1. As a developer, I want to see all my Flow State Dev projects in one place
2. As a developer, I want to quickly open projects in my editor
3. As a developer, I want to configure where the tool looks for projects
4. As a developer, I want to see project health status at a glance

### Acceptance Criteria
- [ ] Users can configure search directories for projects
- [ ] GUI automatically discovers Flow State Dev projects
- [ ] Projects display with relevant metadata (framework, last modified, etc.)
- [ ] Quick actions work (open in editor, run dev server, etc.)
- [ ] Settings persist between sessions

### Technical Approach
- Create ProjectScanner service for discovery
- Add new ProjectsView to the GUI
- Implement settings storage
- Add API endpoints for project operations

---

## Feature: Project Scanner Service

**Title:** Feature: Implement Project Scanner Service
**Labels:** feature, enhancement, gui
**Body:**

### Description
Create a service that scans configured directories to discover existing Flow State Dev projects.

### Requirements
- Scan common directories by default (~/claude/, ~/projects/, ~/dev/)
- Allow custom directory configuration
- Detect projects by:
  - CLAUDE.md file presence
  - package.json with flow-state-dev dependency
  - .fsd-project marker file
- Extract project metadata:
  - Project name
  - Framework/stack used
  - Last modified date
  - Git status (if applicable)
  - Health indicators

### Technical Details
```javascript
class ProjectScanner {
  async scanDirectories(paths: string[]): Promise<Project[]>
  async getProjectInfo(path: string): Promise<ProjectInfo>
  async refreshProject(path: string): Promise<ProjectInfo>
}
```

### Acceptance Criteria
- [ ] Scanner finds all Flow State Dev projects in configured paths
- [ ] Project detection is accurate (no false positives)
- [ ] Scanning is performant (< 2s for typical developer machine)
- [ ] Results are cached appropriately
- [ ] Handles filesystem errors gracefully

---

## Feature: Project Manager View

**Title:** Feature: Create Project Manager View
**Labels:** feature, enhancement, gui, ui
**Body:**

### Description
Implement a new view in the GUI for managing discovered projects.

### UI Requirements
- List/grid view toggle
- Project cards showing:
  - Project name and path
  - Framework/stack icons
  - Last modified date
  - Quick action buttons
- Search and filter functionality
- Sort options (name, date, type)

### Features
- Quick actions per project:
  - Open in VS Code
  - Open in default editor
  - Run dev server
  - Run tests
  - View documentation
  - Copy path
- Bulk operations:
  - Archive multiple projects
  - Export project list
  
### Acceptance Criteria
- [ ] View displays all discovered projects
- [ ] Search filters projects in real-time
- [ ] Quick actions execute correctly
- [ ] UI is responsive and performant
- [ ] Empty state guides new users

---

## Feature: User Settings Page

**Title:** Feature: Add User Settings Page
**Labels:** feature, enhancement, gui, ui
**Body:**

### Description
Create a settings page for users to configure GUI preferences and project discovery options.

### Settings Categories

#### Project Discovery
- Configure search directories
- Include/exclude patterns
- Scan frequency
- Auto-scan on startup

#### Editor Integration
- Default editor selection
- VS Code path
- Custom editor commands

#### GUI Preferences
- Theme (light/dark/auto)
- Default view (grid/list)
- Project card information density
- Notification preferences

#### Data Management
- Export settings
- Import settings
- Reset to defaults
- Clear cache

### Technical Requirements
- Settings stored in ~/.fsd/settings.json
- Real-time preference application
- Validation for paths and patterns
- Migration for setting schema changes

### Acceptance Criteria
- [ ] All settings are persistable
- [ ] Changes apply immediately
- [ ] Invalid inputs show helpful errors
- [ ] Settings can be exported/imported
- [ ] Defaults are sensible

---

## Feature: Project Quick Actions

**Title:** Feature: Implement Project Quick Actions
**Labels:** feature, enhancement, gui
**Body:**

### Description
Add quick action functionality to perform common operations on discovered projects.

### Actions to Implement

#### Editor Integration
- Open in VS Code: `code <project-path>`
- Open in system default editor
- Open specific file (README.md, CLAUDE.md)

#### Development Commands
- Start dev server (detect and run appropriate command)
- Run tests
- Run build
- Install dependencies

#### Git Operations
- Show git status
- Open in git GUI
- View recent commits

#### Project Info
- Show project health report
- View dependencies
- Check for updates

### Technical Details
- Actions use Flow State Dev API where possible
- Graceful fallback for missing commands
- Progress indication for long operations
- Error handling with recovery suggestions

### Acceptance Criteria
- [ ] All actions execute correctly
- [ ] Appropriate feedback during execution
- [ ] Errors are handled gracefully
- [ ] Actions are contextual (only show available ones)

---

## Task: Dark Mode Support

**Title:** Task: Add Dark Mode Support to GUI
**Labels:** task, enhancement, gui, ui
**Body:**

### Description
Implement dark mode theme support throughout the GUI application.

### Requirements
- Toggle in app bar
- System preference detection
- Smooth theme transitions
- Persist user preference

### Implementation
- Use Vuetify's built-in dark theme
- Add theme toggle component
- Store preference in localStorage
- Apply theme on app initialization

### Acceptance Criteria
- [ ] Dark mode toggle is accessible
- [ ] All components respect theme
- [ ] No contrast/readability issues
- [ ] Preference persists between sessions
- [ ] Follows system theme by default

---

## Task: Keyboard Shortcuts

**Title:** Task: Implement Keyboard Shortcuts
**Labels:** task, enhancement, gui, ux
**Body:**

### Description
Add keyboard shortcuts for common GUI operations to improve productivity.

### Shortcuts to Implement
- `Ctrl/Cmd + N` - New project
- `Ctrl/Cmd + O` - Open project finder
- `Ctrl/Cmd + ,` - Open settings
- `Ctrl/Cmd + K` - Quick command palette
- `/` - Focus search
- `Escape` - Close dialogs/cancel operations
- `Ctrl/Cmd + R` - Refresh project list
- `?` - Show keyboard shortcuts help

### Technical Requirements
- Global key handler
- Shortcut hints in UI
- Customizable shortcuts (future)
- Conflict detection
- OS-specific key combinations

### Acceptance Criteria
- [ ] All shortcuts work as expected
- [ ] Shortcuts are discoverable (tooltips/help)
- [ ] No conflicts with browser shortcuts
- [ ] Work across all views
- [ ] Help dialog shows all shortcuts