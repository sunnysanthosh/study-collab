'use client';

import { Shell } from "@/components/layout/Shell";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface AdminStats {
    totalUsers: number;
    activeTopics: number;
    pendingRequests: number;
    onlineNow: number;
}

export default function AdminDashboard() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAdminData = async () => {
            setIsLoading(true);
            try {
                const [statsResponse, usersResponse] = await Promise.all([
                    adminApi.getStats(),
                    adminApi.getUsers(50, 0),
                ]);

                if (statsResponse.error) {
                    showToast(statsResponse.error, 'error');
                } else if (statsResponse.data?.stats) {
                    setStats(statsResponse.data.stats);
                }

                if (usersResponse.error) {
                    showToast(usersResponse.error, 'error');
                } else if (usersResponse.data?.users) {
                    setUsers(usersResponse.data.users);
                }
            } catch (error) {
                console.error('Error loading admin data:', error);
                showToast('Failed to load admin data', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadAdminData();
    }, [showToast]);

    const statCards = stats ? [
        { label: 'Total Users', value: stats.totalUsers.toString(), color: 'var(--primary)' },
        { label: 'Active Topics', value: stats.activeTopics.toString(), color: 'var(--success)' },
        { label: 'Pending Requests', value: stats.pendingRequests.toString(), color: 'var(--warning)' },
        { label: 'Online Now', value: stats.onlineNow.toString(), color: 'var(--secondary)' },
    ] : [];

    return (
        <Shell>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Manage topics, users, and platform settings
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1" style={{ 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {statCards.map((stat) => (
                    <div key={stat.label} className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ 
                            fontSize: '0.9rem', 
                            color: 'hsl(var(--muted-foreground))',
                            marginBottom: '0.5rem'
                        }}>
                            {stat.label}
                        </div>
                        <div style={{ 
                            fontSize: '2rem', 
                            fontWeight: 'bold',
                            color: `hsl(${stat.color})`
                        }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Management Table */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Users</h2>
                    <Link href="/admin/add-topic" style={{ textDecoration: 'none' }}>
                        <Button>Add New Topic</Button>
                    </Link>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                <th style={{ 
                                    padding: '1rem', 
                                    color: 'hsl(var(--muted-foreground))',
                                    textAlign: 'left',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>Name</th>
                                <th style={{ 
                                    padding: '1rem', 
                                    color: 'hsl(var(--muted-foreground))',
                                    textAlign: 'left',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>Email</th>
                                <th style={{ 
                                    padding: '1rem', 
                                    color: 'hsl(var(--muted-foreground))',
                                    textAlign: 'left',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>Email</th>
                                <th style={{ 
                                    padding: '1rem', 
                                    color: 'hsl(var(--muted-foreground))',
                                    textAlign: 'left',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>Role</th>
                                <th style={{ 
                                    padding: '1rem', 
                                    color: 'hsl(var(--muted-foreground))',
                                    textAlign: 'left',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                                        No users found.
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr 
                                    key={user.id} 
                                    style={{ 
                                        borderBottom: '1px solid hsl(var(--border))',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'hsl(var(--muted) / 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                    className="animate-fadeIn"
                                >
                                    <td style={{ padding: '1rem' }}>{user.name}</td>
                                    <td style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>
                                        {user.email}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            background: user.role === 'admin'
                                                ? 'hsl(var(--warning) / 0.2)'
                                                : 'hsl(var(--success) / 0.2)',
                                            color: user.role === 'admin'
                                                ? 'hsl(var(--warning))'
                                                : 'hsl(var(--success))'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Shell>
    );
}
