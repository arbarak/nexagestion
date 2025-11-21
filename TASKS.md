# 📘 tasks.md — NexaGestion (ERP Web App)

Tech stack (cible) :
- Frontend / Backend : Next.js 15 (App Router) + TypeScript
- UI : Tailwind CSS + shadcn/ui
- ORM : Prisma (ou Drizzle, mais un seul ORM choisi)
- DB : PostgreSQL
- Cache / Jobs : Redis (optionnel au début)
- Déploiement : Nixpacks → Dokploy sur VPS Ubuntu
- OS serveur : Ubuntu (VPS), développement : Windows 11 (VS Code)
- Langue par défaut : Français
- Qualité code : **Biome** (formatter + linter unique)

Domaine métier :
- Groupe de sociétés (4 sociétés)
- Référentiels partagés au niveau Groupe (clients, fournisseurs, articles, services…)
- Données opérationnelles isolées par Société (ventes, achats, stock, paiements, rapports)
- Module Maritime : bateaux par client + interventions + stock
- Suivi des employés (temps, activités, visites)
- Ventes (devis, commandes, BL, factures, avoirs)
- Achats, y compris fournisseurs étrangers (EUR) et satellite / téléphonie
- Trésorerie & paiements (y compris paiements partiels / multi-factures)
- Rapports avancés
- Conformité Maroc (ICE, IF, RC, Patente, TVA/TSP, journaux)

---

## 0. Initialisation du projet

- [ ] Créer le repo Git `nexagestion`
- [ ] Initialiser Next.js 15 (App Router + TypeScript)
- [ ] Installer Tailwind CSS
- [ ] Installer shadcn/ui et initialiser un thème de base
- [ ] Installer & configurer **Biome** :
  - [ ] Fichier `biome.json`
  - [ ] Scripts NPM : `lint`, `format`
- [ ] Créer la structure :
  - [ ] `app/(auth)` (login)
  - [ ] `app/(dashboard)` (backoffice)
  - [ ] `app/api/**` (API)
  - [ ] `components/`, `lib/`, `prisma/`
- [ ] Mettre en place i18n (locale par défaut : `fr`)
- [ ] Layout global :
  - [ ] Sidebar (menu)
  - [ ] Header (sélecteur société, thème, user)

---

## 1. Architecture multi-sociétés & référentiels partagés

### 1.1 Groupe / Société

- [ ] `Group` :
  - [ ] id, name, createdAt, updatedAt
- [ ] `Company` :
  - [ ] id, groupId
  - [ ] name
  - [ ] ICE, IF, RC, Patente, CNSS
  - [ ] logoUrl
  - [ ] address, city, country (Maroc par défaut)
  - [ ] phone, email
  - [ ] currency (MAD)
  - [ ] accountingSettings (JSON)

### 1.2 Utilisateurs & rôles

- [ ] `User` :
  - [ ] id, email, passwordHash
  - [ ] firstName, lastName
  - [ ] preferredLocale
- [ ] `UserCompanyRole` :
  - [ ] userId, companyId, role (ADMIN, MANAGER, STOCK, ACCOUNTANT, VIEWER)
- [ ] Auth :
  - [ ] Login/logout
  - [ ] Session + protection routes `/app/(dashboard)/**`

### 1.3 Référentiels partagés (niveau Groupe)

- [ ] `Client` (groupId) :
  - [ ] infos légales possibles : ICE/IF/RC/Patente, adresse, téléphone, email…
- [ ] `Supplier` (groupId) :
  - [ ] locaux & étrangers
  - [ ] champs : name, country, isForeign (bool), defaultCurrency (MAD/EUR), ICE/IF/RC/Patente si applicable
- [ ] `Category` (groupId)
- [ ] `Brand` (groupId)
- [ ] `Product` (groupId) :
  - [ ] categoryId, brandId, SKU, barcode
  - [ ] minStock
  - [ ] defaultPurchasePrice, defaultSalePrice
- [ ] `Service` (groupId) :
  - [ ] prix par défaut
- [ ] `TaxRate` (groupId) :
  - [ ] type (TVA, TSP, AUTRE)
  - [ ] rate
  - [ ] active

> Règle : référentiels partagés au niveau Groupe, avec possibilité d’activer/désactiver par société si besoin.

### 1.4 Contexte Société

- [ ] Sélecteur de société dans le header
- [ ] Middleware backend pour injecter `companyId` dans toutes les requêtes authentifiées
- [ ] Toutes les requêtes DB pour les opérations **doivent** être filtrées par `companyId`
- [ ] Référentiels filtrés par `groupId` + règles de visibilité par société

