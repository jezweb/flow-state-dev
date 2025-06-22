# Web Application Project Planning Templates

## How to Use These Templates

1. **Start with PROJECT_BRIEF.md** - Fill this out with your initial idea
2. **Run through each template** in the order listed below
3. **Replace all placeholders** marked with `[PLACEHOLDER]` or in brackets
4. **Delete sections** that don't apply to your project
5. **Add custom sections** as needed for your specific requirements

---

# 1. PROJECT_BRIEF.md Template

```markdown
# [PROJECT_NAME] - Project Brief

## Project Vision
[1-2 sentences describing what this project is and why it exists]

## Problem Statement
[What problem does this solve? Who has this problem?]

## Target Users
- **Primary Users**: [Who will use this most?]
- **Secondary Users**: [Who else might use this?]
- **Admin Users**: [Who will manage the system?]

## Core Features (MVP)
1. [Feature 1 - most important]
2. [Feature 2]
3. [Feature 3]
4. [Feature 4]
5. [Feature 5]

## Future Features (Post-MVP)
- [Future feature 1]
- [Future feature 2]
- [Future feature 3]

## Technical Preferences
- **Frontend**: Vue 3 + Vuetify 3 (or specify alternatives)
- **Backend**: Supabase (or specify alternatives)
- **Additional Services**: [Any third-party services needed]
- **Deployment**: [Netlify/Vercel/Other]

## Constraints & Requirements
- **Budget**: [Any budget constraints]
- **Timeline**: [Any deadline requirements]
- **Scale**: [Expected number of users]
- **Security**: [Any special security needs]
- **Compliance**: [Any regulatory requirements]

## Success Metrics
- [How will you measure if this project is successful?]
- [What KPIs matter?]

## Inspiration & References
- [Links to similar products]
- [Screenshots or descriptions of features you like]
```

---

# 2. PROJECT_OVERVIEW.md Template

```markdown
# [PROJECT_NAME] - Project Overview

## Vision
[Expanded version of your project vision - 1 paragraph]

## Core Concept
- **Type**: [SaaS/Internal Tool/Public Platform/E-commerce/etc.]
- **Model**: [Single-tenant/Multi-tenant/Freemium/etc.]
- **Differentiator**: [What makes this unique?]

## Technology Stack
- **Frontend**: Vue 3 with [UI Library]
- **Backend Services**: Supabase ([list specific features: Database, Auth, Storage, Realtime])
- **Additional Services**: [Any third-party APIs or services]
- **Deployment**: [Platform] ([what it handles])

## Key Principles
1. **[Principle 1]**: [Explanation]
2. **[Principle 2]**: [Explanation]
3. **[Principle 3]**: [Explanation]
4. **[Principle 4]**: [Explanation]
5. **[Principle 5]**: [Explanation]

## User Types
- **[User Type 1]**: [Description and main goals]
- **[User Type 2]**: [Description and main goals]
- **[User Type 3]**: [Description and main goals]

## Value Proposition
- [Key value point 1]
- [Key value point 2]
- [Key value point 3]
- [Key value point 4]

## Revenue Model (if applicable)
- **Pricing Strategy**: [Free/Paid/Freemium/Subscription]
- **Monetization**: [How the project makes money]
```

---

# 3. USER_STORIES.md Template

```markdown
# [PROJECT_NAME] - User Stories

## [User Type 1] Stories

### [Feature Category 1]
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

### [Feature Category 2]
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

## [User Type 2] Stories

### [Feature Category]
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

## Common User Journeys

### [Journey Name 1] ([User Type])
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]
5. [Outcome]

### [Journey Name 2] ([User Type])
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Outcome]

## Edge Cases & Error Scenarios
- When [condition], the system should [behavior]
- If [error occurs], the user should [see/be able to do]
```

---

# 4. FEATURES_REQUIREMENTS.md Template

