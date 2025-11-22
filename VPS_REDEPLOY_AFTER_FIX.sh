#!/bin/bash

# NexaGestion VPS Redeploy After Fix
# Run this on the VPS to pull latest fixes and rebuild

set -e

echo "=========================================="
echo "NexaGestion VPS Redeploy Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Navigate to app
echo -e "${YELLOW}[1/8] Navigating to app directory...${NC}"
cd /root/nexagestion || { echo -e "${RED}ERROR: /root/nexagestion not found${NC}"; exit 1; }
pwd
echo -e "${GREEN}✓ Directory OK${NC}"
echo ""

# 2. Stop PM2
echo -e "${YELLOW}[2/8] Stopping PM2...${NC}"
pm2 stop nexagestion || true
sleep 2
echo -e "${GREEN}✓ PM2 stopped${NC}"
echo ""

# 3. Pull latest changes
echo -e "${YELLOW}[3/8] Pulling latest changes from GitHub...${NC}"
git pull origin main
echo -e "${GREEN}✓ Changes pulled${NC}"
echo ""

# 4. Clean npm cache
echo -e "${YELLOW}[4/8] Cleaning npm cache...${NC}"
npm cache clean --force
echo -e "${GREEN}✓ Cache cleaned${NC}"
echo ""

# 5. Install dependencies
echo -e "${YELLOW}[5/8] Installing dependencies...${NC}"
npm install 2>&1 | tail -10
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# 6. Build
echo -e "${YELLOW}[6/8] Building application...${NC}"
npm run build 2>&1 | tail -20
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# 7. Kill any lingering processes on port 3000
echo -e "${YELLOW}[7/8] Cleaning up port 3000...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓ Port cleaned${NC}"
echo ""

# 8. Restart PM2
echo -e "${YELLOW}[8/8] Restarting PM2...${NC}"
pm2 restart nexagestion || pm2 start npm --name nexagestion -- start
pm2 save
sleep 3
pm2 status
echo -e "${GREEN}✓ PM2 restarted${NC}"
echo ""

# Health checks
echo -e "${YELLOW}Running health checks...${NC}"
sleep 2
curl -I http://localhost:3000 2>&1 | head -3
echo ""
echo -e "${GREEN}=========================================="
echo "✓ Redeploy Complete!"
echo "==========================================${NC}"

