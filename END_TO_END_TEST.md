# End-to-End Testing Guide - Phase 3

**Date:** 2026-01-25  
**Version:** v0.5.3

---

## Pre-Testing Setup

### 1. Start All Services

```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
./scripts/start-services.sh

# Or use the consolidated dev script
./start-dev.sh
```

**Expected:** All services start successfully
- ✅ Database running on port 5432
- ✅ API running on port 3001
- ✅ WebSocket running on port 3002
- ✅ Frontend running on port 3000

### 2. Run Database Migration

```bash
cd backend/api
npm run migrate
```

**Expected:** Database schema created successfully

### 3. Verify Services

```bash
# Check API health
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000

# Check database (if Docker)
docker exec studycollab-db pg_isready -U studycollab
```

### 4. Optional Automated Checks
```bash
# Backend unit/integration
cd backend/api
npm test

# Frontend unit tests
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
npm test

# WebSocket integration tests
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab/backend/websocket
npm test

# Browser E2E (Playwright, services must be running)
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
npx playwright install
# One-command runner (starts services, seeds, runs Playwright, stops)
./scripts/run-e2e.sh
# Optional: disable rate limiting for repeated E2E logins
# DISABLE_RATE_LIMIT=true npm run dev  (run in backend/api)
npm run test:e2e
```

---

## Test Scenarios

### Test 1: User Registration

**Steps:**
1. Navigate to http://localhost:3000/signup
2. Fill in registration form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "Test1234!"
   - Confirm Password: "Test1234!"
3. Click "Sign Up"

**Expected Results:**
- ✅ Form validation works
- ✅ Success message appears
- ✅ Redirected to /topics
- ✅ User logged in automatically
- ✅ Navbar shows user name
- ✅ Token stored in localStorage

**Verify in Database:**
```sql
SELECT id, name, email, role FROM users WHERE email = 'test@example.com';
```

---

### Test 2: User Login

**Steps:**
1. Logout (if logged in)
2. Navigate to http://localhost:3000/login
3. Enter credentials:
   - Email: "test@example.com"
   - Password: "Test1234!"
4. Click "Sign In"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to /topics
- ✅ Token stored
- ✅ User info displayed in navbar

**Test Invalid Credentials:**
- Wrong password → Error message
- Non-existent email → Error message

---

### Test 3: Create Topic

**Prerequisites:** User must be logged in

**Steps:**
1. Navigate to http://localhost:3000/topics
2. Look for "Create Topic" button (or navigate to admin page)
3. Fill topic form:
   - Title: "Calculus Study Group"
   - Description: "Working on derivatives and integrals"
   - Subject: "Math"
   - Difficulty: "Intermediate"
   - Tags: ["Calculus", "Math"]
4. Submit

**Expected Results:**
- ✅ Topic created successfully
- ✅ Topic appears in topics list
- ✅ User automatically added as member
- ✅ Can navigate to topic room

**Verify in Database:**
```sql
SELECT * FROM topics WHERE title = 'Calculus Study Group';
SELECT * FROM topic_members WHERE topic_id = (SELECT id FROM topics WHERE title = 'Calculus Study Group');
```

---

### Test 4: Join Topic

**Steps:**
1. Navigate to http://localhost:3000/topics
2. Click on a topic card
3. Should automatically join (or click "Join" button if available)

**Expected Results:**
- ✅ User added to topic_members
- ✅ Can access topic room
- ✅ Can send messages

**Verify in Database:**
```sql
SELECT * FROM topic_members WHERE user_id = '<user_id>';
```

---

### Test 5: Send Messages (WebSocket)

**Prerequisites:** User joined a topic

**Steps:**
1. Navigate to topic room: http://localhost:3000/topics/{topic-id}
2. Wait for WebSocket connection (check console)
3. Type a message in chat input
4. Send message

**Expected Results:**
- ✅ WebSocket connects (check browser console)
- ✅ Message appears in chat immediately
- ✅ Message saved to database
- ✅ Message persists after page refresh
- ✅ Other users see message (if multiple browsers)
- ✅ Presence count updates when users join/leave
- ✅ Notification event delivered to other members

**Verify in Database:**
```sql
SELECT * FROM messages WHERE topic_id = '<topic_id>' ORDER BY created_at DESC LIMIT 5;
```

---

### Test 6: Message History

**Steps:**
1. Send several messages in a topic
2. Refresh the page
3. Navigate back to topic room

**Expected Results:**
- ✅ Previous messages load on page load
- ✅ Message history displayed correctly
- ✅ Messages ordered chronologically
- ✅ User info (name, avatar) displayed correctly

---

### Test 7: Update Profile

**Steps:**
1. Navigate to http://localhost:3000/profile
2. Update name or email
3. Save changes

**Expected Results:**
- ✅ Profile updated successfully
- ✅ Changes reflected immediately
- ✅ Updated info in navbar

**Verify in Database:**
```sql
SELECT name, email FROM users WHERE id = '<user_id>';
```

---

### Test 8: Token Refresh

**Steps:**
1. Login and note the token expiration time (15 minutes)
2. Wait or manually trigger refresh
3. Check token in localStorage

**Expected Results:**
- ✅ Token refreshes automatically (every 14 minutes)
- ✅ User stays logged in
- ✅ No interruption in service

---

### Test 9: Logout

**Steps:**
1. Click "Logout" in navbar
2. Try to access protected route

**Expected Results:**
- ✅ Logged out successfully
- ✅ Tokens cleared from localStorage
- ✅ Redirected to home/login
- ✅ Cannot access protected routes

---

### Test 10: Search and Filter Topics

