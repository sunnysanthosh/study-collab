# Phase 3 Development Plan

## Overview
Phase 3 focuses on implementing real database integration and authentication to replace the mock/test systems.

---

## Goals

1. ✅ **Database Setup**
   - PostgreSQL connection and configuration
   - Database schema creation
   - Migration system

2. ✅ **Real Authentication**
   - JWT token generation and validation
   - Password hashing (bcrypt)
   - User registration and login
   - Token refresh mechanism

3. ✅ **Database Models**
   - Users table
   - Topics table
   - Messages table
   - Topic members table

4. ✅ **API Integration**
   - Connect controllers to database
   - Implement CRUD operations
   - Add validation and error handling

5. ✅ **WebSocket Persistence**
   - Save messages to database
   - Load message history
   - User presence tracking

---

## Implementation Steps

### Step 1: Database Setup
- [x] Install database dependencies (pg, pg-pool)
- [ ] Create database connection module
- [ ] Create schema SQL file
- [ ] Add migration script
- [ ] Test database connection

### Step 2: Authentication Implementation
- [ ] Install JWT and bcrypt dependencies
- [ ] Create JWT utility functions
- [ ] Implement password hashing
- [ ] Update auth controller with real logic
- [ ] Add authentication middleware
- [ ] Test login/register endpoints

### Step 3: Database Models
- [ ] Create User model/queries
- [ ] Create Topic model/queries
- [ ] Create Message model/queries
- [ ] Create TopicMember model/queries
- [ ] Add helper functions

### Step 4: API Endpoints
- [ ] Update auth endpoints (register, login, refresh, logout)
- [ ] Update user endpoints (get profile, update profile)
- [ ] Update topic endpoints (list, create, get, join)
- [ ] Add validation middleware
- [ ] Add error handling

### Step 5: WebSocket Integration
- [ ] Add database connection to WebSocket service
- [ ] Save messages to database
- [ ] Load message history on room join
- [ ] Track user presence

### Step 6: Frontend Updates
- [ ] Update AuthContext to use real API
- [ ] Add token storage and refresh
- [ ] Update API calls to include authentication
- [ ] Handle token expiration

### Step 7: Testing
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test topic creation
- [ ] Test message sending
- [ ] Test message persistence
- [ ] End-to-end testing

---

## Dependencies to Add

### Backend API
```json
{
  "pg": "^8.11.3",
  "@types/pg": "^8.10.9",
  "bcryptjs": "^2.4.3",
  "@types/bcryptjs": "^2.4.6",
  "jsonwebtoken": "^9.0.2",
  "@types/jsonwebtoken": "^9.0.5",
  "dotenv": "^16.3.1"
}
```

### WebSocket Service
```json
{
  "pg": "^8.11.3",
  "@types/pg": "^8.10.9",
  "jsonwebtoken": "^9.0.2",
  "@types/jsonwebtoken": "^9.0.5",
  "dotenv": "^16.3.1"
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Topics Table
```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100),
  difficulty VARCHAR(50),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Topic Members Table
```sql
CREATE TABLE topic_members (
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (topic_id, user_id)
);
```

---

## Environment Variables

### Backend API (.env)
```
DATABASE_URL=postgresql://studycollab:studycollab@localhost:5432/studycollab
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
```

### WebSocket Service (.env)
```
DATABASE_URL=postgresql://studycollab:studycollab@localhost:5432/studycollab
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
PORT=3002
NODE_ENV=development
```

---

## Security Considerations

1. **Password Security**
   - Use bcrypt with salt rounds (10-12)
   - Never store plain passwords
   - Validate password strength

2. **JWT Security**
   - Use strong secret keys
   - Set appropriate expiration times
   - Implement refresh token rotation
   - Store tokens securely (httpOnly cookies in production)

3. **Database Security**
   - Use parameterized queries (prevent SQL injection)
   - Validate all inputs
   - Use connection pooling
   - Limit database access

4. **API Security**
   - Rate limiting
   - CORS configuration
   - Input validation
   - Error message sanitization

---

## Testing Checklist

- [ ] User can register with valid data
- [ ] User cannot register with duplicate email
- [ ] User can login with correct credentials
- [ ] User cannot login with incorrect credentials
- [ ] JWT token is generated on login
- [ ] Protected routes require valid token
- [ ] Token refresh works
- [ ] User can create topics
- [ ] User can join topics
- [ ] Messages are saved to database
- [ ] Message history loads on room join
- [ ] User presence is tracked

---

## Timeline Estimate

- **Step 1-2:** 2-3 hours (Database + Auth)
- **Step 3-4:** 2-3 hours (Models + API)
- **Step 5:** 1-2 hours (WebSocket)
- **Step 6:** 1-2 hours (Frontend)
- **Step 7:** 1-2 hours (Testing)

**Total:** ~8-12 hours

---

**Status:** 🚀 Starting Implementation

