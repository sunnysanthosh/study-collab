# Changelog

All notable changes to StudyCollab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-01-25

### Added
- **Admin activity logs**
  - `admin_activity_logs` table (admin_user_id, action, target_type, target_id, metadata, created_at)
  - Logging for user update, user delete, and topic delete (best-effort; request not failed on log error)
  - `GET /api/admin/activity-logs` with pagination
  - Activity logs section on Admin Dashboard (Time, Admin, Action, Target, Details)

- **Admin dashboard enhancements** (from v0.5.x)
  - User management: Edit (name, email, role) and Delete with self-delete/last-admin safeguards
  - Topic moderation: list with creator, member/message counts; delete any topic
  - Stats: Total Messages; System Health card (API status + timestamp)
  - Activity logs UI

### Changed
- Admin controller wires `AdminActivityLog` for user/topic mutations
- Admin dashboard fetches and displays activity logs; refetches after edit/delete

### Testing
- API: admin controller tests for `getAdminActivityLogs`; `AdminActivityLog` mocked in update/delete tests
- Frontend: AdminDashboard test asserts Activity logs section
- Migration creates `admin_activity_logs` and indexes

---

## [0.5.4] - 2026-01-25

### Added
- Playwright E2E runner script with service bootstrap and teardown
- Chat/presence/notification E2E coverage in Playwright
- Database-backed integration tests for API and WebSocket services
- CI job for Playwright E2E with Postgres service

### Changed
- CI now provisions Postgres for API/WebSocket integration tests
- Rate limiting can be disabled for test automation (`DISABLE_RATE_LIMIT=true`)
- Service scripts resolve project root dynamically for portability

### Fixed
- Postgres notification delivery now uses `pg_notify` for realtime events

### Testing
- Backend tests: 13 files, 37 tests passing
- WebSocket tests: 1 file, 1 test passing
- Frontend tests: 4 files, 6 tests passing
- Playwright E2E: 5 tests passing

---

## [0.5.3] - 2026-01-25

### Added
- Coverage thresholds for backend and frontend test suites
- Backend controller tests for auth and user profile flows
- Frontend tests for the admin add-topic form

### Changed
- Vitest config now scopes frontend tests to `src/` only
- Frontend API client guards localStorage access in test/runtime
- Admin dashboard table header markup corrected

### Testing
- Backend tests: 12 files, 35 tests passing
- Frontend tests: 3 files, 5 tests passing
- Full E2E script re-run (14/14 pass)

### Docs
- Refreshed E2E baseline and testing guides for v0.5.3

---

## [0.5.2] - 2026-01-24

### Added
- **Security hardening**
  - Token blacklist with logout revocation (access + refresh)
  - Rate limiting (global + auth-specific)
  - WebSocket token revocation checks

- **Real-time notifications & presence**
  - Postgres LISTEN/NOTIFY pipeline for notifications
  - WebSocket delivery for notification events
  - User presence tracking via user_sessions
  - Room presence updates with online counts

- **Message & file UX upgrades**
  - Message pagination in API and UI
  - File upload progress indicators

- **Topic organization**
  - Topic categories
  - Favorites/bookmarks

- **Testing infrastructure**
  - Vitest setup for API and frontend
  - Initial unit tests for controllers and components
  - CI workflow for test execution

### Changed
- Database migration is now idempotent (safe re-runs)
- Notification flow updated to emit realtime events
- Admin dashboard wired to live data
- Next.js upgraded to resolve security advisories

### Security
- Helmet configured for cross-origin resource policy
- Token revocation enforced across API and WebSocket

### Testing
- End-to-end tests re-run (14/14 pass)
- Added unit tests for API controllers/models and frontend components

---

## [0.5.1] - 2024-12-29

### Added
- **Comprehensive Logging System**
  - Winston logger with daily log rotation
  - Structured JSON logging for production
  - Colorized console logging for development
  - Multiple log levels (error, warn, info, http, debug)
  - Separate log files for errors, HTTP, combined, exceptions, rejections
  - Automatic log compression (gzip)
  - Configurable log retention (7-30 days)

- **Request Logging**
  - HTTP request/response logging middleware
  - Response time tracking
  - User context capture (userId, email)
  - IP address and user agent logging
  - Sanitized request body logging (passwords redacted)

- **Error Tracking System**
  - Centralized error tracking with context
  - Error counting and threshold alerts
  - Categorized error tracking (API, Database, Auth, File)
  - Error statistics API endpoint (`/api/logs/stats`)
  - CustomError class for operational errors
  - Async error wrapper (`asyncHandler`)

- **Database Query Logging**
  - Query execution tracking
  - Performance monitoring
  - Slow query detection (>1000ms warnings)
  - Parameter logging (truncated for security)
  - Error logging with stack traces

