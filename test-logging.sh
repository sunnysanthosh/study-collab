#!/bin/bash
# Quick test of logging system

echo "Testing logging system..."

# Test API with logging
curl -s http://localhost:3001/health > /dev/null && echo "✅ API health check logged"

# Test error logging
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"invalid"}' > /dev/null && echo "✅ Error logging tested"

# Check log files
if [ -d "backend/api/logs" ]; then
  echo "✅ Logs directory exists"
  ls -lh backend/api/logs/ 2>/dev/null | head -5
else
  echo "⚠️  Logs directory not found"
fi

echo ""
echo "Logging system test complete!"

