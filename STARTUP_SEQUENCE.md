# StudyCollab Startup & Shutdown Sequence

## Overview

This document details the exact sequence for starting and stopping StudyCollab services, including dependencies, error handling, and verification steps.

---

## Startup Sequence

### Phase 1: Pre-flight Checks (30 seconds)

1. **Dependency Verification**
   - ✅ Node.js installed and version check
   - ✅ npm installed and version check
   - ✅ Docker available (optional check)

2. **Port Availability Check**
   - ✅ Port 3000 (Frontend) - Check if available
   - ✅ Port 3001 (API) - Check if available
   - ✅ Port 3002 (WebSocket) - Check if available
   - ✅ Port 5432 (Database) - Check if available

3. **Dependency Installation Check**
   - ✅ Frontend `node_modules` exists
   - ✅ API `node_modules` exists
   - ✅ WebSocket `node_modules` exists
   - ⚠️ Auto-install if missing

**Error Handling:**
- If port in use → Exit with code 1, show process info
- If dependency missing → Exit with code 2, show installation command
- If check fails → Log error and exit

---

### Phase 2: Database Setup (10-15 seconds)

1. **Docker Container Check**
   - Check if `studycollab-db` container exists
   - If exists and running → Skip
   - If exists but stopped → Start container
   - If doesn't exist → Create new container

2. **Database Initialization**
   - Wait 5 seconds for PostgreSQL to initialize
   - Verify with `pg_isready`
   - Retry up to 3 times if not ready

3. **Connection Verification**
   - Test connection to database
   - Verify credentials work

**Error Handling:**
- If Docker not available → Warn but continue (assumes local PostgreSQL)
- If container fails to start → Exit with code 3
- If database not ready after retries → Exit with code 3

**Commands:**
```bash
# Create container
docker run -d \
  --name studycollab-db \
  -e POSTGRES_DB=studycollab \
  -e POSTGRES_USER=studycollab \
  -e POSTGRES_PASSWORD=studycollab \
  -p 5432:5432 \
  postgres:15-alpine

# Verify
docker exec studycollab-db pg_isready -U studycollab
```

---

### Phase 3: Backend Services (20-30 seconds)

#### 3.1 API Service Startup

**Order:** 1st backend service (depends on database)

**Steps:**
1. Change to `services/api` directory
2. Start with `npm run dev` (background process)
3. Capture PID
4. Wait for health check: `http://localhost:3001/health`
5. Retry up to 30 times (30 seconds max)
6. Verify response contains `{"status":"ok"}`

**Success Criteria:**
- Process running (PID exists)
- Port 3001 listening
- Health endpoint returns 200 OK

**Error Handling:**
- If process fails to start → Check logs, exit with code 4
- If health check fails → Log error, exit with code 4
- If timeout → Exit with code 4

**Logs:** `/tmp/studycollab/API.log`

---

#### 3.2 WebSocket Service Startup

**Order:** 2nd backend service (depends on database)

**Steps:**
1. Change to `services/websocket` directory
2. Start with `npm run dev` (background process)
3. Capture PID
4. Wait 2 seconds (no HTTP health check)
5. Verify port 3002 is listening

**Success Criteria:**
- Process running (PID exists)
- Port 3002 listening

**Error Handling:**
- If process fails to start → Check logs, exit with code 4
- If port not listening → Log warning, continue

**Logs:** `/tmp/studycollab/WebSocket.log`

---

### Phase 4: Frontend Service (15-20 seconds)

**Order:** Last service (depends on API and WebSocket)

**Steps:**
1. Change to project root directory
2. Start with `npm run dev` (background process)
3. Capture PID
4. Wait for health check: `http://localhost:3000`
5. Retry up to 30 times (30 seconds max)
6. Verify response is HTML (200 OK)

**Success Criteria:**
- Process running (PID exists)
- Port 3000 listening
- HTTP endpoint returns 200 OK

**Error Handling:**
- If process fails to start → Check logs, exit with code 4
- If health check fails → Log error, exit with code 4
- If timeout → Exit with code 4

**Logs:** `/tmp/studycollab/Frontend.log`

---

### Phase 5: Verification & Status (5 seconds)

1. **Final Status Check**
   - Verify all PIDs are running
   - Verify all ports are listening
   - Verify all health endpoints respond

2. **Status File Update**
   - Write "RUNNING" to `/tmp/studycollab/status.txt`
   - Write timestamp

3. **Summary Output**
   - Display service URLs
   - Display log locations
   - Display stop command

**Total Startup Time:** ~60-90 seconds

---

## Shutdown Sequence

### Phase 1: Service Shutdown (10-20 seconds)

**Order:** Reverse of startup (Frontend → WebSocket → API)

#### 1.1 Frontend Shutdown

