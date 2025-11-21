# DEPLOYMENT.md — NexaGestion (Nixpacks + Dokploy)

Déploiement cible: **Nixpacks** pour construire une image Docker optimisée, puis **Dokploy** sur VPS Ubuntu.

---

## 1. Pré‑requis VPS
- Ubuntu installé
- Dokploy installé et fonctionnel
- Domaine configuré (optionnel mais recommandé)
- Ports ouverts: 80/443

## 2. Préparation projet
- Variables d’environnement placées dans Dokploy (pas dans le code)
- Script build Next.js OK: `npm run build`
- Script start Next.js OK: `npm run start`

## 3. Nixpacks

### 3.1 Fichier `nixpacks.toml`
Créer à la racine:
```toml
[phases.install]
cmd = "npm ci"

[phases.build]
cmd = "npm run build"

[start]
cmd = "npm run start"

[variables]
NODE_ENV="production"
PORT="3000"
```

### 3.2 Build de l’image
```bash
nixpacks build . -t nexagestion:latest
```

### 3.3 Test local
```bash
docker run -p 3000:3000 nexagestion:latest
```

## 4. Push vers un registre
Exemple GHCR:
```bash
docker tag nexagestion:latest ghcr.io/<user>/nexagestion:latest
docker push ghcr.io/<user>/nexagestion:latest
```

## 5. Déploiement Dokploy

1. Créer une nouvelle App → **Container Image**
2. Image: `ghcr.io/<user>/nexagestion:latest`
3. Ajouter services:
   - PostgreSQL
   - Redis (optionnel au début)
4. Variables d’env:
   - `DATABASE_URL=postgres://...`
   - `REDIS_URL=redis://...`
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_APP_URL=https://app.votredomaine.com`
   - autres secrets (SMTP, S3, etc.)
5. Activer HTTPS Let's Encrypt dans Dokploy.
6. Vérifier logs et healthcheck.

## 6. CI/CD (recommandé)
GitHub Actions:
- lint/format Biome
- build Nixpacks
- push registry
- Dokploy pull auto (tag latest) ou redéploiement manuel.
