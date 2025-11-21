# 🤝 Contributing to NexaGestion

Guidelines for contributing code to NexaGestion.

## Getting Started

1. Read [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) to set up your environment
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
3. Read [GLOSSARY.md](GLOSSARY.md) to understand terminology
4. Check [TASKS.md](TASKS.md) for available tasks

## Branch Naming Convention

```
feature/description          # New feature
bugfix/description           # Bug fix
refactor/description         # Code refactoring
docs/description             # Documentation
chore/description            # Maintenance tasks
```

### Examples
```
feature/multi-company-switching
bugfix/stock-calculation-error
refactor/extract-payment-logic
docs/add-api-examples
chore/update-dependencies
```

## Commit Message Convention

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Tests
- `chore`: Build, dependencies, etc.

### Scope
- `auth`: Authentication
- `stock`: Stock management
- `sales`: Sales module
- `purchases`: Purchases module
- `boats`: Maritime module
- `employees`: Employee tracking
- `payments`: Payment management
- `reports`: Reporting
- `ui`: User interface
- `db`: Database

### Subject
- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at end
- Max 50 characters

### Examples
```
feat(sales): add invoice validation
fix(stock): correct quantity calculation
refactor(payments): extract allocation logic
docs(api): add authentication examples
test(stock): add movement tests
```

## Pull Request Process

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature
```

### 2. Make Changes
- Follow code style guidelines
- Write tests for new code
- Update documentation
- Run linter and formatter

### 3. Commit Changes
```bash
git add .
git commit -m "feat(scope): description"
```

### 4. Push to Remote
```bash
git push origin feature/your-feature
```

### 5. Create Pull Request
- Use PR template (see below)
- Link related issues
- Request reviewers
- Ensure CI/CD passes

### 6. Code Review
- Address reviewer comments
- Update PR as needed
- Ensure all checks pass

### 7. Merge
- Squash commits if needed
- Delete feature branch
- Close related issues

## Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] No breaking changes
```

## Code Style Guidelines

### TypeScript
```typescript
// ✅ Good
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ❌ Bad
const calculateTotal = (items) => {
  let total = 0
  for (let i = 0; i < items.length; i++) {
    total += items[i].price
  }
  return total
}
```

### Naming Conventions
- **Variables/Functions:** camelCase
- **Classes/Types:** PascalCase
- **Constants:** UPPER_SNAKE_CASE
- **Files:** kebab-case (except components: PascalCase)

### File Organization
```
feature/
  ├── components/
  │   ├── FeatureForm.tsx
  │   └── FeatureList.tsx
  ├── lib/
  │   ├── calculateFeature.ts
  │   └── validateFeature.ts
  ├── types.ts
  └── page.tsx
```

### Comments
```typescript
// ✅ Good: Explain WHY, not WHAT
// Calculate total with TVA because Moroccan law requires it
const total = subtotal * (1 + tvaRate)

// ❌ Bad: Obvious from code
// Add TVA to subtotal
const total = subtotal * (1 + tvaRate)
```

## Testing Requirements

### Unit Tests
- Write tests for business logic
- Aim for 80%+ coverage
- Test edge cases and errors

### Integration Tests
- Test API endpoints
- Test database operations
- Test multi-step workflows

### Running Tests
```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## Code Quality Checks

### Linting
```bash
npx biome lint
```

### Formatting
```bash
npx biome format
```

### Type Checking
```bash
npx tsc --noEmit
```

### All Checks
```bash
npm run lint
npm run format
npm run type-check
```

## Documentation Requirements

### Code Comments
- Document complex logic
- Explain business rules
- Add examples for utilities

### Commit Messages
- Clear, descriptive messages
- Reference related issues
- Explain WHY, not WHAT

### PR Description
- Explain changes clearly
- Link related issues
- Describe testing approach

### Update Docs
- Update ARCHITECTURE.md if structure changes
- Update API_SPEC.md if endpoints change
- Update DATABASE.md if schema changes
- Update TASKS.md if requirements change

## Performance Considerations

### Database Queries
- Use indexes effectively
- Avoid N+1 queries
- Paginate large result sets
- Use database views for complex queries

### Frontend
- Lazy load components
- Optimize images
- Minimize bundle size
- Use React.memo for expensive components

### Caching
- Cache API responses
- Use Redis for expensive operations
- Invalidate cache appropriately

## Security Checklist

- [ ] No secrets in code
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (use ORM)
- [ ] XSS prevention (sanitize output)
- [ ] CSRF protection enabled
- [ ] Authentication required for protected routes
- [ ] Authorization checked for sensitive operations
- [ ] Audit logging for important actions

## Deployment Checklist

- [ ] All tests pass
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] No breaking changes
- [ ] Performance acceptable
- [ ] Security review passed

## Getting Help

- Check [GLOSSARY.md](GLOSSARY.md) for terms
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for design
- Ask in team discussions
- Review similar code in codebase

