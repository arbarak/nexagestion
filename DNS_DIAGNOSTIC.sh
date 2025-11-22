#!/bin/bash

# NexaGestion DNS Diagnostic Script
# Run this to diagnose DNS and domain issues

echo "🔍 NexaGestion DNS Diagnostic"
echo "=============================="
echo ""

DOMAIN="nexagestion.arbarak.cloud"
IP="72.61.106.182"
PORT="3000"

echo "📋 Configuration:"
echo "Domain: $DOMAIN"
echo "IP: $IP"
echo "Port: $PORT"
echo ""

# Test 1: DNS Resolution
echo "1️⃣  Testing DNS Resolution..."
if command -v nslookup &> /dev/null; then
    nslookup $DOMAIN
    echo ""
elif command -v dig &> /dev/null; then
    dig $DOMAIN
    echo ""
else
    echo "⚠️  nslookup/dig not available"
    echo ""
fi

# Test 2: Ping IP
echo "2️⃣  Testing IP Connectivity..."
if ping -c 1 $IP &> /dev/null; then
    echo "✅ IP $IP is reachable"
else
    echo "❌ IP $IP is not reachable"
fi
echo ""

# Test 3: HTTP on IP
echo "3️⃣  Testing HTTP on IP:Port..."
if curl -s -I http://$IP:$PORT | head -1; then
    echo "✅ HTTP on $IP:$PORT is working"
else
    echo "❌ HTTP on $IP:$PORT is not working"
fi
echo ""

# Test 4: HTTP on Domain
echo "4️⃣  Testing HTTP on Domain..."
if curl -s -I http://$DOMAIN | head -1; then
    echo "✅ HTTP on $DOMAIN is working"
else
    echo "❌ HTTP on $DOMAIN is not working"
fi
echo ""

# Test 5: HTTPS on Domain
echo "5️⃣  Testing HTTPS on Domain..."
if curl -s -I https://$DOMAIN 2>/dev/null | head -1; then
    echo "✅ HTTPS on $DOMAIN is working"
else
    echo "❌ HTTPS on $DOMAIN is not working"
fi
echo ""

# Test 6: Check DNS from Google
echo "6️⃣  Testing DNS with Google's nameserver..."
if command -v nslookup &> /dev/null; then
    nslookup $DOMAIN 8.8.8.8
    echo ""
fi

echo "=============================="
echo "✅ Diagnostic Complete"
echo ""
echo "Next Steps:"
echo "1. If DNS fails: Wait 24-48 hours for propagation"
echo "2. If HTTP on IP works but domain fails: DNS issue"
echo "3. If HTTPS fails: SSL certificate issue"
echo "4. Check Dokploy dashboard for domain status"

