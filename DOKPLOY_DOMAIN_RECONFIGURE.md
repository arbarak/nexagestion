# 🔧 Dokploy Domain Reconfiguration Guide

## Current Status
- Domain: `nexagestion.arbarak.cloud`
- Error: `queryA ENOTFOUND nexagestion.arbarak.cloud`
- Port: 3000
- Status: Needs reconfiguration

## Step 1: Access Dokploy Dashboard
1. Go to: https://dokploy.arbarak.cloud (or your Dokploy URL)
2. Login with your credentials
3. Navigate to: **Nexagestion** application

## Step 2: Go to Domains Tab
1. Click on **Domains** tab
2. You should see: `nexagestion.arbarak.cloud`
3. Status shows: ⚠️ ENOTFOUND error

## Step 3: Edit Domain Configuration
1. Click **Edit** button on the domain
2. Verify the following settings:

### Domain Settings to Check
```
Domain Name: nexagestion.arbarak.cloud
Port: 3000
Protocol: HTTP (Dokploy handles HTTPS)
SSL: Enabled (auto-generate with Let's Encrypt)
```

## Step 4: Remove and Re-add Domain (if needed)
If editing doesn't work:

### Option A: Remove Domain
1. Click **Delete** on the domain
2. Confirm deletion
3. Wait 30 seconds

### Option B: Add Domain Again
1. Click **Add Domain** button
2. Enter: `nexagestion.arbarak.cloud`
3. Set Port: `3000`
4. Enable SSL: ✅ Yes
5. Click **Save**

## Step 5: Wait for SSL Certificate
- Dokploy will attempt to issue SSL certificate
- This takes 2-5 minutes
- You'll see status change from ⚠️ to ✅

## Step 6: Verify Configuration
After saving, check:
1. Domain status in Dokploy (should be green ✅)
2. SSL certificate issued (check certificate icon)
3. Port shows 3000

## Step 7: Restart Services (if needed)
If domain still shows error:

```bash
ssh root@72.61.106.182

# Restart Dokploy
docker restart dokploy

# Wait 30 seconds
sleep 30

# Check status
docker ps | grep dokploy
```

## Step 8: Test Access
After configuration:

```bash
# Test HTTP
curl -I http://nexagestion.arbarak.cloud

# Test HTTPS
curl -I https://nexagestion.arbarak.cloud

# Or visit in browser
https://nexagestion.arbarak.cloud
```

## Troubleshooting

### Issue: Domain still shows ENOTFOUND
**Cause**: DNS not propagated yet
**Solution**: 
- Wait 24-48 hours
- Check DNS at: https://dnschecker.org
- Use IP temporarily: http://72.61.106.182:3000

### Issue: SSL Certificate Not Issued
**Cause**: Domain not accessible during certificate validation
**Solution**:
1. Ensure DNS is working first
2. Remove and re-add domain in Dokploy
3. Wait 5 minutes for certificate

### Issue: 502 Bad Gateway
**Cause**: Application not running or Nginx misconfigured
**Solution**:
```bash
pm2 status
pm2 restart nexagestion
```

### Issue: Connection Refused
**Cause**: Application crashed or port changed
**Solution**:
```bash
pm2 logs nexagestion --lines 50
pm2 restart nexagestion
```

## Dokploy Nginx Configuration
Dokploy automatically creates Nginx config:
```bash
# View Nginx config
docker exec dokploy cat /etc/nginx/conf.d/nexagestion.arbarak.cloud.conf

# Test Nginx config
docker exec dokploy nginx -t

# Reload Nginx
docker exec dokploy nginx -s reload
```

## DNS Verification
Before reconfiguring in Dokploy, verify DNS:

```bash
# From your local machine
nslookup nexagestion.arbarak.cloud

# Should return: 72.61.106.182
```

## Expected Output After Fix
```
✅ Domain: nexagestion.arbarak.cloud
✅ Port: 3000
✅ SSL: Enabled
✅ Status: Active
✅ Certificate: Valid
```

## Support Resources
- Dokploy Docs: https://dokploy.com/docs
- Let's Encrypt: https://letsencrypt.org
- DNS Checker: https://dnschecker.org

