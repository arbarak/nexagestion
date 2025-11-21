# 06 – Style, Quality & Biome Rules

## Formatting & linting

- Use **Biome** for both linting and formatting.
- Code must be compatible with:
  - `npx biome format`
  - `npx biome lint`

## TypeScript

- Use strict TypeScript options whenever possible.
- Avoid `any` – if necessary, prefer narrow, explicit unions or generics.

## Naming

- Use **English names in code**, **French for UI labels and texts**.
- Domain terms should match DB names from `DATABASE.md`.

## Components & functions

- Keep components small and focused.
- Prefer composition over huge monolithic components.
- For logic with multiple steps, break into well-named functions.

## Comments & docs

- Add comments where domain logic is not obvious (TVA/TSP rules, Morocco-specific quirks).
- For complex flows (e.g. Avoir impact on stock & accounting), document in code + refer to `TASKS.md`.
