# 🧪 Test Now - Quick Steps

**All services are starting!** Follow these steps to test:

---

## ✅ Service Status

Check if all services are running:
```bash
./scripts/status.sh
```

**Expected:**
- ✅ Frontend: http://localhost:3000
- ✅ API: http://localhost:3001
- ✅ WebSocket: http://localhost:3002
- ✅ Database: localhost:5432

---

## 🚀 Quick Test Steps

### 1. Open Application
**URL:** http://localhost:3000

---

### 2. Register a User

1. Click **"Sign Up"** button
2. Fill the form:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** Test1234!
   - **Confirm Password:** Test1234!
3. Click **"Sign Up"**

**✅ Expected:** Redirected to `/topics` page, logged in automatically

---

### 3. Create a Topic

**Open Browser Console (F12 or Cmd+Option+I) and paste:**

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
  window.topicId = data.id;
  alert('Topic created! ID: ' + data.id + '\nRefresh the topics page to see it.');
})
.catch(err => {
  console.error('❌ Error:', err);
  alert('Error creating topic. Check console for details.');
});
```

**✅ Expected:** Topic created, alert shows topic ID

---

### 4. View Your Topic

1. Navigate to **http://localhost:3000/topics**
2. Refresh the page (F5)
3. You should see "Calculus Study Group" topic
4. Click on it

**✅ Expected:** Topic card appears, clicking navigates to topic room

---

### 5. Send Messages

1. In the topic room, wait for WebSocket connection (check console)
2. Type a message in the chat input
3. Press Enter or click Send

**✅ Expected:**
- Message appears immediately
- Your name/avatar shows
- Message persists after refresh

**Check Console:**
- Should see "✅ Connected to WebSocket server"
- Should see message events

---

### 6. Verify Message Persistence

1. Send a few messages
2. Refresh the page (F5)
3. Navigate back to the topic room

**✅ Expected:** Previous messages load automatically

---

### 7. Test Real-time (Optional)

1. Open a second browser window (or incognito)
2. Register another user: `test2@example.com`
3. Join the same topic (use topic ID from first browser)
4. Send messages from both browsers

**✅ Expected:** Messages appear in real-time in both browsers

---

## 🔍 Verify in Database

```bash
# Connect to database
docker exec -it studycollab-db psql -U studycollab -d studycollab

# Check users
SELECT id, name, email FROM users;

# Check topics
SELECT id, title, subject FROM topics;

# Check messages
SELECT m.content, u.name, t.title 
FROM messages m
JOIN users u ON m.user_id = u.id
JOIN topics t ON m.topic_id = t.id
ORDER BY m.created_at DESC
LIMIT 5;
```

---

## 🐛 Troubleshooting

### Services Not Running?
```bash
# Check status
./scripts/status.sh

# Check logs
tail -f /tmp/studycollab/*.log
```

### WebSocket Not Connecting?
- Check browser console for errors
- Verify token: `localStorage.getItem('studycollab_token')`
- Check WebSocket service: `lsof -ti:3002`

### API Errors?
- Check API logs: `tail -f /tmp/studycollab/API.log`
- Verify database is running: `docker ps | grep studycollab-db`

---

## ✅ Test Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Topic creation works
- [ ] Topics list displays
- [ ] Can join topic
- [ ] Can send messages
- [ ] Messages persist
- [ ] Message history loads
- [ ] Real-time messaging works

---

**Happy Testing! 🚀**

