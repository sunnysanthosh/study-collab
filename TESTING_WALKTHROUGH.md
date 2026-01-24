# End-to-End Testing Walkthrough

**Quick Start Guide for Testing StudyCollab**

---

## 🚀 Quick Setup

### 1. Start All Services
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
./scripts/start-services.sh

# Or use the consolidated dev script
./start-dev.sh
```

### 2. Run Database Migration
```bash
cd services/api
npm run migrate
```

### 3. Verify Services
```bash
# Check status
./scripts/status.sh

# Test API
curl http://localhost:3001/health

# Open browser
open http://localhost:3000
```

---

## 📝 Step-by-Step Testing

### Automated Checks (Recommended First)
```bash
# Backend unit/integration
cd services/api
npm test

# Frontend unit tests
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
npm test

# WebSocket integration tests
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab/services/websocket
npm test

# API-focused E2E script (services must be running)
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
./test-script.sh

# Browser E2E (Playwright, services must be running)
npx playwright install
# One-command runner (starts services, seeds, runs Playwright, stops)
./scripts/run-e2e.sh
# Optional: disable rate limiting for repeated E2E logins
# DISABLE_RATE_LIMIT=true npm run dev  (run in services/api)
npm run test:e2e
```

### Test 1: User Registration ✅

**Steps:**
1. Open browser: http://localhost:3000
2. Click "Sign Up" or navigate to http://localhost:3000/signup
3. Fill the form:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** Test1234!
   - **Confirm Password:** Test1234!
4. Click "Sign Up"

**Expected:**
- ✅ Success message appears
- ✅ Redirected to /topics page
- ✅ Navbar shows "Test User"
- ✅ You're automatically logged in

**Verify in Browser Console:**
```javascript
// Check token stored
localStorage.getItem('studycollab_token')
// Should return a JWT token

// Check user stored
localStorage.getItem('studycollab_user')
// Should return user object
```

---

### Test 2: User Login ✅

**Steps:**
1. Click "Logout" in navbar
2. Navigate to http://localhost:3000/login
3. Enter credentials:
   - **Email:** test@example.com
   - **Password:** Test1234!
4. Click "Sign In"

**Expected:**
- ✅ Login successful
- ✅ Redirected to /topics
- ✅ User info displayed

**Test Invalid Login:**
- Try wrong password → Should show error
- Try non-existent email → Should show error

---

### Test 3: Create a Topic ✅

**Steps:**
1. Make sure you're logged in
2. Navigate to http://localhost:3000/topics
3. Look for "Create Topic" or use API:

**Using Browser Console:**
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
  console.log('Topic created:', data);
  // Note the topic ID for next test
});
```

**Expected:**
- ✅ Topic created successfully
- ✅ Topic appears in topics list
- ✅ You're automatically a member

---

### Test 4: View Topics ✅

**Steps:**
1. Navigate to http://localhost:3000/topics
2. You should see the topic you created
3. Try searching: Type "Calculus" in search box
4. Try filtering: Click on subject or tag filters

**Expected:**
- ✅ Topics list displays
- ✅ Search works
- ✅ Filters work
- ✅ Clicking a topic card navigates to topic room
- ✅ Category filter visible when categories exist
- ✅ Favorite toggle visible when logged in

---

### Test 5: Join Topic & Send Messages ✅

