#!/bin/bash

# NexaGestion VPS Deployment & Testing Script
# Run this on the VPS to deploy and test the application

set -e

echo "🚀 NexaGestion VPS Deployment & Testing"
echo "========================================"
echo ""

# Configuration
APP_DIR="/root/nexagestion"
DOMAIN="nexagestion.arbarak.cloud"
IP="72.61.106.182"
PORT="3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verify connectivity
echo -e "${YELLOW}1️⃣  Verifying VPS connectivity...${NC}"
if ping -c 1 8.8.8.8 &> /dev/null; then
    echo -e "${GREEN}✅ Internet connectivity OK${NC}"
else
    echo -e "${RED}❌ No internet connectivity${NC}"
    exit 1
fi
echo ""

# Step 2: Check application directory
echo -e "${YELLOW}2️⃣  Checking application directory...${NC}"
if [ -d "$APP_DIR" ]; then
    echo -e "${GREEN}✅ Application directory exists${NC}"
    cd "$APP_DIR"
else
    echo -e "${RED}❌ Application directory not found${NC}"
    exit 1
fi
echo ""

# Step 3: Pull latest code
echo -e "${YELLOW}3️⃣  Pulling latest code from GitHub...${NC}"
git fetch origin
git pull origin main
echo -e "${GREEN}✅ Code pulled successfully${NC}"
echo ""

# Step 4: Install dependencies
echo -e "${YELLOW}4️⃣  Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 5: Run linting
echo -e "${YELLOW}5️⃣  Running linting checks...${NC}"
npm run lint
echo -e "${GREEN}✅ Linting passed${NC}"
echo ""

# Step 6: Run type checks
echo -e "${YELLOW}6️⃣  Running type checks...${NC}"
npm run type-check
echo -e "${GREEN}✅ Type checks passed${NC}"
echo ""

# Step 7: Build application
echo -e "${YELLOW}7️⃣  Building application...${NC}"
npm run build
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Step 8: Restart PM2
echo -e "${YELLOW}8️⃣  Restarting application with PM2...${NC}"
pm2 restart nexagestion || pm2 start npm --name nexagestion -- start
pm2 save
echo -e "${GREEN}✅ Application restarted${NC}"
echo ""

# Step 9: Check PM2 status
echo -e "${YELLOW}9️⃣  Checking PM2 status...${NC}"
pm2 status
echo ""

# Step 10: Test HTTP on IP
echo -e "${YELLOW}🔟 Testing HTTP on IP:Port...${NC}"
sleep 3
if curl -s -I http://localhost:$PORT | head -1; then
    echo -e "${GREEN}✅ HTTP on localhost:$PORT is working${NC}"
else
    echo -e "${RED}❌ HTTP on localhost:$PORT failed${NC}"
fi
echo ""

# Step 11: Test HTTP on domain
echo -e "${YELLOW}1️⃣1️⃣  Testing HTTP on domain...${NC}"
if curl -s -I http://$DOMAIN | head -1; then
    echo -e "${GREEN}✅ HTTP on $DOMAIN is working${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP on $DOMAIN not working (DNS may not be propagated)${NC}"
fi
echo ""

# Step 12: Check application logs
echo -e "${YELLOW}1️⃣2️⃣  Checking application logs...${NC}"
pm2 logs nexagestion --lines 10 --nostream
echo ""

# Step 13: Check system resources
echo -e "${YELLOW}1️⃣3️⃣  Checking system resources...${NC}"
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}'
echo ""
echo "Memory Usage:"
free -h | grep Mem
echo ""
echo "Disk Usage:"
df -h | grep -E "^/dev"
echo ""

# Step 14: Verify Nginx
echo -e "${YELLOW}1️⃣4️⃣  Verifying Nginx configuration...${NC}"
nginx -t
echo -e "${GREEN}✅ Nginx configuration OK${NC}"
echo ""

# Step 15: Summary
echo -e "${GREEN}========================================"
echo "✅ Deployment & Testing Complete!"
echo "========================================${NC}"
echo ""
echo "📊 Summary:"
echo "- Domain: $DOMAIN"
echo "- IP: $IP"
echo "- Port: $PORT"
echo "- Status: Running"
echo ""
echo "🔗 Access URLs:"
echo "- HTTP (IP): http://$IP:$PORT"
echo "- HTTP (Domain): http://$DOMAIN"
echo "- HTTPS (Domain): https://$DOMAIN"
echo ""
echo "📝 Useful Commands:"
echo "- View logs: pm2 logs nexagestion"
echo "- Restart app: pm2 restart nexagestion"
echo "- Stop app: pm2 stop nexagestion"
echo "- Monitor: pm2 monit"
echo ""

