# 🚨 Subdomain Troubleshooting - Complete Guide

## Current Issue
```
Domain: nexagestion.arbarak.cloud
Error: queryA ENOTFOUND nexagestion.arbarak.cloud
Status: Not accessible
```

## Quick Fixes (Try These First)

### Fix 1: Clear DNS Cache (Windows)
```powershell
ipconfig /flushdns
```

### Fix 2: Test with IP Address
```bash
# Access via IP directly
http://72.61.106.182:3000

# If this works, it's a DNS issue
```

### Fix 3: Restart Dokploy
```bash
ssh root@72.61.106.182
docker restart dokploy
sleep 30
docker ps | grep dokploy
```

### Fix 4: Restart Nginx
```bash
ssh root@72.61.106.182
nginx -t
systemctl restart nginx
```

## Diagnostic Steps

### Step 1: Check DNS Resolution
```bash
# Windows
nslookup nexagestion.arbarak.cloud

# Linux/Mac
dig nexagestion.arbarak.cloud
```

**Expected Output**: Should show IP `72.61.106.182`

### Step 2: Check from VPS
```bash
ssh root@72.61.106.182
nslookup nexagestion.arbarak.cloud
```

### Step 3: Test Connectivity
```bash
# Test IP
ping 72.61.106.182

# Test HTTP on IP
curl -I http://72.61.106.182:3000

# Test HTTP on domain
curl -I http://nexagestion.arbarak.cloud

# Test HTTPS on domain
curl -I https://nexagestion.arbarak.cloud
```

### Step 4: Check Application Status
```bash
ssh root@72.61.106.182
pm2 status
pm2 logs nexagestion --lines 20
```

## Solution Matrix

| Symptom | Cause | Solution |
|---------|-------|----------|
| IP works, domain doesn't | DNS not propagated | Wait 24-48 hours |
| ENOTFOUND error | DNS resolution failed | Check nameservers |
| 502 Bad Gateway | App not running | `pm2 restart nexagestion` |
| Connection refused | Port blocked | Check firewall |
| SSL certificate error | Certificate not issued | Reconfigure in Dokploy |
| Timeout | Network issue | Check VPS connectivity |

## Complete Fix Procedure

### Step 1: Verify DNS Records
1. Go to your domain registrar (arbarak.cloud)
2. Check DNS records:
   - A record: `nexagestion` → `72.61.106.182`
   - Nameservers: Properly configured
3. If missing, add A record

### Step 2: Wait for Propagation
- DNS changes take 24-48 hours
- Check status: https://dnschecker.org
- Enter: `nexagestion.arbarak.cloud`

### Step 3: Reconfigure in Dokploy
1. Access Dokploy dashboard
2. Go to Nexagestion → Domains
3. Click Edit on domain
4. Verify settings:
   - Domain: `nexagestion.arbarak.cloud`
   - Port: `3000`
   - SSL: Enabled
5. Save changes
6. Wait 5 minutes for SSL certificate

### Step 4: Restart Services
```bash
ssh root@72.61.106.182

# Restart Dokploy
docker restart dokploy

# Restart Nginx
systemctl restart nginx

# Restart application
pm2 restart nexagestion
pm2 save
```

### Step 5: Verify Access
```bash
# Test all endpoints
curl -I http://nexagestion.arbarak.cloud
curl -I https://nexagestion.arbarak.cloud
curl -I http://72.61.106.182:3000

# Visit in browser
https://nexagestion.arbarak.cloud
```

## Emergency Workaround
While fixing DNS, use IP address:
```
http://72.61.106.182:3000
```

## Logs to Check
```bash
# Application logs
pm2 logs nexagestion

# Nginx error logs
tail -f /var/log/nginx/error.log

# Dokploy logs
docker logs dokploy

# System logs
journalctl -u nginx -f
```

## Prevention
- Monitor DNS propagation
- Keep SSL certificates updated
- Regular health checks
- Monitor application logs

## Support
- DNS Checker: https://dnschecker.org
- SSL Checker: https://www.sslshopper.com/ssl-checker.html
- Dokploy Support: https://dokploy.com

