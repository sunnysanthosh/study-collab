# Version 0.6 Release Notes

**Release Date:** 2026-01-25  
**Tag:** v0.6  
**Status:** Released & Tested

---

## What's New in v0.6

### Major Features

#### 1. Advanced Search & Filtering
- Topic full-text search (PostgreSQL `to_tsvector` / `plainto_tsquery`)
- Filters: subject, difficulty, category, tags
- Date range: `created_from`, `created_to`
- Sort: `created_at`, `title`, `popularity` (favorite count)
- Topics page: search bar, filter controls, sort dropdown, date inputs
- Debounced search with API query serialization

#### 2. Admin Dashboard Enhancements
- **User management (CRUD)**
  - Edit user: name, email, role (modal)
  - Delete user (with confirm); block self-delete and deleting last admin
  - PATCH `/api/admin/users/:id`, DELETE `/api/admin/users/:id`
- **Topic moderation**
  - List topics with creator, member count, message count
  - Delete any topic (admin override)
  - GET `/api/admin/topics`, DELETE `/api/admin/topics/:id`
- **Analytics & system health**
  - Stats: Total Users, Active Topics, Total Messages, Pending Requests, Online Now
  - System Health card: API status + timestamp (GET `/health`)
  - Dashboard loads stats, users, topics, health in parallel

#### 3. Admin Activity Logs
- `admin_activity_logs` table: `admin_user_id`, `action`, `target_type`, `target_id`, `metadata`, `created_at`
- Logged actions: `user_updated`, `user_deleted`, `topic_deleted` (best-effort; request not failed on log error)
- GET `/api/admin/activity-logs` with pagination
- Activity logs section on Admin Dashboard: Time, Admin, Action, Target, Details

---

## New Files & Modules

### Backend API
- `services/api/src/models/AdminActivityLog.ts` – create log, get paginated logs
- `services/api/tests/topicModel.test.ts` – topic search/filter model tests
- Schema: `admin_activity_logs` table + indexes (`idx_admin_activity_logs_admin_user_id`, `idx_admin_activity_logs_created_at`)

### Frontend
- `apps/web/src/app/topics/TopicsPage.test.tsx` – filter UI and query serialization tests
- Updated `apps/web/src/app/admin/page.tsx` – user CRUD, topic moderation, activity logs, health card
- Updated `apps/web/src/app/topics/page.tsx` – search, filters, sort, date range, difficulty
- Updated `apps/web/src/lib/api.ts` – `api.patch`, `adminApi` (updateUser, deleteUser, getTopics, deleteTopic, getHealth, getActivityLogs), `AdminUser`, `AdminTopic`, `AdminActivityLog` types

### Database Schema Updates
- `admin_activity_logs` table (schema.sql)
- Topic model: `getAdminTopicList`, `AdminTopicRow`; filters `createdFrom`/`createdTo`, `sort: 'popularity'`
- User model: `adminUpdateUser`, `deleteUser`, `countUsersByRole`, `AdminUserUpdate`

### Documentation
- `VERSION_v0.6.md` – this file
- `CHANGELOG.md` – [0.6.0] entry
- `NEXT_STEPS.md` – v0.6.0 status, short-term items marked done

---

## Testing Results

### Unit & Integration Tests
| Suite        | Test Files | Tests | Status |
|-------------|------------|-------|--------|
| Frontend    | 5          | 7     | Pass   |
| API         | 15         | 47    | Pass   |
| WebSocket   | 1          | 2     | Pass   |
| **Total**   | **21**     | **56**| **Pass** |

### End-to-End (Playwright)
- **Total:** 7
- **Passed:** 7
- **Failed:** 0
- **Success rate:** 100%

### Coverage
- API: topic search/filter, admin CRUD, activity logs, contract & integration
- Frontend: AdminDashboard (stats, users, topics, health, activity logs), TopicsPage filters
- E2E: auth smoke, admin dashboard, chat (persist, presence/notification), topics

### Security
- JWT authentication verified
- Admin-only routes (`requireAdmin`)
- Self-delete and last-admin delete blocked
- Email uniqueness enforced on user update

---

## Technical Details

### API Endpoints Added / Changed

