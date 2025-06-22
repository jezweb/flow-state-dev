# Expanded GitHub Issues Workflow

## Issue Categories & Labels

### 1. Development Tasks (What you have now)
- `enhancement` - New features
- `bug` - Something broken
- `frontend` / `backend` / `database` - Component areas
- `priority: high/medium/low` - Urgency levels

### 2. Human Tasks (New!)
- `human-task` 🙋 - Requires human intervention
- `research` 🔍 - Need to research/decide something
- `review` 👀 - Needs human review/approval
- `deploy` 🚀 - Manual deployment steps
- `config` ⚙️ - Environment/service configuration

### 3. Documentation & Notes
- `documentation` 📝 - Update docs
- `system-note` 📌 - Important info about the system
- `decision` 🤔 - Architecture/design decisions
- `gotcha` ⚠️ - Tricky things to remember

### 4. Future/Backlog
- `future-enhancement` 🔮 - Nice to have later
- `v2` / `v3` - Version planning
- `idea` 💡 - Potential features
- `tech-debt` 🏗️ - Refactoring needs

### 5. External Dependencies
- `waiting-external` ⏳ - Blocked by external factor
- `api-keys` 🔑 - Need credentials/access
- `third-party` 🤝 - Depends on external service

## Issue Templates

### Human Task Template
```markdown
## Human Action Required 🙋

**What needs to be done:**
[Clear description of the human task]

**Why it can't be automated:**
[Reason - needs API key, business decision, manual review, etc.]

**When it needs to be done:**
- [ ] Before testing
- [ ] Before deployment
- [ ] Can be done anytime

**Instructions:**
1. Step one
2. Step two

**Resources needed:**
- Link to relevant docs
- Access requirements

**Blocking:** #[issue numbers this blocks]
```

### System Note Template
```markdown
## System Note 📌

**Component:** [What part of the system]

**Important Information:**
[Key details about how this works]

**Why this matters:**
[Context for future developers]

**Common issues:**
- Issue 1 and solution
- Issue 2 and solution

**Related code:**
- `path/to/file.js` - Description

**Last verified:** [Date]
```

### Decision Record Template
```markdown
## Architecture Decision Record 🤔

**Date:** [YYYY-MM-DD]
**Status:** Accepted/Superseded/Deprecated

**Context:**
[What prompted this decision]

**Decision:**
[What we decided to do]

**Alternatives considered:**
1. Option A - Pros/cons
2. Option B - Pros/cons

**Consequences:**
- Positive: 
- Negative:
- Neutral:

**References:**
- Links to relevant discussions
```

## Workflow Examples

### Example 1: API Integration
```markdown
Title: Configure Stripe API for production
Labels: human-task, config, priority: high

## Human Action Required 🙋

**What needs to be done:**
Add Stripe production API keys to environment

**Why it can't be automated:**
Requires access to Stripe dashboard and secure handling of keys

**Instructions:**
1. Log into Stripe dashboard
2. Copy production keys (not test keys!)
3. Add to Netlify environment variables:
   - STRIPE_PUBLIC_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
4. Test webhook endpoint at /api/stripe/webhook

**Blocking:** #5 (Payment system implementation)
```

### Example 2: System Gotcha
```markdown
Title: IMPORTANT: Supabase RLS policies on new tables
Labels: system-note, gotcha, database

## System Note 📌

**Component:** Database / Supabase

**Important Information:**
Every new table MUST have Row Level Security (RLS) enabled and policies configured. Forgetting this will make data publicly accessible!

**Common issues:**
- New table created but no RLS = security risk
- Solution: Always run these after creating table:
  ```sql
  ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users can only see their own data" ON new_table
    FOR ALL USING (auth.uid() = user_id);
  ```

**Related code:**
- `supabase/migrations/` - All table definitions
- `docs/database-security.md` - RLS guide
```

### Example 3: Future Enhancement
```markdown
Title: Add AI-powered job description generator
Labels: future-enhancement, ai, v2

## Future Feature Idea 💡

**Description:**
Use AI to generate job descriptions based on:
- Job title
- Required skills
- Company culture

**Why valuable:**
- Saves time for users
- Ensures consistent quality
- Could be premium feature

**Technical approach:**
- Integrate with Claude/OpenAI API
- Create templates for different industries
- Store generated descriptions for learning

**Dependencies:**
- Need AI API budget approval
- Requires content moderation system

**Estimated effort:** 2-3 days
```

## GitHub Project Board Views

### 1. Development Board (Current)
- Todo → In Progress → Review → Done

### 2. Human Tasks Board
- Needs Action → In Progress → Completed
- Filtered by `human-task` label

### 3. System Knowledge Base
- Pinned issues with `system-note`, `gotcha`, `decision`
- Sorted by component

### 4. Roadmap Board
- Now → Next → Later → Someday
- Mix of enhancements and ideas

## Automation Rules

### GitHub Actions for Human Tasks
```yaml
name: Human Task Reminder

on:
  schedule:
    - cron: '0 9 * * 1' # Monday 9am
  
jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v6
        with:
          script: |
            const issues = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: 'human-task',
              state: 'open'
            });
            
            if (issues.data.length > 0) {
              const list = issues.data.map(i => `- #${i.number}: ${i.title}`).join('\n');
              
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title: `Weekly Reminder: ${issues.data.length} human tasks pending`,
                body: `## Human Tasks Requiring Attention\n\n${list}`,
                labels: ['reminder']
              });
            }
```

## Issue Queries for Quick Access

### Bookmarkable Searches
```
# All human tasks
is:open label:human-task sort:priority

# System documentation
label:system-note,gotcha,decision

# Blocked by external
is:open label:waiting-external

# This week's priorities
is:open label:priority:high created:>2024-01-15

# Future roadmap
label:future-enhancement,v2,idea
```

## Benefits of This Approach

1. **Single Source of Truth** - Everything is in GitHub
2. **Searchable History** - Find that gotcha from 6 months ago
3. **Team Collaboration** - Everyone sees what needs human action
4. **Progress Tracking** - Know what's blocking automation
5. **Knowledge Retention** - System quirks documented where they matter

## Claude.md Addition

Add this to your claude.md:

```markdown
## Issue Management

### Creating Issues
When you encounter:
1. **Need human action** → Create issue with `human-task` label
2. **System quirk/gotcha** → Create issue with `system-note` label  
3. **Future idea** → Create issue with `future-enhancement` label
4. **Architecture decision** → Create issue with `decision` label

### Issue References
Always reference related issues in commits:
- "Implements #1" - Closes issue
- "Partial work on #2" - References issue
- "Blocked by #3" - Documents dependency
```