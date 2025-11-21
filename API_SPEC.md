# API_SPEC.md — NexaGestion

Toutes les APIs sont sous `/api` (Next.js route handlers).  
Chaque endpoint :
- vérifie auth + RBAC
- dérive `companyId` depuis session
- valide payload (Zod)
- scoping strict par société/groupe

---

## 1. Auth
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET  `/api/auth/me`

## 2. Group / Companies
- GET  `/api/companies` *(sociétés accessibles par l’utilisateur)*
- POST `/api/companies` *(admin groupe)*
- PUT  `/api/companies/:id`
- GET  `/api/group/settings`

## 3. Référentiels (shared)
### Clients
- GET  `/api/clients`
- POST `/api/clients`
- PUT  `/api/clients/:id`
- DELETE `/api/clients/:id`
- GET  `/api/clients/:id/boats` *(liste bateaux du client)*

### Fournisseurs
- GET  `/api/suppliers`
- POST `/api/suppliers`
- PUT  `/api/suppliers/:id`
- DELETE `/api/suppliers/:id`
- GET  `/api/suppliers?isForeign=true`

### Produits / Services / Catégories / Marques
- GET/POST/PUT/DELETE `/api/products`
- GET/POST/PUT/DELETE `/api/services`
- GET/POST/PUT/DELETE `/api/categories`
- GET/POST/PUT/DELETE `/api/brands`
- GET/POST/PUT/DELETE `/api/taxrates`

## 4. Stock & Inventaires (isolated)
### Dépôts
- GET  `/api/warehouses`
- POST `/api/warehouses`
- PUT  `/api/warehouses/:id`
- DELETE `/api/warehouses/:id`

### Stock
- GET  `/api/stock` *(global par dépôt/article)*
- GET  `/api/stock/:productId`
- POST `/api/stock/transfer`
- POST `/api/stock/movement`
- GET  `/api/stock/movements`

### Inventaires
- GET  `/api/inventories`
- POST `/api/inventories`
- GET  `/api/inventories/:id`
- POST `/api/inventories/:id/validate`

## 5. Bateaux & interventions
- GET  `/api/boats`
- POST `/api/boats`
- PUT  `/api/boats/:id`
- DELETE `/api/boats/:id`
- GET  `/api/boats/:id/interventions`
- POST `/api/boats/:id/interventions`
- POST `/api/boats/:id/movement` *(BOAT_OUT/IN)*

## 6. Employés & tracking
- GET  `/api/employees`
- POST `/api/employees`
- PUT  `/api/employees/:id`
- DELETE `/api/employees/:id`

### Sessions
- POST `/api/employees/:id/sessions/start`
- POST `/api/employees/:id/sessions/end`
- GET  `/api/sessions`

### Visites
- GET  `/api/visits`
- POST `/api/visits`
- PUT  `/api/visits/:id`
- DELETE `/api/visits/:id`

### Audit
- GET `/api/audit`

## 7. Ventes
- GET  `/api/sales?type=QUOTE|ORDER|DELIVERY_NOTE|INVOICE|CREDIT_NOTE|PROFORMA`
- POST `/api/sales`
- GET  `/api/sales/:id`
- PUT  `/api/sales/:id`
- POST `/api/sales/:id/validate`
- POST `/api/sales/:id/convert` *(vers type suivant)*
- POST `/api/sales/:id/cancel`

### PDF
- GET `/api/invoices/:id/pdf`
- GET `/api/quotes/:id/pdf`
- GET `/api/delivery-notes/:id/pdf`
- GET `/api/credit-notes/:id/pdf`

## 8. Achats (locaux & étrangers)
- GET  `/api/purchases?type=...&kind=NORMAL|SUPPLIES|SATELLITE`
- POST `/api/purchases`
- GET  `/api/purchases/:id`
- PUT  `/api/purchases/:id`
- POST `/api/purchases/:id/validate`

### Liens satellite → facture locale
- POST `/api/purchases/:id/link-local-invoice`
- GET  `/api/purchases/:id/local-invoice`

## 9. Paiements
- GET  `/api/payments`
- POST `/api/payments`
- GET  `/api/payments/:id`
- PUT  `/api/payments/:id`
- DELETE `/api/payments/:id`

### Allocations fournisseurs étrangers
- POST `/api/payments/:id/allocate`
- DELETE `/api/payments/:id/allocations/:allocId`

## 10. Rapports
- GET `/api/reports/sales`
- GET `/api/reports/purchases`
- GET `/api/reports/stock`
- GET `/api/reports/treasury`
- GET `/api/reports/boats`
- GET `/api/reports/employees`
- GET `/api/reports/tax`
- GET `/api/reports/foreign-suppliers`
