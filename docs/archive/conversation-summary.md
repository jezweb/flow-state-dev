# Claude + Jez: Web Dev Workflow Discussion Summary

## 📅 Discussion Date: January 2025

## 🎯 Main Topic: Optimizing Claude Code + Human Developer Workflow

### What We Discussed:
How to create standardized systems and templates that make it easier for Jez (human) and Claude Code (AI) to collaborate effectively on web development projects.

---

## 1. Starting Point: User Memory Enhancement

### Original user-memory.md
Jez shared his starter file that includes:
- Personal info (CEO of Jezweb, Newcastle Australia)
- Tech preferences (Vue 3 > React, Vuetify, Tailwind, Supabase)
- Work style (prototypes for handover, likes documentation)
- Claude interaction preferences (be proactive, use formatting)

### Key Addition Discussed:
Using GitHub issues for tracking human tasks and getting Claude Code to use context7 for checking current library versions when errors occur.

### Enhanced Version Added:
- Workflow commands (/compact, /issue, /milestone, /context7)
- GitHub workflow standards (labels, milestones, templates)
- Development standards (checklists, error handling)
- Communication style guidelines

---

## 2. Claude.md Files for Projects

### Purpose Identified:
Project-specific instructions that Claude Code reads to understand each project's unique requirements.

### Key Innovation:
Create different templates for different project types rather than starting from scratch each time.

### Templates Created:

#### Starter Template Includes:
- Project overview and current status
- Tech stack with specific versions
- Key patterns and conventions
- Common issues and solutions
- Development workflow
- Testing checklist

#### Specialized Templates (11 Total):
1. **WordPress Plugin** - PHP development with WordPress standards
2. **TypeScript MCP Server** - Model Context Protocol with SSE
3. **n8n Custom Node** - Workflow automation nodes
4. **React Native App** - Cross-platform mobile
5. **React Vite Web App** - Modern React with Vite
6. **AI Web App** - Vue + Supabase + Flowise (Jez's favorite stack)
7. **Chrome Extension** - Manifest V3 with Vue popup
8. **SaaS Application** - Multi-tenant with Supabase
9. **n8n Workflow Integration** - Automation platform
10. **Netlify Functions** - Serverless deployment
11. **AI Integration Project** - OpenAI/Claude integrations

### Generator Prompt Created:
A fill-in-the-blank prompt to generate custom claude.md files based on project specifics.

---

## 3. GitHub Issues as Project Management System

### The Revelation:
GitHub issues can track more than just bugs - they're perfect for:
- Human tasks (API keys, manual deployments)
- System documentation (gotchas, important notes)
- Architecture decisions
- Future ideas/roadmap

### Expanded Label System:

#### Development Tasks:
- bug, enhancement, frontend, backend, database
- priority: high/medium/low

#### Human Tasks (New):
- human-task 🙋
- research 🔍
- review 👀
- deploy 🚀
- config ⚙️

#### Documentation:
- system-note 📌
- gotcha ⚠️
- decision 🤔
- documentation 📝

#### Future Planning:
- future-enhancement 🔮
- tech-debt 🏗️
- idea 💡

### Issue Templates Designed:
- Human Task Template
- System Note Template
- Architecture Decision Record
- API Integration Template
- Deployment Checklist
- Performance Issue Template

---

## 4. Automation Tools Discussed

### Three Main Automation Categories:

#### 1. Label Setup Script
- Bash script to create all standard labels
- Consistent colors and descriptions
- Run once per repository

#### 2. GitHub Actions (4 workflows):
- **Auto-labeler**: Reads issue content, adds relevant labels
- **Human Task Dashboard**: Weekly summary of manual tasks
- **Stale Issue Manager**: Cleans up old issues
- **Dependency Tracker**: Tracks blocking relationships

#### 3. Additional Issue Templates:
- YAML templates with dropdowns and checkboxes
- Markdown templates for quick creation
- Specialized templates for security, deployment, etc.

---

## 5. Complete Project Standardization System

### The Vision:
"Claude Code Ready" projects where everything is standardized so AI and human work seamlessly together.

### Components Discussed:

#### Project Structure:
- Standardized folder organization
- Configuration files (VS Code, environment, git)
- Documentation templates

#### Development Tools:
- Environment file generator
- Migration system for database
- Error handling patterns
- Performance monitoring
- Testing infrastructure

#### Automation Scripts:
- Project initializer
- Component generator
- Deployment validator
- Health monitor

### Master Setup Concept:
```bash
claude-init my-app vue-supabase
# Creates everything in 30 seconds
```

---

## 6. The Practical Roadmap

### Jez's Concern:
"This is too much to get today... it's overwhelming"

### Solution: Phased Approach

#### Phase 1: Start Simple (Week 1)
1. Create GitHub labels file (15 min)
2. Basic claude.md template (30 min)
3. One issue template (20 min)

#### Phase 2: Build Habits (Week 2-4)
- Use the tools consistently
- Update templates based on experience
- Create "Human Tasks" bookmark

#### Phase 3: Add Automation (Month 2)
- Only automate actual pain points
- Start with one automation
- Build gradually

#### Phase 4: Standardize Stack (Month 3)
- Pick one pattern to standardize
- Document it
- Use consistently

#### Phase 5: Build Toolkit (Month 4-6)
- Create tools as needed
- Start with highest impact

---

## 🎯 Key Takeaways

### For Jez:
1. Start with just GitHub labels (15 minutes today)
2. Build habits before adding complexity
3. Every standardization saves future time
4. It's YOUR system - customize for your needs

### The Big Win:
Reducing friction between human and AI development by having clear, consistent patterns that both can follow.

### Success Metrics:
- Claude Code stops asking how to structure things
- Less time debugging the same issues
- Faster project starts
- More time building, less time configuring

---

## 💡 Future Discussion Topics

### Near Term:
1. Which Phase 1 items to implement first
2. Specific label colors and names
3. First project to test the system on

### Medium Term:
1. Which automations would save most time
2. How to handle client-specific variations
3. Integration with existing tools (Coolify, n8n)

### Long Term:
1. Building a CLI tool
2. Creating VS Code extension
3. Open-sourcing the system
4. AI-powered enhancements

---

## 📝 Action Items for Next Chat

1. **Share results** of Phase 1 implementation
2. **Identify pain points** that came up
3. **Decide** on first automation to add
4. **Discuss** any new ideas that emerged

---

## 🔗 Related Resources to Reference

1. Original user-memory.md file
2. Enhanced user memory (artifact)
3. Claude.md templates collection
4. Extended templates collection
5. GitHub automation options
6. Complete project setup system
7. Practical roadmap

---

## Quote to Remember:
"The goal is to make YOUR development life easier, one small improvement at a time!"