---

## 2. Conformité Maroc (fiscalité & légale)

- [ ] ICE, IF, RC, Patente, CNSS sur `Company`
- [ ] Affichage sur documents (factures, avoirs, etc.)
- [ ] Configuration TVA/TSP :
  - [ ] Taux standards Maroc (20, 10, 7, 14, 0) + TSP 4% services
- [ ] Page "Paramètres fiscaux" par société :
  - [ ] Activation/désactivation de certains taux
- [ ] Rapport TVA par période :
  - [ ] Synthèse TVA collectée par taux
- [ ] Préparation facturation électronique (plus tard) :
  - [ ] Génération JSON/XML de facture
- [ ] Archivage légal :
  - [ ] Factures validées verrouillées en édition après délai
  - [ ] Conservation PDF & données ≥10 ans

---

## 3. Stock & inventaire

### 3.1 Modèles

- [ ] `Warehouse` :
  - [ ] companyId, name, address, active
- [ ] `Stock` :
  - [ ] companyId, warehouseId, productId, quantity
- [ ] `StockMovement` :
  - [ ] companyId, warehouseId, productId
  - [ ] employeeId (nullable)
  - [ ] boatId (nullable)
  - [ ] type (ENTREE, SORTIE, TRANSFERT, AJUSTEMENT, INVENTAIRE, BOAT_OUT, BOAT_IN)
  - [ ] direction (IN/OUT)
  - [ ] quantity
  - [ ] note
  - [ ] createdAt

### 3.2 Inventaires

- [ ] `InventoryCount` :
  - [ ] companyId, warehouseId, status (DRAFT, VALIDATED)
- [ ] `InventoryLine` :
  - [ ] inventoryCountId, productId, qtyTheorique, qtyComptee, ecart
- [ ] Logique :
  - [ ] Création d’un inventaire (snapshot)
  - [ ] Saisie des quantités
  - [ ] Validation → mouvements d’ajustement

### 3.3 Services utilitaires stock (`lib/stock`)

- [ ] Récupérer stock courant (par produit et dépôt)
- [ ] Appliquer un mouvement (mise à jour `Stock`)
- [ ] Vérifier minStock et générer alertes

### 3.4 UI stock

- [ ] Page "Stock global"
- [ ] Page "Mouvements de stock"
- [ ] Page "Transferts"
- [ ] Module "Inventaires"

---

## 4. Module Bateaux & lien clients

### 4.1 Règle métier : client ↔ bateaux

- Chaque **client** peut posséder **plusieurs bateaux**
- Chaque **bateau** appartient **obligatoirement** à un client (`clientId` obligatoire)
- Chaque bateau est aussi lié à une société via `companyId` (exploitation & rapports par société)

### 4.2 Modèles

- [ ] `Boat` :
  - [ ] companyId
  - [ ] clientId (OBLIGATOIRE)
  - [ ] name
  - [ ] registration
  - [ ] ownerName (en plus du client si besoin)
  - [ ] type (chalutier, plaisance…)
  - [ ] notes
- [ ] `BoatItemOperation` :
  - [ ] boatId
  - [ ] employeeId
  - [ ] companyId
  - [ ] clientId (rempli automatiquement depuis le bateau)
  - [ ] productId
  - [ ] warehouseId
  - [ ] movementId (FK vers `StockMovement`)
  - [ ] direction (IN/OUT)
  - [ ] quantity
  - [ ] date
  - [ ] note

### 4.3 Intégration dans les flux

- Lors de la création d’une facture ou intervention :
  - [ ] Choix du **client** en premier
  - [ ] Bateaux proposés = `Boat` où `clientId = client sélectionné` et `companyId = société courante`
- Les mouvements `BOAT_OUT` et `BOAT_IN` doivent :
  - [ ] Affecter le stock
  - [ ] Enregistrer l’employé, le bateau, le client, le dépôt

### 4.4 UI bateaux

- [ ] Dans la fiche client :
  - [ ] Section "Bateaux du client" (liste + ajouter/modifier)
- [ ] Page "Bateaux" générale :
  - [ ] Filtres : société, client, nom, immatriculation
- [ ] Page "Détail bateau" :
  - [ ] Informations générales
  - [ ] Onglet "Interventions & articles"
- [ ] Page "Mouvements bateaux" :
  - [ ] Formulaire pour BOAT_OUT/IN
  - [ ] Historique filtré (bateau, client, employé, produit)

