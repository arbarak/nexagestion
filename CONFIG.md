# CONFIG.md — NexaGestion

## 1. Variables d’environnement obligatoires

### Base de données
- `DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME`

### Application
- `NODE_ENV=production|development`
- `NEXT_PUBLIC_APP_URL=https://...`
- `PORT=3000`

### Auth
- `AUTH_SECRET=...` *(si NextAuth ou JWT)*
- `SESSION_COOKIE_NAME=nexagestion_session`

### Redis (si activé)
- `REDIS_URL=redis://HOST:PORT`

## 2. Variables optionnelles

### Emails (si intégration plus tard)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### Stockage backups / logos (optionnel)
- `S3_ENDPOINT`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_BUCKET`

## 3. Règles
- Ne jamais committer `.env.local`
- En prod, toutes les variables sont stockées dans Dokploy.
- Les paramètres fiscaux (TVA/TSP) sont en base via `TaxRate`.
