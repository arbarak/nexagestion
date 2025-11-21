# 02 – Architecture & Domain Rules

## Domain model (MUST respect)

Core concepts (see `TASKS.md` + `DATABASE.md`):

- Group & Companies : `Group`, `Company`
- Users & Roles : `User`, `UserCompanyRole`, RBAC
- Shared referential (level Group) :
  - `Client`, `Supplier`, `Product`, `Service`, `Category`, `Brand`, `TaxRate`
- Stock & Inventories :
  - `Warehouse`, `Stock`, `StockMovement`, `InventoryCount`, `InventoryLine`
- Maritime :
  - `Boat`, `BoatItemOperation`, `StockMovement` types `BOAT_OUT` / `BOAT_IN`
- Employees & tracking :
  - `Employee`, `EmployeeCompany`, `WorkSession`, `Visit`, `AuditLog`
- Sales :
  - `SaleDocument` (types: QUOTE, ORDER, DELIVERY_NOTE, INVOICE, CREDIT_NOTE, PROFORMA)
  - `SaleLine`
- Purchases :
  - `PurchaseDocument`, `PurchaseLine`
- Treasury & Accounting :
  - `Payment`, `AccountingExport`

Do **not** invent new domain entities if an equivalent already exists; extend the existing ones.

## Multi-sociétés rules

- All **operations** MUST include a `companyId` in DB and API.
- **Referentials** belong to `groupId` and are shared across companies.
- Do NOT mix data of different companies in a single record.

## Morocco-specific rules

- Respect ICE, IF, RC, Patente fields on `Company`, `Client`, `Supplier`.
- Support Moroccan TVA/TSP rates through `TaxRate` records.
- Respect invoice flows and legal requirements described in `TASKS.md`.

## Where to put code

- Domain logic: utility modules under `lib/` (e.g. `lib/stock`, `lib/sales`).
- API surface: `/app/api/**` routes.
- UI / screens: `/app/(dashboard)/...`.
