# Quick Start Guide - StudyCollab Testing

## 🚀 Fastest Way to Start Testing

### Option 1: Docker Compose (Recommended)

```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
docker-compose up -d
```

This starts:
- ✅ Frontend on http://localhost:3000
- ✅ API on http://localhost:3001  
- ✅ WebSocket on http://localhost:3002
- ✅ PostgreSQL database on localhost:5432

**View logs:**
```bash
docker-compose logs -f
```

**Stop services:**
```bash
docker-compose down
```

---

### Option 2: Manual Start (3 Terminals)

**Terminal 1 - Frontend:**
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
npm run dev
```

**Terminal 2 - API:**
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab/backend/api
npm run dev
```

**Terminal 3 - WebSocket:**
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab/backend/websocket
npm run dev
```

---

## ✅ Pre-Flight Checks

1. **Dependencies installed?**
   ```bash
   # Frontend
   cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
   npm install
   
   # Backend API
   cd backend/api
   npm install
   
   # WebSocket
   cd ../websocket
   npm install
   ```

2. **Database running?**
   ```bash
   # Using Docker
   docker run -d --name studycollab-db \
     -e POSTGRES_DB=studycollab \
     -e POSTGRES_USER=studycollab \
     -e POSTGRES_PASSWORD=studycollab \
     -p 5432:5432 \
     postgres:15-alpine
   ```

3. **Environment variables set?**
   - Frontend: `.env.local` (created automatically)
   - API: `backend/api/.env` (created automatically)
   - WebSocket: `backend/websocket/.env` (created automatically)

---

## 🧪 Quick Test

1. **Open browser:** http://localhost:3000
2. **Check home page loads**
3. **Navigate to Topics:** http://localhost:3000/topics
4. **Join a topic room**
5. **Test chat** (if WebSocket connected)

---

## 📋 Full Testing

See `TESTING_CHECKLIST.md` for comprehensive testing guide.

---

## 🛠️ Troubleshooting

**Port in use?**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

**Services not starting?**
- Check logs in each terminal
- Verify dependencies installed
- Check environment variables

**WebSocket not connecting?**
- Verify WebSocket service running on port 3002
- Check browser console for errors
- Verify CORS settings

---

## 📚 Documentation

- `LOCAL_TESTING_GUIDE.md` - Detailed setup guide
- `TESTING_CHECKLIST.md` - Comprehensive test checklist
- `DEVELOPMENT_JOURNAL.md` - Development history
- `ARCHITECTURE.md` - System architecture

