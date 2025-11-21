# NexaGestion — ERP de Gestion Commerciale & Maritime (Maroc)

NexaGestion est un ERP web **rapide, moderne et multi‑sociétés** destiné aux entreprises marocaines de taille moyenne, avec un focus métier maritime (bateaux, interventions, abonnements satellite), une gestion commerciale complète et un suivi avancé des employés.

## Objectifs clés
- **Multi‑sociétés (groupe de 4 sociétés)**: bascule instantanée entre sociétés, isolation stricte des opérations.
- **Référentiels partagés au niveau groupe**: clients, fournisseurs, articles, services, familles, marques, taux TVA/TSP.
- **Opérations isolées par société**: ventes, achats, stock, paiements, bateaux, employés, rapports.
- **Gestion stock & inventaires**: multi‑dépôts, entrées/sorties/transferts, inventaires avec ajustements.
- **Module maritime**: bateaux **appartenant aux clients**, interventions, BOAT_OUT/BOAT_IN auto‑sync avec stock.
- **Ventes complètes**: Devis → Commande → BL → Facture → Avoir, remises, TVA/TSP Maroc.
- **Achats locaux & étrangers**: suivi EUR, paiements partiels & multi‑factures.
- **Satellite / Téléphone par bateau**: factures étrangères en EUR + taux de change + refacturation locale en MAD.
- **Suivi employés**: sessions, visites, audit des actions, interventions sur bateaux.
- **Rapports avancés**: ventes, achats, stock, trésorerie, bateaux, employés, TVA/TSP, fournisseurs étrangers.
- **Conformité Maroc**: ICE, IF, RC, Patente, CNSS, journaux, archivage PDF.

## Stack technique (obligatoire)
- **Next.js 15 App Router + TypeScript** (fullstack)
- **Tailwind CSS + shadcn/ui**
- **PostgreSQL**
- **ORM: Prisma (ou Drizzle, un seul choix)**
- **Redis** (optionnel au début)
- **Biome** (lint + format, pas d’ESLint/Prettier)
- **Build & Deploy: Nixpacks → Dokploy → VPS Ubuntu**
- Langue UI par défaut: **Français**
- Responsive complet: desktop + tablette + mobile
- Thèmes: **clair / sombre**

## Démarrage rapide (dev)
1. Installer dépendances  
   `npm install`
2. Créer `.env.local` à partir de `CONFIG.md`
3. Lancer DB locale (Postgres)  
4. Migrations ORM  
   `npx prisma migrate dev` *(ou Drizzle équivalent)*
5. Lancer l’app  
   `npm run dev`

## Références
- Voir `TASKS.md` pour la roadmap complète.
- Voir `ARCHITECTURE.md` pour les modules & flux.
- Voir `DATABASE.md` pour la modélisation.
- Voir `UI_GUIDE.md` pour les règles UX/UI.
- Voir `DEPLOYMENT.md` pour Nixpacks + Dokploy.
