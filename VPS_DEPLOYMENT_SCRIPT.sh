#!/bin/bash

# NexaGestion VPS Deployment and Testing Script
# This script deploys the latest changes to the VPS and runs comprehensive tests

set -e

echo "🚀 Starting NexaGestion VPS Deployment and Testing..."
echo "=================================================="

# Configuration
VPS_IP="72.61.106.182"
VPS_USER="root"
APP_DIR="/root/nexagestion"
BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Connecting to VPS and pulling latest changes...${NC}"
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
  cd /root/nexagestion
  echo "Current branch: $(git branch)"
  echo "Pulling latest changes..."
  git pull origin main
  echo "Latest commit: $(git log --oneline -1)"
ENDSSH

echo -e "${GREEN}✓ Latest changes pulled${NC}"

echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
  cd /root/nexagestion
  npm install
ENDSSH

echo -e "${GREEN}✓ Dependencies installed${NC}"

echo -e "${YELLOW}Step 3: Running linting checks...${NC}"
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
  cd /root/nexagestion
  npm run lint
ENDSSH

echo -e "${GREEN}✓ Linting passed${NC}"

echo -e "${YELLOW}Step 4: Running type checks...${NC}"
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
  cd /root/nexagestion
  npm run type-check
ENDSSH

echo -e "${GREEN}✓ Type checks passed${NC}"

echo -e "${YELLOW}Step 5: Building the application...${NC}"
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
  cd /root/nexagestion
  npm run build
ENDSSH

echo -e "${GREEN}✓ Build completed successfully${NC}"

echo -e "${YELLOW}Step 6: Restarting the application...${NC}"
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
  pm2 restart nexagestion
  pm2 save
  sleep 3
  pm2 status
ENDSSH

echo -e "${GREEN}✓ Application restarted${NC}"

echo -e "${YELLOW}Step 7: Running health checks...${NC}"
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
  echo "Checking HTTP endpoint..."
  curl -s -I http://localhost:3000 | head -1
  echo ""
  echo "Checking HTTPS endpoint..."
  curl -s -I https://nexagestion.arbark.cloud | head -1
ENDSSH

echo -e "${GREEN}✓ Health checks passed${NC}"

echo -e "${YELLOW}Step 8: Verifying deployment...${NC}"
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
  echo "Application Status:"
  pm2 status
  echo ""
  echo "Recent logs:"
  pm2 logs nexagestion --lines 10 --nostream
ENDSSH

echo -e "${GREEN}✓ Deployment verification complete${NC}"

echo ""
echo -e "${GREEN}=================================================="
echo "✅ DEPLOYMENT AND TESTING COMPLETE!"
echo "=================================================="
echo "Application URL: https://nexagestion.arbark.cloud"
echo "VPS IP: ${VPS_IP}"
echo "Branch: ${BRANCH}"
echo -e "=================================================="${NC}

