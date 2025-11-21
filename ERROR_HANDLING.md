# ⚠️ Error Handling & Validation

Standardized error handling and validation patterns for NexaGestion.

## HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | User not authenticated |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |
| 503 | Service Unavailable | Database/service down |

## Error Response Format

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "email": "Invalid email format",
      "quantity": "Must be greater than 0"
    }
  }
}
```

### Error Codes
```
VALIDATION_ERROR      - Input validation failed
UNAUTHORIZED          - User not authenticated
FORBIDDEN             - User lacks permission
NOT_FOUND             - Resource not found
CONFLICT              - Resource already exists
RATE_LIMITED          - Too many requests
DATABASE_ERROR        - Database operation failed
EXTERNAL_SERVICE_ERROR - External API failed
INVALID_STATE         - Operation invalid for current state
BUSINESS_RULE_VIOLATION - Business logic violated
```

## Validation with Zod

### Schema Definition
```typescript
import { z } from 'zod'

const createClientSchema = z.object({
  name: z.string().min(1, 'Name required').max(255),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+?[0-9]{10,}/, 'Invalid phone'),
  ice: z.string().optional(),
})

type CreateClientInput = z.infer<typeof createClientSchema>
```

### Validation in API Route
```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = createClientSchema.parse(body)
    
    // Process valid data
    const client = await createClient(data)
    return Response.json(client, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.flatten().fieldErrors
        }
      }, { status: 422 })
    }
    throw error
  }
}
```

## Business Logic Validation

### Validate Business Rules
```typescript
// ✅ Good: Check business rules
if (boat.clientId !== client.id) {
  throw new Error('Boat does not belong to client')
}

if (stock.quantity < quantity) {
  throw new Error('Insufficient stock')
}

if (invoice.status !== 'DRAFT') {
  throw new Error('Can only edit draft invoices')
}
```

### Custom Error Classes
```typescript
class ValidationError extends Error {
  constructor(message: string, public details: Record<string, string>) {
    super(message)
    this.name = 'ValidationError'
  }
}

class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BusinessRuleError'
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`)
    this.name = 'NotFoundError'
  }
}
```

## Error Handling in API Routes

### Try-Catch Pattern
```typescript
export async function POST(req: Request) {
  try {
    // Validate input
    const data = schema.parse(await req.json())
    
    // Check permissions
    const user = await getUser()
    if (!user) throw new UnauthorizedError()
    
    // Execute business logic
    const result = await service.create(data)
    
    // Return success
    return Response.json(result, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

function handleError(error: unknown) {
  if (error instanceof z.ZodError) {
    return Response.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        details: error.flatten().fieldErrors
      }
    }, { status: 422 })
  }
  
  if (error instanceof UnauthorizedError) {
    return Response.json({
      success: false,
      error: { code: 'UNAUTHORIZED' }
    }, { status: 401 })
  }
  
  if (error instanceof NotFoundError) {
    return Response.json({
      success: false,
      error: { code: 'NOT_FOUND', message: error.message }
    }, { status: 404 })
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error)
  return Response.json({
    success: false,
    error: { code: 'SERVER_ERROR' }
  }, { status: 500 })
}
```

## Client-Side Error Handling

### Display User-Friendly Messages
```typescript
async function submitForm(data) {
  try {
    const response = await fetch('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      
      if (error.error.code === 'VALIDATION_ERROR') {
        // Show field-level errors
        Object.entries(error.error.details).forEach(([field, message]) => {
          showFieldError(field, message)
        })
      } else {
        // Show generic error
        showToast(error.error.message, 'error')
      }
      return
    }
    
    showToast('Client created successfully', 'success')
  } catch (error) {
    showToast('Network error', 'error')
  }
}
```

## Validation Rules by Entity

### Client
- Name: required, max 255 chars
- Email: valid email format
- Phone: valid phone format
- ICE: optional, valid format if provided

### Invoice
- ClientId: required, must exist
- Lines: at least 1 line required
- Quantities: must be > 0
- Prices: must be >= 0
- Status: must be DRAFT to edit

### Stock Movement
- ProductId: required, must exist
- Quantity: must be > 0
- WarehouseId: required, must exist
- Type: must be valid movement type

### Payment
- Amount: must be > 0
- Date: must be valid date
- Mode: must be valid payment mode
- InvoiceId: must exist if provided

## Logging Errors

### Error Logging Pattern
```typescript
import { logger } from '@/lib/logger'

try {
  // Operation
} catch (error) {
  logger.error('Operation failed', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context: { userId, companyId, action: 'create_invoice' }
  })
  
  throw error
}
```

## Testing Error Scenarios

### Test Validation Errors
```typescript
it('should reject invalid email', async () => {
  const response = await POST({
    email: 'invalid-email'
  })
  
  expect(response.status).toBe(422)
  expect(response.body.error.code).toBe('VALIDATION_ERROR')
})
```

### Test Business Rule Violations
```typescript
it('should reject insufficient stock', async () => {
  const response = await POST({
    productId: 'prod-1',
    quantity: 1000 // More than available
  })
  
  expect(response.status).toBe(400)
  expect(response.body.error.code).toBe('BUSINESS_RULE_VIOLATION')
})
```

## Error Recovery

### Retry Logic
```typescript
async function retryOperation(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}
```

### Graceful Degradation
- Show cached data if API fails
- Disable features if dependencies unavailable
- Queue operations for retry
- Notify user of temporary issues

