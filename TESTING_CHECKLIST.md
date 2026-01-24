# Testing Checklist for StudyCollab

Use this checklist to systematically test all features of the application.

## Pre-Testing Setup

- [ ] All dependencies installed (frontend, API, WebSocket)
- [ ] Environment variables configured
- [ ] Database running (PostgreSQL)
- [ ] All services started (Frontend, API, WebSocket)
- [ ] Playwright browsers installed (`npx playwright install`)

## Quick Start Commands

### Start All Services

**Option 1: Using the script**
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
./start-dev.sh
```

**Option 2: Manual (3 terminals)**

Terminal 1 - Frontend:
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
npm run dev
```

Terminal 2 - API:
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab/backend/api
npm run dev
```

Terminal 3 - WebSocket:
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab/backend/websocket
npm run dev
```

### Automated Tests (Optional)
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

# Browser E2E (Playwright, services must be running)
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
npm run test:e2e
```

---

## 1. Frontend Testing

### Home Page (`/`)
- [ ] Page loads without errors
- [ ] Hero section displays with gradient text
- [ ] "StudyCollab" title is visible
- [ ] Tagline text is readable
- [ ] "Get Started" button is clickable
- [ ] "Explore Topics" button is clickable
- [ ] Features section shows 4 cards:
  - [ ] Real-time Chat card
  - [ ] Problem Board card
  - [ ] Study Groups card
  - [ ] Live Updates card
- [ ] CTA section at bottom displays
- [ ] Page is responsive (test on mobile viewport)
- [ ] No console errors

**Expected URLs:**
- Get Started → `/signup`
- Explore Topics → `/topics`

---

### Login Page (`/login`)
- [ ] Page loads correctly
- [ ] Form displays with email and password fields
- [ ] Email field accepts input
- [ ] Password field accepts input
- [ ] Password visibility toggle works (eye icon)
- [ ] Form validation works:
  - [ ] Empty email shows error
  - [ ] Invalid email format shows error
  - [ ] Empty password shows error
  - [ ] Password < 6 chars shows error
- [ ] "Sign In" button is clickable
- [ ] Loading state shows when submitting
- [ ] "Sign up" link navigates to `/signup`
- [ ] No console errors

**Test Cases:**
1. Submit empty form → Should show validation errors
2. Submit with invalid email → Should show email error
3. Submit with short password → Should show password error
4. Submit valid form → Should show loading (will fail without backend)

---

### Signup Page (`/signup`)
- [ ] Page loads correctly
- [ ] Form displays with all fields:
  - [ ] Full Name
  - [ ] Email
  - [ ] Password
  - [ ] Confirm Password
- [ ] All fields accept input
- [ ] Password visibility toggles work for both password fields
- [ ] Form validation works:
  - [ ] Empty name shows error
  - [ ] Invalid email shows error
  - [ ] Password < 8 chars shows error
  - [ ] Password mismatch shows error
- [ ] Helper text displays for password requirements
- [ ] "Sign Up" button is clickable
- [ ] Loading state shows when submitting
- [ ] "Sign in" link navigates to `/login`
- [ ] No console errors

**Test Cases:**
1. Submit with mismatched passwords → Should show error
2. Submit with all valid data → Should show loading

---

### Topics Page (`/topics`)
- [ ] Page loads correctly
- [ ] Page header displays ("Study Topics")
- [ ] Search bar is visible and functional
- [ ] Filter panel shows:
  - [ ] "All" button
  - [ ] Tag filter buttons (Math, Physics, CS, Chemistry, etc.)
  - [ ] Category filter buttons (when categories exist)
- [ ] Topics display in grid layout
- [ ] Each topic card shows:
  - [ ] Title
  - [ ] Description
  - [ ] Active user count with pulsing indicator
  - [ ] Tags
  - [ ] "Join Room" button
- [ ] Favorite toggle is visible when logged in
- [ ] Search functionality:
  - [ ] Type in search → Topics filter in real-time
  - [ ] Clear search → All topics show
- [ ] Tag filtering:
  - [ ] Click tag → Only matching topics show
  - [ ] Click "All" → All topics show
- [ ] Empty state displays when no matches
- [ ] "Join Room" button navigates to topic room
- [ ] Cards have hover effects
- [ ] Page is responsive
- [ ] No console errors

**Test Cases:**
1. Search for "Calculus" → Should show Calculus topic
2. Filter by "Math" tag → Should show only math topics
3. Search for non-existent topic → Should show empty state

---

### Topic Room (`/topics/[id]`)
- [ ] Page loads correctly
- [ ] Layout shows:
  - [ ] Problem Board on left (larger)
  - [ ] Chat Interface on right (narrower)
- [ ] Problem Board displays:
  - [ ] Problem title and description
  - [ ] Tool buttons (Draw, Text, Image)
  - [ ] Workspace area
- [ ] Tool selection works:
  - [ ] Click "Draw" → Button highlights
  - [ ] Click "Text" → Textarea appears
  - [ ] Click "Image" → Button highlights
- [ ] Chat Interface displays:
  - [ ] Header with "Live Chat" title
  - [ ] Message count
  - [ ] Online users count/presence indicator
  - [ ] Connection status indicator
  - [ ] Messages area (scrollable)
  - [ ] Input field at bottom
  - [ ] Send button
- [ ] Connection status:
  - [ ] Shows "Connected" or "Offline"
  - [ ] Pulsing dot (green when connected)
- [ ] Chat functionality:
  - [ ] Type message → Input updates
  - [ ] Click Send → Message appears (if WebSocket connected)
  - [ ] Typing indicator works (if WebSocket connected)
  - [ ] "Load earlier messages" loads older history
  - [ ] File upload progress indicator updates during upload
- [ ] Responsive: Stacks vertically on mobile
- [ ] No console errors

**Test Cases:**
1. Type message and send → Should appear in chat
2. Check WebSocket connection status
3. Test typing indicator (type in input)

---

### Profile Page (`/profile`)
- [ ] Page loads correctly
- [ ] Profile header displays:
  - [ ] Avatar (or initial letter)
  - [ ] Name and email
  - [ ] Bio text
  - [ ] "Edit Profile" button
- [ ] Statistics cards display:
  - [ ] Topics Joined
  - [ ] Messages Sent
  - [ ] Problems Solved
  - [ ] Study Hours
- [ ] Edit mode:
  - [ ] Click "Edit Profile" → Form appears
  - [ ] Name field is editable
  - [ ] Email field is editable
  - [ ] Bio textarea is editable
  - [ ] Avatar upload button appears
  - [ ] "Save Changes" and "Cancel" buttons appear
- [ ] Avatar upload:
  - [ ] Click camera icon → File picker opens
  - [ ] Select image → Preview appears
- [ ] Form submission:
  - [ ] Click "Save Changes" → Shows loading
  - [ ] Click "Cancel" → Returns to view mode
- [ ] No console errors

**Test Cases:**
1. Edit profile and save → Should show loading state
2. Upload avatar image → Should show preview

---

### Admin Dashboard (`/admin`)
- [ ] Page loads correctly
- [ ] Page header displays
- [ ] Statistics cards show:
  - [ ] Total Users
  - [ ] Active Topics
  - [ ] Pending Requests
  - [ ] Online Now
- [ ] "Add New Topic" button is visible
- [ ] User management table displays:
  - [ ] Column headers (Name, Email, Role, Joined)
  - [ ] User rows with real data
  - [ ] Role badges render correctly
- [ ] Table rows have hover effects
- [ ] "Add New Topic" button navigates to `/admin/add-topic`
- [ ] No console errors

---

### Add Topic Page (`/admin/add-topic`)
- [ ] Page loads correctly
- [ ] Form displays:
  - [ ] Topic Title field
  - [ ] Category field
  - [ ] Subject field
  - [ ] Difficulty field
  - [ ] Description textarea
  - [ ] Tags field
- [ ] All fields accept input
- [ ] Form validation:
  - [ ] Empty title shows error
  - [ ] Short description shows error
  - [ ] Empty tags shows error
- [ ] Character counter for description
- [ ] "Create Topic" button is clickable
- [ ] "Cancel" button navigates back
- [ ] Loading state on submit
- [ ] No console errors

---

## 2. Backend API Testing

### Health Check
```bash
curl http://localhost:3001/health
```
- [ ] Returns `{"status":"ok","timestamp":"..."}`
- [ ] Response time < 100ms

### Authentication Endpoints

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123456"}'
```
- [ ] Returns 201 status
- [ ] Returns user data (without password)

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```
- [ ] Returns 200 status
- [ ] Returns tokens (accessToken, refreshToken)

### Topics Endpoints

**Get Topics:**
```bash
curl http://localhost:3001/api/topics
```
- [ ] Returns 200 status
- [ ] Returns topics array (may be empty)

**Create Topic:**
```bash
curl -X POST http://localhost:3001/api/topics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Topic","description":"Test","tags":["test"]}'
```
- [ ] Returns 201 status
- [ ] Returns created topic

**Favorites:**
```bash
curl -X POST http://localhost:3001/api/topics/TOPIC_ID/favorite \
  -H "Authorization: Bearer YOUR_TOKEN"
