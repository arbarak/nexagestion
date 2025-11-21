# 🧪 Testing Strategy & Guidelines

Comprehensive testing approach for NexaGestion.

## Testing Pyramid

```
        E2E Tests (10%)
       Integration Tests (30%)
      Unit Tests (60%)
```

## Unit Tests (60%)

**Framework:** Vitest or Jest  
**Location:** `__tests__/` or `.test.ts` files next to source  
**Coverage Target:** 80%+

### What to Test
- Business logic in `lib/` modules
- Utility functions
- Validation schemas (Zod)
- Calculations (stock, taxes, totals)

### Example Structure
```
lib/
  stock/
    calculateStock.ts
    calculateStock.test.ts
  sales/
    calculateTotals.ts
    calculateTotals.test.ts
```

### Running Unit Tests
```bash
npm run test
npm run test:watch
npm run test:coverage
```

## Integration Tests (30%)

**Framework:** Vitest + Prisma Test Utils  
**Location:** `__tests__/integration/`  
**Coverage Target:** Key workflows

### What to Test
- API endpoints with database
- Multi-step workflows (Quote → Invoice)
- Stock movements with inventory
- Payment allocations
- Multi-company isolation

### Test Database Setup
```bash
# Use separate test database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexagestion_test"
npx prisma migrate deploy
```

### Running Integration Tests
```bash
npm run test:integration
```

## E2E Tests (10%)

**Framework:** Playwright or Cypress  
**Location:** `e2e/`  
**Coverage Target:** Critical user flows

### What to Test
- User login/logout
- Create and validate invoice
- Multi-company switching
- Stock transfer workflow
- Payment allocation

### Running E2E Tests
```bash
npm run test:e2e
npm run test:e2e:ui  # Interactive mode
```

## API Testing

### Manual Testing
Use Thunder Client or Postman:
- Import API collection from `docs/api.postman_collection.json`
- Test endpoints with various payloads
- Verify error responses

### Automated API Tests
```bash
# Run API integration tests
npm run test:api
```

## Test Coverage

### Coverage Goals
- **Overall:** 80%+
- **Critical paths:** 95%+
- **UI components:** 60%+

### Generate Coverage Report
```bash
npm run test:coverage
```

### Coverage Thresholds
```json
{
  "branches": 80,
  "functions": 80,
  "lines": 80,
  "statements": 80
}
```

## Testing Best Practices

### 1. Test Naming
```typescript
// ✅ Good
describe('calculateStockTotal', () => {
  it('should return sum of all warehouse quantities', () => {})
  it('should return 0 when no stock exists', () => {})
})

// ❌ Bad
describe('stock', () => {
  it('works', () => {})
})
```

### 2. Test Organization
```typescript
describe('SaleDocument', () => {
  describe('validation', () => {
    it('should require clientId', () => {})
  })
  
  describe('calculations', () => {
    it('should calculate total with TVA', () => {})
  })
})
```

### 3. Arrange-Act-Assert Pattern
```typescript
it('should calculate invoice total correctly', () => {
  // Arrange
  const lines = [
    { quantity: 2, unitPrice: 100, taxRate: 0.2 }
  ]
  
  // Act
  const total = calculateTotal(lines)
  
  // Assert
  expect(total).toBe(240) // 2 * 100 * 1.2
})
```

### 4. Mock External Dependencies
```typescript
// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    client: {
      findUnique: vi.fn()
    }
  }
}))
```

### 5. Test Data Factories
```typescript
// Use factories for consistent test data
const createTestClient = (overrides = {}) => ({
  id: 'client-1',
  name: 'Test Client',
  ...overrides
})
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:integration
      - run: npm run test:e2e
```

## Test Maintenance

### Regular Tasks
- [ ] Update tests when features change
- [ ] Remove obsolete tests
- [ ] Refactor flaky tests
- [ ] Review coverage reports monthly
- [ ] Update test data factories

### Debugging Tests
```bash
# Run single test file
npm run test -- calculateStock.test.ts

# Run tests matching pattern
npm run test -- --grep "should calculate"

# Debug mode
node --inspect-brk ./node_modules/.bin/vitest
```

## Performance Testing

### Load Testing
- Use k6 or Artillery for API load tests
- Test with realistic data volumes
- Monitor response times and errors

### Database Query Performance
- Use `EXPLAIN ANALYZE` for slow queries
- Monitor query execution times
- Add indexes as needed

## Accessibility Testing

### Manual Testing
- Test keyboard navigation
- Verify color contrast
- Test with screen readers

### Automated Testing
```bash
npm run test:a11y
```

## Security Testing

### OWASP Top 10
- [ ] SQL Injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Authentication bypass
- [ ] Authorization bypass

### Running Security Tests
```bash
npm run test:security
```

## Test Reporting

### Coverage Report
```bash
npm run test:coverage
# Opens coverage/index.html
```

### Test Results
- View in CI/CD pipeline
- Generate HTML reports
- Track trends over time

