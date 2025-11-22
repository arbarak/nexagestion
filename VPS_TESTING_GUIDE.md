# 🧪 VPS Testing & Deployment Guide

## Quick Start

### Option 1: Run from Windows (PowerShell)
```powershell
# Make script executable
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Run deployment script
.\RUN_VPS_DEPLOYMENT.ps1
```

### Option 2: Run from VPS (SSH)
```bash
# SSH to VPS
ssh root@72.61.106.182

# Run deployment script
bash /root/nexagestion/VPS_DEPLOYMENT_TEST.sh
```

### Option 3: Manual Steps
Follow the manual deployment steps below

---

## Manual Deployment Steps

### Step 1: SSH to VPS
```bash
ssh root@72.61.106.182
```

### Step 2: Navigate to app directory
```bash
cd /root/nexagestion
```

### Step 3: Pull latest code
```bash
git fetch origin
git pull origin main
```

### Step 4: Install dependencies
```bash
npm install
```

### Step 5: Run linting
```bash
npm run lint
```

### Step 6: Run type checks
```bash
npm run type-check
```

### Step 7: Build application
```bash
npm run build
```

### Step 8: Restart PM2
```bash
pm2 restart nexagestion
pm2 save
```

### Step 9: Check status
```bash
pm2 status
```

---

## Testing Checklist

### ✅ Connectivity Tests
- [ ] SSH connection works
- [ ] Internet connectivity OK
- [ ] Application directory exists
- [ ] Git pull successful

### ✅ Build Tests
- [ ] npm install successful
- [ ] Linting passed
- [ ] Type checks passed
- [ ] Build completed

### ✅ Runtime Tests
- [ ] PM2 restart successful
- [ ] Application running
- [ ] HTTP on IP works
- [ ] HTTP on domain works (if DNS propagated)

### ✅ Endpoint Tests
```bash
# Test HTTP on IP
curl -I http://72.61.106.182:3000

# Test HTTP on domain
curl -I http://nexagestion.arbarak.cloud

# Test HTTPS on domain
curl -I https://nexagestion.arbarak.cloud

# Test landing page
curl http://72.61.106.182:3000/

# Test API health
curl http://72.61.106.182:3000/api/health
```

### ✅ Feature Tests
- [ ] Landing page loads
- [ ] Login page accessible
- [ ] Signup page accessible
- [ ] Forgot password page accessible
- [ ] Marketing pages load
- [ ] Theme toggle works
- [ ] Responsive design works

### ✅ Performance Tests
```bash
# Check CPU usage
top -bn1 | grep "Cpu(s)"

# Check memory usage
free -h

# Check disk usage
df -h

# Check application logs
pm2 logs nexagestion --lines 20
```

---

## Troubleshooting

### Issue: npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Issue: Build fails
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Try build again
npm run build
```

### Issue: PM2 restart fails
```bash
# Check PM2 status
pm2 status

# Stop application
pm2 stop nexagestion

# Start application
pm2 start npm --name nexagestion -- start

# Save PM2 config
pm2 save
```

### Issue: HTTP not responding
```bash
# Check if port 3000 is listening
netstat -tlnp | grep 3000

# Check application logs
pm2 logs nexagestion

# Restart application
pm2 restart nexagestion
```

### Issue: DNS not working
```bash
# Check DNS resolution
nslookup nexagestion.arbarak.cloud

# Use IP directly
http://72.61.106.182:3000
```

---

## Monitoring

### View Real-time Logs
```bash
pm2 logs nexagestion
```

### Monitor System Resources
```bash
pm2 monit
```

### Check PM2 Status
```bash
pm2 status
```

### View Application Details
```bash
pm2 show nexagestion
```

---

## Useful Commands

```bash
# Restart application
pm2 restart nexagestion

# Stop application
pm2 stop nexagestion

# Start application
pm2 start nexagestion

# Delete application
pm2 delete nexagestion

# Save PM2 config
pm2 save

# Resurrect PM2 config
pm2 resurrect

# View all processes
pm2 list

# View logs
pm2 logs

# Clear logs
pm2 flush
```

---

## Expected Output

### Successful Build
```
✅ Linting passed
✅ Type checks passed
✅ Build completed
✅ Application restarted
```

### Successful Tests
```
✅ HTTP on localhost:3000 is working
✅ HTTP on nexagestion.arbarak.cloud is working
✅ Application logs show no errors
```

### System Resources
```
CPU Usage: ~5-10%
Memory Usage: ~200-300MB
Disk Usage: ~2-3GB
```

---

## Support

- PM2 Docs: https://pm2.keymetrics.io
- Next.js Docs: https://nextjs.org/docs
- Node.js Docs: https://nodejs.org/docs

