# StudyCollab Service Management - Quick Reference

## 🚀 Quick Commands

```bash
# Start all services
./scripts/start-services.sh

# Stop all services
./scripts/stop-services.sh

# Check status
./scripts/status.sh
```

## ✅ Current Status

**All services are running!**

- ✅ Frontend: http://localhost:3000
- ✅ API: http://localhost:3001
- ✅ WebSocket: http://localhost:3002
- ⚠️ Database: Not running (optional for basic testing)

## 📋 Service Startup Sequence

1. **Pre-flight Checks** (5-10s)
   - Dependencies (Node.js, npm, Docker)
   - Port availability
   - Dependency installation

2. **Database Setup** (10-15s)
   - Docker container creation/start
   - PostgreSQL initialization

3. **Backend Services** (20-30s)
   - API service (port 3001)
   - WebSocket service (port 3002)

4. **Frontend Service** (15-20s)
   - Next.js dev server (port 3000)

5. **Verification** (5s)
   - Health checks
   - Status confirmation

**Total Time:** ~60-90 seconds

## 📚 Documentation

- **SERVICE_MANAGEMENT.md** - Complete management guide
- **STARTUP_SEQUENCE.md** - Detailed startup sequence
- **ERROR_CODES.md** - Error codes and troubleshooting
- **LOCAL_TESTING_GUIDE.md** - Testing instructions
- **TESTING_CHECKLIST.md** - Comprehensive test checklist

## 🔧 Troubleshooting

See `ERROR_CODES.md` for detailed solutions to common issues.

**Quick fixes:**
```bash
# Port in use
lsof -ti:3000 | xargs kill -9

# View logs
tail -f /tmp/studycollab/*.log

# Check status
./scripts/status.sh
```

## 📝 Logs

All logs in `/tmp/studycollab/`:
- `startup.log` - Startup execution
- `Frontend.log` - Frontend service
- `API.log` - API service
- `WebSocket.log` - WebSocket service
- `pids.txt` - Process IDs
- `status.txt` - Service status