---

## 5. Suivi des employés

### 5.1 Modèles

- [ ] `Employee` (niveau Groupe) :
  - [ ] groupId
  - [ ] firstName, lastName
  - [ ] cin, matricule
  - [ ] phone, email, address
  - [ ] jobTitle
  - [ ] dateEntree, dateSortie
  - [ ] status (ACTIVE/INACTIVE)
- [ ] `EmployeeCompany` :
  - [ ] employeeId, companyId, internalRole
- [ ] Lien `User` → `Employee` (facultatif mais recommandé)

### 5.2 AuditLog

- [ ] `AuditLog` :
  - [ ] companyId, userId (ou employeeId)
  - [ ] actionType, entityType, entityId
  - [ ] timestamp
  - [ ] metadata (JSON)
- [ ] Enregistrer:
  - [ ] Création/modification/suppression clients, fournisseurs
  - [ ] Devis, BL, factures, avoirs
  - [ ] Achats
  - [ ] Mouvements stock, inventaires
  - [ ] Paiements
  - [ ] Interventions bateaux

### 5.3 Sessions de travail

- [ ] `WorkSession` :
  - [ ] employeeId, companyId
  - [ ] date
  - [ ] startTime, endTime
  - [ ] type (PRESENCE, VISITE, TELETRAVAIL, AUTRE)
  - [ ] notes

### 5.4 Visites

- [ ] `Visit` :
  - [ ] employeeId, companyId
  - [ ] clientId ou supplierId
  - [ ] date
  - [ ] type (COMMERCIALE, RECOUVREMENT, TECHNIQUE, AUTRE)
  - [ ] objectif
  - [ ] compteRendu

### 5.5 UI

- [ ] "Référentiel → Employés"
- [ ] "Suivi → Activités"
- [ ] "Suivi → Temps de travail"
- [ ] "Suivi → Visites"
- [ ] "Suivi → Interventions bateaux" (par employé)

---

## 6. Ventes : Devis, BL, Factures, Avoirs

### 6.1 Modèles

- [ ] `SaleDocument` :
  - [ ] companyId
  - [ ] clientId (OBLIGATOIRE)
  - [ ] boatId (optionnel, mais si présent, doit appartenir au client)
  - [ ] type (QUOTE, ORDER, DELIVERY_NOTE, INVOICE, CREDIT_NOTE, PROFORMA)
  - [ ] status (DRAFT, VALIDATED, CANCELLED, PAID, PARTIALLY_PAID)
  - [ ] number
  - [ ] issueDate, dueDate
  - [ ] globalDiscount
  - [ ] currency (MAD)
  - [ ] notes
  - [ ] totalHt, totalTva, totalTsp, totalTtc
  - [ ] linkedDocumentId (pour Avoir → Facture)
  - [ ] createdById
- [ ] `SaleLine` :
  - [ ] saleDocumentId
  - [ ] productId / serviceId
  - [ ] description
  - [ ] quantity
  - [ ] unitPriceHt
  - [ ] discount
  - [ ] taxRateId
  - [ ] totalHt, totalTva, totalTsp, totalTtc

### 6.2 Flux

- [ ] Devis → Commande
- [ ] Devis → Facture
- [ ] Commande → BL
- [ ] BL → Facture
- [ ] Facture → Avoir (partiel/total)

### 6.3 Intégration stock

- [ ] BL / Facture validée → mouvements SORTIE
- [ ] Avoir avec retour → mouvements ENTREE

### 6.4 UI ventes

- [ ] Listes : Devis, Commandes, BL, Factures, Avoirs
- [ ] Formulaire ventes :
  - [ ] Sélection client
  - [ ] Liste bateaux du client
  - [ ] Articles + services
  - [ ] Remises ligne + globale
  - [ ] Taxes par ligne
  - [ ] Choix dépôt pour sortie stock

### 6.5 Gabarits PDF (factures, etc.)

- [ ] Reproduire EXACTEMENT les templates PDF fournis pour factures :
  - [ ] `EXAMPLE FACTURE.pdf` (rempli)
  - [ ] `empty template.pdf` (gabarit)
- [ ] Implémenter :
  - [ ] `templates/invoice/invoice.html`
  - [ ] `templates/invoice/invoice.css`
  - [ ] `lib/pdf/generateInvoice.ts` (HTML → PDF avec Puppeteer ou équivalent)
  - [ ] `lib/pdf/amountToWordsFR.ts` (montant → texte : dirhams + centimes)
