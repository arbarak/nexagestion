# 03 – Frontend, UI & UX Rules

## General

- Use **React Server Components** where possible with Next 15.
- Use **Client Components** only when needed (forms, interactivity, charts).
- All UI **must be responsive**:
  - Mobile: 1 column, stacked cards for data tables.
  - Tablet: 2 columns where relevant.
  - Desktop: full data tables and dashboards.

## Components

- Use **shadcn/ui components** as base (Buttons, Inputs, Dialog, Table, Tabs, etc.).
- Do NOT reinvent inputs if shadcn exists.
- For tables: use a reusable table component (sorting, pagination, filters).

## Theming

- Use app-wide `ThemeProvider` (light/dark).
- Use theme tokens (CSS variables) – do not hardcode colors everywhere.
- Components must work in both themes (no illegible text/background combos).

## Layout

- Global layout:
  - Left sidebar navigation.
  - Top header with:
    - Company switcher.
    - Theme toggle.
    - User menu.
- Key pages to follow:
  - `Dashboard`
  - `Clients`
  - `Fournisseurs`
  - `Articles / Stock`
  - `Bateaux`
  - `Ventes`
  - `Achats`
  - `Trésorerie`
  - `Rapports`
  - `Paramètres`

## Forms

- Use controlled forms with zod validation (or similar) and clear error messages.
- Default language in labels and placeholders: **French**.
- Avoid over-long forms in one page; group logically with sections or tabs.

## Reports UI

- Each report page:
  - Filter panel (collapsible) on left or top.
  - Chart or KPIs at top.
  - Table below with export buttons (PDF, CSV/XLSX).
