# 🔐 Enhanced Authentication Guide

## Overview

NexaGestion now includes enterprise-grade authentication with:
- ✅ Two-Factor Authentication (2FA) via email OTP
- ✅ Rate limiting on sensitive endpoints
- ✅ Secure password reset flow
- ✅ Security audit logging
- ✅ Role-Based Access Control (RBAC)

## Authentication Flow

### 1. Login with 2FA

**Step 1: Initial Login**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (if 2FA enabled):**
```json
{
  "message": "2FA code sent to your email",
  "requiresVerification": true,
  "expiresIn": 600
}
```

**Step 2: Verify 2FA Code**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "code": "123456"
}
```

**Response (success):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "companyId": "company-1"
  }
}
```

### 2. Enable 2FA

```bash
POST /api/auth/2fa
{
  "method": "email"
}
```

Methods supported: `email`, `sms`, `authenticator`

### 3. Password Reset

**Step 1: Request Reset**
```bash
POST /api/auth/password-reset
{
  "email": "user@example.com"
}
```

**Step 2: Verify Code & Reset**
```bash
PUT /api/auth/password-reset
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123!"
}
```

## Rate Limiting

### Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 attempts | 15 minutes |
| Password Reset | 3 attempts | 1 hour |
| API Read | 100 requests | 1 minute |
| API Write | 30 requests | 1 minute |
| Export | 10 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1703145600
```

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

## Security Features

### Session Security
- HTTPOnly cookies (no JavaScript access)
- Secure flag (HTTPS only)
- SameSite=Strict
- CSRF token validation

### Audit Logging
All authentication events are logged:
- `LOGIN_SUCCESS` - Successful login
- `LOGIN_FAILED` - Failed login attempt
- `PASSWORD_RESET_REQUESTED` - Password reset initiated
- `PASSWORD_RESET_SUCCESS` - Password successfully reset
- `2FA_ENABLED` - 2FA activated
- `2FA_DISABLED` - 2FA deactivated

### Data Isolation
- All operations scoped by `companyId`
- Shared referentials scoped by `groupId`
- RBAC enforced on all protected routes

## Implementation Details

### Files Added/Modified

1. **app/api/auth/login/route.ts** - Enhanced with 2FA and rate limiting
2. **app/api/auth/password-reset/route.ts** - New password reset endpoint
3. **lib/rate-limiter.ts** - Rate limiting service
4. **lib/auth-middleware.ts** - Authentication middleware
5. **prisma/schema.prisma** - Added PasswordReset model

### Environment Variables

```env
AUTH_SECRET=your-secret-key-min-32-chars
DATABASE_URL=postgresql://user:password@localhost:5432/nexagestion
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Testing

### Test Login with Rate Limiting
```bash
# First 5 attempts succeed
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# 6th attempt returns 429 Too Many Requests
```

### Test 2FA Flow
```bash
# Enable 2FA
curl -X POST http://localhost:3000/api/auth/2fa \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"method":"email"}'

# Login with 2FA
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass","code":"123456"}'
```

## Next Steps

1. **Email Integration** - Configure email service for OTP delivery
2. **SMS Support** - Add SMS provider for 2FA
3. **Authenticator App** - Support TOTP with Google Authenticator
4. **Redis Integration** - Use Redis for distributed rate limiting
5. **Session Management** - Implement session revocation and device tracking

## Support

For issues or questions, refer to:
- [API_AUTHENTICATION.md](API_AUTHENTICATION.md) - API authentication details
- [SECURITY.md](SECURITY.md) - Security best practices
- [CONFIG.md](CONFIG.md) - Configuration guide

