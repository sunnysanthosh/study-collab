#!/bin/bash

# StudyCollab Service Shutdown Script
# Handles orderly shutdown of all services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/Users/santhoshsrinivas/MyApps/iLearn/study-collab"
LOG_DIR="/tmp/studycollab"
PID_FILE="$LOG_DIR/pids.txt"
STATUS_FILE="$LOG_DIR/status.txt"

# Error Codes
EXIT_SUCCESS=0
EXIT_PROCESS_NOT_FOUND=1

# Function: Log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/shutdown.log"
}

# Function: Stop service by PID
stop_service() {
    local service_name=$1
    local pid=$2
    local port=$3
    
    if [ -z "$pid" ]; then
        log "${YELLOW}⚠ $service_name: No PID found${NC}"
        return
    fi
    
    # Check if process exists
    if ps -p "$pid" > /dev/null 2>&1; then
        log "${BLUE}Stopping $service_name (PID: $pid)...${NC}"
        kill "$pid" 2>/dev/null || true
        
        # Wait for graceful shutdown
        local count=0
        while ps -p "$pid" > /dev/null 2>&1 && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # Force kill if still running
        if ps -p "$pid" > /dev/null 2>&1; then
            log "${YELLOW}Force killing $service_name...${NC}"
            kill -9 "$pid" 2>/dev/null || true
        fi
        
        log "${GREEN}✓ $service_name stopped${NC}"
    else
        log "${YELLOW}⚠ $service_name (PID: $pid) not running${NC}"
    fi
    
    # Also kill by port (fallback)
    if [ -n "$port" ]; then
        local port_pid=$(lsof -ti:$port 2>/dev/null || true)
        if [ -n "$port_pid" ]; then
            log "${BLUE}Killing process on port $port (PID: $port_pid)...${NC}"
            kill "$port_pid" 2>/dev/null || true
        fi
    fi
}

# Function: Main shutdown sequence
main() {
    log "${GREEN}========================================${NC}"
    log "${GREEN}  StudyCollab Service Shutdown${NC}"
    log "${GREEN}========================================${NC}"
    
    # Stop services in reverse order
    # 1. Frontend
    # 2. WebSocket
    # 3. API
    # 4. Database (optional)
    
    if [ -f "$PID_FILE" ]; then
        log "${BLUE}Stopping services from PID file...${NC}"
        
        # Read PIDs in reverse order
        while IFS= read -r line; do
            if [ -n "$line" ]; then
                IFS=':' read -r service_name pid port <<< "$line"
                stop_service "$service_name" "$pid" "$port"
            fi
        done < <(tac "$PID_FILE")
        
        # Clear PID file
        > "$PID_FILE"
    else
        log "${YELLOW}No PID file found, stopping by port...${NC}"
    fi
    
    # Stop by ports (fallback)
    log "${BLUE}Checking ports for remaining processes...${NC}"
    for port in 3000 3001 3002; do
        local pid=$(lsof -ti:$port 2>/dev/null || true)
        if [ -n "$pid" ]; then
            log "${BLUE}Killing process on port $port (PID: $pid)...${NC}"
            kill "$pid" 2>/dev/null || true
        fi
    done
    
    # Stop Docker Compose if running
    if command -v docker-compose &> /dev/null; then
        if docker-compose ps 2>/dev/null | grep -q "Up"; then
            log "${BLUE}Stopping Docker Compose services...${NC}"
            cd "$PROJECT_ROOT"
            docker-compose down 2>/dev/null || true
            log "${GREEN}✓ Docker Compose services stopped${NC}"
        fi
    fi
    
    # Stop database container (optional)
    if command -v docker &> /dev/null; then
        if docker ps | grep -q studycollab-db; then
            read -p "Stop database container? (y/N): " stop_db
            if [ "$stop_db" = "y" ] || [ "$stop_db" = "Y" ]; then
                log "${BLUE}Stopping database container...${NC}"
                docker stop studycollab-db 2>/dev/null || true
                log "${GREEN}✓ Database container stopped${NC}"
            else
                log "${YELLOW}Database container left running${NC}"
            fi
        fi
    fi
    
    # Update status
    echo "STOPPED" > "$STATUS_FILE"
    echo "$(date)" >> "$STATUS_FILE"
    
    log "${GREEN}========================================${NC}"
    log "${GREEN}  All services stopped${NC}"
    log "${GREEN}========================================${NC}"
    
    exit $EXIT_SUCCESS
}

# Run main function
main "$@"

