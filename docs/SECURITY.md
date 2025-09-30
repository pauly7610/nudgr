# Security Guide

Comprehensive security documentation for the Friction Analytics Platform.

## Table of Contents

- [Security Overview](#security-overview)
- [Authentication Security](#authentication-security)
- [Data Protection](#data-protection)
- [Input Validation](#input-validation)
- [RLS Policies](#rls-policies)
- [API Security](#api-security)
- [Best Practices](#best-practices)
- [Incident Response](#incident-response)

## Security Overview

The platform implements multiple layers of security:

1. **Authentication**: Supabase Auth with JWT tokens
2. **Authorization**: Row Level Security (RLS) policies
3. **Input Validation**: Zod schema validation
4. **XSS Prevention**: Automatic output escaping
5. **CSRF Protection**: Token-based protection
6. **Rate Limiting**: Per-user and per-API key limits
7. **Monitoring**: Real-time security event tracking

## Authentication Security

### Password Requirements

Passwords must meet these criteria:

```typescript
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter  
- At least one number
- Maximum 128 characters
```

### Implementation

```typescript
import { passwordSchema } from '@/lib/validation';

// Validate password
const result = passwordSchema.safeParse(userPassword);
if (!result.success) {
  // Handle validation errors
  console.error(result.error.errors);
}
```

### Session Management

- **Session Duration**: 24 hours
- **Refresh Tokens**: Automatically rotated
- **Session Storage**: Secure, httpOnly cookies
- **Logout**: Clears all session data

```typescript
import { supabase } from '@/integrations/supabase/client';

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Logout
await supabase.auth.signOut();
```

### Multi-Factor Authentication (MFA)

**Status**: Not yet implemented
**Priority**: High
**Recommended**: TOTP-based MFA for admin accounts

## Data Protection

### Row Level Security (RLS)

All tables have RLS enabled to ensure data isolation.

**Example Policy:**

```sql
-- Users can only view their own data
CREATE POLICY "Users can view own data"
  ON public.user_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all data
CREATE POLICY "Admins can view all data"
  ON public.user_data
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
```

### Sensitive Data Handling

**Never log:**
- Passwords
- API keys
- Session tokens
- Credit card numbers
- Personal identification numbers

**Always encrypt:**
- API keys (at rest)
- Session tokens
- User PII (in backups)

```typescript
// ❌ WRONG - Logging sensitive data
console.log('User password:', password);

// ✅ CORRECT - Logging non-sensitive data
console.log('Login attempt for user:', email);
```

### Data Retention

| Data Type | Retention Period | Auto-Delete |
|-----------|------------------|-------------|
| Error Logs | 90 days | Yes |
| Performance Metrics | 30 days | Yes |
| Analytics Events | 180 days | Yes |
| Session Recordings | Based on plan | No |
| Friction Events | 1 year | No |

## Input Validation

### Using Validation Schemas

```typescript
import { emailSchema, sanitizedTextSchema } from '@/lib/validation';

// Email validation
const emailResult = emailSchema.safeParse(userEmail);
if (!emailResult.success) {
  throw new Error(emailResult.error.errors[0].message);
}

// Text sanitization (prevents XSS)
const safeText = sanitizedTextSchema.parse(userInput);
```

### Form Validation Example

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  message: z.string().trim().min(1).max(1000),
});

const form = useForm({
  resolver: zodResolver(contactSchema),
});
```

### Preventing SQL Injection

```typescript
// ❌ WRONG - Never concatenate user input in queries
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;

// ✅ CORRECT - Use Supabase client methods
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail);
```

### XSS Prevention

```typescript
import { preventXSS } from '@/lib/validation';

// Sanitize user input before display
const safeContent = preventXSS(userInput);

// ❌ WRONG - Never use dangerouslySetInnerHTML with user content
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ CORRECT - Display text directly (React auto-escapes)
<div>{userInput}</div>
```

## RLS Policies

### Policy Structure

Every table should have policies for:
1. **SELECT**: Who can read data
2. **INSERT**: Who can create data
3. **UPDATE**: Who can modify data
4. **DELETE**: Who can remove data

### User Roles System

```sql
-- Create role enum
CREATE TYPE app_role AS ENUM ('admin', 'analyst', 'viewer');

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role app_role NOT NULL
);

-- Helper function (avoids RLS recursion)
CREATE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### Example Policies

```sql
-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON public.friction_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to read all data
CREATE POLICY "Admins can read all data"
  ON public.friction_events
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Allow system to insert data
CREATE POLICY "System can insert data"
  ON public.friction_events
  FOR INSERT
  WITH CHECK (true);
```

### Testing RLS Policies

```sql
-- Test as a specific user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"user-id-here"}';

-- Run your query
SELECT * FROM friction_events;

-- Reset
RESET ROLE;
```

## API Security

### API Key Management

```typescript
// Generate API key
import { apiKeySchema } from '@/lib/validation';

const apiKey = crypto.randomUUID(); // Use proper key generation
const validated = apiKeySchema.parse(apiKey);

// Store hashed version in database
const hashedKey = await hashAPIKey(validated);
```

### Rate Limiting

```typescript
import { rateLimiter } from '@/lib/validation';

// Check rate limit (60 requests per minute)
if (!rateLimiter.canMakeRequest('user-123', 60, 60000)) {
  throw new Error('Rate limit exceeded');
}

// Make API call
await fetchData();
```

### CORS Configuration

```typescript
// Edge function CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Restrict in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Handle preflight
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

### Request Validation

```typescript
import { frictionEventSchema } from '@/lib/validation';

// Validate incoming data
export async function POST(request: Request) {
  const body = await request.json();
  
  const validation = frictionEventSchema.safeParse(body);
  if (!validation.success) {
    return new Response(
      JSON.stringify({ error: validation.error.errors }),
      { status: 400 }
    );
  }
  
  // Process validated data
  const event = validation.data;
}
```

## Best Practices

### 1. Secure Development

```typescript
// ✅ DO: Use environment variables for secrets
const apiKey = Deno.env.get('API_KEY');

// ❌ DON'T: Hardcode secrets
const apiKey = 'sk-1234567890abcdef';
```

### 2. Error Handling

```typescript
// ✅ DO: Generic error messages to users
catch (error) {
  errorTracker.captureException(error);
  return { error: 'An error occurred' };
}

// ❌ DON'T: Expose internal errors
catch (error) {
  return { error: error.message }; // May reveal stack traces
}
```

### 3. Password Storage

```typescript
// ✅ DO: Let Supabase handle password hashing
await supabase.auth.signUp({ email, password });

// ❌ DON'T: Implement your own password hashing
const hashed = sha256(password); // Insecure!
```

### 4. Session Management

```typescript
// ✅ DO: Use Supabase session management
const { data: { session } } = await supabase.auth.getSession();

// ❌ DON'T: Store tokens in localStorage
localStorage.setItem('token', jwt); // Vulnerable to XSS
```

### 5. Input Validation

```typescript
// ✅ DO: Validate on both client and server
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

// Client validation
const result = schema.safeParse(formData);

// Server validation (edge function)
const serverResult = schema.safeParse(requestBody);
```

## Incident Response

### Security Incident Procedure

1. **Detect**: Monitor security dashboard and error logs
2. **Contain**: Disable affected accounts/API keys
3. **Investigate**: Review logs and determine scope
4. **Remediate**: Patch vulnerabilities
5. **Notify**: Inform affected users if required
6. **Document**: Record incident and lessons learned

### Common Security Issues

#### Suspicious Login Attempts

```sql
-- Query for failed login attempts
SELECT user_id, COUNT(*) as attempt_count, MAX(created_at)
FROM error_logs
WHERE error_type = 'AuthenticationError'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 5;
```

#### API Key Compromise

```typescript
// Immediately revoke compromised key
await supabase
  .from('api_keys')
  .update({ is_active: false })
  .eq('api_key', compromisedKey);

// Generate new key for user
const newKey = generateAPIKey();
```

#### Data Breach Response

1. Lock down affected systems
2. Identify scope of breach
3. Notify users within 72 hours (GDPR)
4. Reset all user sessions
5. Require password resets
6. Review and strengthen RLS policies

### Emergency Contacts

- **Security Lead**: [Your Contact]
- **Database Admin**: [Your Contact]
- **On-Call Engineer**: [Your Contact]

## Security Audit Checklist

### Monthly Checks

- [ ] Review RLS policies for all tables
- [ ] Audit API key usage and rotate old keys
- [ ] Check for SQL injection vulnerabilities
- [ ] Review error logs for security issues
- [ ] Verify backup encryption
- [ ] Test authentication flows
- [ ] Check rate limiting effectiveness

### Quarterly Checks

- [ ] Full security scan
- [ ] Penetration testing
- [ ] Dependency vulnerability scan
- [ ] Review user permissions
- [ ] Update security documentation
- [ ] Security training for team

### Annual Checks

- [ ] Third-party security audit
- [ ] Compliance review (GDPR, SOC 2)
- [ ] Disaster recovery drill
- [ ] Update incident response plan

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)
- [Web Security Checklist](https://www.w3.org/TR/security-checklist/)

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email security@yourdomain.com with details
3. Include steps to reproduce if possible
4. We'll respond within 24 hours

---

**Last Updated**: 2025-09-30
**Version**: 1.0
