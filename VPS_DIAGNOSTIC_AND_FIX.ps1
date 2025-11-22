# NexaGestion VPS Diagnostic & Fix Script (PowerShell)
# Run this from Windows PowerShell to diagnose and fix VPS deployment

$VPS_IP = "72.61.106.182"
$VPS_USER = "root"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "NexaGestion VPS Diagnostic & Fix Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# SSH command to run on VPS
$commands = @"
cd /root/nexagestion

echo '=== 1. Directory Check ==='
pwd
ls -la | head -5

echo ''
echo '=== 2. Git Status ==='
git status
git log -1 --oneline

echo ''
echo '=== 3. Node Versions ==='
node -v
npm -v

echo ''
echo '=== 4. Cleaning npm cache ==='
npm cache clean --force

echo ''
echo '=== 5. Installing dependencies ==='
npm install 2>&1 | tail -20

echo ''
echo '=== 6. Running linting ==='
npm run lint 2>&1 | tail -10 || echo 'Linting warnings (non-fatal)'

echo ''
echo '=== 7. Type checking ==='
npm run type-check 2>&1 | tail -10 || echo 'Type check warnings (non-fatal)'

echo ''
echo '=== 8. Building application ==='
npm run build 2>&1 | tail -30

echo ''
echo '=== 9. PM2 Status ==='
pm2 status

echo ''
echo '=== 10. Restarting PM2 ==='
pm2 restart nexagestion || pm2 start npm --name nexagestion -- start
pm2 save
sleep 3

echo ''
echo '=== 11. Health Checks ==='
echo 'Testing localhost:3000...'
curl -I http://localhost:3000 2>&1 | head -5

echo ''
echo 'Testing IP:3000...'
curl -I http://72.61.106.182:3000 2>&1 | head -5

echo ''
echo '=== 12. PM2 Logs ==='
pm2 logs nexagestion --lines 30 --nostream

echo ''
echo '✓ Diagnostic Complete!'
"@

Write-Host "Connecting to VPS: $VPS_IP" -ForegroundColor Yellow
Write-Host "Running diagnostic commands..." -ForegroundColor Yellow
Write-Host ""

# Execute SSH command
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" $commands

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✓ Diagnostic Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

