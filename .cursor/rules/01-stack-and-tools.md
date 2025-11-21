# 01 – Stack & Tools Rules

## Tech stack (DO use)

- Framework : **Next.js 15 (App Router)** + TypeScript
- UI : **TailwindCSS + shadcn/ui**
- DB : **PostgreSQL**
- ORM : **Prisma** (or Drizzle – follow `DATABASE.md`)
- Cache / jobs : **Redis** (optionnel mais prévu)
- Lint / format : **Biome** (unique source of truth)
- Déploiement : **Nixpacks → Dokploy** sur VPS Ubuntu
- Langue UX par défaut : **Français**

## Tools (DON’T use unless explicitly allowed)

- ❌ Pas d’ESLint ou Prettier séparés (Biome remplace)
- ❌ Pas de framework backend séparé (Nest, Express, Fastify) – Next API routes only
- ❌ Pas de base de données autre que PostgreSQL
- ❌ Pas de CSS-in-JS (styled-components, emotion…). Utiliser Tailwind + shadcn/ui.

## Commands (conventions)

- Build : `npm run build`
- Dev   : `npm run dev`
- Start : `npm run start`
- Lint  : `npx biome lint`
- Format: `npx biome format`

Whenever you add code, make sure it is compatible with this stack and these tools.