- **Frontend Error Logging**
  - Global error handlers (window error, unhandled rejections)
  - Context capture (URL, user agent, user ID)
  - Structured error logging
  - Optional backend error reporting
  - Error logger utility component

- **Enhanced Error Handling**
  - CustomError class with status codes and error codes
  - Enhanced error handler middleware
  - Error ID generation for production tracking
  - Development vs production error responses
  - Full request context in error logs

- **Documentation**
  - `LOGGING_SYSTEM.md` - Complete logging system guide
  - `LOGGING_IMPLEMENTATION.md` - Implementation summary
  - Usage examples and best practices

### Changed
- Replaced all `console.log/error/warn` with structured logging
- Enhanced error handling in all controllers
- Improved error messages with context
- Updated error responses with error IDs (production)
- Database connection logging improved

### Security
- Sensitive data redaction in logs (passwords, tokens)
- Authentication error tracking
- Request logging with user context
- Audit trail for security events

### Performance
- Log file rotation prevents disk space issues
- Automatic compression reduces storage
- Configurable retention periods
- Efficient query logging

---

## [0.5.0] - 2024-12-29

### Added
- **File Upload System**
  - Complete file upload API with multer
  - Local file storage with organized directory structure
  - File validation (type, size limits - 10MB max)
  - Avatar upload functionality
  - File serving endpoint
  - FileUpload UI component (icon & button variants)
  - Chat file attachments
  - Profile avatar upload integration

- **Notifications System**
  - Notifications database table
  - Notification API endpoints (CRUD operations)
  - Unread count tracking
  - Mark as read functionality
  - NotificationCenter component (backend integrated)
  - Auto-refresh every 30 seconds
  - Notification deletion

- **Enhanced Message Features**
  - Message editing with `edited_at` timestamp
  - Message deletion with permission checks
  - Message reactions (emoji) with toggle functionality
  - Reaction counts display
  - Edited indicator in UI
  - Reaction picker interface
  - Message action buttons (edit, delete, react)

- **Profile Management Enhancements**
  - Real avatar upload (replaces URL-based)
  - Profile update API integration
  - Profile page with backend connection
  - Error handling and validation

- **Database Schema Updates**
  - Added `edited_at` column to `messages` table
  - Created `message_reactions` table
  - Created `file_attachments` table
  - Created `notifications` table
  - Created `user_sessions` table (for future presence tracking)
  - Added indexes for performance

- **Testing & Documentation**
  - Comprehensive end-to-end testing (14/14 tests passed - 100%)
  - Automated testing script (`test-script.sh`)
  - E2E testing report (`E2E_TEST_REPORT.md`)
  - Testing guide for v0.5 (`TESTING_v0.5.md`)
  - Updated roadmap (`NEXT_STEPS.md`)

### Changed
- Updated ChatInterface component with file upload, reactions, editing, deletion
- Updated NotificationCenter to connect to backend API
- Updated Profile page to use real avatar upload
- Updated Button component with outline variant
- Enhanced API client with file and notification endpoints
- Improved message display with edited indicators and reactions

### Security
- File type validation (images, PDFs, documents only)
- File size limits enforced (10MB max)
- Permission checks for message editing/deletion
- Authorization verified for all new endpoints
- Input sanitization for file uploads

### Performance
- Database indexes added for new tables
- Efficient file serving with static middleware
- Optimized notification queries
- Response times < 100ms average

### Testing
- 100% test success rate (14/14 tests passed)
- All API endpoints verified
- Frontend components tested
- Security measures validated
- Performance benchmarks met

---

## [0.4.0] - 2024-12-21

### Added
- **Complete Database Integration**
  - PostgreSQL database with full schema
  - Database migrations system (`npm run migrate`)
  - Connection pooling and error handling
  - All data persisted to database

- **Real Authentication System**
  - JWT token generation and verification
  - Password hashing with bcrypt (12 salt rounds)
  - User registration with validation
  - Login with credential verification
  - Token refresh mechanism (15min access, 7day refresh)
  - Authentication middleware for protected routes

- **WebSocket Message Persistence**
  - Messages saved to database
  - Message history loading on room join
  - User membership verification
  - Real-time message synchronization

- **Frontend-Backend Integration**
  - API client utility (`src/lib/api.ts`)
  - AuthContext with real API integration
  - Auto token refresh (every 14 minutes)
  - All pages integrated with backend
  - Real-time messaging with persistence

- **Demo Mode**
  - Enhanced seed script (`services/api/src/db/seed.ts`) - **Preserved**
  - Auto-seeding on startup (DEMO_MODE=true)
  - Reset script (`services/api/src/db/reset-demo.ts`) - **Preserved**
  - Demo startup script (`scripts/start-demo.sh`) - **Preserved**
  - 5 test users, 6 demo topics, sample messages
  - Comprehensive demo data

