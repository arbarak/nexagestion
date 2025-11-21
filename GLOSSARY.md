# 📖 NexaGestion Glossary

Key terms and definitions used throughout NexaGestion documentation and codebase.

## Business Terms

### Groupe (Group)
The top-level organizational unit containing multiple companies. Shared referentials (clients, suppliers, products) belong to the group level.

### Société (Company)
A business entity within a group. Operations (sales, purchases, stock) are isolated per company. A group typically has 4 companies.

### Client (Customer)
A business or individual that purchases products/services. Clients are shared at the group level. Clients can own multiple boats.

### Fournisseur (Supplier)
A business that provides products/services. Can be local (MAD) or foreign (EUR). Shared at group level.

### Bateau (Boat)
A maritime vessel owned by a client. Each boat belongs to exactly one client and one company. Used for maritime operations and interventions.

### Intervention
A technical service performed on a boat. Generates stock movements (BOAT_OUT/BOAT_IN) and is tracked by employee.

### Employé (Employee)
A person working for the company. Tracked at group level with company-specific assignments. Can have sessions and visits.

## Sales & Purchases Terms

### Devis (Quote)
A sales proposal sent to a customer. First step in sales flow.

### Commande (Order)
A confirmed purchase order from a customer. Follows a quote.

### Bon de Livraison (Delivery Note / BL)
A document confirming goods shipped to customer. Can trigger stock movement.

### Facture (Invoice)
A billing document sent to customer. Final step in sales flow.

### Avoir (Credit Note)
A document reducing customer debt. Used for returns or adjustments.

### Proforma
A preliminary invoice sent before goods are shipped.

### Achat (Purchase)
A purchase from a supplier. Can be local (MAD) or foreign (EUR).

### Fournisseur Étranger (Foreign Supplier)
A supplier outside Morocco, typically billing in EUR.

### Satellite / Téléphone
Subscription services (satellite, telephone) for boats, billed by foreign suppliers in EUR.

## Stock & Inventory Terms

### Dépôt (Warehouse)
A physical location storing inventory. Each company can have multiple warehouses.

### Stock
The quantity of a product in a warehouse. Tracked per product per warehouse per company.

### Mouvement de Stock (Stock Movement)
A transaction changing stock quantity. Types: ENTREE, SORTIE, TRANSFERT, AJUSTEMENT, INVENTAIRE, BOAT_OUT, BOAT_IN.

### Inventaire (Inventory Count)
A physical count of stock to verify theoretical quantities. Generates adjustment movements.

### BOAT_OUT
Stock movement when items leave warehouse for a boat.

### BOAT_IN
Stock movement when items return from a boat to warehouse.

## Financial Terms

### TVA (Value Added Tax)
Moroccan sales tax. Standard rates: 20%, 10%, 7%, 14%, 0%.

### TSP (Tax on Services)
Moroccan service tax. Standard rate: 4%.

### Taux de Change (Exchange Rate)
EUR to MAD conversion rate for foreign purchases.

### Paiement (Payment)
Money received from customer or paid to supplier. Can be partial or full.

### Allocation
Assignment of a payment to one or more invoices.

### Trésorerie (Treasury)
Cash management and payment tracking.

## Compliance Terms

### ICE (Identifiant Commun de l'Entreprise)
Moroccan business identification number.

### IF (Identifiant Fiscal)
Moroccan tax identification number.

### RC (Registre de Commerce)
Moroccan commercial registration number.

### Patente
Moroccan business license.

### CNSS (Caisse Nationale de Sécurité Sociale)
Moroccan social security number.

## Technical Terms

### companyId
Database identifier for a company. Used to isolate operations per company.

### groupId
Database identifier for a group. Used to identify shared referentials.

### RBAC (Role-Based Access Control)
Permission system based on user roles: ADMIN, MANAGER, STOCK, ACCOUNTANT, VIEWER.

### Middleware
Backend code that processes requests before they reach route handlers. Used for authentication and company context injection.

### ORM (Object-Relational Mapping)
Database abstraction layer. NexaGestion uses Prisma or Drizzle.

### Zod
TypeScript-first schema validation library used for API payload validation.

### Biome
Code formatter and linter replacing ESLint and Prettier.

### Nixpacks
Tool for building Docker images from source code.

### Dokploy
Deployment platform for hosting applications on VPS.

## Abbreviations

| Abbreviation | Meaning |
|--------------|---------|
| ERP | Enterprise Resource Planning |
| API | Application Programming Interface |
| UI | User Interface |
| UX | User Experience |
| DB | Database |
| JWT | JSON Web Token |
| HTTPS | Hypertext Transfer Protocol Secure |
| CSV | Comma-Separated Values |
| XLSX | Excel Spreadsheet Format |
| PDF | Portable Document Format |
| VPS | Virtual Private Server |
| CI/CD | Continuous Integration/Continuous Deployment |

