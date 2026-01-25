'use client';

import { Shell } from "@/components/layout/Shell";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEffect, useState, useCallback } from "react";
import { adminApi, type AdminUser, type AdminTopic, type AdminActivityLog } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

interface AdminStats {
  totalUsers: number;
  activeTopics: number;
  pendingRequests: number;
  onlineNow: number;
  totalMessages: number;
}

type HealthState = { status: string; timestamp: string } | null;

export default function AdminDashboard() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<HealthState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user' });
  const [saving, setSaving] = useState(false);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, topicsRes, healthRes, logsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(50, 0),
        adminApi.getTopics(50, 0),
        adminApi.getHealth(),
        adminApi.getActivityLogs(50, 0),
      ]);
      if (statsRes.error) showToast(statsRes.error, 'error');
      else if (statsRes.data?.stats) setStats(statsRes.data.stats);
      if (usersRes.error) showToast(usersRes.error, 'error');
      else if (usersRes.data?.users) setUsers(usersRes.data.users);
      if (topicsRes.error) showToast(topicsRes.error, 'error');
      else if (topicsRes.data?.topics) setTopics(topicsRes.data.topics);
      if (healthRes.error) setHealth({ status: 'error', timestamp: '' });
      else if (healthRes.data) setHealth(healthRes.data);
      if (logsRes.error) showToast(logsRes.error, 'error');
      else if (logsRes.data?.logs) setLogs(logsRes.data.logs);
    } catch (e) {
      console.error(e);
      showToast('Failed to load admin data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const closeEdit = () => {
    setEditingUser(null);
    setSaving(false);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await adminApi.updateUser(editingUser.id, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      });
      if (res.error) {
        showToast(res.error, 'error');
        return;
      }
      showToast('User updated', 'success');
      closeEdit();
      loadAdminData();
    } catch (e) {
      showToast('Failed to update user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (u: AdminUser) => {
    if (user?.id === u.id) {
      showToast('Cannot delete your own account', 'error');
      return;
    }
    if (!confirm(`Delete user "${u.name}" (${u.email})? This cannot be undone.`)) return;
    try {
      const res = await adminApi.deleteUser(u.id);
      if (res.error) {
        showToast(res.error, 'error');
        return;
      }
      showToast('User deleted', 'success');
      loadAdminData();
    } catch (e) {
      showToast('Failed to delete user', 'error');
    }
  };

  const handleDeleteTopic = async (t: AdminTopic) => {
    if (!confirm(`Delete topic "${t.title}"? All messages and members will be removed.`)) return;
    try {
      const res = await adminApi.deleteTopic(t.id);
      if (res.error) {
        showToast(res.error, 'error');
        return;
      }
      showToast('Topic deleted', 'success');
      loadAdminData();
    } catch (e) {
      showToast('Failed to delete topic', 'error');
    }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers.toString(), color: 'var(--primary)' },
    { label: 'Active Topics', value: stats.activeTopics.toString(), color: 'var(--success)' },
    { label: 'Total Messages', value: (stats.totalMessages ?? 0).toString(), color: 'var(--secondary)' },
    { label: 'Pending Requests', value: stats.pendingRequests.toString(), color: 'var(--warning)' },
    { label: 'Online Now', value: stats.onlineNow.toString(), color: 'var(--muted-foreground)' },
  ] : [];

  return (
    <Shell>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          Manage topics, users, and platform settings
        </p>
      </div>

      {/* Stats + Health */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
        {statCards.map((s) => (
          <div key={s.label} className="glass-panel" style={{ padding: '1.5rem', minWidth: '160px' }}>
            <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>{s.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: `hsl(${s.color})` }}>{s.value}</div>
          </div>
        ))}
        {health && (
          <div className="glass-panel" style={{ padding: '1.5rem', minWidth: '200px' }}>
            <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>System Health</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: health.status === 'ok' ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
              API: {health.status === 'ok' ? 'OK' : 'Error'}
            </div>
            {health.timestamp && (
              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
                {new Date(health.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Management */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Users</h2>
          <Link href="/admin/add-topic" style={{ textDecoration: 'none' }}>
            <Button>Add New Topic</Button>
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Name</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Email</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Role</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Joined</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                    <td style={{ padding: '1rem' }}>{u.name}</td>
                    <td style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: u.role === 'admin' ? 'hsl(var(--warning) / 0.2)' : 'hsl(var(--success) / 0.2)',
                        color: u.role === 'admin' ? 'hsl(var(--warning))' : 'hsl(var(--success))',
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Button variant="outline" style={{ marginRight: '0.5rem' }} onClick={() => openEdit(u)}>Edit</Button>
                      <Button variant="danger" disabled={user?.id === u.id} onClick={() => handleDeleteUser(u)}>Delete</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topic Moderation */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Topics</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Title</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Creator</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Members</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Messages</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Loading topics...</td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>No topics found.</td>
                </tr>
              ) : (
                topics.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                    <td style={{ padding: '1rem' }}>
                      <Link href={`/topics/${t.id}`} style={{ color: 'hsl(var(--primary))', textDecoration: 'none' }}>{t.title}</Link>
                    </td>
                    <td style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>{t.creator_name ?? '—'}</td>
                    <td style={{ padding: '1rem' }}>{t.member_count}</td>
                    <td style={{ padding: '1rem' }}>{t.message_count}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Button variant="danger" onClick={() => handleDeleteTopic(t)}>Delete</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Activity logs</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Time</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Admin</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Action</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Target</th>
                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Loading logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>No activity yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                    <td style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>{log.admin_name ?? '—'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        background: 'hsl(var(--muted) / 0.5)',
                        color: 'hsl(var(--foreground))',
                      }}>{log.action}</span>
                    </td>
                    <td style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>{log.target_type} {log.target_id ? `(${log.target_id.slice(0, 8)}…)` : ''}</td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
                      {log.metadata && typeof log.metadata === 'object'
                        ? Object.entries(log.metadata)
                            .map(([k, v]) => (v != null ? `${k}: ${String(v)}` : null))
                            .filter(Boolean)
                            .join(' · ') || '—'
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={closeEdit}
        >
          <div
            className="glass-panel"
            style={{ padding: '2rem', minWidth: '360px', maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>Edit user</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsl(var(--input))',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'hsl(var(--foreground))',
                  }}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={closeEdit}>Cancel</Button>
              <Button onClick={handleSaveUser} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
