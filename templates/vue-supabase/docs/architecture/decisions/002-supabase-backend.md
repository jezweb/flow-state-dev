# ADR-002: Use Supabase for Backend Services

## Status

Accepted

## Context

We need a backend solution that provides:
- Database with real-time capabilities
- Authentication and authorization
- File storage
- API generation
- Scalability without managing infrastructure
- Cost-effective for small to medium projects
- Good developer experience

## Decision

We will use Supabase as our Backend-as-a-Service (BaaS) provider, which gives us PostgreSQL database, authentication, storage, and real-time subscriptions.

## Alternatives Considered

### Option 1: Firebase
- **Pros:**
  - Mature platform with Google backing
  - Excellent real-time capabilities
  - Good client SDKs
  - Integrated with Google Cloud
- **Cons:**
  - NoSQL only (Firestore)
  - Vendor lock-in concerns
  - Limited query capabilities
  - Can get expensive at scale

### Option 2: Supabase (Chosen)
- **Pros:**
  - PostgreSQL - full SQL database
  - Open source and self-hostable
  - Built-in auth with multiple providers
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Generous free tier
  - Auto-generated APIs
- **Cons:**
  - Younger platform
  - Smaller community
  - Fewer regions available
  - Some features still in beta

### Option 3: Custom Backend (Node.js + PostgreSQL)
- **Pros:**
  - Full control over implementation
  - No vendor lock-in
  - Can optimize for specific needs
  - Choose your own stack
- **Cons:**
  - Significant development time
  - Need to handle infrastructure
  - Security is our responsibility
  - More complexity to manage

### Option 4: AWS Amplify
- **Pros:**
  - Comprehensive AWS integration
  - GraphQL and REST APIs
  - Multiple database options
  - Serverless architecture
- **Cons:**
  - Complex pricing model
  - Steeper learning curve
  - AWS vendor lock-in
  - Can be overkill for smaller projects

## Consequences

### Positive
- Get full PostgreSQL power with SQL queries
- Authentication handled out of the box
- RLS provides fine-grained security
- Can self-host if needed (no lock-in)
- Real-time subscriptions work well
- Storage API for file uploads
- Good local development experience

### Negative
- Need to learn PostgreSQL if not familiar
- RLS policies can be complex
- Self-hosting requires significant effort
- Some advanced features require direct SQL
- Fewer tutorials compared to Firebase

### Neutral
- Database migrations need to be managed
- Need to design schema carefully
- Real-time features require subscription management
- Edge Functions for custom logic (similar to serverless)

## Implementation

1. Use Supabase JavaScript client library
2. Implement Row Level Security policies for all tables
3. Use Supabase Auth for all authentication
4. Store files in Supabase Storage
5. Use real-time subscriptions sparingly for performance
6. Create database migrations for schema changes
7. Use Edge Functions for complex business logic

## References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase vs Firebase Comparison](https://supabase.com/alternatives/supabase-vs-firebase)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Date**: 2024-01-10  
**Author**: Flow State Dev Team  
**Reviewers**: Backend Lead, Security Team