**Steps:**
1. Navigate to http://localhost:3000/topics
2. Use search box to search topics
3. Filter by subject
4. Filter by tags

**Expected Results:**
- ✅ Search filters topics correctly
- ✅ Subject filter works
- ✅ Tag filter works
- ✅ Category filter works (if categories exist)
- ✅ Filters can be combined
- ✅ Clear filters works

---

### Test 10b: Favorites

**Steps:**
1. Navigate to http://localhost:3000/topics
2. Toggle favorite on a topic (star icon)
3. Refresh and confirm favorite persists

**Expected Results:**
- ✅ Favorite toggle updates UI immediately
- ✅ Favorite persists after reload

---

### Test 10c: Admin Dashboard

**Steps:**
1. Login as admin user
2. Navigate to http://localhost:3000/admin
3. Verify stats and user list load

**Expected Results:**
- ✅ Stats load from API
- ✅ User list renders with name/email/role/joined

---

## Error Scenarios

### Test 11: Duplicate Email Registration

**Steps:**
1. Try to register with existing email

**Expected:**
- ✅ Error message: "User with this email already exists"
- ✅ Registration fails
- ✅ User not created

---

### Test 12: Weak Password

**Steps:**
1. Try to register with weak password (e.g., "123")

**Expected:**
- ✅ Validation error before submission
- ✅ Error message about password requirements
- ✅ Registration fails

---

### Test 13: Invalid Token

**Steps:**
1. Manually modify token in localStorage
2. Try to access protected route

**Expected:**
- ✅ Request fails with 401
- ✅ User redirected to login
- ✅ Error message displayed

---

### Test 14: WebSocket Without Token

**Steps:**
1. Clear token from localStorage
2. Try to join topic room

**Expected:**
- ✅ WebSocket connection fails
- ✅ Error message displayed
- ✅ Cannot send messages

---

### Test 15: Send Message Without Membership

**Steps:**
1. Create topic with User A
2. Login as User B
3. Try to send message without joining

**Expected:**
- ✅ Message sending fails
- ✅ Error message: "You must be a member..."
- ✅ Auto-join on room entry should handle this

---

## Performance Tests

### Test 16: Multiple Users

**Steps:**
1. Open multiple browser windows/incognito
2. Register different users
3. Join same topic
4. Send messages from all users

**Expected:**
- ✅ All users see messages in real-time
- ✅ User presence tracked correctly
- ✅ Typing indicators work
- ✅ No performance degradation

---

### Test 17: Message History Load

**Steps:**
1. Create topic with many messages (50+)
2. Join topic
3. Check load time

**Expected:**
- ✅ History loads within 1-2 seconds
- ✅ Only last 50 messages loaded
- ✅ UI remains responsive

---

## Database Verification

### Check All Tables

```sql
-- Users
SELECT COUNT(*) FROM users;

-- Topics
SELECT COUNT(*) FROM topics;

-- Messages
SELECT COUNT(*) FROM messages;

-- Topic Members
SELECT COUNT(*) FROM topic_members;
```

### Check Relationships

```sql
-- Messages with user info
SELECT m.id, m.content, u.name, u.email 
FROM messages m 
JOIN users u ON m.user_id = u.id 
LIMIT 10;

-- Topics with creator info
SELECT t.id, t.title, u.name as creator 
FROM topics t 
LEFT JOIN users u ON t.created_by = u.id 
LIMIT 10;

-- Topic members with user info
SELECT tm.topic_id, t.title, u.name as member_name
FROM topic_members tm
JOIN topics t ON tm.topic_id = t.id
JOIN users u ON tm.user_id = u.id
LIMIT 10;
```

---

## API Endpoint Tests

### Test 18: API Health Check

```bash
curl http://localhost:3001/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

---

### Test 19: Register via API

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test User",
    "email": "apitest@example.com",
    "password": "Test1234!"
  }'
```

**Expected:** Returns user object and tokens

---

### Test 20: Login via API

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "Test1234!"
  }'
```

**Expected:** Returns user object and tokens

---

### Test 21: Get Topics via API

```bash
curl http://localhost:3001/api/topics
```

**Expected:** Returns array of topics

---

### Test 22: Protected Route (No Token)

```bash
curl http://localhost:3001/api/users/profile
```

**Expected:** `401 Unauthorized`

---

### Test 23: Protected Route (With Token)

```bash
TOKEN="<access_token_from_login>"
curl http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Returns user profile

---

## WebSocket Connection Test

### Test 24: WebSocket Connection

**Using Browser Console:**
```javascript
const socket = io('http://localhost:3002', {
  auth: { token: localStorage.getItem('studycollab_token') }
});

socket.on('connect', () => console.log('Connected!'));
socket.on('error', (error) => console.error('Error:', error));
```

**Expected:** Connection successful

---

## Cleanup After Testing

### Remove Test Data

```sql
-- Remove test users (be careful!)
DELETE FROM messages WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%');
DELETE FROM topic_members WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%');
DELETE FROM topics WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%test%');
DELETE FROM users WHERE email LIKE '%test%';
```

---

## Test Results Template

```
Test #: [Test Name]
Status: [✅ Pass / ❌ Fail / ⚠️ Partial]
Notes: [Any observations]
Time: [Duration if relevant]
```

---

## Known Issues to Watch For

1. **Token expiration** - May need to refresh during long tests
2. **Database connection** - Ensure PostgreSQL is running
3. **CORS errors** - Check environment variables
4. **WebSocket connection** - May need to check token validity
5. **Port conflicts** - Ensure ports 3000, 3001, 3002, 5432 are available

---

**Testing Status:** Ready to begin  
**Last Updated:** 2026-01-25

