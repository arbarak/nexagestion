# 07 – Security & Compliance Rules

## Authentication

- Use secure password hashing (bcrypt or argon2).
- Never log passwords or sensitive tokens.

## Authorization

- Always check:
  - Is the user authenticated?
  - Does the user have the appropriate **role** for the **company**?
- RBAC must be enforced in all protected API routes.

## Data isolation

- All DB queries must be scoped by:
  - `companyId` for operations.
  - `groupId` for shared referentials.
- Do not return data from another company or group.

## Audit logging

- For critical operations, write to `AuditLog`:
  - Creation & validation of documents (sales, purchases)
  - Stock movements
  - Boat interventions
  - Employee/role changes

## Input sanitization

- Validate and sanitize all user input.
- Use zod schemas to avoid injection / invalid types.

## Backup & retention

- Respect backup rules defined in `TASKS.md` and `DEPLOYMENT.md`.
- Do not store secrets in code; use env variables.
