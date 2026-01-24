# StudyCollab Error Codes & Troubleshooting Guide

This document provides a comprehensive guide to error codes, common issues, and their solutions.

## Error Code Reference

### Startup Script Error Codes

| Code | Name | Description | Solution |
|------|------|-------------|----------|
| 0 | EXIT_SUCCESS | All services started successfully | - |
| 1 | EXIT_PORT_IN_USE | Port already in use | Kill process on port or change port |
| 2 | EXIT_DEPENDENCY_MISSING | Required dependency not found | Install missing dependency |
| 3 | EXIT_DATABASE_ERROR | Database failed to start | Check Docker/PostgreSQL installation |
| 4 | EXIT_SERVICE_FAILED | Service failed to start | Check service logs |
| 5 | EXIT_INVALID_ENV | Invalid environment configuration | Check .env files |

### Shutdown Script Error Codes

| Code | Name | Description | Solution |
|------|------|-------------|----------|
| 0 | EXIT_SUCCESS | All services stopped successfully | - |
| 1 | EXIT_PROCESS_NOT_FOUND | Process not found | Already stopped or PID file corrupted |

---

## Common Issues & Solutions

### 1. Port Already in Use

**Error Message:**
```
✗ Port 3000 (Frontend) is already in use
```

**Solutions:**

**Option A: Kill the process**
```bash
# Find process
lsof -ti:3000

# Kill process
lsof -ti:3000 | xargs kill -9
```

**Option B: Use different ports**
Edit `.env.local` and service configurations to use different ports.

**Option C: Use stop script**
```bash
./scripts/stop-services.sh
```

---

### 2. Database Connection Failed

**Error Message:**
```
✗ Database failed to start
```

**Solutions:**

**Check Docker:**
```bash
# Check if Docker is running
docker ps

# Check database container
docker ps | grep studycollab-db

# View database logs
docker logs studycollab-db
```

**Start database manually:**
```bash
docker run -d \
  --name studycollab-db \
  -e POSTGRES_DB=studycollab \
  -e POSTGRES_USER=studycollab \
  -e POSTGRES_PASSWORD=studycollab \
  -p 5432:5432 \
  postgres:15-alpine
```

**Check PostgreSQL connection:**
```bash
psql -h localhost -U studycollab -d studycollab
```

---

### 3. Dependencies Not Installed

**Error Message:**
```
✗ Node.js is not installed
✗ npm is not installed
```

**Solutions:**

**Install Node.js:**
- Download from https://nodejs.org/
- Or use Homebrew: `brew install node`

**Install dependencies:**
```bash
# Frontend
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
npm install

# Backend API
cd services/api
npm install

# WebSocket
cd ../websocket
npm install
```

---

### 4. Service Failed to Start

**Error Message:**
```
✗ API failed to start after 30 seconds
```

**Solutions:**

**Check service logs:**
```bash
tail -f /tmp/studycollab/API.log
tail -f /tmp/studycollab/WebSocket.log
tail -f /tmp/studycollab/Frontend.log
```

**Check for TypeScript errors:**
```bash
cd services/api
npm run build

cd ../websocket
npm run build
```

**Check environment variables:**
```bash
# Verify .env files exist
ls -la services/api/.env
ls -la services/websocket/.env
ls -la .env.local
```

**Manual start for debugging:**
```bash
# Start service manually to see errors
cd services/api
npm run dev
```

---

### 5. WebSocket Connection Failed

**Error Message:**
```
WebSocket connection failed
Connection status: Offline
```

**Solutions:**

**Check WebSocket service:**
```bash
# Verify service is running
lsof -ti:3002

# Check logs
tail -f /tmp/studycollab/WebSocket.log
```

**Check CORS settings:**
Verify `FRONTEND_URL` in `services/websocket/.env` matches frontend URL.

**Check browser console:**
- Open browser DevTools → Console
- Look for WebSocket connection errors
- Check Network tab for WebSocket connection

