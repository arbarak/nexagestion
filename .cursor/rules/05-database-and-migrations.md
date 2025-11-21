# 05 – Database & Migrations Rules

## ORM

- Use **Prisma** (or Drizzle if already chosen) as defined in `DATABASE.md`.
- Do NOT write raw SQL except for:
  - Performance-critical reports.
  - Custom aggregations that ORM can’t express easily.

## Schema modifications

- Any schema change must:
  - Stay consistent with the conceptual model in `DATABASE.md` & `TASKS.md`.
  - Preserve multi-company & group relations.
  - Not break required enums (SaleDocumentType, StockMovementType, etc.).

## Migrations

- Use `prisma migrate` (or Drizzle migrations) to evolve the schema.
- Never edit migration files manually after they’ve been applied in production.
- Keep schema and migrations under version control.

## Data rules

- **Never** remove `companyId` or `groupId` from existing tables.
- When adding new foreign keys, ensure `ON DELETE` behaviour is explicit and safe:
  - Prefer `RESTRICT` or `SET NULL` instead of `CASCADE` for critical business data.

## Reporting

- For heavy reports, prefer:
  - Views or materialized views (if needed).
  - Dedicated functions in `lib/reports/` rather than mixing logic in route handlers.
