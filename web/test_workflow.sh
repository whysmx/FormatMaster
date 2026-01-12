#!/bin/bash

echo "=== Testing Complete Workflow ==="
echo ""
echo "1. Server Status:"
curl -s http://localhost:8002/api/health
echo ""
echo ""
echo "2. Available Templates:"
curl -s http://localhost:8002/api/templates
echo ""
echo ""
echo "3. History with Filename Masking:"
curl -s http://localhost:8002/api/history
echo ""
echo ""
echo "4. Page Status:"
echo -n "   Main page: "
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8002/
echo -n "   History page: "
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8002/history
echo -n "   Manage page: "
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8002/manage
echo ""
echo "✅ All tests completed!"
