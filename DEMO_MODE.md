# Demo Mode Guide

## Overview

Demo mode provides a pre-configured environment with test users, topics, and sample messages for easy testing and demonstration.

---

## 🚀 Quick Start (Demo Mode)

### Option 1: Use Demo Startup Script (Recommended)

```bash
./scripts/start-demo.sh
```

This script will:
- ✅ Start database
- ✅ Run migrations
- ✅ Seed demo data automatically
- ✅ Start all services with demo mode enabled

### Option 2: Manual Demo Mode

1. **Start services normally:**
   ```bash
   ./scripts/start-services.sh
   ```

2. **Seed demo data:**
   ```bash
   cd services/api
   npm run seed:demo
   ```

3. **Start API with demo mode:**
   ```bash
   cd services/api
   DEMO_MODE=true npm run dev
   ```

---

## 🎭 Demo Mode Features

### Auto-Seeding
When `DEMO_MODE=true` is set, the API service will:
- Check if demo data exists on startup
- Automatically seed if database is empty
- Skip seeding if data already exists

### Demo Data Includes

**5 Test Users:**
- `test@studycollab.com` / `Test1234!`
- `admin@studycollab.com` / `Admin1234!`
- `student@studycollab.com` / `Student1234!`
- `alice@studycollab.com` / `Demo1234!`
- `bob@studycollab.com` / `Demo1234!`

**6 Demo Topics:**
- Calculus I
- Physics: Mechanics
- Intro to Computer Science
- Organic Chemistry
- Cell Biology
- Statistics and Probability

**Sample Messages:**
- Pre-populated messages in the first topic
- Multiple users' messages
- Realistic conversation examples

---

## 📋 Demo Mode Commands

### Seed Demo Data
```bash
cd services/api
npm run seed:demo
```

### Reset Demo Data
```bash
cd services/api
npm run reset:demo
```

### Reset and Re-seed
```bash
cd services/api
npm run reset-and-seed
```

---

## 🔧 Environment Variables

### Enable Demo Mode

**Option 1: Environment Variable**
```bash
export DEMO_MODE=true
npm run dev
```

**Option 2: Inline**
```bash
DEMO_MODE=true npm run dev
```

**Option 3: .env file**
```env
DEMO_MODE=true
NODE_ENV=demo
```

---

## 🧪 Demo Credentials

### Test Users

| Email | Password | Role |
|-------|----------|------|
| test@studycollab.com | Test1234! | user |
| admin@studycollab.com | Admin1234! | admin |
| student@studycollab.com | Student1234! | user |
| alice@studycollab.com | Demo1234! | user |
| bob@studycollab.com | Demo1234! | user |

### Login Steps

1. Navigate to: http://localhost:3000/login
2. Use any of the credentials above
3. Click "Sign In"

---

## 📊 Demo Data Structure

### Users Table
- 5 pre-configured users
- Passwords are hashed with bcrypt
- Roles assigned (user/admin)

### Topics Table
- 6 demo topics across different subjects
- Tags and difficulty levels set
- Created by test user

### Messages Table
- Sample messages in first topic
- Multiple users' messages
- Timestamps set

### Topic Members Table
- Test user is member of all topics
- Other users added to first topic

---

## 🔄 Resetting Demo Data

### Complete Reset
```bash
cd services/api
npm run reset:demo
npm run seed:demo
```

### What Gets Reset
- ✅ All messages deleted
- ✅ All topic memberships deleted
- ✅ All topics deleted
- ✅ All users deleted
- ✅ Fresh demo data seeded

---

## 🎯 Use Cases

### Development Testing
- Quick setup for testing features
- Consistent test data
- No need to manually create users/topics

### Demonstrations
- Show application with real data
- Multiple users and conversations
- Realistic scenarios

### CI/CD Testing
- Automated test data setup
- Consistent test environment
- Easy cleanup and reset

---

## 📝 Seed Script Details

### Location
`services/api/src/db/seed.ts`

### What It Does
1. Creates test users with hashed passwords
2. Creates demo topics with descriptions
3. Adds users as topic members
4. Creates sample messages
5. Skips existing data (idempotent)

### Customization
Edit `seed.ts` to:
- Add more test users
- Add more demo topics
- Customize messages
- Change user roles

---

## 🔍 Verify Demo Data

### Check Users
```bash
docker exec -it studycollab-db psql -U studycollab -d studycollab -c "SELECT name, email, role FROM users;"
```

### Check Topics
```bash
docker exec -it studycollab-db psql -U studycollab -d studycollab -c "SELECT title, subject, difficulty FROM topics;"
```

### Check Messages
```bash
docker exec -it studycollab-db psql -U studycollab -d studycollab -c "SELECT COUNT(*) FROM messages;"
```

---

## ⚙️ Configuration

### Disable Auto-Seeding
Remove or set `DEMO_MODE=false`:
```bash
DEMO_MODE=false npm run dev
```

### Custom Seed Data
Edit `services/api/src/db/seed.ts`:
- Modify `testUsers` array
- Modify `demoTopics` array
- Modify `demoMessages` array

---

## 🚨 Important Notes

1. **Demo Mode is for Development Only**
   - Never use in production
   - Contains test credentials
   - Auto-seeding can overwrite data

2. **Data Persistence**
   - Demo data persists in database
   - Reset script clears all data
   - Seed script is idempotent (safe to run multiple times)

3. **Security**
   - Demo passwords are documented
   - Change passwords for production
   - Remove demo mode in production builds

---

## 📚 Related Documentation

- `TEST_CREDENTIALS.md` - Test user credentials
- `QUICK_TEST_GUIDE.md` - Testing guide
- `END_TO_END_TEST.md` - Complete test scenarios

---

**Last Updated:** 2024-12-21

