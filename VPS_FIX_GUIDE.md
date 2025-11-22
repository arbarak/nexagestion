# 🚀 NexaGestion VPS Fix Guide

## Quick Start (Choose One Method)

### Method 1: Run Bash Script on VPS (Recommended)
```bash
# SSH to VPS
ssh root@72.61.106.182

# Download and run diagnostic script
cd /root/nexagestion
bash VPS_DIAGNOSTIC_AND_FIX.sh
```

### Method 2: Run PowerShell Script from Windows
```powershell
# From Windows PowerShell
.\VPS_DIAGNOSTIC_AND_FIX.ps1
```

### Method 3: Manual Steps
Follow the commands in VPS_LIVE_DEPLOYMENT_COMMANDS.md

---

## Common Issues & Fixes

### Issue 1: npm ENOENT Error
**Error**: `npm ERR! enoent ENOENT: no such file or directory, open '/root/package.json'`

**Fix**:
```bash
cd /root/nexagestion  # Must be in app directory
npm install
```

### Issue 2: Build Fails
**Error**: `npm run build` fails with TypeScript or module errors

**Fix**:
```bash
npm cache clean --force
npm install
npm run type-check
npm run build
```

### Issue 3: PM2 Not Running
**Error**: `pm2 status` shows app as "stopped" or "errored"

**Fix**:
```bash
pm2 restart nexagestion
pm2 save
pm2 status
```

### Issue 4: Port 3000 Not Responding
**Error**: `curl http://localhost:3000` times out

**Fix**:
```bash
# Check if app is running
pm2 status

# View logs
pm2 logs nexagestion --lines 50

# Restart if needed
pm2 restart nexagestion
```

### Issue 5: Database Connection Error
**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Fix**:
```bash
# Check DATABASE_URL in .env
cat /root/nexagestion/.env

# Verify PostgreSQL is running
psql -U postgres -c "SELECT 1"

# If not running, start it
systemctl start postgresql
```

---

## Environment Variables Required

Create `.env` file in `/root/nexagestion`:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:5432/nexagestion"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://nexagestion.arbarak.cloud"
PORT=3000

# Authentication (REQUIRED - min 32 chars)
AUTH_SECRET="your-32-character-secret-key-here"
SESSION_COOKIE_NAME="nexagestion_session"
NEXTAUTH_URL="https://nexagestion.arbarak.cloud"

# Optional
REDIS_URL="redis://localhost:6379"
```

---

## Verification Checklist

After running the fix script:

- [ ] `npm install` completes without errors
- [ ] `npm run build` succeeds
- [ ] `pm2 status` shows `nexagestion` as `online`
- [ ] `curl http://localhost:3000` returns HTTP 200
- [ ] `curl http://72.61.106.182:3000` returns HTTP 200
- [ ] `pm2 logs nexagestion` shows no errors
- [ ] Application loads in browser

---

## Support Commands

```bash
# View logs
pm2 logs nexagestion

# Monitor resources
pm2 monit

# Restart app
pm2 restart nexagestion

# Stop app
pm2 stop nexagestion

# Start app
pm2 start nexagestion

# View app details
pm2 show nexagestion

# Clear logs
pm2 flush
```

---

**Status**: Ready for deployment
**Next**: Run the diagnostic script and report any errors

