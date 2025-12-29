# Testing Guide - v0.5 Features

**Version:** v0.5  
**Date:** 2024-12-21  
**Status:** Ready for Testing

---

## ✅ Implemented Features

### 1. File Upload System
- ✅ File upload API endpoint
- ✅ Avatar upload functionality
- ✅ File storage (local filesystem)
- ✅ File serving endpoint
- ✅ File validation (type, size)
- ✅ FileUpload UI component
- ✅ Chat file attachments
- ✅ Profile avatar upload

### 2. Notifications System
- ✅ Notifications database table
- ✅ Notification API endpoints
- ✅ Unread count tracking
- ✅ Mark as read functionality
- ✅ NotificationCenter component (backend integrated)
- ⏳ Real-time WebSocket notifications (pending)

### 3. Message Features
- ✅ Message editing
- ✅ Message deletion
- ✅ Message reactions (emoji)
- ✅ Reaction counts
- ✅ Edited indicator
- ✅ ChatInterface with all features

### 4. Profile Management
- ✅ Real avatar upload
- ✅ Profile update API integration
- ✅ Profile page with backend

---

## 🧪 Testing Checklist

### Backend API Testing

#### File Upload
- [ ] Upload a file via POST `/api/files/upload`
- [ ] Upload an avatar via POST `/api/files/avatar`
- [ ] Verify file is saved to `uploads/` directory
- [ ] Verify file URL is returned correctly
- [ ] Test file type validation (reject non-allowed types)
- [ ] Test file size validation (reject > 10MB)
- [ ] Access uploaded file via GET `/api/files/uploads/*`
- [ ] Delete file attachment via DELETE `/api/files/:fileId`

#### Notifications
- [ ] Get notifications via GET `/api/notifications`
- [ ] Get unread count via GET `/api/notifications/unread-count`
- [ ] Mark notification as read via PUT `/api/notifications/:id/read`
- [ ] Mark all as read via PUT `/api/notifications/read-all`
- [ ] Delete notification via DELETE `/api/notifications/:id`

#### Messages
- [ ] Edit message via PUT `/api/messages/:messageId`
- [ ] Delete message via DELETE `/api/messages/:messageId`
- [ ] Add reaction via POST `/api/messages/:messageId/reactions`
- [ ] Get reactions via GET `/api/messages/:messageId/reactions`
- [ ] Verify edited_at timestamp is set on edit

### Frontend Testing

#### File Upload
- [ ] Upload file from chat interface
- [ ] Upload avatar from profile page
- [ ] Verify file preview/display
- [ ] Test file size validation message
- [ ] Test file type validation message
- [ ] Verify file link in chat message

#### Notifications
- [ ] View notifications in NotificationCenter
- [ ] See unread count badge
- [ ] Mark notification as read
- [ ] Mark all as read
- [ ] Delete notification
- [ ] Verify notification refresh (every 30s)

#### Chat Interface
- [ ] Send message
- [ ] Edit own message
- [ ] Delete own message
- [ ] Add reaction to message
- [ ] View reaction counts
- [ ] See edited indicator
- [ ] Upload file from chat
- [ ] Verify message history loads

#### Profile
- [ ] View profile page
- [ ] Edit profile information
- [ ] Upload avatar image
- [ ] Verify avatar updates
- [ ] Save profile changes

---

## 🐛 Known Issues to Test

1. **File URL Generation**
   - Verify file URLs are correct
   - Check file serving works correctly
   - Test with different file types

2. **Message Reactions**
   - Test reaction toggle (add/remove)
   - Verify reaction counts update
   - Test multiple users reacting

3. **Notification Refresh**
   - Verify notifications refresh automatically
   - Check unread count updates
   - Test notification deletion

4. **Error Handling**
   - Test with invalid file types
   - Test with oversized files
   - Test with network errors
   - Test with expired tokens

---

## 🚀 Quick Test Steps

### 1. Start Services
```bash
cd study-collab
./scripts/start-demo.sh
```

### 2. Test File Upload
1. Login with test credentials
2. Go to Profile page
3. Click Edit Profile
4. Upload an avatar image
5. Verify avatar updates

### 3. Test Chat Features
1. Go to a topic room
2. Send a message
3. Click edit icon on your message
4. Edit and save
5. Add a reaction (click emoji button)
6. Upload a file (click paperclip icon)

### 4. Test Notifications
1. Click notification bell icon
2. View notifications
3. Mark one as read
4. Mark all as read
5. Delete a notification

---

## 📝 Test Results Template

```
Date: __________
Tester: __________

Backend API:
- File Upload: [ ] Pass [ ] Fail - Notes: __________
- Notifications: [ ] Pass [ ] Fail - Notes: __________
- Messages: [ ] Pass [ ] Fail - Notes: __________

Frontend:
- File Upload: [ ] Pass [ ] Fail - Notes: __________
- Notifications: [ ] Pass [ ] Fail - Notes: __________
- Chat Interface: [ ] Pass [ ] Fail - Notes: __________
- Profile: [ ] Pass [ ] Fail - Notes: __________

Issues Found:
1. __________
2. __________
3. __________
```

---

## 🔧 Troubleshooting

### File Upload Issues
- Check `uploads/` directory exists and is writable
- Verify file size limits (10MB max)
- Check file type restrictions
- Verify authentication token

### Notification Issues
- Check database connection
- Verify user authentication
- Check API endpoint responses
- Verify notification refresh interval

### Message Issues
- Check WebSocket connection
- Verify message permissions
- Check database for message data
- Verify reaction counts

---

**Ready for comprehensive testing!** 🧪

