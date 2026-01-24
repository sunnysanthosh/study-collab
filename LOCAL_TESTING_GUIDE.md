# Local Testing & Deployment Guide

This guide will help you set up and test StudyCollab locally.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker** (optional, for database) - [Download](https://www.docker.com/)
- **PostgreSQL** (if not using Docker) - [Download](https://www.postgresql.org/)

## Quick Start (Recommended)

### Option 1: Using Docker Compose (Easiest)

This will start all services including the database.

```bash
# 1. Navigate to project directory
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab

# 2. Start all services
docker-compose up -d

# 3. Check service status
docker-compose ps

# 4. View logs
docker-compose logs -f
```

**Services will be available at:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- WebSocket: http://localhost:3002
- Database: localhost:5432

---

## Manual Setup (Step by Step)

### Step 1: Install Frontend Dependencies

```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
npm install
```

### Step 2: Install Backend API Dependencies

```bash
cd backend/api
npm install
```

### Step 3: Install WebSocket Service Dependencies

```bash
cd ../websocket
npm install
```

### Step 4: Set Up Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run -d \
  --name studycollab-db \
  -e POSTGRES_DB=studycollab \
  -e POSTGRES_USER=studycollab \
  -e POSTGRES_PASSWORD=studycollab \
  -p 5432:5432 \
  postgres:15-alpine

# Verify it's running
docker ps | grep studycollab-db
```

#### Option B: Using Local PostgreSQL

```bash
# Create database
createdb studycollab

# Or using psql
psql -U postgres
CREATE DATABASE studycollab;
CREATE USER studycollab WITH PASSWORD 'studycollab';
GRANT ALL PRIVILEGES ON DATABASE studycollab TO studycollab;
\q
```

### Step 5: Create Environment Files

Create `.env.local` in the root directory:

```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
EOF
```

Create `.env` in `backend/api`:

```bash
cd backend/api
cat > .env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://studycollab:studycollab@localhost:5432/studycollab
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
EOF
```

Create `.env` in `backend/websocket`:

```bash
cd ../websocket
cat > .env << EOF
NODE_ENV=development
PORT=3002
FRONTEND_URL=http://localhost:3000
EOF
```

### Step 6: Start Services

You'll need **3 terminal windows**:

#### Terminal 1: Frontend
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
npm run dev
```

#### Terminal 2: Backend API
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab/backend/api
npm run dev
```

#### Terminal 3: WebSocket Service
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab/backend/websocket
npm run dev
```

---

## Testing Checklist

### Automated Tests (Recommended)
```bash
# Backend unit/integration
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab/backend/api
npm test

# Frontend unit tests
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
npm test

# WebSocket integration tests
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab/backend/websocket
npm test

# API-focused E2E script (services must be running)
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
./test-script.sh

# Browser E2E (Playwright, services must be running)
npx playwright install

# One-command runner (starts services, seeds, runs Playwright, stops)
./scripts/run-e2e.sh

# Optional: disable rate limiting for repeated E2E logins
# DISABLE_RATE_LIMIT=true npm run dev  (run in backend/api)
npm run test:e2e
```

### 1. Frontend Tests

#### Home Page
- [ ] Navigate to http://localhost:3000
- [ ] Verify hero section displays
- [ ] Check features section shows 4 cards
- [ ] Test "Get Started" button links to signup
- [ ] Test "Explore Topics" button links to topics

#### Authentication Pages
- [ ] Navigate to http://localhost:3000/login
- [ ] Test email validation (try invalid email)
- [ ] Test password visibility toggle
- [ ] Test form submission (will show loading state)
- [ ] Navigate to http://localhost:3000/signup
- [ ] Test all form validations
- [ ] Test password confirmation match

#### Topics Page
- [ ] Navigate to http://localhost:3000/topics
- [ ] Verify topics display in grid
- [ ] Test search functionality
- [ ] Test tag filtering
- [ ] Click "Join Room" on a topic

#### Topic Room
- [ ] Navigate to a topic room (e.g., /topics/math-101)
- [ ] Verify Problem Board displays
- [ ] Verify Chat Interface displays
- [ ] Test tool selection (Draw, Text, Image)
- [ ] Test chat input (type message)
- [ ] Check connection status indicator

#### Profile Page
- [ ] Navigate to http://localhost:3000/profile
- [ ] Verify profile displays
- [ ] Click "Edit Profile"
- [ ] Test form fields
- [ ] Test avatar upload (select image)
- [ ] Click "Save Changes"

#### Admin Dashboard
- [ ] Navigate to http://localhost:3000/admin
- [ ] Verify statistics cards display
- [ ] Check user management table
- [ ] Test "Add New Topic" button

### 2. Backend API Tests

#### Health Check
```bash
curl http://localhost:3001/health
```
Expected: `{"status":"ok","timestamp":"..."}`

#### Authentication Endpoints
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123456"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

#### Topics Endpoints
```bash
# Get all topics
curl http://localhost:3001/api/topics

# Create topic (requires auth token)
curl -X POST http://localhost:3001/api/topics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Topic","description":"Test description","tags":["test"]}'
```

### 3. WebSocket Tests

#### Connection Test
Open browser console on a topic room page and check:
```javascript
// Should see connection logs
// Check Network tab for WebSocket connection
```

#### Manual WebSocket Test
You can use a WebSocket client or browser console:

```javascript
// In browser console on topic room page
// The socket should auto-connect via useSocket hook
// Check for connection status in UI
```

### 4. Integration Tests

#### Full User Flow
1. [ ] Visit home page
2. [ ] Click "Get Started" → Sign up
3. [ ] Fill signup form and submit
4. [ ] Navigate to topics page
5. [ ] Search for a topic
6. [ ] Join a topic room
7. [ ] Send a message in chat
8. [ ] Check typing indicator
9. [ ] Navigate to profile
10. [ ] Edit profile information

---

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :3001  # API
lsof -i :3002  # WebSocket
lsof -i :5432  # Database

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# or
pg_isready

# Test connection
psql -h localhost -U studycollab -d studycollab
```

### Module Not Found Errors

```bash
# Reinstall dependencies
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
rm -rf node_modules package-lock.json
npm install

# Same for backend services
cd backend/api
rm -rf node_modules package-lock.json
npm install

cd ../websocket
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Connection Failed

1. Check WebSocket service is running on port 3002
2. Verify `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
3. Check browser console for CORS errors
4. Verify WebSocket server allows frontend origin

### TypeScript Errors

```bash
# Rebuild TypeScript
cd backend/api
npm run build

cd ../websocket
npm run build
```

---

## Development Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

### Backend API
```bash
npm run dev      # Start with hot reload
npm run build    # Compile TypeScript
npm start        # Start production server
```

### WebSocket Service
```bash
npm run dev      # Start with hot reload
npm run build    # Compile TypeScript
npm start        # Start production server
```

---

## Testing with Docker Compose

### Start All Services
```bash
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f api
docker-compose logs -f websocket
docker-compose logs -f db
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes
```bash
docker-compose down -v
```

### Rebuild Services
```bash
docker-compose up -d --build
```

---

## Performance Testing

### Check Service Health
```bash
# Frontend
curl http://localhost:3000

# API Health
curl http://localhost:3001/health

# WebSocket (check connection in browser)
```

### Monitor Resource Usage
```bash
# Docker services
docker stats

# Or individual processes
top
htop
```

---

## Next Steps After Testing

1. **Database Setup**: Create tables and migrations
2. **Authentication**: Implement JWT properly
3. **API Integration**: Connect frontend to real API endpoints
4. **Message Persistence**: Save chat messages to database
5. **File Uploads**: Implement avatar upload to storage
6. **Testing**: Add unit and integration tests

---

## Quick Reference

| Service | Port | URL | Status Check |
|---------|------|-----|--------------|
| Frontend | 3000 | http://localhost:3000 | Browser |
| API | 3001 | http://localhost:3001/health | `curl http://localhost:3001/health` |
| WebSocket | 3002 | ws://localhost:3002 | Browser console |
| Database | 5432 | localhost:5432 | `psql -h localhost -U studycollab -d studycollab` |

---

## Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check that ports are not in use
5. Review the DEVELOPMENT_JOURNAL.md for implementation details