```markdown
# [PROJECT_NAME] - Feature Requirements

## Authentication & Authorization
**Powered by [Supabase Auth/Other]**

### Requirements
- [List authentication methods: email/password, OAuth providers, magic links, etc.]
- [Session management approach]
- [Password requirements and reset process]
- [Role types and permissions]

### Implementation Notes
- [Any specific authentication considerations]
- [Integration approach]

## [Core Feature 1 Name]

### Requirements
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

### User Interface
- [UI element 1]
- [UI element 2]

### Business Logic
- [Rule 1]
- [Rule 2]

### Implementation Notes
- [Technical consideration 1]
- [Technical consideration 2]

## [Core Feature 2 Name]

### Requirements
- [Requirement 1]
- [Requirement 2]

### User Interface
- [UI elements]

### Business Logic
- [Rules]

### Implementation Notes
- [Technical considerations]

## Security Requirements

### Data Protection
- [Encryption requirements]
- [Access control approach]
- [Sensitive data handling]

### Implementation Notes
- [Security framework/approach]

## Performance Requirements

### Response Times
- [Page load targets]
- [API response targets]
- [Real-time update targets]

### Scalability
- [Concurrent user targets]
- [Data volume expectations]
- [Growth considerations]

### Implementation Notes
- [Performance optimization strategies]

## Compliance & Legal (if applicable)
- [GDPR/CCPA requirements]
- [Industry-specific compliance]
- [Terms of service needs]
- [Privacy policy needs]
```

---

# 5. INTERFACE_DESIGN.md Template

```markdown
# [PROJECT_NAME] - Interface Design Requirements

## Design System
- **Framework**: [Vuetify 3/Other UI Library]
- **Theme**: [Modern/Classic/Minimal/Custom description]
- **Colors**: 
  - Primary: [Color name] ([Hex code])
  - Secondary: [Color name] ([Hex code])
  - Accent: [Color name] ([Hex code])
  - Success/Error/Warning: [Approach]
- **Typography**: [Font family choices]
- **Spacing**: [Spacing system approach]
- **Icons**: [Icon library choice]

## Application Layout

### Main Layout Structure
[ASCII diagram or description of overall layout]

### Navigation Structure
- **Type**: [Sidebar/Top nav/Bottom nav/Combination]
- **Behavior**: [Persistent/Collapsible/Hidden]
- **Contents**: [What goes in navigation]

## Page Layouts

### 1. [Page Name]
**Route**: `/[route]`

**Purpose**: [What this page does]

**Layout**:
[Description or ASCII diagram of page layout]

**Components**:
- [Component 1]: [Purpose]
- [Component 2]: [Purpose]

**User Actions**:
- [Action 1]
- [Action 2]

### 2. [Page Name]
**Route**: `/[route]`

[Continue pattern for all pages]

## Component Patterns

### Forms
- [Input style approach]
- [Validation display]
- [Submit button patterns]

### Cards
- [Card usage]
- [Card variations]

### Tables/Lists
- [When to use tables vs lists]
- [Sorting/filtering approach]
- [Pagination approach]

### Modals/Dialogs
- [When to use modals]
- [Modal patterns]

## Responsive Design

### Breakpoints
- Mobile: [breakpoint]
- Tablet: [breakpoint]
- Desktop: [breakpoint]

### Mobile Adaptations
- [How layouts change on mobile]
- [Touch-friendly considerations]

## Accessibility Requirements
- [WCAG level target]
- [Specific accessibility features]

## Loading & Error States
- **Loading**: [How loading is shown]
- **Empty States**: [How empty states look]
- **Error States**: [How errors are displayed]

## Branding Elements
- [Logo placement]
- [Brand voice in UI copy]
- [Custom illustrations/graphics needs]
```

---

# 6. TECHNICAL_ARCHITECTURE.md Template