- [ ] Route API `/api/invoices/[id]/pdf`
- [ ] Boutons "Télécharger PDF" / "Prévisualiser"
- [ ] Gérer multi-pages (header/footer répétés)

---

## 7. Fournisseurs étrangers & abonnements satellite / téléphonie

Objectif : suivre **séparément** :

1. Achats de **fournitures** auprès de fournisseurs étrangers (en EUR)  
2. Factures de **téléphone / satellite** par bateau (en EUR)  
3. **Paiements** vers ces fournisseurs (paiements partiels, un paiement pour plusieurs factures)  
4. **Re-facturation locale** (conversion) vers bateaux/clients en MAD  

### 7.1 Extension du modèle Fournisseur

- [ ] `Supplier` :
  - [ ] isForeign (bool)
  - [ ] country
  - [ ] defaultCurrency (MAD, EUR)
- [ ] Filtrage :
  - [ ] Fournisseurs locaux
  - [ ] Fournisseurs étrangers

### 7.2 Factures fournisseurs étrangers – Fournitures (SUPPLIES)

Utiliser `PurchaseDocument` avec :

- type = `SUPPLIER_INVOICE`
- champ `kind` = `SUPPLIES`

Champs principaux :

- [ ] supplierId (fournisseur étranger)
- [ ] issueDate
- [ ] invoiceNumber (numéro facture fournisseur)
- [ ] currency = EUR
- [ ] totalAmountEur
- [ ] optional : globalExchangeRate (info)

UI :

- [ ] Formulaire simple : date, numéro, société, fournisseur, montant en EUR
- [ ] Lignes détaillées optionnelles si besoin

### 7.3 Factures téléphonie / satellite (par bateau)

Toujours via `PurchaseDocument` :

- type = `SUPPLIER_INVOICE`  
- kind = `SATELLITE`

Champs spécifiques :

- [ ] supplierId (fournisseur satellite étranger)
- [ ] issueDate (date facture)
- [ ] invoiceNumber (numéro facture fournisseur)
- [ ] boatId (bateau concerné)
- [ ] amountEur (montant facture en EUR)
- [ ] exchangeRate (taux de change EUR→MAD utilisé)
- [ ] amountMad (montant converti – base pour compta)
- [ ] notes

### 7.4 Re-facturation locale (conversion → facture client)

Pour chaque facture satellite fournisseur, on veut suivre la re-facturation locale (en dirhams) au client/bateau.

- [ ] Ajouter lien entre facture fournisseur satellite et facture client locale :
  - [ ] `SatelliteInvoiceLink` (ou champ direct) :
    - [ ] satellitePurchaseId
    - [ ] saleDocumentId (facture locale)
    - [ ] localSaleDate
    - [ ] localSaleNumber
    - [ ] localAmountMad
    - [ ] note
- [ ] Facture locale :
  - [ ] `SaleDocument` type INVOICE
  - [ ] clientId = propriétaire du bateau
  - [ ] boatId
  - [ ] lignes service satellite

### 7.5 Paiements fournisseurs étrangers (EUR) – gestion avancée

On doit gérer :

- plusieurs paiements pour une facture (paiement partiel)
- un paiement unique couvrant plusieurs factures

Implémentation :

- [ ] `Payment` :
  - [ ] kind = FOURNISSEUR
  - [ ] currency (EUR ou MAD)
  - [ ] amount, date, mode, notes
- [ ] `PaymentAllocation` (nouvelle table) :
  - [ ] paymentId
  - [ ] purchaseDocumentId (facture fournisseur)
  - [ ] allocatedAmount (montant affecté à cette facture)
- [ ] Logique :
  - [ ] Solde facture = total facture - somme allocations
  - [ ] Solde paiement = amount - somme allocations
- [ ] UI :
  - [ ] Depuis une facture fournisseur :
    - [ ] Voir paiements liés
    - [ ] Créer une allocation
  - [ ] Depuis un paiement :
    - [ ] Répartir sur plusieurs factures du même fournisseur

### 7.6 Reporting fournisseurs étrangers

- [ ] Rapport "Fournisseurs étrangers – Fournitures" :
  - [ ] Factures en EUR par période/fournisseur
  - [ ] Paiements & soldes
- [ ] Rapport "Fournisseurs étrangers – Satellite / Téléphone" :
  - [ ] Factures par bateau/fournisseur/période
  - [ ] Taux de change & montants EUR vs MAD
  - [ ] Lien avec factures locales (montant re-facturé)

