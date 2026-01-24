#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="/tmp/studycollab-e2e"
mkdir -p "$LOG_DIR"

API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3001}"
SOCKET_URL="${NEXT_PUBLIC_SOCKET_URL:-http://localhost:3002}"
FRONTEND_URL="${E2E_BASE_URL:-http://localhost:3000}"
DATABASE_URL="${TEST_DATABASE_URL:-postgresql://studycollab:studycollab@localhost:5432/studycollab}"
JWT_SECRET="${JWT_SECRET:-test-secret}"

API_PID=""
WS_PID=""
FE_PID=""

cleanup() {
  if [ -n "$FE_PID" ] && ps -p "$FE_PID" > /dev/null 2>&1; then
    kill "$FE_PID" 2>/dev/null || true
  fi
  if [ -n "$WS_PID" ] && ps -p "$WS_PID" > /dev/null 2>&1; then
    kill "$WS_PID" 2>/dev/null || true
  fi
  if [ -n "$API_PID" ] && ps -p "$API_PID" > /dev/null 2>&1; then
    kill "$API_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

port_open() {
  local port=$1
  (echo > /dev/tcp/127.0.0.1/$port) >/dev/null 2>&1
}

wait_for_url() {
  local url=$1
  local name=$2
  for i in {1..40}; do
    if curl -fsS "$url" > /dev/null 2>&1; then
      echo "✅ $name is ready"
      return 0
    fi
    sleep 1
  done
  echo "❌ $name failed to start"
  return 1
}

cd "$PROJECT_ROOT"

if ! port_open 5432; then
  if command -v docker &> /dev/null; then
    docker compose up -d db
  else
    echo "❌ Database is not available on port 5432"
    exit 1
  fi
fi

if [ ! -f "$PROJECT_ROOT/apps/web/node_modules/next/package.json" ]; then
  cd "$PROJECT_ROOT/apps/web"
  npm install
fi

if [ ! -f "$PROJECT_ROOT/services/api/node_modules/express/package.json" ]; then
  cd "$PROJECT_ROOT/services/api"
  npm install
fi

if [ ! -f "$PROJECT_ROOT/services/websocket/node_modules/socket.io/package.json" ]; then
  cd "$PROJECT_ROOT/services/websocket"
  npm install
fi

cd "$PROJECT_ROOT/services/api"
DATABASE_URL="$DATABASE_URL" npm run migrate
DATABASE_URL="$DATABASE_URL" npm run seed

DISABLE_RATE_LIMIT=true DATABASE_URL="$DATABASE_URL" JWT_SECRET="$JWT_SECRET" FRONTEND_URL="$FRONTEND_URL" \
  npm run dev > "$LOG_DIR/api.log" 2>&1 &
API_PID=$!

cd "$PROJECT_ROOT/services/websocket"
DATABASE_URL="$DATABASE_URL" JWT_SECRET="$JWT_SECRET" FRONTEND_URL="$FRONTEND_URL" \
  npm run dev > "$LOG_DIR/websocket.log" 2>&1 &
WS_PID=$!

cd "$PROJECT_ROOT/apps/web"
NEXT_PUBLIC_API_URL="$API_URL" NEXT_PUBLIC_SOCKET_URL="$SOCKET_URL" \
  npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FE_PID=$!

wait_for_url "$API_URL/health" "API"
wait_for_url "$FRONTEND_URL" "Frontend"

npx playwright install --with-deps
E2E_BASE_URL="$FRONTEND_URL" E2E_API_URL="$API_URL" npm run test:e2e
