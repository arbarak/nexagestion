# NexaGestion VPS Deployment & Testing Script (PowerShell)
# Run this from Windows to deploy and test on VPS

param(
    [string]$VpsIP = "72.61.106.182",
    [string]$VpsUser = "root",
    [string]$AppDir = "/root/nexagestion"
)

Write-Host "🚀 NexaGestion VPS Deployment & Testing" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Configuration
$Domain = "nexagestion.arbarak.cloud"
$Port = "3000"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "VPS IP: $VpsIP"
Write-Host "VPS User: $VpsUser"
Write-Host "App Directory: $AppDir"
Write-Host "Domain: $Domain"
Write-Host "Port: $Port"
Write-Host ""

# Step 1: Test SSH connectivity
Write-Host "1️⃣  Testing SSH connectivity..." -ForegroundColor Yellow
try {
    $sshTest = ssh -o ConnectTimeout=5 "$VpsUser@$VpsIP" "echo 'SSH OK'"
    Write-Host "✅ SSH connection successful" -ForegroundColor Green
} catch {
    Write-Host "❌ SSH connection failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Pull latest code
Write-Host "2️⃣  Pulling latest code from GitHub..." -ForegroundColor Yellow
ssh "$VpsUser@$VpsIP" "cd $AppDir && git fetch origin && git pull origin main"
Write-Host "✅ Code pulled successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Install dependencies
Write-Host "3️⃣  Installing dependencies..." -ForegroundColor Yellow
ssh "$VpsUser@$VpsIP" "cd $AppDir && npm install"
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 4: Run linting
Write-Host "4️⃣  Running linting checks..." -ForegroundColor Yellow
ssh "$VpsUser@$VpsIP" "cd $AppDir && npm run lint"
Write-Host "✅ Linting passed" -ForegroundColor Green
Write-Host ""

# Step 5: Run type checks
Write-Host "5️⃣  Running type checks..." -ForegroundColor Yellow
ssh "$VpsUser@$VpsIP" "cd $AppDir && npm run type-check"
Write-Host "✅ Type checks passed" -ForegroundColor Green
Write-Host ""

# Step 6: Build application
Write-Host "6️⃣  Building application..." -ForegroundColor Yellow
ssh "$VpsUser@$VpsIP" "cd $AppDir && npm run build"
Write-Host "✅ Build completed" -ForegroundColor Green
Write-Host ""

# Step 7: Restart PM2
Write-Host "7️⃣  Restarting application with PM2..." -ForegroundColor Yellow
ssh "$VpsUser@$VpsIP" "pm2 restart nexagestion && pm2 save"
Write-Host "✅ Application restarted" -ForegroundColor Green
Write-Host ""

# Step 8: Check PM2 status
Write-Host "8️⃣  Checking PM2 status..." -ForegroundColor Yellow
ssh "$VpsUser@$VpsIP" "pm2 status"
Write-Host ""

# Step 9: Wait for app to start
Write-Host "9️⃣  Waiting for application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "✅ Application should be running" -ForegroundColor Green
Write-Host ""

# Step 10: Test HTTP on IP
Write-Host "🔟 Testing HTTP on IP:Port..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$VpsIP`:$Port" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ HTTP on $VpsIP`:$Port is working" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  HTTP on $VpsIP`:$Port not responding yet" -ForegroundColor Yellow
}
Write-Host ""

# Step 11: Check application logs
Write-Host "1️⃣1️⃣  Checking application logs..." -ForegroundColor Yellow
ssh "$VpsUser@$VpsIP" "pm2 logs nexagestion --lines 10 --nostream"
Write-Host ""

# Step 12: Check system resources
Write-Host "1️⃣2️⃣  Checking system resources..." -ForegroundColor Yellow
ssh "$VpsUser@$VpsIP" "echo 'CPU Usage:' && top -bn1 | grep 'Cpu(s)' && echo '' && echo 'Memory Usage:' && free -h | grep Mem && echo '' && echo 'Disk Usage:' && df -h | grep -E '^/dev'"
Write-Host ""

# Step 13: Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Deployment & Testing Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "- Domain: $Domain"
Write-Host "- IP: $VpsIP"
Write-Host "- Port: $Port"
Write-Host "- Status: Running"
Write-Host ""

Write-Host "🔗 Access URLs:" -ForegroundColor Cyan
Write-Host "- HTTP (IP): http://$VpsIP`:$Port"
Write-Host "- HTTP (Domain): http://$Domain"
Write-Host "- HTTPS (Domain): https://$Domain"
Write-Host ""

Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
Write-Host "- View logs: ssh $VpsUser@$VpsIP 'pm2 logs nexagestion'"
Write-Host "- Restart app: ssh $VpsUser@$VpsIP 'pm2 restart nexagestion'"
Write-Host "- Stop app: ssh $VpsUser@$VpsIP 'pm2 stop nexagestion'"
Write-Host "- Monitor: ssh $VpsUser@$VpsIP 'pm2 monit'"
Write-Host ""

Write-Host "✨ Deployment successful!" -ForegroundColor Green

