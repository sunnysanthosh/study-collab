#!/bin/bash

# StudyCollab Development Startup Script
# This script helps start all services for local development

set -e

echo "🚀 Starting StudyCollab Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v20 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
    echo ""
    echo "Choose deployment method:"
    echo "1) Docker Compose (recommended - starts all services including database)"
    echo "2) Manual (start services individually)"
    read -p "Enter choice [1 or 2]: " choice
    
    if [ "$choice" = "1" ]; then
        echo ""
        echo "${GREEN}Starting services with Docker Compose...${NC}"
        docker-compose up -d
        echo ""
        echo "${GREEN}✅ All services started!${NC}"
        echo ""
        echo "Services:"
        echo "  Frontend:  http://localhost:3000"
        echo "  API:       http://localhost:3001"
        echo "  WebSocket: http://localhost:3002"
        echo "  Database:  localhost:5432"
        echo ""
        echo "View logs: docker-compose logs -f"
        echo "Stop services: docker-compose down"
        exit 0
    fi
fi

echo "${YELLOW}Starting services manually...${NC}"
echo ""

# Install dependencies if needed
echo "📦 Checking dependencies..."

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/api/node_modules" ]; then
    echo "Installing API dependencies..."
    cd backend/api
    npm install
    cd ../..
fi

if [ ! -d "backend/websocket/node_modules" ]; then
    echo "Installing WebSocket dependencies..."
    cd backend/websocket
    npm install
    cd ../..
fi

echo "✅ Dependencies installed"
echo ""

# Check if PostgreSQL is running
echo "🔍 Checking database..."
if command -v docker &> /dev/null; then
    if docker ps | grep -q postgres; then
        echo "✅ PostgreSQL container is running"
    else
        echo "${YELLOW}⚠️  PostgreSQL not running. Starting container...${NC}"
        docker run -d \
            --name studycollab-db \
            -e POSTGRES_DB=studycollab \
            -e POSTGRES_USER=studycollab \
            -e POSTGRES_PASSWORD=studycollab \
            -p 5432:5432 \
            postgres:15-alpine
        echo "✅ PostgreSQL container started"
    fi
else
    echo "${YELLOW}⚠️  Docker not available. Please ensure PostgreSQL is running on localhost:5432${NC}"
fi

echo ""
echo "${GREEN}Starting services in separate terminals...${NC}"
echo ""
echo "You'll need to open 3 terminal windows:"
echo ""
echo "Terminal 1 - Frontend:"
echo "  cd $(pwd)"
echo "  npm run dev"
echo ""
echo "Terminal 2 - API:"
echo "  cd $(pwd)/backend/api"
echo "  npm run dev"
echo ""
echo "Terminal 3 - WebSocket:"
echo "  cd $(pwd)/backend/websocket"
echo "  npm run dev"
echo ""

read -p "Would you like to start them now? [y/N]: " start_now

if [ "$start_now" = "y" ] || [ "$start_now" = "Y" ]; then
    echo ""
    echo "${GREEN}Starting services...${NC}"
    echo ""
    
    # Start frontend in background
    echo "Starting Frontend on http://localhost:3000..."
    npm run dev > /tmp/studycollab-frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    
    # Start API in background
    echo "Starting API on http://localhost:3001..."
    cd backend/api
    npm run dev > /tmp/studycollab-api.log 2>&1 &
    API_PID=$!
    echo "API PID: $API_PID"
    cd ../..
    
    # Start WebSocket in background
    echo "Starting WebSocket on http://localhost:3002..."
    cd backend/websocket
    npm run dev > /tmp/studycollab-websocket.log 2>&1 &
    WEBSOCKET_PID=$!
    echo "WebSocket PID: $WEBSOCKET_PID"
    cd ../..
    
    echo ""
    echo "${GREEN}✅ All services started!${NC}"
    echo ""
    echo "Services:"
    echo "  Frontend:  http://localhost:3000 (PID: $FRONTEND_PID)"
    echo "  API:       http://localhost:3001 (PID: $API_PID)"
    echo "  WebSocket: http://localhost:3002 (PID: $WEBSOCKET_PID)"
    echo ""
    echo "View logs:"
    echo "  tail -f /tmp/studycollab-frontend.log"
    echo "  tail -f /tmp/studycollab-api.log"
    echo "  tail -f /tmp/studycollab-websocket.log"
    echo ""
    echo "To stop services:"
    echo "  kill $FRONTEND_PID $API_PID $WEBSOCKET_PID"
    echo ""
    
    # Save PIDs to file for easy stopping
    echo "$FRONTEND_PID $API_PID $WEBSOCKET_PID" > /tmp/studycollab-pids.txt
    echo "PIDs saved to /tmp/studycollab-pids.txt"
else
    echo ""
    echo "Please start the services manually using the commands above."
fi

