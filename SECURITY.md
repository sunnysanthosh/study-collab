# Security – StudyCollab

This document summarizes security measures implemented in StudyCollab.

---

## CSRF Protection

- **Token-based**: `GET /api/csrf/token` returns a CSRF token (stored in Redis when `REDIS_URL` is set).
- **Validation**: All state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) require `X-CSRF-Token` header. The token is validated against Redis.
- **Frontend**: The API client fetches a token before the first mutating request and sends it with all non-GET requests.
- **Disable**: Set `DISABLE_CSRF=true` (e.g. for local dev without Redis or test runs). When disabled, the token endpoint still returns a token; validation is skipped.

---

## Input Sanitization

- **Middleware**: `sanitizeBody` runs on `req.body` and `req.query`. String values are trimmed, HTML-escaped, and length-limited. Keys such as `password`, `email`, `token` are skipped.
- **Utilities**: `sanitizeString`, `sanitizeEmail`, `sanitizeObject` in `services/api/src/utils/sanitize.ts`.
- **Disable**: Set `DISABLE_INPUT_SANITIZATION=true` (e.g. for tests).

---

## XSS Protection

- **Headers**: Helmet with `xssFilter: true`. HSTS enabled in production only.
- **Output**: User-supplied data is sanitized before storage. React escapes by default when rendering.
- **Content**: Avoid `dangerouslySetInnerHTML` with unsanitized user content.

---

## Secrets Management

- **Validation**: `services/api` uses `envalid` to validate env at startup. See `src/env.ts`.
- **Production**: `JWT_SECRET` and `JWT_REFRESH_SECRET` must be set to non-default values in production; the server will refuse to start otherwise.
- **Template**: Copy `services/api/.env.example` to `.env` and set values. Never commit `.env`.
- **Documentation**: `LOCAL_TESTING_GUIDE.md`, `ERROR_CODES.md`, and `SERVICE_MANAGEMENT.md` describe required env vars.

---

## Audit Logging

- **Table**: `audit_logs` stores auth-related events (`auth_login_success`, `auth_login_failure`, `auth_logout`, `auth_refresh`, `auth_register_success`).
- **Fields**: `event_type`, `user_id`, `ip`, `user_agent`, `metadata`, `created_at`.
- **Usage**: Auth controller logs login success/failure, logout, refresh, and registration. Logging is best-effort; request handling is not failed if logging errors.

---

## Other Safeguards

- **Rate limiting**: General and auth-specific limiters (can be disabled with `DISABLE_RATE_LIMIT` for tests).
- **CORS**: Restricted to `FRONTEND_URL`.
- **JWT**: Access and refresh tokens; blacklisting on logout.
- **Admin**: Admin-only routes and activity logs for user/topic mutations.

---

## Reporting Issues

If you discover a security vulnerability, please report it responsibly (e.g. via a private channel or security contact) rather than opening a public issue.
