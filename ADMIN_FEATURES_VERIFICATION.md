# Admin Features Verification & Implementation Plan

**Date:** January 2026  
**Version:** v0.6  
**Status:** Verification complete; gaps identified

---

## Feature Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Connect admin dashboard to real data | ✅ **Done** | Stats, users, topics, health, logs from API/DB |
| Add user management (CRUD operations) | ✅ **Done** | Read, Update, Delete, **Create** ✓ |
| Add topic moderation tools | ✅ **Done** | List with metadata; delete any topic |
| Implement content moderation | ✅ **Done** | Report, Hide, Delete; Content reports tab |
| Add analytics and statistics | ✅ **Done** | Basic stats ✓; Recharts bar chart ✓ |
| Create admin activity logs | ✅ **Done** | `admin_activity_logs` table; UI section |
| Add system health monitoring | ✅ **Done** | GET `/health`; System Health card |

---

## Detailed Verification

### 1. Connect admin dashboard to real data — ✅ Done

- **Stats:** `getAdminStats` queries DB for `users`, `topics`, `user_sessions`, `messages` counts
- **Users:** `getAdminUsers` fetches users from DB with pagination
- **Topics:** `getAdminTopics` → `TopicModel.getAdminTopicList` (creator, member_count, message_count)
- **Health:** `adminApi.getHealth()` → GET `/health`
- **Activity logs:** `adminApi.getActivityLogs()` → `getAdminActivityLogs`
- **UI:** Admin page loads all data via `Promise.all` on mount and after mutations

### 2. User management (CRUD) — ✅ Done

- **Read:** ✓ `GET /api/admin/users` — list users with limit/offset
- **Update:** ✓ `PATCH /api/admin/users/:id` — name, email, role (modal in UI)
- **Delete:** ✓ `DELETE /api/admin/users/:id` — with self-delete and last-admin safeguards
- **Create:** ✓ `POST /api/admin/users` — name, email, password, role (Add User modal in UI)

### 3. Topic moderation tools — ✅ Done

- **List:** ✓ `GET /api/admin/topics` — title, creator, member_count, message_count
- **Delete:** ✓ `DELETE /api/admin/topics/:id` — admin override
- **UI:** Topics table with Edit link, Delete button; confirmation dialogs

### 4. Content moderation — ✅ Done

- `content_reports` table; `messages.hidden_at` for soft hide
- `POST /api/messages/:id/report` — users report messages
- `GET /api/admin/reports`, `PATCH /api/admin/reports/:id` — list/resolve reports
- `DELETE /api/admin/messages/:id`, `PATCH /api/admin/messages/:id/hide` — admin delete/hide message
- Report button on non-own messages; Content reports tab on Admin Dashboard

### 5. Analytics and statistics — ✅ Done

- **Basic stats:** ✓ totalUsers, activeTopics, totalMessages, onlineNow
- **Analytics:** ✓ `GET /api/admin/analytics?days=7|14|30` — usersByDay, topicsByDay, messagesByDay
- **Charts:** ✓ Recharts bar chart on Admin Dashboard

### 6. Admin activity logs — ✅ Done

- **Table:** `admin_activity_logs` (admin_user_id, action, target_type, target_id, metadata, created_at)
- **Actions logged:** `user_updated`, `user_deleted`, `topic_deleted`
- **API:** `GET /api/admin/activity-logs` with pagination
- **UI:** Activity logs section with Time, Admin, Action, Target, Details

### 7. System health monitoring — ✅ Done

- **Endpoint:** GET `/health` → `{ status, timestamp }`
- **UI:** System Health card on admin dashboard
- **Scripts:** `start-services.sh`, `run-e2e.sh`, `status.sh` use `/health` for readiness checks

---

## Implementation Plan for Gaps

### Phase 1 — Admin Create User (optional)

**Scope:** Allow admins to create users (invite/add).

| Task | Details |
|------|---------|
| API | `POST /api/admin/users` — body: `{ name, email, role }`; generate temp password or send invite |
| Model | Reuse `createUser` from User model; admin bypasses normal registration |
| UI | "Add User" button + modal (name, email, role, optional temp password) |
| Activity log | Log `user_created` |
| Tests | API integration, frontend unit |

**Effort:** ~1–2 days

---

### Phase 2 — Content Moderation

**Scope:** Flag/report messages; admin review and delete/hide.

| Task | Details |
|------|---------|
| Schema | `content_reports` (id, reporter_id, target_type, target_id, reason, status, created_at) |
| Schema | Optional: `messages.hidden_at` or `messages.is_hidden` for soft delete |
| API | `POST /api/messages/:id/report` — users flag message |
| API | `GET /api/admin/reports` — list reports (paginated, filter by status) |
| API | `PATCH /api/admin/reports/:id` — resolve (dismiss / take action) |
| API | `DELETE /api/admin/messages/:id` — admin delete message (hard or soft) |
| UI | "Report" on each message; Admin "Reports" tab; Admin "Delete message" action |
| Activity log | Log `message_reported`, `message_deleted_by_admin`, `report_resolved` |
| Tests | API, E2E for report flow |

**Effort:** ~3–5 days

---

### Phase 3 — Extended Analytics (optional)

**Scope:** Charts and trends.

| Task | Details |
|------|---------|
| API | `GET /api/admin/analytics` — query params: `from`, `to`, `granularity` (day/week) |
| Response | e.g. `{ usersByDay, topicsByDay, messagesByDay }` or similar |
| UI | Charts (e.g. Recharts) — line/bar for users, topics, messages over time |
| pendingRequests | Implement join-request flow if desired, or remove from stats |
| Tests | API unit tests |

**Effort:** ~2–4 days

---

## Recommended Order

1. **Content moderation** (Phase 2) — Highest impact for safety and policy.
2. **Admin create user** (Phase 1) — If admins need to onboard users directly.
3. **Extended analytics** (Phase 3) — Nice-to-have for insights.

---

## Files to Touch (Summary)

### Phase 1 — Admin Create User

- `services/api/src/routes/admin.ts` — add POST `/users`
- `services/api/src/controllers/adminController.ts` — `createAdminUser`
- `services/api/src/models/User.ts` — reuse or extend `createUser`
- `apps/web/src/lib/api.ts` — `adminApi.createUser`
- `apps/web/src/app/admin/page.tsx` — Add User modal + button
- `services/api/src/models/AdminActivityLog.ts` — add `user_created`
- `services/api/tests/adminController.test.ts`

### Phase 2 — Content Moderation

- `services/api/src/db/schema.sql` — `content_reports`, optional `messages.hidden_at`
- `services/api/src/models/ContentReport.ts` — create, list, update
- `services/api/src/routes/messages.ts` — POST report
- `services/api/src/routes/admin.ts` — reports + delete message
- `services/api/src/controllers/adminController.ts` — report + message handlers
- `apps/web/src/app/admin/page.tsx` — Reports tab
- `apps/web/src/components/collab/ChatInterface.tsx` — Report button per message
- `services/api/src/models/AdminActivityLog.ts` — new actions

### Phase 3 — Extended Analytics

- `services/api/src/controllers/adminController.ts` — `getAdminAnalytics`
- `services/api/src/routes/admin.ts` — GET `/analytics`
- `apps/web/package.json` — add Recharts (or similar)
- `apps/web/src/app/admin/page.tsx` — Analytics section with charts

---

*Generated from codebase verification. Update this document as features are implemented.*
