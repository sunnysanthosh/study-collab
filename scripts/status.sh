#!/bin/bash

# StudyCollab Service Status Script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_DIR="/tmp/studycollab"
PID_FILE="$LOG_DIR/pids.txt"
STATUS_FILE="$LOG_DIR/status.txt"

# Function: Check service status
check_service() {
    local service_name=$1
    local port=$2
    local health_url=$3
    
    echo -n "  $service_name (port $port): "
    
    # Check if port is in use
    if lsof -ti:$port > /dev/null 2>&1; then
        # Check health if URL provided
        if [ -n "$health_url" ]; then
            if curl -s "$health_url" > /dev/null 2>&1; then
                echo -e "${GREEN}✓ Running${NC}"
            else
                echo -e "${YELLOW}⚠ Port in use but not responding${NC}"
            fi
        else
            echo -e "${GREEN}✓ Running${NC}"
        fi
    else
        echo -e "${RED}✗ Not running${NC}"
    fi
}

# Main
echo -e "${BLUE}StudyCollab Service Status${NC}"
echo "================================"
echo ""

# Check services
check_service "Frontend" 3000 "http://localhost:3000"
check_service "API" 3001 "http://localhost:3001/health"
check_service "WebSocket" 3002 ""
check_service "Database" 5432 ""

echo ""

# Show PID file info
if [ -f "$PID_FILE" ]; then
    echo -e "${BLUE}Running Processes:${NC}"
    while IFS= read -r line; do
        if [ -n "$line" ]; then
            IFS=':' read -r service_name pid port <<< "$line"
            if ps -p "$pid" > /dev/null 2>&1; then
                echo "  $service_name: PID $pid"
            fi
        fi
    done < "$PID_FILE"
    echo ""
fi

# Show status file
if [ -f "$STATUS_FILE" ]; then
    echo -e "${BLUE}Last Status:${NC}"
    cat "$STATUS_FILE"
    echo ""
fi

# Show log files
if [ -d "$LOG_DIR" ]; then
    echo -e "${BLUE}Log Files:${NC}"
    ls -lh "$LOG_DIR"/*.log 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}' || echo "  No log files"
fi

