# Test Credentials for StudyCollab

## 🧪 Test Login Credentials

The application includes test/demo credentials for easy testing without setting up a full authentication system.

### Pre-configured Test Users

#### Test User 1
- **Email:** `test@studycollab.com`
- **Password:** `test123`
- **Name:** Test User
- **Access:** Standard user

#### Test User 2 (Admin)
- **Email:** `admin@studycollab.com`
- **Password:** `admin123`
- **Name:** Admin User
- **Access:** Admin privileges (future)

#### Test User 3 (Student)
- **Email:** `student@studycollab.com`
- **Password:** `student123`
- **Name:** Student User
- **Access:** Standard user

### Universal Demo Login

For quick testing, you can use **any email address** with the password:
- **Password:** `demo123`

This will create a temporary user with the email you provide.

**Example:**
- Email: `demo@example.com`
- Password: `demo123`

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

