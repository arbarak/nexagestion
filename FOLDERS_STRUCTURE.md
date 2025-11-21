# FOLDERS_STRUCTURE.md — NexaGestion

Arborescence recommandée (Next.js 15 App Router):

```
app/
 ├─ (auth)/
 │   ├─ login/
 │   └─ layout.tsx
 ├─ (dashboard)/
 │   ├─ dashboard/
 │   ├─ clients/
 │   │   ├─ page.tsx
 │   │   └─ [id]/ (détail client + bateaux)
 │   ├─ suppliers/
 │   ├─ products/
 │   ├─ services/
 │   ├─ stock/
 │   │   ├─ warehouses/
 │   │   ├─ movements/
 │   │   ├─ transfers/
 │   │   └─ inventories/
 │   ├─ boats/
 │   ├─ employees/
 │   │   ├─ sessions/
 │   │   └─ visits/
 │   ├─ sales/
 │   │   ├─ quotes/
 │   │   ├─ orders/
 │   │   ├─ delivery-notes/
 │   │   ├─ invoices/
 │   │   └─ credit-notes/
 │   ├─ purchases/
 │   │   └─ foreign/ (SUPPLIES / SATELLITE)
 │   ├─ payments/
 │   ├─ reports/
 │   └─ settings/
 ├─ api/
 │   ├─ auth/
 │   ├─ clients/
 │   ├─ suppliers/
 │   ├─ products/
 │   ├─ services/
 │   ├─ stock/
 │   ├─ inventories/
 │   ├─ boats/
 │   ├─ employees/
 │   ├─ sales/
 │   ├─ purchases/
 │   ├─ payments/
 │   └─ reports/
 └─ layout.tsx

components/
 ├─ ui/              # shadcn/ui
 ├─ layout/          # sidebar, header, breadcrumbs
 ├─ tables/          # data tables réutilisables
 ├─ forms/           # formulaires zod/reac-hook-form
 ├─ charts/          # charts des rapports
 └─ pdf-preview/     # preview PDF in-app

lib/
 ├─ db/              # client Prisma/Drizzle
 ├─ auth/            # sessions + RBAC helpers
 ├─ stock/
 ├─ sales/
 ├─ purchases/
 ├─ boats/
 ├─ employees/
 ├─ reports/
 ├─ pdf/
 └─ utils/

templates/
 └─ invoice/
     ├─ invoice.html
     ├─ invoice.css
     └─ fonts/

prisma/
 ├─ schema.prisma
 ├─ seed.ts
 └─ migrations/

styles/
 ├─ globals.css
 └─ theme.css
```

Principes:
- **UI isolée des services métier**.
- **lib/** contient toute logique non‑UI.
- **templates/** pour PDF exact selon vos modèles.
