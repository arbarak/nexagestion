# DATABASE.md — NexaGestion

NexaGestion utilise PostgreSQL.  
Deux niveaux de données :
- **Groupe (shared)** : référentiels communs.
- **Société (isolated)** : opérations quotidiennes.

> Le schéma exact sera dans `schema.prisma` (ou Drizzle) et doit rester conforme aux règles de `TASKS.md`.

---

## 1. Tables Groupe (shared)

### 1.1 Group
- id (PK)
- name
- createdAt, updatedAt

### 1.2 Company
- id (PK)
- groupId (FK Group)
- name
- ICE, IF, RC, Patente, CNSS
- logoUrl
- address, city, country
- phone, email
- currency (MAD)
- accountingSettings (JSON)
- createdAt, updatedAt

### 1.3 User
- id (PK)
- email (unique)
- passwordHash
- firstName, lastName
- preferredLocale
- createdAt, updatedAt

### 1.4 UserCompanyRole
- id (PK)
- userId (FK User)
- companyId (FK Company)
- role (ADMIN, MANAGER, STOCK, ACCOUNTANT, VIEWER)

### 1.5 Client (shared)
- id (PK)
- groupId (FK Group)
- name
- address, city, country
- phone, email
- ICE, IF, RC, Patente (optionnels)
- notes
- createdAt, updatedAt

### 1.6 Supplier (shared)
- id (PK)
- groupId (FK Group)
- name
- country
- isForeign (bool)
- defaultCurrency (MAD/EUR)
- address, phone, email
- ICE, IF, RC, Patente (optionnels)
- notes
- createdAt, updatedAt

### 1.7 Category / Brand (shared)
- id (PK), groupId
- name
- active
- createdAt, updatedAt

### 1.8 Product (shared)
- id (PK), groupId
- categoryId (FK Category)
- brandId (FK Brand)
- name
- sku
- barcode
- minStock
- defaultPurchasePrice
- defaultSalePrice
- unit
- active
- createdAt, updatedAt

### 1.9 Service (shared)
- id (PK), groupId
- name
- defaultPriceHt
- active
- createdAt, updatedAt

### 1.10 TaxRate (shared)
- id (PK), groupId
- type (TVA, TSP)
- rate (ex 20, 4)
- active
- createdAt, updatedAt

---

## 2. Tables Société (isolated)

### 2.1 Warehouse
- id (PK)
- companyId (FK Company)
- name, address
- active

### 2.2 Stock
- id (PK)
- companyId
- warehouseId
- productId
- quantity
- UNIQUE(companyId, warehouseId, productId)

### 2.3 StockMovement
- id (PK)
- companyId
- warehouseId
- productId
- employeeId (nullable)
- boatId (nullable)
- type (ENTREE, SORTIE, TRANSFERT, AJUSTEMENT, INVENTAIRE, BOAT_OUT, BOAT_IN)
- direction (IN/OUT)
- quantity
- note
- createdAt
- Indexes: (companyId, createdAt), (productId), (boatId)

### 2.4 InventoryCount / InventoryLine
InventoryCount:
- id
- companyId, warehouseId
- status (DRAFT, VALIDATED)
- createdAt
InventoryLine:
- id
- inventoryCountId
- productId
- qtyTheorique
- qtyComptee
- ecart

### 2.5 Boat (client-owned)
- id (PK)
- companyId (FK Company)
- clientId (FK Client) **OBLIGATOIRE**
- name
- registration
- ownerName (optionnel)
- type
- notes
- createdAt, updatedAt

### 2.6 BoatItemOperation
- id
- companyId
- clientId (auto depuis boat)
- boatId
- employeeId
- warehouseId
- productId
- movementId (FK StockMovement)
- direction (IN/OUT)
- quantity
- date
- note

### 2.7 Employee / EmployeeCompany
Employee (shared niveau groupe):
- id, groupId
- firstName, lastName, cin, matricule
- phone, email, address
- jobTitle
- dateEntree, dateSortie
- status
EmployeeCompany:
- id
- employeeId
- companyId
- internalRole

### 2.8 WorkSession
- id
- employeeId
- companyId
- date
- startTime
- endTime
- type (PRESENCE, VISITE, TELETRAVAIL, AUTRE)
- notes

### 2.9 Visit
- id
- employeeId
- companyId
- clientId (nullable)
- supplierId (nullable)
- date
- type (COMMERCIALE, RECOUVREMENT, TECHNIQUE, AUTRE)
- objectif
- compteRendu

### 2.10 AuditLog
- id
- companyId
- userId/employeeId
- actionType
- entityType
- entityId
- timestamp
- metadata (JSON)

### 2.11 SaleDocument / SaleLine
SaleDocument:
- id
- companyId
- clientId
- boatId (nullable, doit appartenir au client)
- type (QUOTE, ORDER, DELIVERY_NOTE, INVOICE, CREDIT_NOTE, PROFORMA)
- status (DRAFT, VALIDATED, CANCELLED, PAID, PARTIALLY_PAID)
- number
- issueDate, dueDate
- globalDiscount
- currency (MAD)
- notes
- totalHt, totalTva, totalTsp, totalTtc
- linkedDocumentId (avoir→facture)
- createdById
SaleLine:
- id
- saleDocumentId
- productId (nullable)
- serviceId (nullable)
- description
- quantity
- unitPriceHt
- discount
- taxRateId
- totalHt, totalTva, totalTsp, totalTtc

### 2.12 PurchaseDocument / PurchaseLine
PurchaseDocument:
- id
- companyId
- supplierId
- type (PURCHASE_ORDER, SUPPLIER_DELIVERY, SUPPLIER_INVOICE)
- kind (NORMAL, SUPPLIES, SATELLITE)
- number / invoiceNumber
- issueDate, dueDate
- currency (MAD/EUR)
- totalHt, totalTva, totalTtc
- totalAmountEur (si EUR)
- boatId (nullable si SATELLITE)
- exchangeRate (nullable si EUR)
- amountMad (nullable si SATELLITE)
- notes
PurchaseLine:
- id
- purchaseDocumentId
- productId/serviceId
- description
- quantity
- unitPriceHt
- discount
- taxRateId
- totalHt, totalTva, totalTtc

### 2.13 SatelliteInvoiceLink
- id
- companyId
- satellitePurchaseId (FK PurchaseDocument kind=SATELLITE)
- saleDocumentId (FK SaleDocument INVOICE)
- localSaleDate
- localSaleNumber
- localAmountMad
- note

### 2.14 Payment / PaymentAllocation
Payment:
- id
- companyId
- kind (CLIENT, FOURNISSEUR)
- mode (ESPECES, CHEQUE, VIREMENT, CARTE, AUTRE)
- currency (MAD/EUR)
- amount
- date
- notes
- saleDocumentId (nullable)
- purchaseDocumentId (nullable)
PaymentAllocation:
- id
- companyId
- paymentId
- purchaseDocumentId
- allocatedAmount

---

## 3. Indexes & performance
- Index obligatoires :
  - companyId sur toutes les tables isolées
  - groupId sur toutes les tables partagées
  - dates sur SaleDocument, PurchaseDocument, StockMovement, WorkSession, Visit
  - clientId sur Boat, SaleDocument
  - supplierId sur PurchaseDocument
- Utiliser vues/materialized views pour rapports lourds (si nécessaire).
