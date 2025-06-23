# Supabase Security Configuration Guide

> Complete guide to securing your Supabase backend

## Table of Contents

- [Overview](#overview)
- [Project Setup Security](#project-setup-security)
- [Authentication Configuration](#authentication-configuration)
- [Row Level Security (RLS)](#row-level-security-rls)
- [API Security](#api-security)
- [Storage Security](#storage-security)
- [Edge Functions Security](#edge-functions-security)
- [Database Security](#database-security)
- [Monitoring & Auditing](#monitoring--auditing)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Overview

Supabase provides enterprise-grade security features out of the box, but they must be configured correctly. This guide covers all security aspects of Supabase configuration.

### Key Security Principles

1. **Enable RLS on all tables** - No exceptions
2. **Use anon key in frontend** - Never expose service role key
3. **Validate everything** - Don't trust client data
4. **Audit regularly** - Monitor access patterns
5. **Least privilege** - Grant minimum necessary permissions

## Project Setup Security

### 1. API Keys Management

```javascript
// Frontend (Vue/React) - Safe to expose
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,      // ✅ Safe
  import.meta.env.VITE_SUPABASE_ANON_KEY  // ✅ Safe
)

// Backend only - Never expose to client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,  // ⚠️ Backend only!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### 2. Environment Configuration

```bash
# .env.local (development)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJ...local-anon-key

# .env.production (production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...production-anon-key

# .env.server (backend only - NEVER commit)
SUPABASE_SERVICE_ROLE_KEY=eyJ...service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### 3. Project Settings

In Supabase Dashboard > Settings > API:

- [ ] Enable RLS on auth schema
- [ ] Set JWT expiry appropriately (default: 1 hour)
- [ ] Configure allowed redirect URLs
- [ ] Set up custom SMTP for production
- [ ] Enable captcha for authentication

## Authentication Configuration

### 1. Email Authentication

```javascript
// Enable email confirmation
// Dashboard > Authentication > Settings > Enable email confirmations

// Sign up with email confirmation
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  options: {
    emailRedirectTo: 'https://yourdomain.com/auth/callback',
    data: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }
})
```

### 2. Password Policies

```sql
-- Set password requirements in Dashboard > Authentication > Settings
-- Minimum length: 8 characters
-- Require: Numbers, uppercase, lowercase, special characters

-- Or use SQL to enforce custom rules
CREATE OR REPLACE FUNCTION auth.validate_password(password text)
RETURNS boolean AS $$
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters';
  END IF;
  
  -- Check for uppercase
  IF NOT (password ~ '[A-Z]') THEN
    RAISE EXCEPTION 'Password must contain uppercase letter';
  END IF;
  
  -- Check for lowercase
  IF NOT (password ~ '[a-z]') THEN
    RAISE EXCEPTION 'Password must contain lowercase letter';
  END IF;
  
  -- Check for number
  IF NOT (password ~ '[0-9]') THEN
    RAISE EXCEPTION 'Password must contain number';
  END IF;
  
  -- Check for special character
  IF NOT (password ~ '[!@#$%^&*(),.?":{}|<>]') THEN
    RAISE EXCEPTION 'Password must contain special character';
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. OAuth Providers

```javascript
// Configure OAuth providers securely
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://yourdomain.com/auth/callback',
    scopes: 'email profile', // Request only needed scopes
    queryParams: {
      access_type: 'offline',
      prompt: 'consent'
    }
  }
})

// Validate OAuth data
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    // Validate user data
    validateOAuthUser(session.user)
  }
})
```

### 4. Multi-Factor Authentication (MFA)

```javascript
// Enable MFA enrollment
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
  friendlyName: 'My App'
})

// Show QR code to user
if (data?.totp?.qr_code) {
  showQRCode(data.totp.qr_code)
}

// Verify MFA code
const { data, error } = await supabase.auth.mfa.verify({
  factorId: factorId,
  code: userInputCode
})

// Challenge MFA on sensitive operations
const { data, error } = await supabase.auth.mfa.challenge({
  factorId: factorId
})
```

## Row Level Security (RLS)

### 1. Basic RLS Setup

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Force RLS for service role (optional but recommended)
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
```

### 2. Common RLS Patterns

#### User Owns Data
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

#### Public Read, Authenticated Write
```sql
-- Anyone can read, only authenticated users can write
CREATE POLICY "Public read access" 
ON posts FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create posts" 
ON posts FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
```

#### Role-Based Access
```sql
-- Create roles table
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'moderator', 'admin')),
  PRIMARY KEY (user_id, role)
);

-- Admin access policy
CREATE POLICY "Admins can do anything" 
ON posts FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);
```

#### Time-Based Access
```sql
-- Content visible after publish date
CREATE POLICY "Published content is public" 
ON articles FOR SELECT 
USING (
  published_at IS NOT NULL 
  AND published_at <= NOW()
);
```

### 3. RLS Best Practices

```sql
-- Use functions for complex logic
CREATE OR REPLACE FUNCTION is_team_member(team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = $1 
    AND team_members.user_id = auth.uid()
    AND team_members.active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use in policy
CREATE POLICY "Team members can view team data" 
ON team_data FOR SELECT 
USING (is_team_member(team_id));
```

### 4. Testing RLS Policies

```sql
-- Test policies as different users
SET LOCAL role TO 'anon';
SELECT * FROM profiles; -- Should fail or return limited data

SET LOCAL role TO 'authenticated';
SET LOCAL request.jwt.claims.sub TO 'user-uuid-here';
SELECT * FROM profiles; -- Should return user's profile

-- Reset
RESET role;
```

## API Security

### 1. Rate Limiting

While Supabase doesn't provide built-in rate limiting, implement it in your application:

```javascript
// Simple in-memory rate limiter
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.requests = new Map()
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(identifier) {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // Remove old requests
    const validRequests = requests.filter(
      time => now - time < this.windowMs
    )
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }
}

// Use in API calls
const limiter = new RateLimiter(100, 60000) // 100 requests per minute

async function apiCall(userId) {
  if (!limiter.isAllowed(userId)) {
    throw new Error('Rate limit exceeded')
  }
  
  // Make Supabase call
  return await supabase.from('data').select()
}
```

### 2. API Key Rotation

```javascript
// Implement key rotation strategy
class SupabaseKeyManager {
  constructor() {
    this.keys = {
      current: process.env.SUPABASE_ANON_KEY,
      previous: process.env.SUPABASE_ANON_KEY_PREVIOUS
    }
  }

  async rotateKeys() {
    // 1. Generate new keys in Supabase Dashboard
    // 2. Update environment variables
    // 3. Deploy with both keys active
    // 4. Monitor for issues
    // 5. Remove old key after confirmation
  }

  getClient() {
    try {
      return createClient(url, this.keys.current)
    } catch (error) {
      // Fallback to previous key
      console.warn('Falling back to previous key')
      return createClient(url, this.keys.previous)
    }
  }
}
```

### 3. Request Validation

```javascript
// Validate all incoming data
import { z } from 'zod'

// Define schemas
const userUpdateSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional()
})

// Validate before database operations
async function updateUserProfile(userId, updates) {
  // Validate input
  const validatedData = userUpdateSchema.parse(updates)
  
  // Additional security checks
  if (validatedData.avatar_url) {
    // Ensure URL is from allowed domain
    const url = new URL(validatedData.avatar_url)
    if (!ALLOWED_DOMAINS.includes(url.hostname)) {
      throw new Error('Invalid avatar URL domain')
    }
  }
  
  // Update with validated data
  const { data, error } = await supabase
    .from('profiles')
    .update(validatedData)
    .eq('id', userId)
    
  return { data, error }
}
```

## Storage Security

### 1. Bucket Configuration

```sql
-- Create buckets with appropriate permissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png']),
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf']);
```

### 2. Storage Policies

```sql
-- Public bucket - anyone can read
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Private bucket - only owner can access
CREATE POLICY "Users can access own documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. File Upload Security

```javascript
// Validate file uploads
async function uploadSecureFile(file, bucket, path) {
  // Check file size
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error('File too large')
  }
  
  // Validate mime type
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  
  // Sanitize filename
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase()
  
  // Generate unique path
  const uniquePath = `${path}/${Date.now()}_${sanitizedName}`
  
  // Upload with proper options
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniquePath, file, {
      cacheControl: '3600',
      upsert: false // Don't overwrite existing files
    })
    
  if (error) throw error
  
  return data
}
```

### 4. Signed URLs for Private Content

```javascript
// Generate time-limited URLs for private content
async function getPrivateFileUrl(bucket, path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
    
  if (error) throw error
  
  // Additional security: Log access
  await logFileAccess(bucket, path, auth.user()?.id)
  
  return data.signedUrl
}

