# Project Glossary

This glossary defines domain-specific terms, abbreviations, and concepts used throughout the project. Understanding these terms helps AI assistants provide more accurate and contextual assistance.

## Business Terms

### Core Concepts
- **User**: A registered person using the application
- **Profile**: Extended user information beyond authentication
- **Organization**: A group of users working together (if applicable)
- **Project**: The main entity users create and manage
- **Workspace**: A collection of related projects

### User Roles
- **Admin**: Full system access, can manage all aspects
- **Manager**: Can manage team and content within their scope
- **Member**: Regular user with standard permissions
- **Guest**: Limited access, typically read-only

### Status Terms
- **Active**: Currently in use or enabled
- **Inactive**: Disabled but not deleted
- **Archived**: Retained for history but not in active use
- **Deleted**: Soft-deleted, retained for recovery period

## Technical Terms

### Architecture
- **SPA**: Single Page Application - our Vue frontend
- **BaaS**: Backend as a Service - what Supabase provides
- **RLS**: Row Level Security - Supabase's authorization system
- **JWT**: JSON Web Token - used for authentication

### Vue Specific
- **SFC**: Single File Component (.vue files)
- **Composable**: Reusable function using Composition API
- **Store**: Pinia state management module
- **Router**: Vue Router for navigation

### Supabase Specific
- **Anon Key**: Public API key for Supabase
- **Service Role**: Admin key (never use in frontend!)
- **Edge Functions**: Serverless functions in Supabase
- **Realtime**: WebSocket-based live updates

### Development
- **HMR**: Hot Module Replacement - instant updates during dev
- **SSG**: Static Site Generation (if applicable)
- **SSR**: Server Side Rendering (if applicable)
- **PWA**: Progressive Web App (if applicable)

## Project-Specific Terms

### Features
- **[Feature Name]**: Description of what it does
- **[Another Feature]**: Its purpose and function

### Data Models
- **[Model Name]**: What it represents
  - Key fields and their purposes
  - Relationships to other models

### Business Logic
- **[Process Name]**: Description of the business process
  - When it occurs
  - What it affects

## Abbreviations

### Common
- **CRUD**: Create, Read, Update, Delete
- **API**: Application Programming Interface
- **UI/UX**: User Interface/User Experience
- **DB**: Database
- **ENV**: Environment (as in .env file)

### Project-Specific
- **[ABC]**: What ABC stands for in our context
- **[XYZ]**: What XYZ means in this project

## Code Conventions

### Naming Patterns
- **`use[Feature]`**: Composable for feature (e.g., useAuth)
- **`[Feature]Service`**: Service module (e.g., userService)
- **`[Feature]Store`**: Pinia store (e.g., userStore)
- **`[Feature]View`**: Page component (e.g., DashboardView)

### File Suffixes
- `.spec.js`: Unit test files
- `.e2e.js`: End-to-end test files
- `.d.ts`: TypeScript declaration files
- `.stories.js`: Storybook component stories

## API Terminology

### HTTP Methods
- **GET**: Retrieve data
- **POST**: Create new resource
- **PUT**: Update entire resource
- **PATCH**: Update part of resource
- **DELETE**: Remove resource

### Response Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Server Error

## Workflow Terms

### Development
- **Feature Branch**: Branch for new feature development
- **Hotfix**: Urgent fix for production
- **PR/MR**: Pull Request / Merge Request
- **CI/CD**: Continuous Integration/Deployment

### Testing
- **Unit Test**: Tests individual components/functions
- **Integration Test**: Tests component interactions
- **E2E Test**: End-to-end user flow tests
- **Smoke Test**: Basic functionality verification

## External Services

### Integrations
- **[Service Name]**: What we use it for
  - Key features we utilize
  - Important limitations

### Third-Party Terms
- Terms specific to integrated services
- Their specific vocabulary we use

---

> 📚 This glossary helps maintain consistent terminology throughout the project. Update it when new terms are introduced!