**Steps:**
1. Click on a topic card (or navigate to http://localhost:3000/topics/{topic-id})
2. Wait for WebSocket connection (check browser console)
3. Type a message in the chat input
4. Press Enter or click Send

**Expected:**
- ✅ WebSocket connects (check console for "Connected!")
- ✅ Message appears immediately
- ✅ Message persists after page refresh
- ✅ Your name/avatar shows correctly
- ✅ Presence count updates for room members
- ✅ Notification received by other members

**Check Browser Console:**
```javascript
// Should see WebSocket connection logs
// Should see message events
```

**Verify Message Saved:**
```javascript
// Get your token
const token = localStorage.getItem('studycollab_token');
const topicId = 'YOUR_TOPIC_ID'; // From previous step

// Check messages
fetch(`http://localhost:3001/api/messages/topic/${topicId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log('Messages:', data));
```

---

### Test 6: Message History ✅

**Steps:**
1. Send several messages in a topic
2. Refresh the page (F5)
3. Navigate back to the topic room

**Expected:**
- ✅ Previous messages load automatically
- ✅ Messages in chronological order
- ✅ All messages display correctly
- ✅ User info (name, avatar) shows
- ✅ "Load earlier messages" fetches older items

---

### Test 7: Multiple Users (Real-time) ✅

**Steps:**
1. Open a second browser window (or incognito)
2. Register a new user: test2@example.com
3. Join the same topic
4. Send messages from both browsers

**Expected:**
- ✅ Messages appear in real-time in both browsers
- ✅ Typing indicators work
- ✅ User presence tracked
- ✅ "User joined" notifications appear

---

### Test 8: Update Profile ✅

**Steps:**
1. Navigate to http://localhost:3000/profile
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
.then(data => console.log('Profile:', data));

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
.then(data => console.log('Updated:', data));
```

---

### Test 9: Favorites ✅

**Steps:**
1. Navigate to http://localhost:3000/topics
2. Toggle favorite on a topic
3. Refresh and confirm favorite persists

**Expected:**
- ✅ Favorite toggle updates UI
- ✅ Favorite persists after reload

---

### Test 10: Admin Dashboard ✅

**Steps:**
1. Login as admin
2. Navigate to http://localhost:3000/admin
3. Verify stats and user list load

**Expected:**
- ✅ Stats load from API
- ✅ User list renders with name/email/role/joined

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

### Connect to Database
```bash
# If using Docker
docker exec -it studycollab-db psql -U studycollab -d studycollab

# Or if local PostgreSQL
psql -U studycollab -d studycollab
```

### Check Users
```sql
SELECT id, name, email, role, created_at FROM users;
```

### Check Topics
```sql
SELECT id, title, subject, created_by, created_at FROM topics;
```

### Check Messages
```sql
SELECT m.id, m.content, m.created_at, u.name as user_name, t.title as topic_title
FROM messages m
JOIN users u ON m.user_id = u.id
JOIN topics t ON m.topic_id = t.id
ORDER BY m.created_at DESC
LIMIT 10;
```

### Check Topic Members
```sql
SELECT tm.topic_id, t.title, u.name as member_name, tm.joined_at
FROM topic_members tm
JOIN topics t ON tm.topic_id = t.id
JOIN users u ON tm.user_id = u.id;
```

---

## ❌ Error Testing

### Test Invalid Registration
- Try duplicate email → Should fail
- Try weak password → Should fail
- Try invalid email format → Should fail

### Test Invalid Login
- Wrong password → Should fail
- Non-existent email → Should fail

### Test Protected Routes Without Token
```bash
# Should return 401
curl http://localhost:3001/api/users/profile
```

### Test Invalid Token
```bash
# Should return 401
curl http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer invalid-token"
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
- [ ] Error handling works

---

## 🐛 Troubleshooting

### Services Not Starting
```bash
# Check status
./scripts/status.sh

# Check logs
tail -f /tmp/studycollab/*.log

# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### Database Connection Issues
```bash
# Check if database is running
docker ps | grep studycollab-db

# Check database logs
docker logs studycollab-db

# Restart database
docker restart studycollab-db
```

### WebSocket Connection Issues
- Check browser console for errors
- Verify token is valid
- Check WebSocket service is running
- Verify CORS settings

### API Errors
- Check API logs: `tail -f /tmp/studycollab/API.log`
- Verify token in request headers
- Check database connection
- Verify environment variables

---

## 📊 Test Results Template

```
Test #: [Number]
Test Name: [Name]
Status: ✅ Pass / ❌ Fail / ⚠️ Partial
Time: [Duration]
Notes: [Any observations]
Errors: [If any]
```

---

**Happy Testing! 🚀**

For detailed test scenarios, see `END_TO_END_TEST.md`