**Steps:**
1. Read PID from `/tmp/studycollab/pids.txt`
2. Send SIGTERM to process
3. Wait up to 10 seconds for graceful shutdown
4. If still running → Send SIGKILL
5. Verify process terminated
6. Kill any process on port 3000 (fallback)

**Error Handling:**
- If PID not found → Skip, try port-based kill
- If process already dead → Log warning, continue

---

#### 1.2 WebSocket Shutdown

**Steps:**
1. Read PID from file
2. Send SIGTERM
3. Wait up to 10 seconds
4. Force kill if needed
5. Kill by port 3002 (fallback)

---

#### 1.3 API Shutdown

**Steps:**
1. Read PID from file
2. Send SIGTERM
3. Wait up to 10 seconds
4. Force kill if needed
5. Kill by port 3001 (fallback)

---

### Phase 2: Docker Cleanup (5 seconds)

1. **Docker Compose Check**
   - Check if `docker-compose` services running
   - If yes → Run `docker-compose down`
   - Wait for completion

2. **Database Container**
   - Check if `studycollab-db` running
   - Prompt user: "Stop database container? (y/N)"
   - If yes → `docker stop studycollab-db`
   - If no → Leave running

---

### Phase 3: Cleanup (2 seconds)

1. **PID File Cleanup**
   - Clear `/tmp/studycollab/pids.txt`

2. **Status File Update**
   - Write "STOPPED" to status file
   - Write timestamp

3. **Port Cleanup**
   - Final check for processes on ports 3000, 3001, 3002
   - Kill any remaining processes

**Total Shutdown Time:** ~20-30 seconds

---

## Dependency Graph

```
┌─────────────┐
│  Database   │
│ (PostgreSQL)│
└──────┬──────┘
       │
       ├──────────────┐
       │              │
┌──────▼──────┐  ┌────▼──────┐
│  API        │  │ WebSocket │
│ (Port 3001) │  │(Port 3002)│
└──────┬──────┘  └────┬──────┘
       │              │
       └──────┬───────┘
              │
       ┌──────▼──────┐
       │  Frontend   │
       │ (Port 3000) │
       └─────────────┘
```

**Dependencies:**
- Frontend → API (HTTP requests)
- Frontend → WebSocket (real-time connection)
- API → Database (data persistence)
- WebSocket → Database (future: auth, persistence)

---

## Error Codes Reference

| Code | Name | When It Occurs | Action |
|------|------|----------------|--------|
| 0 | SUCCESS | All services started/stopped | Continue |
| 1 | PORT_IN_USE | Port already occupied | Kill process or change port |
| 2 | DEPENDENCY_MISSING | Node.js/npm not found | Install dependency |
| 3 | DATABASE_ERROR | Database failed to start | Check Docker/PostgreSQL |
| 4 | SERVICE_FAILED | Service failed to start | Check service logs |

---

## Verification Commands

### Check All Services Running

```bash
# Quick status
./scripts/status.sh

# Detailed check
curl http://localhost:3000      # Frontend
curl http://localhost:3001/health  # API
lsof -i :3002                   # WebSocket
docker ps | grep studycollab-db # Database
```

### Check Process Health

```bash
# All PIDs
cat /tmp/studycollab/pids.txt

# Verify processes
ps -p $(cat /tmp/studycollab/pids.txt | cut -d: -f2 | tr '\n' ' ')
```

### Check Logs

```bash
# All logs
tail -f /tmp/studycollab/*.log

# Specific service
tail -f /tmp/studycollab/API.log
```

---

## Timing Breakdown

| Phase | Duration | Description |
|-------|----------|-------------|
| Pre-flight | 5-10s | Dependency and port checks |
| Database | 10-15s | Container creation/start |
| API | 15-20s | Service start + health check |
| WebSocket | 5-10s | Service start |
| Frontend | 15-20s | Service start + health check |
| Verification | 5s | Final checks |
| **Total** | **60-90s** | Complete startup |

---

## Quick Commands

### Start All Services
```bash
./scripts/start-services.sh
```

### Stop All Services
```bash
./scripts/stop-services.sh
```

### Check Status
```bash
./scripts/status.sh
```

### View Logs
```bash
tail -f /tmp/studycollab/*.log
```

---

## Troubleshooting Sequence

If startup fails:

1. **Check Error Code**
   ```bash
   echo $?
   ```

2. **Check Logs**
   ```bash
   tail -20 /tmp/studycollab/startup.log
   ```

3. **Check Status**
   ```bash
   ./scripts/status.sh
   ```

4. **Refer to ERROR_CODES.md**
   - Find error code
   - Follow solution steps

5. **Manual Start for Debugging**
   ```bash
   # Start services one by one to see errors
   cd services/api && npm run dev
   ```

---

**Last Updated:** 2024

