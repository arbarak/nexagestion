# 04 – Backend & API Rules

## API Organization

- All API routes live in `app/api/**`.
- Use Next.js route handlers (App Router style).
- Each domain should have a dedicated subfolder:
  - `/app/api/clients`
  - `/app/api/products`
  - `/app/api/stock`
  - `/app/api/boats`
  - `/app/api/employees`
  - `/app/api/sales`
  - `/app/api/purchases`
  - `/app/api/payments`
  - `/app/api/reports`

## Company context

- Every authenticated request must include a **companyId** in context (session or header).
- Do NOT trust `companyId` from client blindly; cross-check with user roles.

## Validation

- Use **zod** (or equivalent) to validate request bodies.
- Reject invalid payloads with clear error messages (`400`).

## Business rules

- When implementing endpoints, always check `TASKS.md` for the flow:
  - Devis → Commande → BL → Facture → Avoir
  - Stock movements on validation
  - Boat interventions mapping to stock movements
- Use dedicated helper modules:
  - `lib/stock/` for stock calculations.
  - `lib/sales/` for invoice totals and tax calculation.
  - `lib/reports/` for heavy reporting logic.

## Performance

- Use pagination for listing endpoints (clients, invoices, stock movements, etc.).
- Add indexes to columns mentioned in `DATABASE.md` when necessary (ID, date, companyId, clientId).