// Revoke access by deleting the file or updating policies
async function revokeFileAccess(bucket, path) {
  // Option 1: Delete file
  await supabase.storage.from(bucket).remove([path])
  
  // Option 2: Update user permissions in database
  await supabase
    .from('file_permissions')
    .delete()
    .match({ file_path: path, user_id: userId })
}
```

## Edge Functions Security

### 1. Secure Edge Function Setup

```typescript
// supabase/functions/secure-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Validate environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing environment variables')
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': 'https://yourdomain.com',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      })
    }

    // Verify JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify user
    const { data: { user }, error } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (error || !user) {
      throw new Error('Invalid token')
    }

    // Rate limiting
    const rateLimitKey = `rate_limit:${user.id}:${req.url}`
    const { count } = await supabase
      .rpc('increment_rate_limit', { key: rateLimitKey })
      .single()
      
    if (count > 100) {
      throw new Error('Rate limit exceeded')
    }

    // Process request...
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://yourdomain.com'
      }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://yourdomain.com'
      }
    })
  }
})
```

### 2. Webhook Security

```typescript
// Verify webhook signatures
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')
  
  // Constant time comparison to prevent timing attacks
  return signature.length === expectedSignature.length &&
    signature === expectedSignature
}

serve(async (req) => {
  const signature = req.headers.get('X-Webhook-Signature')
  const payload = await req.text()
  
  if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Process webhook...
})
```

## Database Security

### 1. Secure Database Functions

```sql
-- Use SECURITY DEFINER carefully
CREATE OR REPLACE FUNCTION get_user_sensitive_data(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with function owner's privileges
SET search_path = public -- Prevent search path attacks
AS $$
BEGIN
  -- Verify the requesting user has permission
  IF auth.uid() != user_id AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;
  
  RETURN QUERY
  SELECT u.id, u.email, u.created_at
  FROM auth.users u
  WHERE u.id = user_id;
END;
$$;

-- Grant execute permission only to authenticated users
REVOKE ALL ON FUNCTION get_user_sensitive_data FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_sensitive_data TO authenticated;
```

### 2. Audit Logging

```sql
-- Create audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    current_setting('request.headers')::json->>'x-forwarded-for',
    current_setting('request.headers')::json->>'user-agent'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### 3. Data Encryption

```sql
-- Encrypt sensitive data at rest
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Store encrypted data
CREATE TABLE sensitive_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_ssn TEXT, -- Encrypted social security number
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to store encrypted data
CREATE OR REPLACE FUNCTION store_sensitive_info(
  p_user_id UUID,
  p_ssn TEXT
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_key TEXT;
BEGIN
  -- Get encryption key (store this securely!)
  v_key := current_setting('app.encryption_key');
  
  INSERT INTO sensitive_info (user_id, encrypted_ssn)
  VALUES (
    p_user_id,
    pgp_sym_encrypt(p_ssn, v_key)
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to retrieve decrypted data
CREATE OR REPLACE FUNCTION get_sensitive_info(p_user_id UUID)
RETURNS TABLE (ssn TEXT) AS $$
DECLARE
  v_key TEXT;
BEGIN
  -- Verify user can access their own data
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;
  
  v_key := current_setting('app.encryption_key');
  
  RETURN QUERY
  SELECT pgp_sym_decrypt(encrypted_ssn::bytea, v_key)
  FROM sensitive_info
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Monitoring & Auditing

### 1. Security Monitoring Queries

```sql
-- Monitor failed login attempts
CREATE VIEW security_failed_logins AS
SELECT 
  date_trunc('hour', created_at) as hour,
  count(*) as failed_attempts,
  array_agg(DISTINCT ip_address) as ip_addresses
FROM auth.audit_log_entries
WHERE action = 'login_failed'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
HAVING count(*) > 10
ORDER BY hour DESC;

-- Monitor suspicious activity
CREATE VIEW security_suspicious_activity AS
SELECT 
  user_id,
  count(DISTINCT ip_address) as unique_ips,
  count(*) as total_requests,
  array_agg(DISTINCT action) as actions
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING count(DISTINCT ip_address) > 5
   OR count(*) > 1000;

-- Monitor RLS policy violations
CREATE VIEW security_rls_violations AS
SELECT 
  table_name,
  count(*) as violation_count,
  array_agg(DISTINCT user_id) as users
FROM audit_logs
WHERE action = 'RLS_VIOLATION'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY table_name;
```

### 2. Alerting Setup

```javascript
// Set up security alerts
async function checkSecurityAlerts() {
  // Check for failed login attempts
  const { data: failedLogins } = await supabase
    .from('security_failed_logins')
    .select('*')
    .gte('failed_attempts', 50)
  
  if (failedLogins?.length > 0) {
    await sendSecurityAlert('High number of failed login attempts', failedLogins)
  }
  
  // Check for suspicious activity
  const { data: suspicious } = await supabase
    .from('security_suspicious_activity')
    .select('*')
  
  if (suspicious?.length > 0) {
    await sendSecurityAlert('Suspicious user activity detected', suspicious)
  }
}

// Run checks periodically
setInterval(checkSecurityAlerts, 5 * 60 * 1000) // Every 5 minutes
```

## Common Patterns

### 1. Secure User Profiles

```sql
-- User profiles with privacy settings
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  email_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for profiles
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles"
ON profiles FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 2. Multi-tenant Security

```sql
-- Tenant isolation
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  PRIMARY KEY (organization_id, user_id)
);

-- Tenant data with automatic isolation
CREATE TABLE tenant_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for tenant isolation
CREATE POLICY "Users can only see their organization's data"
ON tenant_data FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);
```

### 3. Secure API Patterns

```javascript
// Secure API wrapper
class SecureSupabaseClient {
  constructor(supabase) {
    this.supabase = supabase
    this.requestCount = new Map()
  }

  async secureQuery(table, operation, options = {}) {
    // Rate limiting
    const userId = (await this.supabase.auth.getUser()).data?.user?.id
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded')
    }

    // Input validation
    this.validateInput(options)

    // Add security headers
    const secureOptions = {
      ...options,
      headers: {
        ...options.headers,
        'X-Client-Version': '1.0.0',
        'X-Request-ID': crypto.randomUUID()
      }
    }

    // Execute query with error handling
    try {
      const query = this.supabase.from(table)[operation](secureOptions)
      const { data, error } = await query

      if (error) {
        this.logSecurityEvent('query_error', { table, operation, error })
        throw error
      }

      return { data, error: null }
    } catch (error) {
      this.handleSecurityError(error)
      throw error
    }
  }

  checkRateLimit(userId) {
    const now = Date.now()
    const userRequests = this.requestCount.get(userId) || []
    const recentRequests = userRequests.filter(t => now - t < 60000)
    
    if (recentRequests.length >= 100) {
      this.logSecurityEvent('rate_limit_exceeded', { userId })
      return false
    }

    recentRequests.push(now)
    this.requestCount.set(userId, recentRequests)
    return true
  }

  validateInput(options) {
    // Implement input validation based on your needs
    if (options.filter) {
      // Check for SQL injection attempts
      const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b)/gi
      if (sqlPatterns.test(JSON.stringify(options.filter))) {
        throw new Error('Invalid input detected')
      }
    }
  }

  logSecurityEvent(event, data) {
    console.error(`[SECURITY] ${event}:`, data)
    // Send to monitoring service
  }

  handleSecurityError(error) {
    // Don't expose internal details
    if (error.message.includes('JWT')) {
      throw new Error('Authentication error')
    }
    if (error.message.includes('RLS')) {
      throw new Error('Permission denied')
    }
    throw new Error('An error occurred')
  }
}
```

## Troubleshooting

### Common Security Issues

#### 1. RLS Policy Not Working

```sql
-- Debug RLS policies
SET LOCAL role TO 'authenticated';
SET LOCAL request.jwt.claims.sub TO 'user-uuid-here';

-- Test your query
SELECT * FROM your_table;

-- Check which policies are being evaluated
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'your_table';
```

#### 2. Authentication Issues

```javascript
// Debug authentication
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
  console.log('Session:', session)
  
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user)
  }
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed')
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('User signed out')
    // Clear local data
  }
})

// Check current session
const { data: { session }, error } = await supabase.auth.getSession()
console.log('Current session:', session)
```

#### 3. Storage Access Issues

```javascript
// Debug storage policies
async function debugStorageAccess(bucket, path) {
  // Try different operations
  const operations = [
    { name: 'list', fn: () => supabase.storage.from(bucket).list(path) },
    { name: 'download', fn: () => supabase.storage.from(bucket).download(path) },
    { name: 'getPublicUrl', fn: () => supabase.storage.from(bucket).getPublicUrl(path) }
  ]

  for (const op of operations) {
    try {
      const result = await op.fn()
      console.log(`✅ ${op.name}:`, result)
    } catch (error) {
      console.error(`❌ ${op.name}:`, error.message)
    }
  }
}
```

## Security Checklist

### Initial Setup
- [ ] Enable RLS on all tables
- [ ] Configure authentication settings
- [ ] Set up email confirmation
- [ ] Configure password policies
- [ ] Set up allowed redirect URLs
- [ ] Enable captcha if needed

### Development
- [ ] Use anon key in frontend only
- [ ] Implement input validation
- [ ] Add rate limiting
- [ ] Handle errors securely
- [ ] Test RLS policies thoroughly
- [ ] Implement audit logging

### Before Production
- [ ] Review all RLS policies
- [ ] Audit all database functions
- [ ] Check storage bucket policies
- [ ] Verify edge function security
- [ ] Set up monitoring
- [ ] Document security procedures

### Ongoing
- [ ] Monitor security alerts
- [ ] Review audit logs
- [ ] Update dependencies
- [ ] Rotate API keys
- [ ] Conduct security reviews
- [ ] Train team on security

## Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security-best-practices)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Deep Dive](https://supabase.com/docs/guides/auth)
- [Storage Security](https://supabase.com/docs/guides/storage/security)

---

Remember: **Security is an ongoing process, not a one-time setup.** Regularly review and update your security configurations as your application grows.