**Topics (existing; extended):**
- GET `/api/topics` – query params: `search`, `subject`, `difficulty`, `category`, `tags`, `limit`, `offset`, `sort` (`created_at` | `title` | `popularity`), `order`, `created_from`, `created_to`

**Admin:**
- PATCH `/api/admin/users/:id` – update user (name, email, role)
- DELETE `/api/admin/users/:id` – delete user
- GET `/api/admin/topics` – list topics with creator, member_count, message_count
- DELETE `/api/admin/topics/:id` – delete any topic
- GET `/api/admin/activity-logs` – paginated activity logs

**Health (existing):**
- GET `/health` – `{ status, timestamp }` (used by dashboard System Health card)

### Dependencies
- No new runtime dependencies. Existing stack: Next.js, Express, Socket.IO, PostgreSQL, Redis, Vitest, Playwright.

### Migration
- Default migration (`npm run migrate` in `services/api`) applies `schema.sql`, which includes `admin_activity_logs`. No separate v0.6 migration script.

---

## Migration from v0.5.x

### Breaking Changes
- None. All changes are additive.

### Steps
1. Pull latest and run `npm run migrate` in `services/api` (if not already applied).
2. Restart services: `./scripts/start-services.sh` or `./scripts/run-e2e.sh` for E2E.

### Environment
- No new required env vars. Optional: `REDIS_URL` for broker (already used in v0.5.x).

---

## Statistics

- **Total test files:** 21 (unit/integration) + 1 E2E suite
- **Total tests:** 56 (unit/integration) + 7 (E2E)
- **New backend modules:** 1 (`AdminActivityLog`)
- **New frontend test files:** 1 (`TopicsPage.test`)
- **Database tables added:** 1 (`admin_activity_logs`)
- **Admin API endpoints added:** 5 (PATCH/DELETE users, GET/DELETE topics, GET activity-logs)

---

## Implementation Activities (Summary)

1. **Advanced search & filtering** – Topic model + controller query params; Topic API + frontend filters; topic model and TopicsPage tests.
2. **Admin user CRUD** – User model helpers (`adminUpdateUser`, `deleteUser`, `countUsersByRole`); admin controller + routes; dashboard Edit/Delete modals and actions.
3. **Admin topic moderation** – `getAdminTopicList`, `deleteAdminTopic`; admin routes; dashboard Topics table with Delete.
4. **Stats & system health** – `totalMessages` in admin stats; `adminApi.getHealth`; System Health card on dashboard.
5. **Admin activity logs** – `admin_activity_logs` table; `AdminActivityLog` model; logging in `updateAdminUser`, `deleteAdminUser`, `deleteAdminTopic`; GET `/api/admin/activity-logs`; Activity logs UI on dashboard.
6. **Tests** – Admin controller tests (including `getAdminActivityLogs`); topic model tests; TopicsPage and AdminDashboard frontend tests; E2E smoke for admin and search flows.
7. **Docs** – `CHANGELOG` [0.6.0], `NEXT_STEPS` v0.6.0 status, `VERSION_v0.6.md`, `E2E_TEST_REPORT` and `PROJECT_STATUS` updated for v0.6.

---

## What's Next

- **Short term:** Performance + indexing (DB indexes, latency checks).
- **Medium term (v0.6–v0.7):** Security (CSRF, sanitization, XSS), OpenAPI docs, search expansion, Redis caching.
- **Long term (v0.8+):** Audio/video, whiteboard, mobile app, production infra.

---

## Quality Assurance

- All unit/integration tests passing (56)
- All E2E tests passing (7)
- Migration runs successfully
- Admin dashboard: users, topics, activity logs, health load correctly
- Topic search and filters work with API
- No known blocking issues

---

## Repository & Artifacts

- **Repository:** https://github.com/sunnysanthosh/study-collab  
- **Tag:** v0.6  
- **Test report:** `E2E_TEST_REPORT.md` (updated for v0.6)  
- **Related:** `CHANGELOG.md`, `NEXT_STEPS.md`, `PROJECT_STATUS.md`, `LOCAL_TESTING_GUIDE.md`

---

**Version v0.6 is complete, tested, and released.**
