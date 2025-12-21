'use client';

import { Shell } from "@/components/layout/Shell";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminDashboard() {
    // Mock data
    const users = [
        { id: 1, name: "Alice Johnson", email: "alice@school.edu", status: "Pending", topic: "Math 101" },
        { id: 2, name: "Bob Smith", email: "bob@school.edu", status: "Active", topic: "Physics 202" },
        { id: 3, name: "Charlie Brown", email: "charlie@school.edu", status: "Pending", topic: "Chemistry 303" },
    ];

    const stats = [
        { label: 'Total Users', value: '1,234', color: 'var(--primary)' },
        { label: 'Active Topics', value: '45', color: 'var(--success)' },
        { label: 'Pending Requests', value: '12', color: 'var(--warning)' },
        { label: 'Online Now', value: '89', color: 'var(--secondary)' },
    ];

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
                {stats.map((stat) => (
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
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>User Requests</h2>
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
                                }}>Requested Topic</th>
                                <th style={{ 
                                    padding: '1rem', 
                                    color: 'hsl(var(--muted-foreground))',
                                    textAlign: 'left',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>Status</th>
                                <th style={{ 
                                    padding: '1rem', 
                                    color: 'hsl(var(--muted-foreground))',
                                    textAlign: 'left',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
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
                                    <td style={{ padding: '1rem' }}>{user.topic}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            background: user.status === 'Active' 
                                                ? 'hsl(var(--success) / 0.2)' 
                                                : 'hsl(var(--warning) / 0.2)',
                                            color: user.status === 'Active' 
                                                ? 'hsl(var(--success))' 
                                                : 'hsl(var(--warning))'
                                        }}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <Button 
                                            variant="ghost" 
                                            style={{ 
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {user.status === 'Pending' ? 'Approve' : 'View'}
                                        </Button>
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