```markdown
# [PROJECT_NAME] - Technical Architecture

## Architecture Principles
1. **[Principle 1]**: [Explanation]
2. **[Principle 2]**: [Explanation]
3. **[Principle 3]**: [Explanation]

## Technology Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **UI Library**: [Choice]
- **State Management**: [Pinia/Vuex/Other]
- **Router**: Vue Router 4
- **Build Tool**: Vite
- **Language**: [TypeScript/JavaScript]
- **Styling**: [Approach]

### Backend Services
- **Database**: [Supabase PostgreSQL/Other]
- **Authentication**: [Approach]
- **File Storage**: [Approach]
- **Real-time**: [If needed]
- **API**: [REST/GraphQL/Other]

### External Services
- **[Service 1]**: [Purpose]
- **[Service 2]**: [Purpose]

### Deployment
- **Hosting**: [Platform]
- **CDN**: [If applicable]
- **CI/CD**: [Approach]

## System Architecture Diagram
[ASCII diagram or description of system components]

## Data Flow Diagrams

### [Flow Name 1]
1. [Step 1]
2. [Step 2]
3. [Step 3]

### [Flow Name 2]
1. [Step 1]
2. [Step 2]

## Frontend Architecture

### Directory Structure
```
src/
├── assets/          # [Purpose]
├── components/      # [Organization approach]
├── composables/     # [What goes here]
├── layouts/         # [Layout approach]
├── plugins/         # [Plugin list]
├── router/          # [Routing approach]
├── services/        # [Service layer approach]
├── stores/          # [State management approach]
├── types/           # [TypeScript types/interfaces]
├── utils/           # [Utility functions]
└── views/           # [Page components]
```

### State Management Structure
- **[Store 1]**: [What it manages]
- **[Store 2]**: [What it manages]
- **[Store 3]**: [What it manages]

### Service Layer
- **[service1.ts]**: [What it handles]
- **[service2.ts]**: [What it handles]

## API Design

### Endpoints Structure (if custom API)
- `[GET/POST/PUT/DELETE] /api/[resource]` - [Purpose]

### Supabase Integration
- **Tables**: [List main tables]
- **RLS Strategy**: [Approach to row-level security]
- **Edge Functions**: [If needed, what they do]

## Security Architecture

### Authentication Flow
[Description of auth flow]

### Authorization Strategy
[How permissions are handled]

### Data Protection
- [Encryption approach]
- [Sensitive data handling]
- [API security]

## Performance Optimization

### Frontend
- [Optimization strategies]

### Backend
- [Database optimization]
- [Caching strategy]

### Assets
- [Image optimization]
- [Code splitting approach]

## Error Handling

### Frontend Errors
- [Error boundary approach]
- [User notification strategy]

### Backend Errors
- [Error logging]
- [Error recovery]

## Monitoring & Logging

### What to Monitor
- [Metric 1]
- [Metric 2]

### Logging Strategy
- [What gets logged]
- [Where logs go]

## Scalability Considerations
- [Horizontal scaling approach]
- [Database scaling]
- [Caching strategy]
```

---

# 7. DATA_MODEL.md Template

```markdown
# [PROJECT_NAME] - Data Model

## Overview
[Brief description of data model approach and principles]

## Core Tables

### 1. users / profiles
[Extended user information beyond auth]

```sql
[table_name]
├── id (uuid, PK)
├── [field_name] ([type], [constraints])
├── [field_name] ([type], [constraints])
├── created_at (timestamp)
└── updated_at (timestamp)
```

### 2. [table_name]
[Purpose of this table]

```sql
[table_name]
├── id (uuid, PK)
├── [field_name] ([type], [constraints])
├── [foreign_key] (uuid, FK -> [referenced_table.field])
├── created_at (timestamp)
└── updated_at (timestamp)
```

## Relationships

```
[ASCII diagram showing table relationships]

Example:
users (1) ────── (n) posts
  │                    │
  │                    │
  └──── (n) comments ──┘
```

## Enums / Types

```sql
-- Status types
CREATE TYPE [type_name] AS ENUM ('[value1]', '[value2]', '[value3]');
```

## Storage Structure (if using file storage)

```
buckets/
└── [bucket_name]/
    └── {user_id}/
        └── {resource_id}/
            └── {filename}
```

## RLS (Row Level Security) Policies

### [table_name]
- **SELECT**: [Who can read]
- **INSERT**: [Who can create]
- **UPDATE**: [Who can update]
- **DELETE**: [Who can delete]

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_[table]_[field] ON [table]([field]);
CREATE INDEX idx_[table]_[composite] ON [table]([field1], [field2]);
```

## Database Functions (if needed)

```sql
-- Example function
CREATE OR REPLACE FUNCTION [function_name]()
RETURNS [return_type] AS $$
BEGIN
  -- Function logic
END;
$$ LANGUAGE plpgsql;
```

