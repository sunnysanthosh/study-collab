import { query } from '../db/connection';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface ContentReport {
  id: string;
  reporter_id: string | null;
  target_type: string;
  target_id: string;
  reason: string | null;
  status: ReportStatus;
  resolved_by: string | null;
  resolved_at: Date | null;
  created_at: Date;
}

export interface ContentReportWithDetails extends ContentReport {
  reporter_name?: string | null;
  target_content?: string | null;
  topic_id?: string | null;
  topic_title?: string | null;
  author_name?: string | null;
}

export interface CreateReportParams {
  reporterId: string;
  targetType: 'message';
  targetId: string;
  reason?: string;
}

export async function createReport(params: CreateReportParams): Promise<ContentReport> {
  const result = await query(
    `INSERT INTO content_reports (reporter_id, target_type, target_id, reason, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [params.reporterId, params.targetType, params.targetId, params.reason || null]
  );
  return result.rows[0] as ContentReport;
}

export async function getReportById(id: string): Promise<ContentReport | null> {
  const result = await query('SELECT * FROM content_reports WHERE id = $1', [id]);
  return (result.rows[0] as ContentReport) || null;
}

export async function getReportsByTarget(
  targetType: string,
  targetId: string
): Promise<ContentReport[]> {
  const result = await query(
    `SELECT * FROM content_reports
     WHERE target_type = $1 AND target_id = $2
     ORDER BY created_at DESC`,
    [targetType, targetId]
  );
  return result.rows as ContentReport[];
}

export async function getAdminReportList(
  limit: number = 50,
  offset: number = 0,
  status?: ReportStatus
): Promise<ContentReportWithDetails[]> {
  const statusFilter = status ? 'AND cr.status = $3' : '';
  const params: (number | string)[] = status ? [limit, offset, status] : [limit, offset];
  const result = await query(
    `SELECT cr.id, cr.reporter_id, cr.target_type, cr.target_id, cr.reason, cr.status,
            cr.resolved_by, cr.resolved_at, cr.created_at,
            u.name AS reporter_name,
            m.content AS target_content,
            m.topic_id,
            t.title AS topic_title,
            au.name AS author_name
     FROM content_reports cr
     LEFT JOIN users u ON cr.reporter_id = u.id
     LEFT JOIN messages m ON cr.target_type = 'message' AND cr.target_id = m.id
     LEFT JOIN topics t ON m.topic_id = t.id
     LEFT JOIN users au ON m.user_id = au.id
     WHERE 1=1 ${statusFilter}
     ORDER BY cr.created_at DESC
     LIMIT $1 OFFSET $2`,
    params
  );
  return result.rows as ContentReportWithDetails[];
}

export async function resolveReport(
  id: string,
  resolvedBy: string,
  action: 'resolved' | 'dismissed'
): Promise<ContentReport | null> {
  const result = await query(
    `UPDATE content_reports
     SET status = $1, resolved_by = $2, resolved_at = NOW()
     WHERE id = $3 AND status = 'pending'
     RETURNING *`,
    [action, resolvedBy, id]
  );
  return (result.rows[0] as ContentReport) || null;
}