**Test WebSocket manually:**
```bash
# Using wscat (install: npm install -g wscat)
wscat -c ws://localhost:3002
```

---

### 6. API Not Responding

**Error Message:**
```
API: Port in use but not responding
```

**Solutions:**

**Check API health:**
```bash
curl http://localhost:3001/health
```

**Check API logs:**
```bash
tail -f /tmp/studycollab/API.log
```

**Verify API is running:**
```bash
ps aux | grep "npm run dev" | grep api
```

**Restart API:**
```bash
# Stop
lsof -ti:3001 | xargs kill -9

# Start manually
cd services/api
npm run dev
```

---

### 7. Frontend Build Errors

**Error Message:**
```
Module not found
TypeScript errors
```

**Solutions:**

**Clear cache and reinstall:**
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
rm -rf node_modules .next package-lock.json
npm install
```

**Check TypeScript:**
```bash
npm run build
```

**Check for missing dependencies:**
```bash
npm list --depth=0
```

---

### 8. Environment Variables Missing

**Error Message:**
```
Invalid environment configuration
```

**Solutions:**

**Create missing .env files:**

Frontend (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
```

Backend API (`services/api/.env`):
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://studycollab:studycollab@localhost:5432/studycollab
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

WebSocket (`services/websocket/.env`):
```bash
NODE_ENV=development
PORT=3002
FRONTEND_URL=http://localhost:3000
```

---

## Debugging Commands

### Check Service Status
```bash
./scripts/status.sh
```

### View All Logs
```bash
tail -f /tmp/studycollab/*.log
```

### Check Port Usage
```bash
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :5432
```

### Check Process Status
```bash
ps aux | grep -E "(node|npm|next)"
```

### Check Docker Containers
```bash
docker ps -a
docker logs studycollab-db
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Test endpoint
curl http://localhost:3001/api/topics
```

### Test WebSocket
```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c ws://localhost:3002
```

---

## Log File Locations

All logs are stored in `/tmp/studycollab/`:

- `startup.log` - Startup script logs
- `shutdown.log` - Shutdown script logs
- `Frontend.log` - Frontend service logs
- `API.log` - API service logs
- `WebSocket.log` - WebSocket service logs
- `pids.txt` - Process IDs
- `status.txt` - Service status

---

## Quick Fix Commands

### Complete Reset
```bash
# Stop all services
./scripts/stop-services.sh

# Kill all processes
lsof -ti:3000,3001,3002 | xargs kill -9

# Remove Docker container
docker stop studycollab-db
docker rm studycollab-db

# Clear logs
rm -rf /tmp/studycollab/*

# Restart
./scripts/start-services.sh
```

### Reinstall Dependencies
```bash
# Frontend
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
rm -rf node_modules package-lock.json
npm install

# Backend API
cd services/api
rm -rf node_modules package-lock.json
npm install

# WebSocket
cd ../websocket
rm -rf node_modules package-lock.json
npm install
```

### Fix Port Conflicts
```bash
# Kill all processes on ports
for port in 3000 3001 3002; do
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done
```

---

## Getting Help

If you encounter an error not listed here:

1. **Check logs:** `/tmp/studycollab/*.log`
2. **Check status:** `./scripts/status.sh`
3. **Review documentation:**
   - `LOCAL_TESTING_GUIDE.md`
   - `DEVELOPMENT_JOURNAL.md`
   - `ARCHITECTURE.md`

4. **Common checks:**
   - All dependencies installed?
   - All services running?
   - Ports available?
   - Environment variables set?
   - Database accessible?

---

## Error Reporting Template

When reporting errors, include:

```
Error Code: [code number]
Error Message: [exact message]
Service: [Frontend/API/WebSocket/Database]
Steps to Reproduce: [steps]
Logs: [relevant log excerpts]
Environment: [OS, Node version, etc.]
```

---

**Last Updated:** 2024

