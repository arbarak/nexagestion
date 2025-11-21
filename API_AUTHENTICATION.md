# 🔐 API Authentication & Authorization

Authentication and authorization strategy for NexaGestion APIs.

## Authentication Flow

### 1. Login
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": {
    "id": "user-1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "session": {
    "token": "eyJhbGc...",
    "expiresAt": "2024-12-21T10:00:00Z"
  }
}
```

### 2. Session Management
- Session stored in HTTPOnly cookie: `nexagestion_session`
- Token expires after 24 hours
- Refresh token available for extending session
- Logout clears session cookie

### 3. Protected Requests
```
GET /api/clients
Authorization: Bearer <session_token>
```

## Authorization (RBAC)

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access to all features and settings |
| **MANAGER** | Create/edit documents, manage users, view reports |
| **STOCK** | Manage inventory, stock movements, transfers |
| **ACCOUNTANT** | View/create payments, manage invoices, reports |
| **VIEWER** | Read-only access to all data |

### Permission Matrix

| Action | ADMIN | MANAGER | STOCK | ACCOUNTANT | VIEWER |
|--------|-------|---------|-------|------------|--------|
| Create Client | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Client | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Client | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Invoice | ✅ | ✅ | ❌ | ✅ | ❌ |
| Validate Invoice | ✅ | ✅ | ❌ | ✅ | ❌ |
| Create Payment | ✅ | ✅ | ❌ | ✅ | ❌ |
| Stock Movement | ✅ | ❌ | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |

## Multi-Company Context

### Company Selection
```
GET /api/companies
Response: [
  { id: "company-1", name: "Company A" },
  { id: "company-2", name: "Company B" }
]
```

### Setting Active Company
```
POST /api/auth/set-company
{
  "companyId": "company-1"
}
```

### Company Context in Requests
- Active company stored in session
- Automatically injected into all API requests
- Backend validates user has access to company
- All operations filtered by companyId

## API Request/Response Format

### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
X-Company-Id: company-1  # Optional, uses session default
```

### Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2024-12-21T10:00:00Z",
    "companyId": "company-1"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User not authenticated",
    "details": {}
  }
}
```

## Rate Limiting

### Limits by Endpoint Type
- **Auth endpoints:** 5 requests/minute per IP
- **Read endpoints:** 100 requests/minute per user
- **Write endpoints:** 30 requests/minute per user
- **Export endpoints:** 10 requests/minute per user

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703145600
```

### Rate Limit Exceeded
```
HTTP 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

## Security Best Practices

### 1. Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

### 2. Session Security
- HTTPOnly cookies (no JavaScript access)
- Secure flag (HTTPS only)
- SameSite=Strict
- CSRF token validation

### 3. Token Validation
- Verify token signature
- Check token expiration
- Validate user still exists
- Verify company access

### 4. Data Isolation
```typescript
// ✅ Correct: Filter by companyId
const clients = await prisma.client.findMany({
  where: { groupId: user.groupId }
})

// ❌ Wrong: No filtering
const clients = await prisma.client.findMany()
```

## API Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| UNAUTHORIZED | 401 | User not authenticated |
| FORBIDDEN | 403 | User lacks permission |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

## Testing Authentication

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:3000/api/clients \
  -H "Authorization: Bearer <token>"
```

### Test Rate Limiting
```bash
for i in {1..101}; do
  curl http://localhost:3000/api/clients
done
```

## Logout & Session Cleanup

### Logout
```
POST /api/auth/logout
Response: { "success": true }
```

### Session Cleanup
- Clear HTTPOnly cookie
- Invalidate token in database
- Log audit event
- Redirect to login page

