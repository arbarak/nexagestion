# 🚀 VPS Manual Deployment & Testing Guide

## Step-by-Step Instructions

### Step 1: SSH to VPS
```bash
ssh root@72.61.106.182
```
**Password**: Use your VPS root password

---

### Step 2: Navigate to Application Directory
```bash
cd /root/nexagestion
```

**Verify**:
```bash
pwd
ls -la
```

---

### Step 3: Pull Latest Code from GitHub
```bash
git fetch origin
git pull origin main
```

**Expected Output**:
```
Already up to date.
or
Updating abc1234..def5678
Fast-forward
 ...
```

---

### Step 4: Install Dependencies
```bash
npm install
```

**Expected Output**:
```
added X packages, removed Y packages, audited Z packages
```

---

### Step 5: Run Linting Checks
```bash
npm run lint
```

**Expected Output**:
```
✅ All files pass linting
or
No issues found
```

---

### Step 6: Run Type Checks
```bash
npm run type-check
```

**Expected Output**:
```
✅ Type checking passed
or
No type errors
```

---

### Step 7: Build Application
```bash
npm run build
```

**Expected Output**:
```
✓ Compiled successfully
✓ Linting and type checking passed
✓ Created optimized production build
```

---

### Step 8: Restart PM2
```bash
pm2 restart nexagestion
pm2 save
```

**Expected Output**:
```
[PM2] Restarting app : nexagestion
[PM2] App restarted
[PM2] PM2 dumped, stopping PM2 daemon
[PM2] PM2 stopped
```

---

### Step 9: Check PM2 Status
```bash
pm2 status
```

**Expected Output**:
```
┌─────┬──────────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ version │ pid     │ status   │
├─────┼──────────────┼─────────┼─────────┼──────────┤
│ 0   │ nexagestion  │ 1.0.0   │ 12345   │ online   │
└─────┴──────────────┴─────────┴─────────┴──────────┘
```

---

### Step 10: Wait for Application to Start
```bash
sleep 3
```

---

### Step 11: Test HTTP on Localhost
```bash
curl -I http://localhost:3000
```

**Expected Output**:
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
...
```

---

### Step 12: Check Application Logs
```bash
pm2 logs nexagestion --lines 20 --nostream
```

**Expected Output**:
```
[nexagestion] ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

### Step 13: Check System Resources
```bash
echo "=== CPU Usage ===" && top -bn1 | grep "Cpu(s)"
echo "" && echo "=== Memory Usage ===" && free -h | grep Mem
echo "" && echo "=== Disk Usage ===" && df -h | grep -E "^/dev"
```

**Expected Output**:
```
=== CPU Usage ===
Cpu(s):  5.2%us,  2.1%sy,  0.0%ni, 92.7%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st

=== Memory Usage ===
Mem:           3.8Gi       1.2Gi       2.6Gi       ...

=== Disk Usage ===
/dev/sda1       100G        30G         70G   30% /
```

---

### Step 14: Verify Nginx Configuration
```bash
nginx -t
```

**Expected Output**:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

### Step 15: Test HTTP on IP Address
```bash
curl -I http://72.61.106.182:3000
```

**Expected Output**:
```
HTTP/1.1 200 OK
...
```

---

### Step 16: Test HTTP on Domain (if DNS propagated)
```bash
curl -I http://nexagestion.arbarak.cloud
```

**Expected Output**:
```
HTTP/1.1 200 OK
...
```

---

### Step 17: View Real-time Logs
```bash
pm2 logs nexagestion
```

**Press Ctrl+C to exit**

---

## Testing Checklist

- [ ] SSH connection successful
- [ ] Application directory exists
- [ ] Git pull successful
- [ ] npm install successful
- [ ] Linting passed
- [ ] Type checks passed
- [ ] Build completed
- [ ] PM2 restart successful
- [ ] Application running (pm2 status shows "online")
- [ ] HTTP on localhost works
- [ ] HTTP on IP works
- [ ] HTTP on domain works (if DNS propagated)
- [ ] No errors in logs
- [ ] System resources normal

---

## Troubleshooting

### If npm install fails:
```bash
npm cache clean --force
npm install
```

### If build fails:
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
npm run build
```

### If PM2 restart fails:
```bash
pm2 stop nexagestion
pm2 delete nexagestion
pm2 start npm --name nexagestion -- start
pm2 save
```

### If HTTP not responding:
```bash
netstat -tlnp | grep 3000
pm2 logs nexagestion
pm2 restart nexagestion
```

### If DNS not working:
```bash
nslookup nexagestion.arbarak.cloud
# Use IP directly: http://72.61.106.182:3000
```

---

## Useful Commands

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

## Summary

After completing all steps:
- ✅ Application deployed
- ✅ All quality checks passed
- ✅ Application running on port 3000
- ✅ Accessible via http://72.61.106.182:3000
- ✅ Ready for production

**Next**: Test landing page and features in browser

