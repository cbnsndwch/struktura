#!/bin/bash

# Test script for Docker Compose setup
# This script validates that all services start correctly and are healthy

set -e

echo "🐳 Testing Docker Compose setup for Struktura..."

# Function to check if service is healthy
check_service_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps $service | grep -q "healthy"; then
            echo "✅ $service is healthy!"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts - waiting for $service..."
        sleep 5
        ((attempt++))
    done
    
    echo "❌ $service failed to become healthy after $max_attempts attempts"
    return 1
}

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo "🌐 Testing $description at $url..."
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo "✅ $description is working!"
        return 0
    else
        echo "❌ $description failed!"
        return 1
    fi
}

# Start services
echo "🚀 Starting Docker Compose services..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Check each service health
check_service_health "mongodb"
check_service_health "redis"

# Wait a bit more for the app to fully start
echo "⏳ Waiting for application to start..."
sleep 30

check_service_health "app"

# Test endpoints
test_endpoint "http://localhost:3000/health" "200" "Health check endpoint"
test_endpoint "http://localhost:3000" "200" "Main application"

# Test database connectivity
echo "🗄️  Testing MongoDB connectivity..."
if docker compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping').ok" | grep -q "1"; then
    echo "✅ MongoDB is accessible!"
else
    echo "❌ MongoDB connectivity test failed!"
    exit 1
fi

# Test Redis connectivity  
echo "🔴 Testing Redis connectivity..."
if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is accessible!"
else
    echo "❌ Redis connectivity test failed!"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Docker Compose setup is working correctly."
echo ""
echo "📱 Access points:"
echo "   • Main Application: http://localhost:3000"  
echo "   • Health Check: http://localhost:3000/health"
echo "   • GraphQL Playground: http://localhost:3000/graphql"
echo ""
echo "🔧 Useful commands:"
echo "   • View logs: docker compose logs -f"
echo "   • Stop services: docker compose down"
echo "   • Restart services: docker compose restart"
echo ""