# Dokploy Deployment Guide - Fix for tsconfig.tsbuildinfo Error

## The Problem

When deploying to Dokploy on Hostinger VPS, builds fail with:
```
error mounting "/var/lib/containerd/.../tsconfig.tsbuildinfo": not a directory
```

**Root Cause**: Dokploy's Nixpacks auto-detector sees `tsconfig.tsbuildinfo` and tries to create a Docker cache mount for it as a directory, but it's actually a file.

---

## The Solution: Use Custom Dockerfile

### Steps to Fix:

1. **Log into Dokploy Web UI** (your Hostinger VPS)

2. **Find your NexaGestion application**

3. **Go to Application Settings**

4. **Find the "Build Method" or "Builder" section**

5. **Change from "Nixpacks" to "Dockerfile"**
   - Set Dockerfile path: `./Dockerfile`
   - Build context: `.`

6. **Save and Trigger a New Deploy**
   - Click "Redeploy" or "Deploy"
   - Wait for build to complete

---

## What We Already Fixed in the Code

✅ Disabled incremental TypeScript builds (`tsconfig.json`)
✅ Removed `tsBuildInfoFile` configuration
✅ Created optimized production Dockerfile
✅ Added Docker health checks
✅ Updated `.gitignore` to exclude build artifacts

---

## Alternative: Manual Cache Clear

If switching to Dockerfile in the UI doesn't work:

### SSH into your VPS:
```bash
ssh root@your-vps-ip
```

### Clear Docker build cache:
```bash
docker builder prune -a -f
docker system prune -a
```

### Redeploy in Dokploy UI
- Trigger full rebuild (not just code deploy)

---

## Verify It Works

After deployment, check:

```bash
# Your application should be running
curl https://your-domain.com

# Should return 200 OK
```

---

## Environment Setup

Make sure these are configured in Dokploy:

```
DATABASE_URL=postgresql://user:password@host/db
NEXTAUTH_SECRET=your-secret-key
NODE_ENV=production
AUTH_SECRET=your-auth-secret
PORT=3000
```

See `.env.example` for all required variables.

---

## Why This Works

- **Custom Dockerfile** = Direct Docker build (no Nixpacks auto-detection)
- **No Nixpacks** = No problematic cache mount attempts
- **No tsconfig.tsbuildinfo** = Nothing to cause "not a directory" error

---

## Performance Impact

| Metric | Impact | Notes |
|--------|--------|-------|
| Build time | +5-10% slower | No incremental TypeScript caching |
| App runtime | None | Same performance |
| Docker image size | Same | No change |
| Deployment reliability | Much better | No more cache mount errors |

---

## Still Having Issues?

1. Verify the latest code is pulled:
   ```bash
   git log --oneline -3
   # Should show: "Disable incremental TypeScript builds"
   ```

2. Manually test Docker build:
   ```bash
   docker build -t nexagestion:test .
   # Should complete without errors
   ```

3. Check Dokploy logs for any permission or resource issues

4. Reach out with:
   - Screenshot of Dokploy build settings
   - Full error logs from deployment
   - Git commit hash you're deploying
