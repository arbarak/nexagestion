# UI_GUIDE.md — NexaGestion

## 1. Design system
- TailwindCSS + shadcn/ui uniquement.
- Utiliser les tokens de thème (CSS vars).
- Style minimal, professionnel, orienté gestion commerciale.

## 2. Layout standard
- Sidebar gauche collapsable.
- Header fixe:
  - Company switcher
  - Theme toggle
  - Search global (plus tard)
  - User menu
- Zone contenu scrollable.

## 3. Responsivité
- **Mobile (<640px)**: cartes empilées, actions en bas.
- **Tablette (640–1024px)**: 2 colonnes quand possible.
- **Desktop (>1024px)**: tableaux complets + toolbar.

Tables sur mobile:
- chaque ligne devient une carte
- titre = champ principal
- meta = champs secondaires
- actions = boutons visibles en bas

## 4. Navigation
Menus principaux:
- Tableau de bord
- Clients
- Fournisseurs
- Articles/Services
- Stock
- Bateaux
- Employés
- Ventes
- Achats
- Paiements
- Rapports
- Paramètres

## 5. Formulaires
- react-hook-form + zod (ou équivalent) pour validation.
- Libellés en FR.
- Sections claires, éviter formulaires trop longs:
  - utiliser Tabs/Accordion si nécessaire.
- Auto‑complétion pour clients, articles, bateaux du client.

## 6. Composants clés
- DataTable réutilisable:
  - pagination
  - tri
  - filtres
  - export
- Dialogs:
  - création/édition rapide
- Combobox:
  - articles/services
  - clients
  - bateaux (filtrés par client)

## 7. Thèmes
- Light / Dark / System.
- Vérifier contrastes partout.
- Charts adaptatifs au thème.

## 8. Rapports
Chaque page rapport:
- Panneau filtres (collapsible)
- KPI en cartes
- Graphique (ligne/barres) si pertinent
- Tableau détail
- Boutons export PDF/CSV/XLSX
