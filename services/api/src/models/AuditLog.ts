import { query } from '../db/connection';

export type AuditEventType =
  | 'auth_login_success'
  | 'auth_login_failure'
  | 'auth_logout'
  | 'auth_refresh'
  | 'auth_register_success';

export interface CreateAuditLogParams {
  eventType: AuditEventType;
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (event_type, user_id, ip, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        params.eventType,
        params.userId ?? null,
        params.ip ?? null,
        params.userAgent ?? null,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]
    );
  } catch (e) {
    console.error('Audit log insert failed:', e);
    // Best-effort; do not throw
  }
}
