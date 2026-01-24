## Change Summary (v0.5.2)

**Date:** 2026-01-24  
**Scope:** Security hardening, realtime notifications, presence, pagination, upload UX, migrations

### What changed
- Added token blacklist with logout revocation (access + refresh) and enforcement in API + WebSocket auth.
- Implemented global and auth-specific rate limiting and tightened security headers.
- Enabled realtime notifications via Postgres LISTEN/NOTIFY and WebSocket delivery.
- Added user presence tracking with room online count.
- Added message pagination (API + UI) and file upload progress indicators.
- Made schema migrations idempotent and re-runnable.

### Key files updated
- `backend/api/src/db/schema.sql`
- `backend/api/src/db/migrate-v0.5.ts`
- `backend/api/src/server.ts`
- `backend/api/src/controllers/authController.ts`
- `backend/api/src/controllers/messageController.ts`
- `backend/api/src/models/TokenBlacklist.ts`
- `backend/api/src/models/Notification.ts`
- `backend/api/src/middleware/auth.ts`
- `backend/websocket/src/server.ts`
- `backend/websocket/src/models/Message.ts`
- `src/components/layout/NotificationCenter.tsx`
- `src/components/collab/ChatInterface.tsx`
- `src/hooks/useSocket.ts`
- `src/lib/api.ts`

### Database changes
- **New table:** `token_blacklist`
- **Indexes:** `idx_token_blacklist_expires_at`, `idx_user_sessions_user_id_unique`
- **Triggers:** `update_users_updated_at`, `update_topics_updated_at` made idempotent

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

### Remaining follow-ups
- Advanced search and filtering
- Topic categories and organization
- Admin dashboard enhancements
- Automated testing infrastructure (unit/integration/E2E)