curl -X DELETE http://localhost:3001/api/topics/TOPIC_ID/favorite \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Favorite add/remove returns 200

**Admin Stats (admin token):**
```bash
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
- [ ] Returns stats payload

---

## 3. WebSocket Testing

### Connection Test
1. Open browser console on topic room page
2. Check for WebSocket connection:
   - [ ] Connection established
   - [ ] No connection errors
   - [ ] Status shows "Connected" in UI

### Message Test
1. Open topic room in two browser windows/tabs
2. Send message from first window:
   - [ ] Message appears in sender's chat
   - [ ] Message appears in receiver's chat
   - [ ] Timestamps are correct
   - [ ] User avatars display

### Typing Indicator Test
1. Type in chat input (don't send):
   - [ ] Typing indicator appears in other clients
   - [ ] Indicator disappears after 3 seconds

### Join/Leave Test
1. Join room:
   - [ ] "user-joined" event received
   - [ ] User list updates
2. Leave room:
   - [ ] "user-left" event received
   - [ ] User list updates

### Presence/Notification Test
1. Open two clients:
   - [ ] Presence count updates when user connects/disconnects
   - [ ] Notification event received for new message

---

## 4. Integration Testing

### Complete User Flow
1. [ ] Visit home page
2. [ ] Click "Get Started" → Navigate to signup
3. [ ] Fill signup form
4. [ ] Submit form (will show loading)
5. [ ] Navigate to topics page
6. [ ] Search for a topic
7. [ ] Click "Join Room" on a topic
8. [ ] Verify topic room loads
9. [ ] Send a message in chat
10. [ ] Check message appears
11. [ ] Toggle favorite on a topic
12. [ ] Navigate to profile
13. [ ] Edit profile information
14. [ ] Save changes

---

## 5. UI/UX Testing

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] All pages are readable
- [ ] Navigation works on all sizes
- [ ] Forms are usable on mobile

### Animations
- [ ] Fade-in animations work
- [ ] Hover effects work
- [ ] Button transitions smooth
- [ ] Loading spinners animate

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Form labels are associated
- [ ] Color contrast is sufficient
- [ ] Screen reader friendly (test with VoiceOver/NVDA)

---

## 6. Error Handling

### Frontend Errors
- [ ] Invalid routes show 404
- [ ] Network errors handled gracefully
- [ ] Form validation errors display
- [ ] Loading states show for async operations
- [ ] Error messages are user-friendly

### Backend Errors
- [ ] Invalid requests return proper status codes
- [ ] Error messages are descriptive
- [ ] CORS errors don't occur
- [ ] Database errors handled (when implemented)

---

## 7. Performance Testing

### Load Times
- [ ] Home page loads < 2 seconds
- [ ] Topics page loads < 1 second
- [ ] Topic room loads < 1.5 seconds
- [ ] API responses < 500ms

### Resource Usage
- [ ] Check browser DevTools → Network tab
- [ ] No unnecessary large files
- [ ] Images optimized (when added)
- [ ] JavaScript bundles reasonable size

---

## Common Issues & Solutions

### Port Already in Use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### WebSocket Connection Failed
- Check WebSocket service is running
- Verify `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
- Check CORS settings in WebSocket server

### API Not Responding
- Check API service is running
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check API logs for errors

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string in API `.env`
- Test connection: `psql -h localhost -U studycollab -d studycollab`

---

## Test Results Summary

**Date**: _______________
**Tester**: _______________
**Environment**: Local Development

### Summary
- Total Tests: ___
- Passed: ___
- Failed: ___
- Skipped: ___

### Critical Issues Found
1. 
2. 
3. 

### Notes
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