## Data Retention Policies
- **[Data Type 1]**: [Retention period]
- **[Data Type 2]**: [Retention period]

## Backup Considerations
- [Backup frequency]
- [Backup retention]
- [Recovery approach]

## Migration Strategy
- [How database changes will be managed]
- [Migration tooling]
```

---

# 8. INTEGRATION_GUIDE.md Template

```markdown
# [PROJECT_NAME] - Integration Guide

## Overview
[Brief description of external services and integrations]

## Supabase Setup

### 1. Create Project
- [Specific steps or considerations]

### 2. Database Setup
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
[Other extensions]

-- Run migrations
[Migration approach]
```

### 3. Authentication Configuration
- **Providers**: [Which auth providers to enable]
- **Email Templates**: [What needs customization]
- **Settings**: [Specific settings needed]

### 4. Storage Setup
- **Buckets**: [List of buckets needed]
- **Policies**: [Access policies]
- **File Size Limits**: [Limits]

### 5. Row Level Security
- [RLS strategy and key policies]

### 6. Real-time Configuration (if needed)
- **Tables**: [Which tables need real-time]
- **Events**: [Which events to listen for]

## [External Service 1] Setup

### 1. Account Creation
[Steps]

### 2. Configuration
[What to configure]

### 3. API Keys
[How to get and secure API keys]

### 4. Integration Steps
[How to integrate with the app]

## Environment Variables

### Required Variables
```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# [Service 1]
VITE_[SERVICE]_API_KEY=
VITE_[SERVICE]_URL=

# App Config
VITE_APP_NAME=
VITE_APP_ENV=
```

### Development Setup
[How to set up local environment]

### Production Setup
[How to configure for production]

## API Integration Patterns

### Supabase Client
```typescript
// Example initialization
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)
```

### [Service] Integration
```typescript
// Example integration code
```

## Testing Integrations

### Supabase Connection Test
[How to verify Supabase is working]

### [Service] Connection Test
[How to verify service is working]

## Common Issues & Troubleshooting

### Issue: [Common issue 1]
**Solution**: [How to fix]

### Issue: [Common issue 2]
**Solution**: [How to fix]

## Security Best Practices
- [Security consideration 1]
- [Security consideration 2]
- [API key management]

## Performance Optimization
- [Optimization tip 1]
- [Optimization tip 2]
```

---

# 9. DEPLOYMENT_REQUIREMENTS.md Template

```markdown
# [PROJECT_NAME] - Deployment Requirements

## Deployment Platform: [Platform Name]

### Why [Platform]
- [Reason 1]
- [Reason 2]
- [Reason 3]

## Prerequisites

### 1. External Services
- **[Service 1]**: [What's needed]
- **[Service 2]**: [What's needed]

### 2. Domain & SSL
- [Domain requirements]
- [SSL approach]

### 3. Repository
- [Git setup requirements]

## Build Configuration

### Build Settings
```yaml
Build command: npm run build
Publish directory: dist
Node version: [version]
```

### Environment Variables Required
```bash
# List all production environment variables
[VARIABLE_NAME]=[description]
```

## Deployment Process

### Initial Setup
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Continuous Deployment
- [CD approach]
- [Branch strategy]

## Production Checklist

### Pre-Deployment
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Seed data loaded (if needed)
- [ ] Third-party services configured

### Security
- [ ] API keys secured
- [ ] CORS configured
- [ ] Security headers set
- [ ] SSL enabled

### Performance
- [ ] Build optimizations enabled
- [ ] Caching configured
- [ ] CDN enabled

### Testing
- [ ] All features tested
- [ ] Cross-browser testing done
- [ ] Mobile testing done
- [ ] Load testing completed

## Configuration Files

### [platform].config.js or .toml
```javascript
// Platform-specific configuration
```

### Headers & Redirects
```
# Redirect rules
# Security headers
```

## Post-Deployment Tasks

### 1. Verification
- [ ] [Check 1]
- [ ] [Check 2]

### 2. Monitoring Setup
- [ ] [Monitor 1]
- [ ] [Monitor 2]

### 3. Backup Verification
- [ ] [Backup check 1]
- [ ] [Backup check 2]

## Scaling Considerations

### Traffic Handling
- [How platform handles scale]
- [CDN configuration]

### Database Scaling
- [Database scaling approach]

### Cost Optimization
- [Cost considerations]
- [Optimization strategies]

## Maintenance

### Regular Tasks
- [Task 1]: [Frequency]
- [Task 2]: [Frequency]

### Update Process
1. [Step 1]
2. [Step 2]

### Rollback Process
1. [Step 1]
2. [Step 2]

## Monitoring & Alerts

### What to Monitor
- [Metric 1]
- [Metric 2]

### Alert Thresholds
- [Alert 1]: [Threshold]
- [Alert 2]: [Threshold]

## Disaster Recovery

### Backup Strategy
- [Backup approach]
- [Recovery time objective]

### Incident Response
1. [Step 1]
2. [Step 2]

## Documentation
- [ ] Deployment runbook created
- [ ] Environment variable documentation
- [ ] Troubleshooting guide
- [ ] Contact information for issues
```

