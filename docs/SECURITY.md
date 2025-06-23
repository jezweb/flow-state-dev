# Flow State Dev Security Guide

> Comprehensive security documentation for Flow State Dev projects

## Table of Contents

- [Overview](#overview)
- [Built-in Security Features](#built-in-security-features)
- [Environment Configuration](#environment-configuration)
- [Authentication & Authorization](#authentication--authorization)
- [Database Security](#database-security)
- [API Security](#api-security)
- [Frontend Security](#frontend-security)
- [Development Security](#development-security)
- [Deployment Security](#deployment-security)
- [Security Checklist](#security-checklist)
- [Incident Response](#incident-response)
- [Security Tools](#security-tools)
- [Resources](#resources)

## Overview

Flow State Dev prioritizes security from the ground up. Every project created with FSD includes:

- 🔒 **Automatic repository detection** - Adapts security based on public/private status
- 🛡️ **Secret protection** - Pre-commit hooks prevent credential exposure
- 📋 **Security templates** - Pre-configured .gitignore with 60+ patterns
- 🔍 **Security scanning** - Built-in tools to detect exposed secrets
- 🚨 **Clear warnings** - Contextual security guidance throughout setup

## Built-in Security Features

### 1. Repository Detection

Flow State Dev automatically detects your repository's visibility and adjusts accordingly:

```bash
$ fsd init my-app

🔍 Repository Analysis
⚠️  PUBLIC repository detected: github.com/user/my-app

🚨 SECURITY WARNING: This is a PUBLIC repository!
   Anyone can see your code and any secrets you commit.
```

### 2. Secret Detection

Built-in patterns detect common secrets:

- Supabase service keys and URLs
- JWT secrets
- API keys (OpenAI, Stripe, AWS, etc.)
- Private keys and certificates
- Database connection strings

### 3. Pre-commit Hooks

Automatic secret scanning before every commit:

```bash
$ git commit -m "Add feature"
🔍 Scanning for secrets...
❌ Found potential secret in src/config.js:
   Line 5: SUPABASE_SERVICE_KEY = "eyJhbGc..."
Commit aborted. Remove secrets before committing.
```

### 4. Enhanced .gitignore

60+ patterns to prevent accidental exposure:

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Private keys
*.pem
*.key
*.p12

# IDE configurations
.vscode/settings.json
.idea/

# And 50+ more patterns...
```

## Environment Configuration

### Development Environments

#### Local Development (.env.local)

```bash
# Safe for local development only
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=local-development-key
```

#### Remote Development (.env)

```bash
# For Supabase Cloud - use placeholder values in public repos
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Environment Priority

1. `.env.local` - Local overrides (gitignored)
2. `.env.[mode]` - Mode-specific (e.g., .env.production)
3. `.env` - Default values (safe placeholders for public repos)

### Best Practices

1. **Never commit real credentials** to public repositories
2. **Use `.env.example`** with placeholder values
3. **Document required variables** without exposing values
4. **Use environment-specific files** for different stages

## Authentication & Authorization

### Supabase Auth Configuration

#### 1. Email Verification

Always enable email verification in production:

```javascript
// supabase/config.toml
[auth]
enable_signup = true
enable_confirmations = true  // Require email verification
```

#### 2. Password Requirements

Configure strong password policies:

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      // Additional metadata
    }
  }
})
```

#### 3. Session Management

```javascript
// Initialize auth state
const initAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Clear sensitive data
      clearUserData()
      router.push('/login')
    }
  })
}
```

#### 4. Multi-Factor Authentication (MFA)

Enable MFA for sensitive operations:

```javascript
// Enable MFA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
})

// Verify MFA
const { data, error } = await supabase.auth.mfa.verify({
  factorId: 'factor-id',
  code: '123456'
})
```

## Database Security

### Row Level Security (RLS)

#### 1. Enable RLS on All Tables

```sql
-- Always enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
```

#### 2. Create Policies

```sql
-- Users can only read their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Public read, authenticated write
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (is_public = true);
```

#### 3. Service Role Security

Never expose service role keys in frontend code:

```javascript
// ❌ NEVER DO THIS
const supabase = createClient(url, SERVICE_ROLE_KEY)

// ✅ Use anon key in frontend
const supabase = createClient(url, ANON_KEY)
```

### Database Migrations

#### Security in Migrations

```sql
-- migrations/20240101000000_create_secure_tables.sql

-- Create tables with security in mind
CREATE TABLE sensitive_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS immediately
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;

-- Add secure policies
CREATE POLICY "Users can only access their own data"
ON sensitive_data
FOR ALL
USING (auth.uid() = user_id);

-- Create secure indexes
CREATE INDEX idx_sensitive_data_user_id ON sensitive_data(user_id);
```

## API Security

### 1. Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
// middleware/rateLimiter.js
const rateLimiter = {
  requests: new Map(),
  
  check(ip, limit = 100, window = 60000) {
    const now = Date.now()
    const userRequests = this.requests.get(ip) || []
    
    // Remove old requests
    const validRequests = userRequests.filter(
      time => now - time < window
    )
    
    if (validRequests.length >= limit) {
      throw new Error('Rate limit exceeded')
    }
    
    validRequests.push(now)
    this.requests.set(ip, validRequests)
  }
}
```

### 2. Input Validation

Always validate and sanitize input:

```javascript
// utils/validation.js
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  age: z.number().min(13).max(120)
})

export const validateUser = (data) => {
  try {
    return userSchema.parse(data)
  } catch (error) {
    throw new Error('Invalid user data')
  }
}
```

### 3. CORS Configuration

Configure CORS properly:

```javascript
// For production
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  optionsSuccessStatus: 200
}
```

## Frontend Security

### 1. Content Security Policy (CSP)

Add CSP headers to prevent XSS:

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.supabase.co;">
```

### 2. XSS Prevention

```javascript
// Always sanitize user input before rendering
import DOMPurify from 'dompurify'

const SafeHTML = ({ content }) => {
  const sanitized = DOMPurify.sanitize(content)
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}
```

### 3. Secure Storage

```javascript
// utils/secureStorage.js
export const secureStorage = {
  set(key, value, encrypt = false) {
    const data = encrypt 
      ? btoa(JSON.stringify(value))  // Basic encoding
      : JSON.stringify(value)
    
    localStorage.setItem(key, data)
  },
  
  get(key, decrypt = false) {
    const data = localStorage.getItem(key)
    if (!data) return null
    
    try {
      return decrypt 
        ? JSON.parse(atob(data))
        : JSON.parse(data)
    } catch {
      return null
    }
  },
  
  remove(key) {
    localStorage.removeItem(key)
  },
  
  clear() {
    localStorage.clear()
  }
}
```

### 4. Secure Component Patterns

```vue
<template>
  <div>
    <!-- Prevent XSS with v-text instead of v-html -->
    <p v-text="userContent"></p>
    
    <!-- Use computed properties for sensitive operations -->
    <button 
      v-if="canDelete" 
      @click="handleDelete"
      :disabled="isDeleting"
    >
      Delete
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isDeleting = ref(false)

// Computed property for authorization
const canDelete = computed(() => {
  return auth.user?.role === 'admin' || 
         auth.user?.id === props.item.userId
})

const handleDelete = async () => {
  if (!canDelete.value) {
    console.error('Unauthorized delete attempt')
    return
  }
  
  isDeleting.value = true
  try {
    await deleteItem(props.item.id)
  } finally {
    isDeleting.value = false
  }
}
</script>
```

## Development Security

### 1. Secure Development Environment

```bash
# .env.development
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=http://localhost:54321
VITE_ENABLE_DEBUG=true

# .env.production
VITE_API_URL=https://api.production.com
VITE_SUPABASE_URL=https://project.supabase.co
VITE_ENABLE_DEBUG=false
```

### 2. Git Security

#### Pre-commit Hook Setup

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run security scanner
npm run security:scan

# Check for debugging code
if grep -r "console.log\|debugger" src/; then
  echo "Remove console.log and debugger statements"
  exit 1
fi
```

### 3. Dependency Security

```json
// package.json
{
  "scripts": {
    "security:audit": "npm audit",
    "security:fix": "npm audit fix",
    "security:check": "npm audit --production"
  }
}
```

Regular dependency updates:

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

## Deployment Security

### 1. Environment Variables

#### Netlify

```toml
# netlify.toml
[build.environment]
  NODE_VERSION = "18"

# Set sensitive variables in Netlify UI, not in config
```

#### Vercel

```json
// vercel.json
{
  "env": {
    "NODE_ENV": "production"
  }
  // Set sensitive variables in Vercel dashboard
}
```

### 2. Build Security

```javascript
// vite.config.js
export default defineConfig({
  build: {
    // Remove source maps in production
    sourcemap: false,
    
    // Minify code
    minify: 'terser',
    
    // Drop console logs in production
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### 3. Headers Configuration

```javascript
// netlify.toml or _headers file
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Security Checklist

### Pre-Development

- [ ] Choose appropriate repository visibility (public/private)
- [ ] Set up .gitignore with security patterns
- [ ] Configure pre-commit hooks
- [ ] Plan authentication strategy
- [ ] Design database schema with RLS in mind

### During Development

- [ ] Use environment variables for all sensitive data
- [ ] Implement proper input validation
- [ ] Add rate limiting to APIs
- [ ] Enable RLS on all tables
- [ ] Write secure RLS policies
- [ ] Implement proper error handling (don't expose internals)
- [ ] Use HTTPS for all external requests
- [ ] Implement CSP headers
- [ ] Sanitize all user inputs
- [ ] Review dependencies for vulnerabilities

### Pre-Deployment

- [ ] Run security scanner: `fsd security scan`
- [ ] Audit npm dependencies: `npm audit`
- [ ] Remove all console.log statements
- [ ] Disable source maps for production
- [ ] Configure secure headers
- [ ] Set up monitoring and alerts
- [ ] Review all environment variables
- [ ] Test authentication flows
- [ ] Verify RLS policies work correctly
- [ ] Document security procedures

### Post-Deployment

- [ ] Monitor for security alerts
- [ ] Set up automated security scanning
- [ ] Regular dependency updates
- [ ] Monitor error logs for security issues
- [ ] Review access logs regularly
- [ ] Keep documentation updated
- [ ] Conduct periodic security reviews

## Incident Response

### 1. Immediate Actions

If you discover a security issue:

1. **Don't panic** - Take systematic action
2. **Assess the scope** - What data/systems are affected?
3. **Contain the issue** - Disable affected features if needed
4. **Document everything** - Keep detailed notes

### 2. For Exposed Secrets

```bash
# 1. Immediately rotate the exposed credential
# 2. Check if the secret was used
# 3. Review access logs
# 4. Update all systems using the credential

# Remove secret from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all
```

### 3. Communication

- Notify affected users promptly
- Be transparent about the impact
- Provide clear remediation steps
- Follow up with prevention measures

## Security Tools

### Built-in FSD Tools

```bash
# Scan for secrets
fsd security scan

# Check repository security
fsd security check

# Set up security tools
fsd security setup
```

### Recommended Third-Party Tools

1. **GitGuardian** - Automated secret detection
2. **Snyk** - Dependency vulnerability scanning
3. **OWASP ZAP** - Web application security testing
4. **SonarQube** - Code quality and security analysis

### Security Headers Testing

Test your deployed application:
- https://securityheaders.com
- https://observatory.mozilla.org

## Supabase-Specific Security

### 1. API Key Management

```javascript
// Correct key usage
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY  // ✅ Safe for frontend
)

// Never expose service role key
// SERVICE_ROLE_KEY is only for backend/admin tasks
```

### 2. RLS Best Practices

```sql
-- Always use auth.uid() for user identification
CREATE POLICY "Users own data" ON user_data
FOR ALL USING (auth.uid() = user_id);

-- Use security definer functions carefully
CREATE FUNCTION get_user_data(user_id uuid)
RETURNS SETOF user_data
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with owner privileges
AS $$
BEGIN
  -- Add security checks here
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  RETURN QUERY SELECT * FROM user_data WHERE id = user_id;
END;
$$;
```

### 3. Storage Security

```sql
-- Storage bucket policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

## Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security-best-practices)
- [Vue.js Security Guide](https://vuejs.org/guide/best-practices/security.html)

### Learning Resources
- [Web Security Academy](https://portswigger.net/web-security)
- [Security Headers](https://securityheaders.com/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Tools & Services
- [Have I Been Pwned](https://haveibeenpwned.com/) - Check for data breaches
- [Mozilla Observatory](https://observatory.mozilla.org/) - Security testing
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL/TLS testing

## Contributing

If you discover a security vulnerability in Flow State Dev:

1. **Do not** open a public issue
2. Email security concerns to: security@flowstatedev.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We take security seriously and will respond promptly to valid concerns.

---

Remember: **Security is not a feature, it's a mindset.** Every line of code, every configuration, and every deployment decision should consider security implications.