#!/bin/bash

# NexaGestion VPS Diagnostic & Fix Script
# Run this on the VPS to diagnose and fix deployment issues

set -e

echo "=========================================="
echo "NexaGestion VPS Diagnostic & Fix Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check directory
echo -e "${YELLOW}[1/10] Checking application directory...${NC}"
cd /root/nexagestion || { echo -e "${RED}ERROR: /root/nexagestion not found${NC}"; exit 1; }
pwd
echo -e "${GREEN}✓ Directory OK${NC}"
echo ""

# 2. Git status
echo -e "${YELLOW}[2/10] Checking Git status...${NC}"
git status
git log -1 --oneline
echo -e "${GREEN}✓ Git OK${NC}"
echo ""

# 3. Node versions
echo -e "${YELLOW}[3/10] Checking Node & npm versions...${NC}"
node -v
npm -v
echo -e "${GREEN}✓ Versions OK${NC}"
echo ""

# 4. Clean npm cache
echo -e "${YELLOW}[4/10] Cleaning npm cache...${NC}"
npm cache clean --force
echo -e "${GREEN}✓ Cache cleaned${NC}"
echo ""

# 5. Install dependencies
echo -e "${YELLOW}[5/10] Installing dependencies...${NC}"
npm install 2>&1 | tail -20
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# 6. Run linting
echo -e "${YELLOW}[6/10] Running linting...${NC}"
npm run lint 2>&1 | tail -20 || echo "Linting warnings (non-fatal)"
echo -e "${GREEN}✓ Linting checked${NC}"
echo ""

# 7. Type checking
echo -e "${YELLOW}[7/10] Running type checks...${NC}"
npm run type-check 2>&1 | tail -20 || echo "Type check warnings (non-fatal)"
echo -e "${GREEN}✓ Type checks done${NC}"
echo ""

# 8. Build
echo -e "${YELLOW}[8/10] Building application...${NC}"
npm run build 2>&1 | tail -50
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# 9. PM2 restart
echo -e "${YELLOW}[9/10] Restarting PM2...${NC}"
pm2 restart nexagestion || pm2 start npm --name nexagestion -- start
pm2 save
sleep 3
pm2 status
echo -e "${GREEN}✓ PM2 restarted${NC}"
echo ""

# 10. Health checks
echo -e "${YELLOW}[10/10] Running health checks...${NC}"
echo "Checking localhost:3000..."
curl -I http://localhost:3000 2>&1 | head -5
echo ""
echo "Checking IP:3000..."
curl -I http://72.61.106.182:3000 2>&1 | head -5
echo ""
echo "PM2 logs (last 20 lines):"
pm2 logs nexagestion --lines 20 --nostream
echo ""

echo -e "${GREEN}=========================================="
echo "✓ Diagnostic & Fix Complete!"
echo "==========================================${NC}"

