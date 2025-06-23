# Security Best Practices Quick Reference

> Essential security practices for Flow State Dev projects

## 🔐 Authentication

### ✅ DO
```javascript
// Use Supabase Auth for authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
})

// Always check auth state
const session = await supabase.auth.getSession()
if (!session) redirect('/login')

// Enable email confirmation
// In Supabase dashboard: Authentication > Settings > Enable email confirmations
```

### ❌ DON'T
```javascript
// Don't store passwords in plain text
// Don't implement custom auth without proper security knowledge
// Don't trust client-side auth checks alone
```

## 🗄️ Database Security

### ✅ DO
```sql
-- Always enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Use auth.uid() for user identification
CREATE POLICY "Users can view own data" ON your_table
FOR SELECT USING (auth.uid() = user_id);

-- Validate data types
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### ❌ DON'T
```sql
-- Don't disable RLS on sensitive tables
-- Don't use service role key in frontend
-- Don't expose database structure in error messages
```

## 🔑 API Keys & Secrets

### ✅ DO
```javascript
// Use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use .env.example for documentation
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_ANON_KEY=your-anon-key
```

### ❌ DON'T
```javascript
// Don't hardcode secrets
const API_KEY = "sk_live_abcd1234" // NEVER!

// Don't commit .env files
// Don't log sensitive data
console.log(process.env.SECRET_KEY) // NEVER!
```

## 🌐 Frontend Security

### ✅ DO
```vue
<template>
  <!-- Sanitize user content -->
  <div v-text="userContent"></div>
  
  <!-- Validate input -->
  <input 
    v-model="email" 
    type="email" 
    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
  >
</template>

<script setup>
// Validate data before sending
const submitForm = async () => {
  if (!isValidEmail(email.value)) {
    return showError('Invalid email')
  }
  // ... rest of submission
}
</script>
```

### ❌ DON'T
```vue
<!-- Don't use v-html with user content -->
<div v-html="userContent"></div> <!-- XSS risk! -->

<!-- Don't trust client-side validation alone -->
<!-- Always validate on backend too -->
```

## 🚀 Deployment Security

### ✅ DO
```javascript
// Production build configuration
export default defineConfig({
  build: {
    sourcemap: false, // No source maps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log
        drop_debugger: true
      }
    }
  }
})

// Use HTTPS everywhere
// Set security headers
// Enable CORS properly
```

### ❌ DON'T
```javascript
// Don't expose development tools in production
// Don't use development keys in production
// Don't skip SSL certificate validation
```

## 🛡️ Quick Security Checklist

### Before First Commit
- [ ] Run `fsd security setup` to configure security tools
- [ ] Review `.gitignore` includes all sensitive files
- [ ] Set up pre-commit hooks
- [ ] Use `.env.example` instead of `.env` in public repos

### During Development
- [ ] Run `fsd security scan` regularly
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Use parameterized queries (Supabase does this automatically)
- [ ] Implement rate limiting for APIs
- [ ] Add input validation on both client and server

### Before Deployment
- [ ] Remove all `console.log` statements
- [ ] Disable source maps for production
- [ ] Set all production environment variables
- [ ] Test with `fsd security scan --verbose`
- [ ] Review all RLS policies

### After Deployment
- [ ] Test security headers: https://securityheaders.com
- [ ] Monitor error logs for security issues
- [ ] Set up alerts for failed auth attempts
- [ ] Regular security audits

## 🚨 Emergency Response

### If You Accidentally Commit Secrets

1. **Immediately rotate the exposed credential**
```bash
# Don't just delete the file - the secret is still in git history!
```

2. **Remove from git history**
```bash
# Use BFG Repo-Cleaner (easier than git filter-branch)
bfg --delete-files file-with-secrets.js
git push --force
```

3. **Notify your team**
- Check if the secret was used
- Review access logs
- Update all affected systems

### Common Security Mistakes to Avoid

1. **Trusting User Input**
```javascript
// ❌ BAD
const query = `SELECT * FROM users WHERE id = ${userId}`

// ✅ GOOD - Supabase handles parameterization
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
```

2. **Exposing Internal Errors**
```javascript
// ❌ BAD
catch (error) {
  return res.json({ error: error.stack }) // Exposes internals!
}

// ✅ GOOD
catch (error) {
  console.error(error) // Log full error server-side
  return res.json({ error: 'Something went wrong' }) // Generic message to user
}
```

3. **Weak Authentication Checks**
```javascript
// ❌ BAD - Client-side only
if (user.role === 'admin') {
  showAdminPanel()
}

// ✅ GOOD - Server-side verification
const { data, error } = await supabase.rpc('check_admin_access')
if (data?.is_admin) {
  showAdminPanel()
}
```

## 📚 Learn More

- [Flow State Dev Security Guide](./SECURITY.md) - Complete security documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Most critical security risks
- [Supabase Security](https://supabase.com/docs/guides/auth/security-best-practices) - Platform-specific security

## 🤝 Security is Everyone's Responsibility

- Report security issues privately
- Keep dependencies updated
- Follow the principle of least privilege
- When in doubt, ask for help

Remember: **It's better to be overly cautious with security than to deal with a breach later.**