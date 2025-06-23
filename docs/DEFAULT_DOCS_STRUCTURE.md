# Default Documentation Structure

Flow State Dev now includes a comprehensive documentation structure in every new project. This helps teams maintain good documentation practices and provides excellent context for AI assistants.

## What's Included

### 📁 docs/ Folder
A complete documentation structure with:
- **context/** - Essential project information for humans and AI
- **guides/** - How-to documentation for developers
- **api/** - API documentation templates
- **architecture/** - Technical decisions and ADRs
- **team/** - Team processes and conventions
- **features/** - Feature-specific documentation

### 🤖 .claude/ Folder  
AI-specific context files that help Claude and other AI assistants:
- **personality.md** - How AI should interact with your team
- **code-style.md** - Project-specific coding preferences
- **avoid.md** - Anti-patterns to avoid
- **project-glossary.md** - Domain-specific terms
- **current-focus.md** - What's being worked on

## Key Features

### For Developers
- Clear onboarding with getting-started guide
- Development practices documented
- Architecture decisions recorded
- Team conventions established

### For AI Assistants
- Immediate project understanding
- Coding style preferences clear
- Business context provided
- Current priorities visible

### For Project Management
- Technical debt tracked
- User personas defined
- Business rules documented
- Progress tracking built-in

## Usage

When you create a new Flow State Dev project:

```bash
fsd init my-project
```

You automatically get:
1. Complete documentation structure
2. Pre-filled templates with guidance
3. AI context files ready to customize
4. Best practices built-in

## Customization

After project creation:
1. Update `docs/context/project-overview.md` with your project details
2. Customize `.claude/personality.md` for your team's style
3. Fill in business rules and user personas
4. Keep `current-focus.md` updated each sprint

## Benefits

- **Better AI Assistance**: Claude understands your project immediately
- **Faster Onboarding**: New developers get up to speed quickly  
- **Knowledge Preservation**: Decisions and context are documented
- **Consistent Standards**: Team conventions are clear
- **Living Documentation**: Templates encourage regular updates

## Example Files Created

```
my-project/
├── docs/
│   ├── README.md                    # Documentation hub
│   ├── context/
│   │   ├── project-overview.md      # What your project does
│   │   ├── architecture.md          # How it's built
│   │   ├── business-rules.md        # Core logic
│   │   ├── user-personas.md         # Who uses it
│   │   └── technical-debt.md        # What needs fixing
│   ├── guides/
│   │   ├── getting-started.md       # Quick start guide
│   │   └── development.md           # Dev practices
│   └── architecture/
│       └── decisions/
│           └── 000-adr-template.md  # Decision template
└── .claude/
    ├── README.md                    # AI context guide
    ├── personality.md               # Interaction style
    ├── code-style.md               # Coding preferences
    ├── avoid.md                    # What not to do
    ├── project-glossary.md         # Terms defined
    └── current-focus.md            # Active work

```

## Related Issue
See [#56](https://github.com/jezweb/flow-state-dev/issues/56) for the implementation details.

---

This documentation structure is now part of every Flow State Dev project, ensuring teams start with best practices from day one!