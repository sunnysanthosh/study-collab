#!/bin/bash

# StudyCollab Development Stop Script

echo "🛑 Stopping StudyCollab services..."

# Stop Docker Compose if running
if docker-compose ps | grep -q "Up"; then
    echo "Stopping Docker Compose services..."
    docker-compose down
fi

# Stop processes from PID file
if [ -f /tmp/studycollab-pids.txt ]; then
    PIDS=$(cat /tmp/studycollab-pids.txt)
    if [ ! -z "$PIDS" ]; then
        echo "Stopping processes: $PIDS"
        kill $PIDS 2>/dev/null || true
        rm /tmp/studycollab-pids.txt
    fi
fi

# Kill processes by port (fallback)
echo "Checking for processes on ports 3000, 3001, 3002..."
for port in 3000 3001 3002; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "Killing process on port $port (PID: $PID)"
        kill $PID 2>/dev/null || true
    fi
done

echo "✅ Services stopped"