---

## 8. Achats (général)

- [ ] `PurchaseDocument` :
  - [ ] companyId, supplierId
  - [ ] type (PURCHASE_ORDER, SUPPLIER_DELIVERY, SUPPLIER_INVOICE)
  - [ ] kind (NORMAL, SUPPLIES, SATELLITE, etc.)
  - [ ] number, issueDate, dueDate, notes
  - [ ] currency (MAD ou EUR)
  - [ ] totalHt, totalTva, totalTtc, totalAmountEur (si applicable)
- [ ] `PurchaseLine` :
  - [ ] purchaseDocumentId
  - [ ] productId / serviceId
  - [ ] description
  - [ ] quantity
  - [ ] unitPriceHt
  - [ ] discount
  - [ ] taxRateId
  - [ ] totalHt, totalTva, totalTtc
- [ ] Flux locaux :
  - [ ] Commande → BL fournisseur → Facture fournisseur
  - [ ] Entrées stock sur BL ou Facture (paramétrable)
- [ ] UI Achats :
  - [ ] Listes & formulaires pour commandes, BL, factures
  - [ ] Filtres : fournisseur local/étranger, kind (SUPPLIES/SATELLITE)

---

## 9. Trésorerie & paiements

- [ ] `Payment` (général) :
  - [ ] companyId
  - [ ] kind (CLIENT, FOURNISSEUR)
  - [ ] mode (ESPECES, CHEQUE, VIREMENT, CARTE, AUTRE)
  - [ ] currency (MAD, EUR)
  - [ ] amount
  - [ ] date
  - [ ] notes
- [ ] Clients :
  - [ ] Lien direct Payment ↔ SaleDocument ou modèle d’allocation similaire à fournisseurs
- [ ] Fournisseurs étrangers :
  - [ ] Utiliser `PaymentAllocation` (section 7.5)
- [ ] Journaux :
  - [ ] Caisse
  - [ ] Banque
- [ ] Encours :
  - [ ] Encours clients
  - [ ] Encours fournisseurs
  - [ ] Ancienneté des créances (aging)

---

## 10. Exports comptables (Maroc)

- [ ] Paramétrage comptes comptables par :
  - [ ] Produit/famille
  - [ ] Taux de TVA
  - [ ] Mode de paiement
- [ ] Journaux comptables :
  - [ ] Ventes
  - [ ] Achats (incl. étrangers)
  - [ ] Trésorerie
- [ ] Export CSV / XLSX (XML plus tard)
- [ ] Filtrage par période & société

---

## 11. UI & UX : responsivité + thèmes

- [ ] Utiliser Tailwind + shadcn/ui
- [ ] Responsif :
  - [ ] Mobile : affichage en cartes
  - [ ] Desktop : tableaux complets
- [ ] Thème clair/sombre :
  - [ ] ThemeProvider
  - [ ] Toggle dans le header
  - [ ] Vérifier lisibilité dans les deux thèmes
- [ ] Dashboard :
  - [ ] CA, Achats, Marge, stock faible, interventions bateaux, rappels paiements…
- [ ] Module "Rapports" dédié (ventes, achats, stock, trésorerie, bateaux, employés, fournisseurs étrangers)

---

## 12. Sauvegardes & sécurité

- [ ] Sauvegardes DB :
  - [ ] `pg_dump` quotidien (cron)
  - [ ] Rétention 7 journalières + 4 hebdomadaires
- [ ] Sécurité :
  - [ ] Auth robuste (hash mots de passe)
  - [ ] RBAC par rôle & société
  - [ ] Validation des entrées (zod)
  - [ ] Prévention XSS/CSRF/Injection
  - [ ] AuditLog pour actions sensibles

---

## 13. Déploiement (Nixpacks + Dokploy)

- [ ] `nixpacks.toml` adapté à Next.js :
  - [ ] Phases install/build/start
  - [ ] PORT=3000
- [ ] Build :
  - [ ] `nixpacks build . -t nexagestion:local`
- [ ] Test local :
  - [ ] `docker run -p 3000:3000 nexagestion:local`
- [ ] Push vers registre :
  - [ ] `docker tag` + `docker push`
- [ ] Dokploy :
  - [ ] App "Container image"
  - [ ] Services : PostgreSQL, Redis
  - [ ] Variables d’environnement (DATABASE_URL, REDIS_URL, NODE_ENV, NEXT_PUBLIC_APP_URL, etc.)
  - [ ] Domaine + HTTPS (Let’s Encrypt)
