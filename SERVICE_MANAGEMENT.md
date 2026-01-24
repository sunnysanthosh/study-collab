# StudyCollab Service Management Guide

Complete guide for starting, stopping, and managing StudyCollab services.

## Quick Reference

```bash
# Start all services
./scripts/start-services.sh

# Stop all services
./scripts/stop-services.sh

# Check status
./scripts/status.sh
```

---

## Service Startup Sequence

Services must be started in this order due to dependencies:

```
1. Database (PostgreSQL)
   ↓
2. API Service (depends on database)
   ↓
3. WebSocket Service (depends on database)
   ↓
4. Frontend (depends on API and WebSocket)
```

### Why This Order?

1. **Database First**: Both API and WebSocket services need database connectivity
2. **API Before Frontend**: Frontend makes HTTP requests to API
3. **WebSocket Before Frontend**: Frontend connects to WebSocket for real-time features
4. **Frontend Last**: Frontend depends on both backend services being ready

---

## Detailed Startup Process

### Step 1: Pre-flight Checks

The startup script performs these checks:

1. **Dependency Check**
   - Node.js installed?
   - npm installed?
   - Docker available? (optional)

2. **Port Availability**
   - Port 3000 (Frontend) available?
   - Port 3001 (API) available?
   - Port 3002 (WebSocket) available?
   - Port 5432 (Database) available?

3. **Dependencies Installation**
   - Frontend `node_modules` exists?
   - API `node_modules` exists?
   - WebSocket `node_modules` exists?

### Step 2: Database Setup

1. Check if Docker container exists
2. Start existing container OR create new one
3. Wait for database to be ready
4. Verify connection

### Step 3: Service Startup

**API Service:**
```bash
cd services/api
npm run dev
```
- Starts on port 3001
- Waits for health check: `http://localhost:3001/health`
- Logs: `/tmp/studycollab/API.log`

**WebSocket Service:**
```bash
cd services/websocket
npm run dev
```
- Starts on port 3002
- No health check (WebSocket protocol)
- Logs: `/tmp/studycollab/WebSocket.log`

**Frontend Service:**
```bash
npm run dev
```
- Starts on port 3000
- Waits for health check: `http://localhost:3000`
- Logs: `/tmp/studycollab/Frontend.log`

### Step 4: Verification

All services are verified to be:
- Running (process exists)
- Listening on correct port
- Responding to requests (where applicable)

---

## Service Shutdown Sequence

Services are stopped in reverse order:

```
1. Frontend
   ↓
2. WebSocket
   ↓
3. API
   ↓
4. Database (optional, user prompt)
```

### Shutdown Process

1. **Read PID File**: Get process IDs from `/tmp/studycollab/pids.txt`
2. **Stop Services**: Send SIGTERM to each process
3. **Wait for Graceful Shutdown**: 10 seconds per service
4. **Force Kill if Needed**: Send SIGKILL if still running
5. **Port Cleanup**: Kill any remaining processes on ports
6. **Docker Cleanup**: Stop Docker Compose if running
7. **Database Prompt**: Ask user if they want to stop database

---

## Service Dependencies

### Dependency Graph

```
Frontend
  ├── API Service
  │     └── Database
  └── WebSocket Service
        └── Database
```

### Dependency Details

**Frontend → API:**
- HTTP requests for data
- Authentication endpoints
- Topic management

**Frontend → WebSocket:**
- Real-time chat
- Typing indicators
- User presence

**API → Database:**
- User data
- Topic data
- Message persistence (future)

**WebSocket → Database:**
- User authentication (future)
- Message persistence (future)
- Room management (future)

---

## Manual Service Management

### Start Individual Services

**Database:**
```bash
docker run -d \
  --name studycollab-db \
  -e POSTGRES_DB=studycollab \
  -e POSTGRES_USER=studycollab \
  -e POSTGRES_PASSWORD=studycollab \
  -p 5432:5432 \
  postgres:15-alpine
```

**API:**
```bash
cd services/api
npm run dev
```

**WebSocket:**
```bash
cd services/websocket
npm run dev
```

**Frontend:**
```bash
npm run dev
```

### Stop Individual Services

**By PID:**
```bash
kill <PID>
```

**By Port:**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

**Database:**
```bash
docker stop studycollab-db
```

---

## Service Health Checks

