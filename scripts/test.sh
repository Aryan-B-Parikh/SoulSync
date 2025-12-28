#!/bin/bash
# Test runner script for SoulSync

echo "🧪 Running SoulSync test suite..."

# Run client tests
echo "📱 Running client tests..."
cd client && npm test -- --watchAll=false --coverage
client_exit=$?
cd ..

# Run server tests
echo "🖥️  Running server tests..."
npm run test:server
server_exit=$?

# Summary
echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="

if [ $client_exit -eq 0 ]; then
    echo "✅ Client tests: PASSED"
else
    echo "❌ Client tests: FAILED"
fi

if [ $server_exit -eq 0 ]; then
    echo "✅ Server tests: PASSED"
else
    echo "❌ Server tests: FAILED"
fi

echo "========================================="

if [ $client_exit -eq 0 ] && [ $server_exit -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed."
    exit 1
fi
