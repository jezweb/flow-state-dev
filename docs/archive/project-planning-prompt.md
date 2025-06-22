# Project Planning Generation Prompt Template

## Instructions
Copy this template, fill in all the sections with your project details, then provide it along with the planning templates file to generate complete project documentation.

---

# Generate Project Planning Documentation

I need you to create a complete set of project planning documents using the provided templates. Here are the project details:

## Basic Information

**Project Name**: [Your project name]

**Project Type**: [Choose one: SaaS / Internal Tool / Public Platform / E-commerce / Social Platform / API Service / Other: specify]

**Deployment Model**: [Choose one: Single-tenant / Multi-tenant / Standalone / Other: specify]

**Target Audience**: [B2B / B2C / Internal / Mixed]

## Project Description

**One-line Description**: [What is this project in one sentence?]

**Problem Statement**: [What specific problem does this solve? Be detailed about the pain points]

**Vision Statement**: [What's the long-term vision for this project? Where do you see it in 2-3 years?]

## Users & Stakeholders

**User Types**: [List each type of user and their primary goals]
1. **[User Type 1]**: [Description] - Main goals: [what they want to achieve]
2. **[User Type 2]**: [Description] - Main goals: [what they want to achieve]
3. **[User Type 3]**: [Description] - Main goals: [what they want to achieve]

**Admin Capabilities Needed**: [What should admins be able to do?]

## Core Features (MVP)

List features in priority order with brief descriptions:

1. **[Feature Name]**: [Description of what it does and why it's essential]
2. **[Feature Name]**: [Description of what it does and why it's essential]
3. **[Feature Name]**: [Description of what it does and why it's essential]
4. **[Feature Name]**: [Description of what it does and why it's essential]
5. **[Feature Name]**: [Description of what it does and why it's essential]

## Detailed Feature Requirements

For each core feature, provide:

### [Feature 1 Name]
- **User Story**: As a [user type], I want to [action] so that [benefit]
- **Acceptance Criteria**: 
  - [Specific criterion 1]
  - [Specific criterion 2]
- **UI Elements Needed**: [List UI components]
- **Business Rules**: [Any specific rules or constraints]

### [Feature 2 Name]
[Repeat structure for each core feature]

## Technical Specifications

**Frontend Framework**: [Vue 3 / Other - specify version]

**UI Library**: [Vuetify 3 / Quasar / Element Plus / Other]

**Backend Service**: [Supabase / Firebase / Custom API / Other]

**Additional Services Needed**:
- [Service 1]: [What it's for]
- [Service 2]: [What it's for]

**Real-time Features**: [Do you need real-time updates? For what?]

**File Storage Needs**: [What types of files? Size limits?]

**Authentication Requirements**: 
- Methods: [Email/Password / OAuth / Magic Link / Other]
- OAuth Providers: [Google / GitHub / Other]

## Design & User Experience

**Design Style**: [Modern Minimal / Corporate / Playful / Dark Theme / Other: describe]

**Brand Colors** (if established):
- Primary: [Color/Hex]
- Secondary: [Color/Hex]
- Accent: [Color/Hex]

**Key Pages/Screens** (list all main pages):
1. [Page name] - [Purpose]
2. [Page name] - [Purpose]
3. [Page name] - [Purpose]

**Mobile Responsiveness**: [Critical / Important / Nice-to-have]

**Accessibility Requirements**: [WCAG AA / Basic / Specific needs]

## Data & Relationships

**Main Data Entities** (things you're storing):
1. **[Entity]**: [Description] - Key fields: [field1, field2]
2. **[Entity]**: [Description] - Key fields: [field1, field2]
3. **[Entity]**: [Description] - Key fields: [field1, field2]

**Key Relationships**:
- [Entity1] has many [Entity2]
- [Entity1] belongs to [Entity2]
- [Other relationships]

**Data Privacy Needs**: [What data is sensitive? Any compliance requirements?]

## Business Logic & Rules

**Key Business Rules**:
1. [Rule 1: e.g., "Users can only edit their own content"]
2. [Rule 2: e.g., "Posts must be approved before publishing"]
3. [Rule 3]

**Permissions/Roles**:
- [Role 1]: Can [permissions]
- [Role 2]: Can [permissions]

**Limits/Quotas**: [Any usage limits, rate limits, storage quotas?]

## Integrations

**External APIs Needed**:
- [API Name]: [Purpose] - [Specific features needed]
- [API Name]: [Purpose] - [Specific features needed]

**Webhook Requirements**: [Any incoming/outgoing webhooks?]

**Import/Export Needs**: [Data formats, import sources]

## Scale & Performance

**Expected User Base**: 
- Launch: [number] users
- 6 months: [number] users
- 1 year: [number] users

**Performance Requirements**:
- Page load time: [target]
- API response time: [target]
- Concurrent users: [expected number]

**Data Volume Expectations**: [How much data will accumulate?]

## Deployment & Operations

**Deployment Platform**: [Netlify / Vercel / AWS / Other]

**Environments Needed**: [Development / Staging / Production]

**Monitoring Requirements**: [What needs to be monitored?]

**Backup Requirements**: [Frequency, retention period]

## Constraints & Considerations

**Budget Constraints**: [Any budget limits for services/hosting?]

**Timeline**: [When does this need to launch? Any phases?]

**Technical Constraints**: [Browser support? Device requirements?]

**Legal/Compliance**: [GDPR / HIPAA / Other requirements?]

**Geographic Restrictions**: [Where will users be located?]

## Success Metrics

**How will you measure success?**:
- [Metric 1: e.g., "100 active users in first month"]
- [Metric 2: e.g., "< 2 second page load times"]
- [Metric 3: e.g., "95% uptime"]

## Future Vision (Post-MVP)

**Planned Features**:
1. [Feature] - [Why it's important]
2. [Feature] - [Why it's important]
3. [Feature] - [Why it's important]

**Potential Expansions**: [Mobile app? API? Integrations?]

## References & Inspiration

**Similar Products**: [List products that do something similar]

**What You Like About Them**: [Specific features or approaches]

**What You'd Do Differently**: [Your improvements]

**Screenshots/Links**: [Any visual references?]

## Additional Context

[Any other important information about the project, special requirements, or context that would help in creating the planning documents]

---

## Questions to Answer Before Generation

If any of these are unclear, please ask before proceeding:

1. **Business Model**: How will this project sustain itself? (Revenue model, funding, internal budget)
2. **User Acquisition**: How will users find and start using this?
3. **Differentiation**: What makes this different from existing solutions?
4. **Risk Factors**: What could prevent this project's success?
5. **Dependencies**: Are there any external factors this project depends on?

---

**Note**: Please generate all 9 planning documents (PROJECT_OVERVIEW, USER_STORIES, FEATURES_REQUIREMENTS, INTERFACE_DESIGN, TECHNICAL_ARCHITECTURE, DATA_MODEL, INTEGRATION_GUIDE, DEPLOYMENT_REQUIREMENTS, and README) based on this information. If any critical information is missing or unclear, please ask for clarification before proceeding.