### API Health Check

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-21T..."
}
```

### Frontend Health Check

```bash
curl http://localhost:3000
```

**Expected:** HTML response (200 status)

### WebSocket Health Check

WebSocket doesn't have HTTP health endpoint. Check:
- Process is running
- Port is listening
- Connection from browser works

---

## Log Management

### Log Locations

All logs in `/tmp/studycollab/`:

- `startup.log` - Startup script execution log
- `shutdown.log` - Shutdown script execution log
- `Frontend.log` - Frontend service output
- `API.log` - API service output
- `WebSocket.log` - WebSocket service output
- `pids.txt` - Process IDs (format: `service:pid:port`)
- `status.txt` - Service status and timestamp

### View Logs

**All logs:**
```bash
tail -f /tmp/studycollab/*.log
```

**Specific service:**
```bash
tail -f /tmp/studycollab/API.log
tail -f /tmp/studycollab/WebSocket.log
tail -f /tmp/studycollab/Frontend.log
```

**Startup/Shutdown logs:**
```bash
tail -f /tmp/studycollab/startup.log
tail -f /tmp/studycollab/shutdown.log
```

### Clear Logs

```bash
rm -rf /tmp/studycollab/*.log
```

---

## Process Management

### PID File Format

`/tmp/studycollab/pids.txt` contains one line per service:
```
Frontend:12345:3000
API:12346:3001
WebSocket:12347:3002
```

Format: `service_name:pid:port`

### Check Running Processes

```bash
# Using PID file
cat /tmp/studycollab/pids.txt

# Using ps
ps aux | grep -E "(node|npm|next)"

# Using ports
lsof -i :3000
lsof -i :3001
lsof -i :3002
```

---

## Environment Variables

### Required Environment Variables

**Frontend (`.env.local`):**
- `NEXT_PUBLIC_API_URL` - API service URL
- `NEXT_PUBLIC_SOCKET_URL` - WebSocket service URL

**API (`services/api/.env`):**
- `NODE_ENV` - Environment (development/production)
- `PORT` - API port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend URL for CORS

**WebSocket (`services/websocket/.env`):**
- `NODE_ENV` - Environment
- `PORT` - WebSocket port (default: 3002)
- `FRONTEND_URL` - Frontend URL for CORS

---

## Troubleshooting

### Service Won't Start

1. Check logs: `tail -f /tmp/studycollab/[Service].log`
2. Check port: `lsof -i :[port]`
3. Check dependencies: `npm list --depth=0`
4. Check environment: Verify `.env` files exist

### Service Crashes

1. Check error logs
2. Verify dependencies installed
3. Check environment variables
4. Try manual start for detailed errors

### Port Conflicts

1. Find process: `lsof -ti:[port]`
2. Kill process: `lsof -ti:[port] | xargs kill -9`
3. Or use stop script: `./scripts/stop-services.sh`

### Database Issues

1. Check container: `docker ps | grep studycollab-db`
2. Check logs: `docker logs studycollab-db`
3. Test connection: `psql -h localhost -U studycollab -d studycollab`

---

## Best Practices

1. **Always use scripts**: Use `start-services.sh` and `stop-services.sh`
2. **Check status first**: Run `status.sh` before starting
3. **Monitor logs**: Watch logs during startup
4. **Clean shutdown**: Always use stop script, not `kill -9`
5. **Environment check**: Verify `.env` files before starting
6. **Dependency check**: Ensure all `node_modules` installed

---

## Automation

### Auto-start on System Boot

**macOS (using launchd):**
Create `~/Library/LaunchAgents/com.studycollab.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.studycollab</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/santhoshsrinivas/MyApps/iLearn/study-collab/scripts/start-services.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/Users/santhoshsrinivas/MyApps/iLearn/study-collab</string>
</dict>
</plist>
```

**Linux (using systemd):**
Create `/etc/systemd/system/studycollab.service`:
```ini
[Unit]
Description=StudyCollab Services
After=network.target

[Service]
Type=oneshot
ExecStart=/path/to/scripts/start-services.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

---

## Monitoring

### Service Status Monitoring

```bash
# Continuous monitoring
watch -n 5 './scripts/status.sh'
```

### Resource Usage

```bash
# CPU and Memory
top -p $(cat /tmp/studycollab/pids.txt | cut -d: -f2 | tr '\n' ',' | sed 's/,$//')

# Docker resources
docker stats studycollab-db
```

---

**Last Updated:** 2024

