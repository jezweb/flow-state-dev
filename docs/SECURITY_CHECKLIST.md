# Developer Security Checklist

> Actionable security checklist for every stage of development

## 🚀 Project Setup

### Repository Configuration
- [ ] Choose correct repository visibility (public vs private)
- [ ] Run `fsd security setup` to initialize security tools
- [ ] Verify `.gitignore` includes all sensitive patterns
- [ ] Set up branch protection rules on `main`
- [ ] Enable security alerts in GitHub settings

### Initial Security Setup
- [ ] Create `.env.example` with placeholder values
- [ ] Configure pre-commit hooks for secret scanning
- [ ] Set up dependency vulnerability scanning
- [ ] Document security requirements in README
- [ ] Create security contact information

### Environment Configuration
- [ ] Use separate `.env` files for each environment
- [ ] Never commit `.env.local` or `.env.production`
- [ ] Document all required environment variables
- [ ] Use strong, unique values for all secrets
- [ ] Rotate default development credentials

## 💻 Development Phase

### Daily Security Practices
- [ ] Run `fsd security scan` before each commit
- [ ] Review git diff for accidental secret exposure
- [ ] Update dependencies regularly: `npm update`
- [ ] Check for vulnerabilities: `npm audit`
- [ ] Use parameterized queries (automatic with Supabase)

### Code Security
- [ ] Validate all user inputs
- [ ] Sanitize data before rendering
- [ ] Use `v-text` instead of `v-html` for user content
- [ ] Implement proper error handling
- [ ] Add rate limiting to API endpoints

### Authentication Implementation
- [ ] Enable email confirmation in Supabase
- [ ] Implement proper session management
- [ ] Add password strength requirements
- [ ] Set up secure password reset flow
- [ ] Configure session timeout

### Database Security
- [ ] Enable RLS on ALL tables
- [ ] Write restrictive RLS policies
- [ ] Test policies with different user roles
- [ ] Use `auth.uid()` for user identification
- [ ] Never expose service role key

## 🧪 Testing Phase

### Security Testing
- [ ] Test authentication flows thoroughly
- [ ] Verify RLS policies work correctly
- [ ] Check for information disclosure in errors
- [ ] Test rate limiting implementation
- [ ] Validate CORS configuration

### Penetration Testing Basics
- [ ] Test for SQL injection (though Supabase protects against this)
- [ ] Check for XSS vulnerabilities
- [ ] Verify CSRF protection
- [ ] Test file upload restrictions
- [ ] Check for exposed endpoints

### Performance & Security
- [ ] Remove all `console.log` statements
- [ ] Disable debugging features
- [ ] Optimize bundle size
- [ ] Check for exposed source maps
- [ ] Verify no sensitive data in build output

## 📦 Pre-Deployment

### Final Security Review
- [ ] Run comprehensive security scan: `fsd security scan --verbose`
- [ ] Audit all npm dependencies: `npm audit --production`
- [ ] Review all environment variables
- [ ] Check for hardcoded secrets: `grep -r "secret\|key\|password" src/`
- [ ] Verify all TODO security items are resolved

### Build Configuration
- [ ] Disable source maps in production
- [ ] Enable code minification
- [ ] Remove development dependencies
- [ ] Configure security headers
- [ ] Set up CSP (Content Security Policy)

### Deployment Preparation
- [ ] Document deployment security procedures
- [ ] Create rollback plan
- [ ] Set up monitoring and alerting
- [ ] Configure error tracking (without exposing sensitive data)
- [ ] Prepare incident response plan

## 🌐 Deployment

### Platform-Specific Security

#### Netlify
- [ ] Set environment variables in Netlify UI
- [ ] Configure `_headers` file for security headers
- [ ] Enable HTTPS (automatic)
- [ ] Set up deploy previews securely
- [ ] Configure build commands properly

#### Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Configure `vercel.json` security headers
- [ ] Enable HTTPS (automatic)
- [ ] Set up preview deployments securely
- [ ] Configure serverless function security

#### Custom Server
- [ ] Configure HTTPS with valid SSL certificate
- [ ] Set up firewall rules
- [ ] Enable DDoS protection
- [ ] Configure reverse proxy security
- [ ] Harden server configuration

### Post-Deployment Verification
- [ ] Test HTTPS is enforced
- [ ] Verify security headers: https://securityheaders.com
- [ ] Check SSL configuration: https://www.ssllabs.com/ssltest/
- [ ] Test authentication flows in production
- [ ] Verify error messages don't leak information

## 🔄 Maintenance

### Regular Security Tasks

#### Daily
- [ ] Monitor error logs for security issues
- [ ] Check for unusual authentication patterns
- [ ] Review access logs
- [ ] Monitor rate limit violations
- [ ] Check for security alerts

#### Weekly
- [ ] Run dependency vulnerability scan
- [ ] Review and update dependencies
- [ ] Check for new security advisories
- [ ] Audit user permissions
- [ ] Review security metrics

#### Monthly
- [ ] Comprehensive security audit
- [ ] Update security documentation
- [ ] Review and rotate API keys
- [ ] Test backup and recovery procedures
- [ ] Security training/awareness

## 🚨 Incident Response

### If Security Breach Suspected
- [ ] Don't panic - follow the plan
- [ ] Document everything immediately
- [ ] Isolate affected systems if possible
- [ ] Assess scope and impact
- [ ] Begin containment procedures

### Immediate Actions
- [ ] Rotate all potentially compromised credentials
- [ ] Review access logs for unauthorized access
- [ ] Check for data exfiltration
- [ ] Notify security team/stakeholders
- [ ] Preserve evidence for investigation

### Communication
- [ ] Prepare breach notification if required
- [ ] Update status page if applicable
- [ ] Communicate with affected users
- [ ] Document lessons learned
- [ ] Update security procedures

## 📋 Quick Reference Commands

```bash
# Security Scanning
fsd security scan              # Scan for secrets
fsd security scan --verbose    # Detailed scan
fsd security check            # Check repo security status

# Dependency Security
npm audit                     # Check for vulnerabilities
npm audit fix                # Auto-fix vulnerabilities
npm audit --production       # Production dependencies only

# Git Security
git log -p -S "password"     # Search for "password" in history
git secrets --scan           # Scan for secrets (if installed)

# Local Testing
npm run build && npm run preview  # Test production build
lighthouse <url> --view          # Test performance & security
```

## 🎯 Security Goals

### Minimum Security Standard
- ✅ No exposed secrets in code
- ✅ All tables have RLS enabled
- ✅ Authentication required for sensitive operations
- ✅ HTTPS enforced everywhere
- ✅ Security headers configured

### Recommended Security Level
- ✅ All minimum standards met
- ✅ Rate limiting implemented
- ✅ Comprehensive error handling
- ✅ Regular security audits
- ✅ Monitoring and alerting setup

### Advanced Security
- ✅ All recommended standards met
- ✅ Penetration testing performed
- ✅ Security training completed
- ✅ Incident response plan tested
- ✅ Compliance requirements met

## 📚 Resources

- [Flow State Dev Security Guide](./SECURITY.md)
- [Security Best Practices](./SECURITY_BEST_PRACTICES.md)
- [OWASP Security Checklist](https://owasp.org/www-project-application-security-verification-standard/)
- [Supabase Security Docs](https://supabase.com/docs/guides/auth/security-best-practices)

---

**Remember**: This checklist is a starting point. Security requirements may vary based on your application's specific needs and compliance requirements.