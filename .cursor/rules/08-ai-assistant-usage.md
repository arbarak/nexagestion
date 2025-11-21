# 08 – AI Assistant Usage (Cursor / Augment Code AI)

## Goals

- Use AI to:
  - Generate scaffolding.
  - Implement modules following `TASKS.md`.
  - Refactor & improve code quality.
  - Add tests, docs, and small features.

## Golden rules

1. **Always read** `TASKS.md`, `ARCHITECTURE.md`, `DATABASE.md`, and `UI_GUIDE.md` before generating significant changes.
2. Do **not**:
   - Change the core stack (Next.js, Tailwind, shadcn, Prisma/Drizzle, Biome, Nixpacks).
   - Remove or alter multi-company logic.
   - Create random new entities that conflict with domain model.
3. When in doubt about behavior:
   - Prefer adding TODO comments referencing `TASKS.md` rather than inventing new business rules.

## Style

- Keep generated code consistent with existing patterns.
- Ensure **French labels** are used for UI, **English** for code.

## Safety

- Never introduce debug secrets in code.
- Do not auto-generate test data with real client names (use fake examples).
