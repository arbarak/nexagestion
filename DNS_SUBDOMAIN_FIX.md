# 🔧 NexaGestion DNS Subdomain Fix Guide

## Problem
- Domain: `nexagestion.arbarak.cloud`
- Error: `queryA ENOTFOUND nexagestion.arbarak.cloud`
- Status: Not accessible via HTTPS
- DNS Record: A record exists (nexagestion → 72.61.106.182)

## Root Causes to Check

### 1. DNS Propagation Delay
- DNS changes can take 24-48 hours to fully propagate
- Check current status at: https://dnschecker.org

### 2. Nameserver Configuration
- Verify nameservers are correctly set for arbarak.cloud
- Check if Child Nameserver 2 is properly configured

### 3. Dokploy Configuration
- Domain shows ENOTFOUND error in Dokploy
- May need to reconfigure or restart

### 4. SSL Certificate
- Certificate may not be issued for the subdomain
- Dokploy uses Let's Encrypt for auto-SSL

## Step-by-Step Fix

### Step 1: Verify DNS Records (Local Machine)
```bash
# Check DNS resolution
nslookup nexagestion.arbarak.cloud
# or
dig nexagestion.arbarak.cloud
# or on Windows
nslookup nexagestion.arbarak.cloud 8.8.8.8
```

### Step 2: Check from VPS
```bash
ssh root@72.61.106.182
nslookup nexagestion.arbarak.cloud
dig nexagestion.arbarak.cloud
```

### Step 3: Verify Dokploy Configuration
1. Go to Dokploy Dashboard
2. Navigate to Nexagestion app → Domains tab
3. Check domain: `nexagestion.arbarak.cloud`
4. Verify port: 3000
5. Check SSL status

### Step 4: Reconfigure Domain in Dokploy
If domain shows error:
1. Click "Edit" on the domain
2. Verify domain name is correct
3. Ensure port is 3000
4. Save changes
5. Wait 2-3 minutes for SSL certificate

### Step 5: Check Nginx Configuration
```bash
ssh root@72.61.106.182
cat /etc/nginx/sites-enabled/nexagestion.arbarak.cloud
# or check Dokploy's nginx config
docker exec dokploy cat /etc/nginx/conf.d/nexagestion.arbarak.cloud.conf
```

### Step 6: Restart Services
```bash
ssh root@72.61.106.182

# Restart Dokploy
docker restart dokploy

# Restart Nginx
nginx -t  # Test config
systemctl restart nginx

# Restart application
pm2 restart nexagestion
```

### Step 7: Verify Resolution
```bash
# Test DNS
nslookup nexagestion.arbarak.cloud

# Test HTTP
curl -I http://nexagestion.arbarak.cloud

# Test HTTPS
curl -I https://nexagestion.arbarak.cloud

# Test from browser
https://nexagestion.arbarak.cloud
```

## Common Issues & Solutions

### Issue: ENOTFOUND Error
**Solution**: DNS not propagated yet
- Wait 24-48 hours
- Or use IP directly: http://72.61.106.182:3000

### Issue: Connection Refused
**Solution**: Application not running
```bash
pm2 status
pm2 restart nexagestion
```

### Issue: SSL Certificate Error
**Solution**: Certificate not issued
- Dokploy will auto-issue after domain is accessible
- Wait 5-10 minutes after domain configuration

### Issue: 502 Bad Gateway
**Solution**: Nginx can't reach application
```bash
# Check if app is running
pm2 status

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

## Temporary Workaround
While DNS propagates, access via IP:
```
http://72.61.106.182:3000
```

## Verification Checklist
- [ ] DNS resolves: `nslookup nexagestion.arbarak.cloud`
- [ ] HTTP works: `curl -I http://nexagestion.arbarak.cloud`
- [ ] HTTPS works: `curl -I https://nexagestion.arbarak.cloud`
- [ ] Browser access: https://nexagestion.arbarak.cloud
- [ ] Dokploy shows green status
- [ ] SSL certificate valid

## Support
- DNS Checker: https://dnschecker.org
- SSL Checker: https://www.sslshopper.com/ssl-checker.html
- Dokploy Docs: https://dokploy.com

