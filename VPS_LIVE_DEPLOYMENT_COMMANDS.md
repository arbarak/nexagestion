# 🚀 VPS Live Deployment Commands

## Current Status
✅ SSH Connected to VPS
✅ Ubuntu 24.04.3 LTS
✅ System Load: 1.92
✅ Memory: 44% used
✅ Disk: 51.9% used

---

## Step 1: Navigate to Application Directory
```bash
cd /root/nexagestion
pwd
ls -la
```

**Expected Output**:
```
/root/nexagestion
total XXX
drwxr-xr-x  XX root root    XXXX Nov 21 XX:XX .
drwx------  XX root root    XXXX Nov 21 XX:XX ..
-rw-r--r--   1 root root     XXX Nov 21 XX:XX .gitignore
-rw-r--r--   1 root root     XXX Nov 21 XX:XX package.json
...
```

---

## Step 2: Check Current Git Status
```bash
git status
```

**Expected Output**:
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

---

## Step 3: Pull Latest Code from GitHub
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

## Step 4: Check Node and npm Versions
```bash
node --version
npm --version
```

**Expected Output**:
```
v18.x.x or higher
9.x.x or higher
```

---

## Step 5: Install Dependencies
```bash
npm install
```

**Expected Output**:
```
added XXX packages, removed X packages, audited XXX packages
```

**Time**: ~2-3 minutes

---

## Step 6: Run Linting Checks
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

## Step 7: Run Type Checks
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

## Step 8: Build Application
```bash
npm run build
```

**Expected Output**:
```
✓ Compiled successfully
✓ Linting and type checking passed
✓ Created optimized production build
```

**Time**: ~2-3 minutes

---

## Step 9: Check PM2 Status
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

## Step 10: Restart PM2
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

## Step 11: Wait for Application to Start
```bash
sleep 3
pm2 status
```

---

## Step 12: Test HTTP on Localhost
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

## Step 13: Check Application Logs
```bash
pm2 logs nexagestion --lines 20 --nostream
```

**Expected Output**:
```
[nexagestion] ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## Step 14: Check System Resources
```bash
echo "=== CPU Usage ===" && top -bn1 | grep "Cpu(s)"
echo "" && echo "=== Memory Usage ===" && free -h | grep Mem
echo "" && echo "=== Disk Usage ===" && df -h | grep -E "^/dev"
```

---

## Step 15: Verify Nginx
```bash
nginx -t
```

**Expected Output**:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

## Step 16: Test HTTP on IP
```bash
curl -I http://72.61.106.182:3000
```

**Expected Output**:
```
HTTP/1.1 200 OK
...
```

---

## Step 17: Test HTTP on Domain (if DNS propagated)
```bash
curl -I http://nexagestion.arbarak.cloud
```

**Expected Output**:
```
HTTP/1.1 200 OK
...
```

---

## Step 18: View Real-time Logs
```bash
pm2 logs nexagestion
```

**Press Ctrl+C to exit**

---

## Summary Commands (Copy & Paste All)

```bash
# Navigate to app
cd /root/nexagestion

# Pull code
git pull origin main

# Install dependencies
npm install

# Run checks
npm run lint
npm run type-check

# Build
npm run build

# Restart PM2
pm2 restart nexagestion
pm2 save

# Check status
pm2 status

# Test
curl -I http://localhost:3000
```

---

## ✅ Success Indicators

- [x] SSH connected
- [ ] Navigated to /root/nexagestion
- [ ] Git pull successful
- [ ] npm install successful
- [ ] Linting passed
- [ ] Type checks passed
- [ ] Build completed
- [ ] PM2 restarted
- [ ] HTTP responds on localhost:3000
- [ ] HTTP responds on IP:3000
- [ ] No errors in logs
- [ ] System resources normal

---

## 🚨 If Something Goes Wrong

### npm install fails
```bash
npm cache clean --force
npm install
```

### Build fails
```bash
node --version  # Check version
npm run build   # Try again
```

### PM2 restart fails
```bash
pm2 stop nexagestion
pm2 delete nexagestion
pm2 start npm --name nexagestion -- start
pm2 save
```

### HTTP not responding
```bash
pm2 logs nexagestion
netstat -tlnp | grep 3000
```

---

**Next**: Follow each step above and report results!

