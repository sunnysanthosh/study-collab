# Performance Optimization Plan — v0.8.0

**Target Version:** v0.8.0  
**Created:** 2026-02-01  
**Status:** Implemented (2026-02-01)

This document outlines the implementation plan for performance optimization across the StudyCollab stack: database, API, WebSocket, Redis, and frontend.

---

## Overview

| # | Task | Priority | Effort | Dependencies |
|---|------|----------|--------|--------------|
| 1 | Database indexing | High | Low | None |
| 2 | Redis caching | High | Medium | Redis (existing) |
| 3 | Query optimization | High | Medium | 1 |
| 4 | Message batching | Medium | Medium | None |
| 5 | WebSocket compression | Low | Low | None |
| 6 | Frontend bundle size | High | Medium | None |
| 7 | Image optimization | Medium | Low | None |
| 8 | Lazy loading | Medium | Low | None |

**Recommended implementation order:** 1 → 2 → 3 → 6 → 7 → 8 → 4 → 5

---

## 1. Database Indexing

### Current State
- Indexes exist for: `messages` (topic_id, user_id, created_at), `topics` (created_by, category, search GIN), `topic_members`, `topic_favorites`, `notifications`, `content_reports`, etc.

### Gaps to Address
- **Composite indexes** for common query patterns:
  - `messages(topic_id, created_at)` — message history pagination (ORDER BY created_at)
  - `messages(topic_id, hidden_at)` — filtering visible messages
  - `notifications(user_id, read, created_at)` — unread notifications sorted by date
  - `admin_activity_logs(created_at DESC)` — activity log pagination
- **Partial index** for `messages` where `hidden_at IS NULL` (visible messages only).

### Implementation

**File:** `services/api/src/db/schema.sql`

```sql
-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_messages_topic_created ON messages(topic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_topic_visible ON messages(topic_id) WHERE hidden_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_desc ON admin_activity_logs(created_at DESC);
```

### Tests
- API integration tests: verify indexed queries complete within latency targets
- Run `EXPLAIN ANALYZE` on key queries before/after

---

## 2. Redis Caching

### Current State
- Redis used for: CSRF token storage, notification broker (pub/sub)
- No caching layer for read-heavy API responses

### Target Routes to Cache
| Route | TTL | Invalidation |
|-------|-----|--------------|
| `GET /api/topics` | 60s | On topic create/update/delete |
| `GET /api/topics/:id` | 30s | On topic update, message count change |
| `GET /api/users/profile` | 5min | On profile update |
| `GET /api/admin/stats` | 30s | On any admin mutation |
| `GET /api/admin/analytics?days=N` | 60s | On any admin mutation |

### Implementation
- Add `getCache(key)`, `setCache(key, value, ttlSeconds)` to `services/api/src/utils/redis.ts`
- Create `cacheMiddleware(ttl)` for GET routes
- Cache keys: `topics:list:${hash(filters)}`, `topic:${id}`, `user:profile:${id}`, `admin:stats`, `admin:analytics:${days}`
- Invalidate on mutations (controller layer or model hooks)

### Tests
- Unit tests: cache hit/miss behavior
- Integration: verify stale data is not served after invalidation

---

## 3. Query Optimization

### Areas
1. **N+1 elimination**
   - `getAllTopics` + member/message counts: use subqueries or batch counts
   - Admin reports list: join message content in single query
2. **Select only needed columns**
   - Avoid `SELECT *` where full row not needed
3. **Pagination**
   - Ensure `LIMIT/OFFSET` or keyset pagination with indexed ORDER BY
4. **Slow query logging**
   - Log queries > 500ms (already have slow query detection in v0.5.1)

### Implementation
- Audit `Topic.getAllTopics`, `ContentReport.getAdminReportList`, `Message.getMessagesByTopic`
- Add `EXPLAIN ANALYZE` to CI or manual perf checklist

---

## 4. Message Batching

### WebSocket
- **Rapid sends:** Debounce/throttle client-side; or server-side batch window (e.g., 50ms) before persisting + broadcasting
- **Notification creation:** Batch `createMessageNotifications` — insert multiple notifications in one `INSERT ... VALUES (...), (...), (...)` and single `pg_notify` for batch

### API
- `POST /api/messages` (if exists): same batching logic
- Notification creation in WebSocket: already loops; optimize to single multi-row INSERT

### Implementation
- WebSocket: optional `perMessageDeflate` already helps; batching optional for high-traffic
- Notification: refactor `createMessageNotifications` to use `INSERT INTO notifications (...) SELECT ... FROM unnest(...)` pattern

---

## 5. WebSocket Compression

### Current State
- Socket.IO default: no compression

### Implementation
- Enable `perMessageDeflate: true` in Socket.IO server options
- Reduces payload size for text messages (JSON)

**File:** `services/websocket/src/server.ts`

```ts
const io = new Server(httpServer, {
  cors: { ... },
  perMessageDeflate: true,
});
```

### Tests
- E2E: verify messages still deliver correctly

---

## 6. Frontend Bundle Size

### Current State
- Next.js 16, Recharts, Socket.IO client
- Admin dashboard imports Recharts; topics page imports topic API; all pages use Shell

### Targets
- Dynamic import admin page and Recharts (admin-only)
- Route-based code splitting (Next.js default)
- Tree-shake Recharts: import only `BarChart`, `Bar`, etc. (already done)
- Analyze bundle: `npm run build` + `@next/bundle-analyzer`

### Implementation
- Add `next/bundle-analyzer` (devDep)
- `dynamic(() => import('@/app/admin/page'), { ssr: false })` for admin route if acceptable
- Lazy load Recharts in admin: `const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })`
- Verify no duplicate React/react-dom

---

## 7. Image Optimization

### Current State
- Avatars: `avatar_url` from DB, rendered as `<img src={...}>`
- File uploads: served via API; no Next.js Image

### Implementation
- Use `next/image` for avatars with `unoptimized` if external URLs, or proxy through API with proper cache headers
- Add `images` config in `next.config.mjs` for remote domains if avatars are external
- For local uploads: serve via Next.js API route with `Cache-Control` and optional resizing

### Example
```tsx
<Image src={avatarUrl} alt={name} width={40} height={40} className="rounded-full" />
```

---

## 8. Lazy Loading

### Targets
- **Admin dashboard:** `React.lazy` + `Suspense` for heavy sections (Analytics chart, Content reports table)
- **ChatInterface:** Lazy load when topic room mounts
- **Recharts:** Dynamic import (see §6)
- **Lists:** Intersection Observer for topic cards / message list (virtualization if >100 items)

### Implementation
- `const AdminAnalytics = lazy(() => import('@/components/admin/AdminAnalytics'));`
- Wrap with `<Suspense fallback={<Spinner />}>`
- Consider `react-window` or `@tanstack/virtual` for long message lists (optional, if needed)

---

## Success Criteria

| Metric | Before | Target |
|--------|--------|--------|
| API p95 latency (topics list) | — | < 200ms |
| API p95 latency (messages) | — | < 100ms |
| WebSocket message latency | — | < 50ms |
| First Load JS (home) | — | < 150KB |
| Admin page JS | — | < 300KB (with Recharts) |

---

## Security & Test Objectives

- **Security:** Cache must not store sensitive data (e.g., tokens); cache keys must be opaque to prevent enumeration
- **Tests:** All existing tests must pass; add performance regression tests where feasible (e.g., bundle size budget in CI)

---

## Related Docs

- `ARCHITECTURE.md` — System architecture
- `NEXT_STEPS.md` — Roadmap
- `CHANGELOG.md` — Version history
