# ARCHITECTURE.md — NexaGestion

## 1. Vue d’ensemble
NexaGestion est une application **fullstack Next.js 15** organisée en modules métier.  
Les règles structurantes :
- **Groupe → Sociétés → Utilisateurs**
- **Référentiels partagés (Group)** vs **Opérations isolées (Company)**
- **Conformité Maroc** + **spécificité maritime**

### 1.1 Schéma logique
```
Groupe (Group)
 ├── Sociétés (Company) x4
 │    ├── Opérations isolées
 │    │    ├── Stock, Inventaires, Mouvements
 │    │    ├── Ventes (Devis, BL, Factures…)
 │    │    ├── Achats
 │    │    ├── Paiements & Trésorerie
 │    │    ├── Bateaux & Interventions
 │    │    ├── Suivi Employés (sessions/visites)
 │    │    └── Rapports
 │    └── Permissions par société (UserCompanyRole)
 └── Référentiels partagés
      ├── Clients (avec Bateaux)
      ├── Fournisseurs (locaux + étrangers)
      ├── Produits, Services, Catégories, Marques
      └── Taux fiscaux TVA/TSP
```

## 2. Couches applicatives

### 2.1 Présentation (UI)
- Next.js App Router, React Server Components par défaut.
- shadcn/ui pour composants.
- Tailwind pour layout, responsive, thèmes.
- Pages `/app/(dashboard)` par module.

### 2.2 API / Contrôleurs
- Route handlers Next.js sous `/app/api/**`.
- Chaque endpoint :
  - récupère contexte `companyId` (middleware session)
  - valide payload (Zod)
  - appelle services métier sous `/lib/**`

### 2.3 Services métier
Sous `/lib/**` :
- `lib/stock/*` : calcul stock, application mouvements, inventaires.
- `lib/sales/*` : totaux, TVA/TSP, conversions devis→facture.
- `lib/purchases/*` : factures fournisseurs, conversions EUR.
- `lib/boats/*` : BOAT_OUT/IN, historique interventions par bateau/client.
- `lib/employees/*` : sessions, visites, audit.
- `lib/reports/*` : agrégations, exports.
- `lib/pdf/*` : génération PDF template exact.

### 2.4 Données
- PostgreSQL
- Prisma/Drizzle ORM
- Migrations versionnées sous `/prisma/migrations` (ou Drizzle).
- Index sur colonnes critiques (`companyId`, `clientId`, `date`, etc.)

## 3. Gestion multi‑sociétés

### 3.1 Contexte société
- Le `companyId` courant est choisi via le **sélecteur de société** dans le header.
- Le backend contrôle que l’utilisateur a un rôle sur cette société.
- Toute requête opérationnelle est filtrée par `companyId`.

### 3.2 Référentiels groupe
- Créés une fois au niveau groupe (`groupId`).
- Utilisables par toutes les sociétés.
- Option d’activation par société via table pivot ou champ JSON.

## 4. Flux métier principaux

### 4.1 Ventes
1. **Devis (QUOTE)**  
2. **Commande client (ORDER)**  
3. **Bon de livraison (DELIVERY_NOTE)** *(option stock)*  
4. **Facture (INVOICE)**  
5. **Avoir (CREDIT_NOTE)**  
- Conversions automatiques.
- TVA/TSP par ligne.
- Remises par ligne & globale.
- Impact stock à la validation (BL ou facture selon paramétrage).

### 4.2 Achats
- Commande → BL Fournisseur → Facture Fournisseur.
- Entrée stock selon paramétrage (BL ou facture).
- **Fournisseurs étrangers (EUR)** :
  - kind = SUPPLIES (fournitures)
  - kind = SATELLITE (téléphone/satellite par bateau)

### 4.3 Satellite / Téléphone (par bateau)
1. Facture fournisseur satellite en EUR avec taux de change.  
2. Conversion MAD (amountMad).  
3. **Refacturation locale** au client/bateau via `SaleDocument` lié.

### 4.4 Maritime / Bateaux
- Chaque **bateau appartient à un client** (clientId obligatoire).
- Interventions techniques génèrent des BOAT_OUT/BOAT_IN.
- Historique par bateau, client, employé.

### 4.5 Employés
- Référentiel employés (groupe) + affectation par société.
- Sessions de travail (start/end).
- Visites clients/fournisseurs.
- AuditLog sur actions sensibles.

## 5. Reporting
- Panneau filtres commun.
- KPI + graphiques + tableaux.
- Export PDF/CSV/XLSX.
- Périmètre strict `companyId`.

## 6. PDF
- Génération HTML→PDF (Puppeteer recommandé) pour fidélité parfaite.
- Templates identiques aux PDFs fournis.
