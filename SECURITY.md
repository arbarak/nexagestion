# SECURITY.md — NexaGestion

## 1. Authentification
- Login par credentials.
- Hash mots de passe: bcrypt/argon2.
- Sessions sécurisées (cookies HTTPOnly).

## 2. Autorisation (RBAC)
Rôles par société:
- ADMIN
- MANAGER
- STOCK
- ACCOUNTANT
- VIEWER

Règles:
- Toute API protégée vérifie:
  1) user authentifié
  2) rôle valide sur `companyId` courant
- Les actions sensibles (validation docs, suppressions) réservées aux rôles adaptés.

## 3. Isolation données
- Référentiels: filtrer par `groupId`.
- Opérations: filtrer par `companyId`.
- Ne jamais accepter un `companyId` envoyé par le client sans vérification session.

## 4. Validation / Sanitization
- Zod sur tous les payloads.
- Refuser champs inattendus.
- Limiter tailles (notes, descriptions, etc.)

## 5. Audit
- Table `AuditLog` obligatoire pour:
  - CRUD référentiels
  - Validation/cancel ventes & achats
  - Mouvements stock
  - Interventions bateaux
  - Paiements & allocations
  - Changements rôles utilisateurs

## 6. Sécurité API
- Rate limiting sur endpoints sensibles (auth, exports).
- Protection CSRF/XSS standard Next.js.
- Pas de secrets en dur dans le code.

## 7. Backups
- Backups DB automatiques (pg_dump) avec rétention.
- Accès backups réservé ADMIN.