---

# 10. README.md Template (for the requirements folder)

```markdown
# [PROJECT_NAME] - Requirements Documentation

## Overview
This folder contains the complete requirements documentation for [PROJECT_NAME], [brief description]. These documents provide everything needed to build the application from scratch.

## Quick Start

1. **Start with PROJECT_BRIEF.md** - Understand the core idea
2. **Read PROJECT_OVERVIEW.md** - Get the full vision
3. **Review USER_STORIES.md** - Understand user needs
4. **Study TECHNICAL_ARCHITECTURE.md** - Understand the system
5. **Follow INTEGRATION_GUIDE.md** - Set up services
6. **Implement from FEATURES_REQUIREMENTS.md** - Build features
7. **Design using INTERFACE_DESIGN.md** - Create the UI
8. **Deploy with DEPLOYMENT_REQUIREMENTS.md** - Go live

## Document Index

| Document | Purpose |
|----------|---------|
| PROJECT_BRIEF.md | Initial idea and constraints |
| PROJECT_OVERVIEW.md | Expanded vision and approach |
| USER_STORIES.md | User needs and journeys |
| FEATURES_REQUIREMENTS.md | Detailed feature specifications |
| INTERFACE_DESIGN.md | UI/UX requirements |
| TECHNICAL_ARCHITECTURE.md | System design and patterns |
| DATA_MODEL.md | Database schema and structure |
| INTEGRATION_GUIDE.md | External service setup |
| DEPLOYMENT_REQUIREMENTS.md | Production deployment guide |

## Key Decisions

### Technology Stack
- **Frontend**: [Stack]
- **Backend**: [Stack]
- **Deployment**: [Platform]

### Architecture Patterns
- [Pattern 1]
- [Pattern 2]

### Design Philosophy
- [Philosophy point 1]
- [Philosophy point 2]

## Getting Started

To build [PROJECT_NAME] from these requirements:

1. [Setup step 1]
2. [Setup step 2]
3. [Setup step 3]

## Contributing to Requirements

When updating requirements:
1. Keep documents in sync
2. Mark deprecated sections
3. Add date stamps for major changes
4. Keep examples concrete

## Questions?

If any requirement is unclear:
- Check related documents for context
- Consider the user's perspective
- Aim for the simplest solution
- Prioritize platform features over custom code
```

---

## Using These Templates

### For Your Next Project:

1. **Copy all templates** to a new folder
2. **Fill in PROJECT_BRIEF.md** first with your idea
3. **Work through each template**, replacing placeholders
4. **Delete sections** that don't apply
5. **Add project-specific sections** as needed
6. **Keep templates updated** as you learn what works

### Tips for Success:

- **Be specific** - Concrete examples are better than vague descriptions
- **Think in user terms** - Features should map to user needs
- **Leverage platforms** - Use Supabase/service features vs custom code
- **Start simple** - MVP first, then iterate
- **Keep it maintainable** - Update docs as project evolves

### Common Sections to Add:

- **Analytics Requirements** - If tracking user behavior
- **Notification System** - If sending emails/push notifications
- **Payment Integration** - If handling payments
- **Content Management** - If users create content
- **API Documentation** - If exposing an API
- **Mobile App Requirements** - If building mobile apps
- **Internationalization** - If supporting multiple languages
