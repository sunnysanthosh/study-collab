import { query } from '../db/connection';

export type AdminLogAction =
  | 'user_updated'
  | 'user_deleted'
  | 'topic_deleted';

export interface AdminActivityLogRow {
  id: string;
  admin_user_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  admin_name?: string | null;
}

export async function createAdminLog(params: {
  adminUserId: string;
  action: AdminLogAction;
  targetType: 'user' | 'topic';
  targetId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await query(
    `INSERT INTO admin_activity_logs (admin_user_id, action, target_type, target_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      params.adminUserId,
      params.action,
      params.targetType,
      params.targetId,
      params.metadata ? JSON.stringify(params.metadata) : null,
    ]
  );
}

export async function getAdminActivityLogs(
  limit: number = 50,
  offset: number = 0
): Promise<AdminActivityLogRow[]> {
  const result = await query(
    `SELECT l.id, l.admin_user_id, l.action, l.target_type, l.target_id, l.metadata, l.created_at,
            u.name AS admin_name
     FROM admin_activity_logs l
     LEFT JOIN users u ON l.admin_user_id = u.id
     ORDER BY l.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows as AdminActivityLogRow[];
}
