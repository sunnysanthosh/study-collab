# Test Credentials for StudyCollab

## 🧪 Test Login Credentials

**Note:** With Phase 3 (v0.3), the application now uses real JWT authentication. Test users must be seeded into the database first.

### Seeding Test Users

Run the seed script to create test users:

```bash
cd backend/api
npm run seed
```

This will create the following test users in the database.

### Pre-configured Test Users (After Seeding)

After running `npm run seed`, these users will be available:

#### Test User 1
- **Email:** `test@studycollab.com`
- **Password:** `Test1234!`
- **Name:** Test User
- **Role:** user
- **Access:** Standard user

#### Test User 2 (Admin)
- **Email:** `admin@studycollab.com`
- **Password:** `Admin1234!`
- **Name:** Admin User
- **Role:** admin
- **Access:** Admin privileges (future)

#### Test User 3 (Student)
- **Email:** `student@studycollab.com`
- **Password:** `Student1234!`
- **Name:** Student User
- **Role:** user
- **Access:** Standard user

### Password Requirements

All passwords must meet these requirements:
- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

## How to Login

1. Navigate to: http://localhost:3000/login
2. Enter one of the test credentials above
3. Click "Sign In"
4. You'll be redirected to the Topics page upon successful login

---

## What Happens After Login

- ✅ User session is stored in localStorage
- ✅ Navbar shows user name and logout button
- ✅ Notification center becomes available
- ✅ Profile page becomes accessible
- ✅ Authenticated routes become available

---

## Logout

Click the "Logout" button in the navbar to end your session.

---

## Notes

- These are **test credentials only** - not for production use
- Authentication is currently **client-side only** (mock)
- User data is stored in browser localStorage
- Clearing browser data will log you out
- No actual backend authentication is implemented yet

---

## Future Implementation

When real authentication is implemented:
- These test credentials will be removed
- JWT tokens will be used
- Backend validation will be required
- Database user storage will be implemented

---

**Last Updated:** 2024-12-21

