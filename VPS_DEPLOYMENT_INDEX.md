# 🚀 VPS Deployment & Testing Index

## 📚 Documentation Files (Read in Order)

### 1. **START HERE** - VPS_MANUAL_DEPLOYMENT.md
Step-by-step manual deployment instructions
- SSH to VPS
- Pull code
- Install dependencies
- Run quality checks
- Build application
- Restart PM2
- Test endpoints

### 2. VPS_TESTING_GUIDE.md
Quick start guide with multiple deployment options
- PowerShell script option
- SSH script option
- Manual steps option
- Troubleshooting guide

### 3. VPS_COMPLETE_TESTING_CHECKLIST.md
Comprehensive testing checklist
- Deployment phase
- Runtime phase
- Connectivity phase
- Landing page tests
- Authentication tests
- Responsive design tests
- Performance tests

### 4. VPS_DEPLOYMENT_TEST.sh
Automated bash script for VPS deployment
- Run on VPS directly
- Automated testing
- System resource checks

### 5. RUN_VPS_DEPLOYMENT.ps1
PowerShell script for Windows
- Run from Windows
- SSH to VPS automatically
- Execute all deployment steps

---

## ⚡ Quick Start (Choose One)

### Option 1: Manual Steps (Recommended)
1. Read: **VPS_MANUAL_DEPLOYMENT.md**
2. SSH to VPS: `ssh root@72.61.106.182`
3. Follow step-by-step instructions
4. Test each step

### Option 2: PowerShell Script (Windows)
```powershell
.\RUN_VPS_DEPLOYMENT.ps1
```

### Option 3: Bash Script (VPS)
```bash
bash /root/nexagestion/VPS_DEPLOYMENT_TEST.sh
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Latest code committed
- [ ] All changes pushed to GitHub
- [ ] DNS configured (if needed)
- [ ] VPS accessible

### Deployment
- [ ] SSH connection successful
- [ ] Code pulled from GitHub
- [ ] Dependencies installed
- [ ] Linting passed
- [ ] Type checks passed
- [ ] Build completed
- [ ] PM2 restarted
- [ ] Application running

### Testing
- [ ] HTTP on IP works
- [ ] HTTP on domain works (if DNS propagated)
- [ ] Landing page loads
- [ ] Auth pages work
- [ ] No console errors
- [ ] System resources normal

### Post-Deployment
- [ ] All tests passed
- [ ] Documentation updated
- [ ] Logs monitored
- [ ] Ready for production

---

## 🔗 Access URLs

- **IP Address**: http://72.61.106.182:3000
- **Domain (HTTP)**: http://nexagestion.arbarak.cloud
- **Domain (HTTPS)**: https://nexagestion.arbarak.cloud

---

## 📊 Current Status

- **VPS IP**: 72.61.106.182
- **VPS OS**: Ubuntu 24.04
- **Application Port**: 3000
- **Domain**: nexagestion.arbarak.cloud
- **Process Manager**: PM2
- **Web Server**: Nginx
- **Database**: PostgreSQL

---

## 🎯 Deployment Steps Summary

```bash
# 1. SSH to VPS
ssh root@72.61.106.182

# 2. Navigate to app
cd /root/nexagestion

# 3. Pull code
git pull origin main

# 4. Install dependencies
npm install

# 5. Run checks
npm run lint
npm run type-check

# 6. Build
npm run build

# 7. Restart PM2
pm2 restart nexagestion
pm2 save

# 8. Check status
pm2 status

# 9. Test
curl -I http://localhost:3000
```

---

## 🔍 Testing Steps Summary

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs nexagestion --lines 20

# Test HTTP
curl -I http://72.61.106.182:3000

# Monitor resources
pm2 monit

# Check system
top -bn1 | grep "Cpu(s)"
free -h | grep Mem
df -h | grep -E "^/dev"
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| npm install fails | `npm cache clean --force && npm install` |
| Build fails | Check Node version, try again |
| PM2 restart fails | `pm2 stop nexagestion && pm2 start npm --name nexagestion -- start` |
| HTTP not responding | Check logs: `pm2 logs nexagestion` |
| DNS not working | Use IP directly: `http://72.61.106.182:3000` |

---

## 📞 Useful Commands

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

## ✅ Verification Checklist

- [ ] SSH connection works
- [ ] Code deployed
- [ ] Build successful
- [ ] Application running
- [ ] HTTP works on IP
- [ ] HTTP works on domain (if DNS propagated)
- [ ] Landing page loads
- [ ] Auth pages work
- [ ] No errors in logs
- [ ] System resources normal

---

## 🎉 Success Criteria

✅ All deployment steps completed
✅ All quality checks passed
✅ Application running on port 3000
✅ HTTP endpoints responding
✅ Landing page accessible
✅ No critical errors
✅ Ready for production

---

**Status**: 🟢 Ready for Deployment
**Last Updated**: Now
**Next Step**: Follow VPS_MANUAL_DEPLOYMENT.md