- **Database Models**
  - User model with CRUD operations
  - Topic model with filtering
  - Message model with history
  - TopicMember model for membership

- **API Endpoints**
  - `/api/auth/register` - User registration
  - `/api/auth/login` - User login
  - `/api/auth/refresh` - Token refresh
  - `/api/auth/logout` - User logout
  - `/api/users/profile` - Get/update profile
  - `/api/topics` - List/create topics
  - `/api/topics/:id` - Topic operations
  - `/api/messages` - Message operations

- **Comprehensive Documentation**
  - `PHASE_3_JOURNAL.md` - Complete Phase 3 documentation
  - `END_TO_END_TEST.md` - Comprehensive testing guide
  - `TESTING_WALKTHROUGH.md` - Quick testing reference
  - `QUICK_TEST_GUIDE.md` - Step-by-step guide
  - `TEST_NOW.md` - Immediate testing steps
  - `DEMO_MODE.md` - Demo mode guide
  - `VERSION_v0.4.md` - Release notes

### Changed
- Replaced test authentication with real JWT authentication
- All mock data replaced with database queries
- Frontend now uses real API endpoints
- WebSocket connections require JWT authentication
- Provider order fixed (ToastProvider wraps AuthProvider)

### Security
- Password strength validation (8+ chars, uppercase, lowercase, number)
- SQL injection prevention (parameterized queries)
- JWT token expiration and refresh
- Protected routes with authentication middleware
- Membership verification for messaging
- Creator-only topic updates/deletes

### Seed Scripts (Preserved for Future Use)
- `services/api/src/db/seed.ts` - Comprehensive seeding script
- `services/api/src/db/reset-demo.ts` - Demo data reset script
- `scripts/start-demo.sh` - Demo mode startup script
- All scripts documented in `DEMO_MODE.md`

---

## [0.2.0] - 2024-12-21

### Added
- **Service Management System**
  - Automated startup script (`scripts/start-services.sh`) with dependency management
  - Graceful shutdown script (`scripts/stop-services.sh`)
  - Service status checker (`scripts/status.sh`)
  - Process tracking and logging system
  - Health check verification for all services

- **Test Authentication System**
  - AuthContext for user session management
  - Test credentials: test@studycollab.com / test123
  - Admin credentials: admin@studycollab.com / admin123
  - Student credentials: student@studycollab.com / student123
  - Universal demo login (any email with password: demo123)
  - Login/logout functionality
  - Protected routes support
  - localStorage persistence

- **Comprehensive Documentation**
  - `SERVICE_MANAGEMENT.md` - Complete service management guide
  - `STARTUP_SEQUENCE.md` - Detailed startup sequence documentation
  - `ERROR_CODES.md` - Error codes and troubleshooting guide
  - `TEST_CREDENTIALS.md` - Test login credentials reference
  - `LOCAL_TESTING_GUIDE.md` - Step-by-step testing guide
  - `TESTING_CHECKLIST.md` - Comprehensive test checklist
  - `SETUP_COMPLETE.md` - Setup summary
  - `README_SERVICES.md` - Quick reference guide

- **Backend Service Structures**
  - API service (Express.js) with TypeScript
  - WebSocket service (Socket.IO) with TypeScript
  - Docker configurations for all services
  - Environment variable templates
  - Route controllers and middleware

- **UI Enhancements**
  - Updated Navbar with authentication state
  - Login page with test credentials display
  - Toast notification integration
  - User profile access for authenticated users
  - Logout functionality

### Changed
- Updated login page to show test credentials
- Enhanced Navbar to display user information when authenticated
- Improved error handling in authentication flow

### Technical Details
- Error codes: 0 (Success), 1 (Port in use), 2 (Dependency missing), 3 (Database error), 4 (Service failed)
- Log files stored in `/tmp/studycollab/`
- Process IDs tracked in `pids.txt`
- Service status tracked in `status.txt`

---

## [0.1.0] - 2024-12-21

### Added
- Initial UI/UX redesign
- Component library (Button, Input, PasswordInput, Toast)
- Enhanced Home page with features showcase
- Improved authentication pages with validation
- Topics page with search and filtering
- Topic Room with chat and problem board
- User Profile page
- Notification Center component
- Admin Dashboard
- WebSocket client integration
- Real-time chat interface
- Typing indicators
- Responsive design
- Glassmorphism design system
- Animations and transitions

### Changed
- Complete CSS redesign with CSS variables
- Form validation throughout
- Better error handling
- Improved accessibility

---

## [0.0.0] - Initial

- Basic Next.js setup
- Simple pages
- Minimal styling
- No backend services

