# ⚡ Quick Deployment Commands

## Copy & Paste Ready Commands

### 1. SSH to VPS
```bash
ssh root@72.61.106.182
```

### 2. Navigate & Pull Latest
```bash
cd /root/nexagestion && git pull origin main
```

### 3. Verify Latest Commit
```bash
git log --oneline -1
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Quality Checks
```bash
npm run lint && npm run type-check
```

### 6. Build Application
```bash
npm run build
```

### 7. Restart Application
```bash
pm2 restart nexagestion && pm2 save
```

### 8. Check Status
```bash
pm2 status
```

### 9. View Logs
```bash
pm2 logs nexagestion --lines 20
```

### 10. Health Check
```bash
curl -I https://nexagestion.arbark.cloud
```

---

## All-in-One Deployment Script

```bash
ssh root@72.61.106.182 << 'EOF'
cd /root/nexagestion
git pull origin main
npm install
npm run build
pm2 restart nexagestion
pm2 save
echo "✅ Deployment complete!"
pm2 status
EOF
```

---

## Monitoring Commands

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs nexagestion

# Show status
pm2 status

# Restart if needed
pm2 restart nexagestion
```

---

## Rollback Commands

```bash
# View history
git log --oneline -5

# Rollback to previous version
git reset --hard <commit_hash>
npm install
npm run build
pm2 restart nexagestion
```

---

## Latest Deployment Info

- **Commit**: a99f438
- **Branch**: main
- **VPS IP**: 72.61.106.182
- **URL**: https://nexagestion.arbark.cloud
- **Status**: ✅ READY TO DEPLOY

