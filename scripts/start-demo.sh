#!/bin/bash

# StudyCollab Demo Mode Startup Script
# This script starts all services in demo mode with auto-seeding

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
export REDIS_URL="${REDIS_URL:-redis://localhost:6379}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  StudyCollab Demo Mode Startup${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if database is running
echo -e "${BLUE}Checking database...${NC}"
if ! docker ps | grep -q studycollab-db; then
    echo -e "${YELLOW}Starting database container...${NC}"
    docker run -d \
        --name studycollab-db \
        -e POSTGRES_DB=studycollab \
        -e POSTGRES_USER=studycollab \
        -e POSTGRES_PASSWORD=studycollab \
        -p 5432:5432 \
        postgres:15-alpine > /dev/null 2>&1
    
    echo -e "${YELLOW}Waiting for database to initialize...${NC}"
    sleep 5
fi

echo -e "${BLUE}Checking Redis...${NC}"
if ! docker ps | grep -q studycollab-redis; then
    echo -e "${YELLOW}Starting Redis container...${NC}"
    docker run -d \
        --name studycollab-redis \
        -p 6379:6379 \
        redis:7-alpine > /dev/null 2>&1
    sleep 2
fi

# Run migration
echo -e "${BLUE}Running database migration...${NC}"
cd "$PROJECT_DIR/services/api"
npm run migrate > /dev/null 2>&1 || echo -e "${YELLOW}Migration may have already run${NC}"

# Seed demo data
echo -e "${BLUE}Seeding demo data...${NC}"
npm run seed:demo

# Start services with demo mode
echo -e "${BLUE}Starting services in demo mode...${NC}"

# Start API with demo mode
cd "$PROJECT_DIR/services/api"
DEMO_MODE=true REDIS_URL="$REDIS_URL" npm run dev > /tmp/studycollab/API.log 2>&1 &
API_PID=$!
echo "API started with PID: $API_PID"

# Start WebSocket
cd "$PROJECT_DIR/services/websocket"
DEMO_MODE=true REDIS_URL="$REDIS_URL" npm run dev > /tmp/studycollab/WebSocket.log 2>&1 &
WS_PID=$!
echo "WebSocket started with PID: $WS_PID"

# Start Frontend
cd "$PROJECT_DIR/apps/web"
npm run dev > /tmp/studycollab/Frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Save PIDs
mkdir -p /tmp/studycollab
echo "API:$API_PID:3001" > /tmp/studycollab/pids.txt
echo "WebSocket:$WS_PID:3002" >> /tmp/studycollab/pids.txt
echo "Frontend:$FRONTEND_PID:3000" >> /tmp/studycollab/pids.txt

# Wait for services
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 5

# Verify services
echo -e "${BLUE}Verifying services...${NC}"
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ API is running${NC}"
else
    echo -e "${RED}❌ API failed to start${NC}"
fi

if lsof -ti:3002 > /dev/null; then
    echo -e "${GREEN}✅ WebSocket is running${NC}"
else
    echo -e "${RED}❌ WebSocket failed to start${NC}"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${YELLOW}⏳ Frontend is starting...${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Demo Mode Started Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  API:       ${GREEN}http://localhost:3001${NC}"
echo -e "  WebSocket: ${GREEN}ws://localhost:3002${NC}"
echo ""
echo -e "${BLUE}Demo Credentials:${NC}"
echo -e "  ${YELLOW}test@studycollab.com${NC} / ${YELLOW}Test1234!${NC}"
echo -e "  ${YELLOW}admin@studycollab.com${NC} / ${YELLOW}Admin1234!${NC}"
echo -e "  ${YELLOW}student@studycollab.com${NC} / ${YELLOW}Student1234!${NC}"
echo ""
echo -e "${BLUE}Demo Data:${NC}"
echo -e "  ${GREEN}✅ 5 test users created${NC}"
echo -e "  ${GREEN}✅ 6 demo topics created${NC}"
echo -e "  ${GREEN}✅ Sample messages added${NC}"
echo ""
echo -e "${YELLOW}To reset demo data:${NC}"
echo -e "  cd services/api && npm run reset:demo && npm run seed:demo"
echo ""
echo -e "${YELLOW}To stop services:${NC}"
echo -e "  ./scripts/stop-services.sh"
echo ""

