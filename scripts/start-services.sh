#!/bin/bash

# StudyCollab Service Startup Script
# Handles dependency management and orderly startup

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="/tmp/studycollab"
PID_FILE="$LOG_DIR/pids.txt"
STATUS_FILE="$LOG_DIR/status.txt"

# Error Codes
EXIT_SUCCESS=0
EXIT_PORT_IN_USE=1
EXIT_DEPENDENCY_MISSING=2
EXIT_DATABASE_ERROR=3
EXIT_SERVICE_FAILED=4
EXIT_INVALID_ENV=5

# Create log directory
mkdir -p "$LOG_DIR"

# Function: Log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/startup.log"
}

# Function: Check if port is available
check_port() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        return 1  # Port in use
    fi
    return 0  # Port available
}

# Function: Wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=0
    
    log "${YELLOW}Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            log "${GREEN}✓ $service_name is ready${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    log "${RED}✗ $service_name failed to start after $max_attempts seconds${NC}"
    return 1
}

# Function: Check dependencies
check_dependencies() {
    log "${BLUE}Checking dependencies...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log "${RED}✗ Node.js is not installed${NC}"
        exit $EXIT_DEPENDENCY_MISSING
    fi
    log "${GREEN}✓ Node.js $(node --version)${NC}"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log "${RED}✗ npm is not installed${NC}"
        exit $EXIT_DEPENDENCY_MISSING
    fi
    log "${GREEN}✓ npm $(npm --version)${NC}"
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        log "${GREEN}✓ Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1)${NC}"
    else
        log "${YELLOW}⚠ Docker not found (optional)${NC}"
    fi
}

# Function: Check ports
check_ports() {
    log "${BLUE}Checking ports...${NC}"
    
    local ports=(3000 3001 3002 5432)
    local port_names=("Frontend" "API" "WebSocket" "Database")
    
    for i in "${!ports[@]}"; do
        if check_port "${ports[$i]}"; then
            log "${GREEN}✓ Port ${ports[$i]} (${port_names[$i]}) is available${NC}"
        else
            log "${RED}✗ Port ${ports[$i]} (${port_names[$i]}) is already in use${NC}"
            log "${YELLOW}  Run: lsof -ti:${ports[$i]} | xargs kill -9${NC}"
            exit $EXIT_PORT_IN_USE
        fi
    done
}

# Function: Setup database
setup_database() {
    log "${BLUE}Setting up database...${NC}"
    
    if command -v docker &> /dev/null; then
        # Check if container exists
        if docker ps -a | grep -q studycollab-db; then
            if docker ps | grep -q studycollab-db; then
                log "${GREEN}✓ Database container is running${NC}"
            else
                log "${YELLOW}Starting existing database container...${NC}"
                docker start studycollab-db
                sleep 2
            fi
        else
            log "${YELLOW}Creating database container...${NC}"
            docker run -d \
                --name studycollab-db \
                -e POSTGRES_DB=studycollab \
                -e POSTGRES_USER=studycollab \
                -e POSTGRES_PASSWORD=studycollab \
                -p 5432:5432 \
                postgres:15-alpine > /dev/null 2>&1
            
            log "${YELLOW}Waiting for database to initialize...${NC}"
            sleep 5
        fi
        
        # Verify database is ready
        if docker exec studycollab-db pg_isready -U studycollab > /dev/null 2>&1; then
            log "${GREEN}✓ Database is ready${NC}"
        else
            log "${RED}✗ Database failed to start${NC}"
            exit $EXIT_DATABASE_ERROR
        fi
    else
        log "${YELLOW}⚠ Docker not available. Please ensure PostgreSQL is running on localhost:5432${NC}"
    fi
}

# Function: Install dependencies if needed
install_dependencies() {
    log "${BLUE}Checking dependencies...${NC}"
    
    cd "$PROJECT_ROOT"
    
    # Frontend
    if [ ! -d "node_modules" ]; then
        log "${YELLOW}Installing frontend dependencies...${NC}"
        npm install
    fi
    log "${GREEN}✓ Frontend dependencies${NC}"
    
    # Backend API
    if [ ! -d "backend/api/node_modules" ]; then
        log "${YELLOW}Installing API dependencies...${NC}"
        cd backend/api
        npm install
        cd "$PROJECT_ROOT"
    fi
    log "${GREEN}✓ API dependencies${NC}"
    
    # WebSocket
    if [ ! -d "backend/websocket/node_modules" ]; then
        log "${YELLOW}Installing WebSocket dependencies...${NC}"
        cd backend/websocket
        npm install
        cd "$PROJECT_ROOT"
    fi
    log "${GREEN}✓ WebSocket dependencies${NC}"
}

# Function: Start service
start_service() {
    local service_name=$1
    local service_dir=$2
    local command=$3
    local port=$4
    local health_url=$5
    
    log "${BLUE}Starting $service_name...${NC}"
    
    cd "$PROJECT_ROOT/$service_dir"
    
    # Start service in background
    nohup $command > "$LOG_DIR/${service_name}.log" 2>&1 &
    local pid=$!
    
    # Save PID
    echo "$service_name:$pid:$port" >> "$PID_FILE"
    
    log "${GREEN}✓ $service_name started (PID: $pid)${NC}"
    
    # Wait for service to be ready
    if [ -n "$health_url" ]; then
        wait_for_service "$health_url" "$service_name" || exit $EXIT_SERVICE_FAILED
    else
        sleep 2
    fi
    
    cd "$PROJECT_ROOT"
}

# Function: Main startup sequence
main() {
    log "${GREEN}========================================${NC}"
    log "${GREEN}  StudyCollab Service Startup${NC}"
    log "${GREEN}========================================${NC}"
    
    # Clear previous PIDs
    > "$PID_FILE"
    > "$STATUS_FILE"
    
    # Pre-flight checks
    check_dependencies
    check_ports
    
    # Setup
    install_dependencies
    setup_database
    
    log "${BLUE}Starting services in order...${NC}"
    
    # Start services in dependency order
    # 1. Database (already done)
    # 2. API (depends on database)
    start_service "API" "backend/api" "npm run dev" 3001 "http://localhost:3001/health"
    
    # 3. WebSocket (depends on database)
    start_service "WebSocket" "backend/websocket" "npm run dev" 3002 ""
    
    # 4. Frontend (depends on API and WebSocket)
    start_service "Frontend" "." "npm run dev" 3000 "http://localhost:3000"
    
    # Final status
    log "${GREEN}========================================${NC}"
    log "${GREEN}  All services started successfully!${NC}"
    log "${GREEN}========================================${NC}"
    log ""
    log "${BLUE}Service URLs:${NC}"
    log "  Frontend:  http://localhost:3000"
    log "  API:       http://localhost:3001"
    log "  WebSocket: http://localhost:3002"
    log "  Database:  localhost:5432"
    log ""
    log "${BLUE}View logs:${NC}"
    log "  tail -f $LOG_DIR/*.log"
    log ""
    log "${BLUE}Stop services:${NC}"
    log "  $PROJECT_ROOT/scripts/stop-services.sh"
    log ""
    
    # Save status
    echo "RUNNING" > "$STATUS_FILE"
    echo "$(date)" >> "$STATUS_FILE"
    
    exit $EXIT_SUCCESS
}

# Run main function
main "$@"

