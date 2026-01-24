# Quick End-to-End Testing Guide

## ✅ Service Checklist

- [ ] API running: http://localhost:3001
- [ ] WebSocket running: http://localhost:3002
- [ ] Frontend running: http://localhost:3000
- [ ] Database running: localhost:5432

---

## 📋 Setup Steps

### Option 1: Start Docker (Recommended)

1. **Start Docker Desktop**
   - Open Docker Desktop application
   - Wait for it to fully start

2. **Start Database:**
   ```bash
   docker run -d \
     --name studycollab-db \
     -e POSTGRES_DB=studycollab \
     -e POSTGRES_USER=studycollab \
     -e POSTGRES_PASSWORD=studycollab \
     -p 5432:5432 \
     postgres:15-alpine
   ```

3. **Run Migration:**
   ```bash
   cd backend/api
   npm run migrate
   ```

4. **Start Frontend:**
   ```bash
   cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
   npm run dev
   ```

### Option 2: Use Local PostgreSQL

If you have PostgreSQL installed locally:

1. **Create Database:**
   ```bash
   createdb studycollab
   # Or using psql:
   psql -U postgres
   CREATE DATABASE studycollab;
   CREATE USER studycollab WITH PASSWORD 'studycollab';
   GRANT ALL PRIVILEGES ON DATABASE studycollab TO studycollab;
   \q
   ```

2. **Set Environment Variable:**
   ```bash
   export DATABASE_URL=postgresql://studycollab:studycollab@localhost:5432/studycollab
   ```

3. **Run Migration:**
   ```bash
   cd backend/api
   npm run migrate
   ```

4. **Start Frontend:**
   ```bash
   cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
   npm run dev
   ```

---

## 🧪 Testing Steps

### Step 1: Open Application

Open browser: **http://localhost:3000**

---

### Step 2: Register a User

1. Click **"Sign Up"** or navigate to `/signup`
2. Fill the form:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** Test1234!
   - **Confirm Password:** Test1234!
3. Click **"Sign Up"**

**Expected:**
- ✅ Success message
- ✅ Redirected to `/topics`
- ✅ Navbar shows your name
- ✅ Token stored in localStorage

**Verify in Browser Console (F12):**
```javascript
// Check token
localStorage.getItem('studycollab_token')
// Should return a JWT token

// Check user
localStorage.getItem('studycollab_user')
// Should return user object
```

---

## 🧪 Automated Tests (Optional but Recommended)

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

---

### Step 3: Create a Topic

**Method 1: Using Browser Console**

Open Developer Console (F12) and run:

```javascript
// Get your token
const token = localStorage.getItem('studycollab_token');

// Create a topic
fetch('http://localhost:3001/api/topics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Calculus Study Group',
    description: 'Working on derivatives and integrals',
    subject: 'Math',
    difficulty: 'Intermediate',
    tags: ['Calculus', 'Math']
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Topic created:', data);
  // Save topic ID for next step
  window.topicId = data.id;
  alert('Topic created! ID: ' + data.id);
})
.catch(err => console.error('❌ Error:', err));
```

**Method 2: Using curl**

```bash
TOKEN="YOUR_TOKEN_FROM_LOCALSTORAGE"
curl -X POST http://localhost:3001/api/topics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Calculus Study Group",
    "description": "Working on derivatives",
    "subject": "Math",
    "tags": ["Calculus"]
  }'
```

**Expected:**
- ✅ Topic created successfully
- ✅ Returns topic object with ID
- ✅ You're automatically added as member

---

### Step 4: View Topics

1. Navigate to **http://localhost:3000/topics**
2. Refresh the page
3. You should see your created topic

**Test Search:**
- Type "Calculus" in search box
- Topic should filter correctly

**Test Filters:**
- Click on subject filter
- Click on tag filter

---

### Step 5: Join Topic & Send Messages

1. Click on your topic card (or navigate to `/topics/{topic-id}`)
2. Wait for WebSocket connection (check browser console)
3. Type a message in the chat input
4. Press Enter or click Send

**Expected:**
- ✅ WebSocket connects (console shows "Connected!")
- ✅ Message appears immediately
- ✅ Message persists after page refresh
- ✅ Your name/avatar shows correctly

**Check Browser Console:**
```javascript
// Should see connection logs
// Should see message events
```

