## Change Summary (v0.5.2)

**Date:** 2026-01-24  
**Scope:** Security hardening, realtime notifications, presence, pagination, upload UX, migrations, testing

### What changed
- Added token blacklist with logout revocation (access + refresh) and enforcement in API + WebSocket auth.
- Implemented global and auth-specific rate limiting and tightened security headers.
- Enabled realtime notifications via Postgres LISTEN/NOTIFY and WebSocket delivery.
- Added user presence tracking with room online count.
- Added message pagination (API + UI) and file upload progress indicators.
- Made schema migrations idempotent and re-runnable.
- Added topic categories and favorites/bookmarks.
- Added backend and frontend unit tests with CI workflow.
- Wired admin dashboard to live data and added topic creation API flow.
- Upgraded Next.js to address critical security advisory.

### Key files updated
- `backend/api/src/db/schema.sql`
- `backend/api/src/db/migrate-v0.5.ts`
- `backend/api/src/server.ts`
- `backend/api/src/controllers/authController.ts`
- `backend/api/src/controllers/messageController.ts`
- `backend/api/src/models/TokenBlacklist.ts`
- `backend/api/src/models/Notification.ts`
- `backend/api/src/middleware/auth.ts`
- `backend/api/src/middleware/requireAdmin.ts`
- `backend/websocket/src/server.ts`
- `backend/websocket/src/models/Message.ts`
- `src/components/layout/NotificationCenter.tsx`
- `src/components/collab/ChatInterface.tsx`
- `src/hooks/useSocket.ts`
- `src/lib/api.ts`
- `backend/api/src/controllers/adminController.ts`
- `backend/api/src/routes/admin.ts`
- `backend/api/src/models/TopicFavorite.ts`
- `backend/api/tests/*`
- `backend/api/vitest.config.ts`
- `src/components/collab/TopicCard.test.tsx`
- `src/app/admin/AdminDashboard.test.tsx`
- `.github/workflows/ci.yml`
- `vitest.config.ts`

### Database changes
- **New table:** `token_blacklist`
- **Indexes:** `idx_token_blacklist_expires_at`, `idx_user_sessions_user_id_unique`
- **Triggers:** `update_users_updated_at`, `update_topics_updated_at` made idempotent
- **New table:** `topic_favorites`
- **New column:** `topics.category`

### Security changes
- Token revocation enforced on logout and checked on every API/WebSocket auth.
- Rate limiting added (global + auth endpoints).
- Helmet configured for cross-origin resource policy.

### Realtime changes
- Notification creation emits `NOTIFY notification_created`.
- WebSocket listens and pushes `notification` events to user rooms.
- Presence tracked in `user_sessions` and broadcast as `presence-update`.
- Room online count displayed in chat UI.

### UX changes
- Message pagination with “Load earlier messages”.
- File upload progress shown during uploads.

### Tests and verification
- `npm run migrate` (API): ✅ success (idempotent)
- `./test-script.sh`: ✅ 14/14 passed
- `npm audit fix` (API): ✅ 0 vulnerabilities
- `npm audit` (Frontend): ✅ 0 vulnerabilities after Next.js upgrade
- `npm test` (Frontend): Ready
- `npm test` (API): Ready

### Remaining follow-ups
- Advanced search and filtering enhancements
- Admin dashboard enhancements (moderation workflows)
- Automated testing expansion (integration/E2E)
