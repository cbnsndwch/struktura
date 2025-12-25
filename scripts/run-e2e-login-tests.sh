#!/bin/bash
# Helper script to run E2E login tests with proper setup

set -e

echo "🧪 E2E Login Authentication Test Runner"
echo "========================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo "📊 Checking MongoDB connection..."
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${RED}✗ MongoDB is not running${NC}"
    echo ""
    echo "Please start MongoDB before running tests:"
    echo "  macOS: brew services start mongodb-community"
    echo "  Linux: sudo systemctl start mongod"
    echo "  Docker: docker run -d -p 27017:27017 --name mongodb mongo:7.0"
    exit 1
fi

# Check if dev server is running
echo "🌐 Checking if dev server is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Dev server is running at http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠ Dev server is not running${NC}"
    echo ""
    echo "Please start the dev server in another terminal:"
    echo "  cd apps/main"
    echo "  pnpm dev"
    echo ""
    read -p "Press Enter once the dev server is running, or Ctrl+C to cancel..."
fi

# Seed the database
echo ""
echo "🌱 Seeding test users..."
if pnpm db:seed; then
    echo -e "${GREEN}✓ Database seeded successfully${NC}"
else
    echo -e "${RED}✗ Failed to seed database${NC}"
    exit 1
fi

# Wait a moment for database operations to settle
sleep 2

# Run the tests
echo ""
echo "🧪 Running E2E login authentication tests..."
echo ""

cd apps/main
if pnpm test:e2e; then
    echo ""
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