**Verify Message Saved:**
```javascript
const token = localStorage.getItem('studycollab_token');
const topicId = window.topicId || 'YOUR_TOPIC_ID';

fetch(`http://localhost:3001/api/messages/topic/${topicId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log('📨 Messages:', data));
```

---

### Step 6: Test Message History

1. Send several messages in the topic
2. Refresh the page (F5)
3. Navigate back to the topic room

**Expected:**
- ✅ Previous messages load automatically
- ✅ Messages in chronological order
- ✅ All messages display correctly

---

### Step 7: Test Real-time (Multiple Users)

1. Open a second browser window (or incognito)
2. Register a new user: `test2@example.com`
3. Join the same topic (use the topic ID from first browser)
4. Send messages from both browsers

**Expected:**
- ✅ Messages appear in real-time in both browsers
- ✅ Typing indicators work
- ✅ User presence tracked
- ✅ "User joined" notifications appear

---

### Step 8: Update Profile

1. Navigate to **http://localhost:3000/profile**
2. Update your name
3. Save changes

**Expected:**
- ✅ Profile updated successfully
- ✅ Changes reflected in navbar
- ✅ Updated info persists

**Using Browser Console:**
```javascript
const token = localStorage.getItem('studycollab_token');

// Get profile
fetch('http://localhost:3001/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log('👤 Profile:', data));

// Update profile
fetch('http://localhost:3001/api/users/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Updated Name'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Updated:', data));
```

---

## 🔍 API Testing (Using curl)

### Test API Health
```bash
curl http://localhost:3001/health
```

### Test Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test User",
    "email": "apitest@example.com",
    "password": "Test1234!"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "Test1234!"
  }'
```

**Save the token from response, then:**

### Test Protected Route
```bash
TOKEN="YOUR_TOKEN_HERE"
curl http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Test Get Topics
```bash
curl http://localhost:3001/api/topics
```

---

## 🗄️ Database Verification

### If Using Docker:
```bash
docker exec -it studycollab-db psql -U studycollab -d studycollab
```

### If Using Local PostgreSQL:
```bash
psql -U studycollab -d studycollab
```

### Check Data:
```sql
-- Check users
SELECT id, name, email, role, created_at FROM users;

-- Check topics
SELECT id, title, subject, created_by, created_at FROM topics;

-- Check messages
SELECT m.id, m.content, m.created_at, u.name as user_name, t.title as topic_title
FROM messages m
JOIN users u ON m.user_id = u.id
JOIN topics t ON m.topic_id = t.id
ORDER BY m.created_at DESC
LIMIT 10;

-- Check topic members
SELECT tm.topic_id, t.title, u.name as member_name, tm.joined_at
FROM topic_members tm
JOIN topics t ON tm.topic_id = t.id
JOIN users u ON tm.user_id = u.id;
```

---

## ❌ Error Testing

### Test Invalid Registration
- Try duplicate email → Should fail with error
- Try weak password (e.g., "123") → Should fail
- Try invalid email format → Should fail

### Test Invalid Login
- Wrong password → Should fail
- Non-existent email → Should fail

### Test Protected Routes Without Token
```bash
# Should return 401
curl http://localhost:3001/api/users/profile
```

---

## ✅ Success Checklist

- [ ] User can register
- [ ] User can login
- [ ] User can create topic
- [ ] User can view topics
- [ ] User can join topic
- [ ] User can send messages
- [ ] Messages persist in database
- [ ] Message history loads
- [ ] Real-time messaging works
- [ ] Multiple users can chat
- [ ] Profile update works
- [ ] Token refresh works
- [ ] Logout works
- [ ] Protected routes require auth

---

## 🐛 Troubleshooting

### Frontend Not Starting
```bash
# Check if port 3000 is in use
lsof -ti:3000

# Kill process if needed
lsof -ti:3000 | xargs kill -9

# Start frontend
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
npm run dev
```

### Database Connection Issues
```bash
# Check if database is running
docker ps | grep studycollab-db

# Or check local PostgreSQL
pg_isready -U studycollab

# Check connection string
echo $DATABASE_URL
```

### WebSocket Connection Issues
- Check browser console for errors
- Verify token is valid: `localStorage.getItem('studycollab_token')`
- Check WebSocket service is running: `curl http://localhost:3002` (should fail, but service should be running)
- Check CORS settings in WebSocket service

### API Errors
- Check API logs: `tail -f /tmp/studycollab/API.log`
- Verify token in request headers
- Check database connection
- Verify environment variables

---

## 📊 Test Results

Document your test results:

```
Test #: 1
Test Name: User Registration
Status: ✅ Pass / ❌ Fail
Time: 5 seconds
Notes: Registration successful, token stored
```

---

**Happy Testing! 🚀**

For more detailed scenarios, see:
- `TESTING_WALKTHROUGH.md` - Quick guide
- `END_TO_END_TEST.md` - Complete test scenarios

