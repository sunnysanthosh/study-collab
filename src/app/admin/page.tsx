import { Shell } from "@/components/layout/Shell";

export default function AdminDashboard() {
    // Mock data
    const users = [
        { id: 1, name: "Alice Johnson", email: "alice@school.edu", status: "Pending", topic: "Math 101" },
        { id: 2, name: "Bob Smith", email: "bob@school.edu", status: "Active", topic: "Physics 202" },
        { id: 3, name: "Charlie Brown", email: "charlie@school.edu", status: "Pending", topic: "Chemistry 303" },
    ];

    return (
        <Shell>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Admin Dashboard</h2>
                    <button className="btn btn-primary">Add New Topic</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>Name</th>
                                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>Email</th>
                                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>Requested Topic</th>
                                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>Status</th>
                                <th style={{ padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>{user.name}</td>
                                    <td style={{ padding: '1rem' }}>{user.email}</td>
                                    <td style={{ padding: '1rem' }}>{user.topic}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.85rem',
                                            background: user.status === 'Active' ? 'hsl(var(--success) / 0.2)' : 'hsl(var(--warning) / 0.2)',
                                            color: user.status === 'Active' ? 'hsl(var(--success))' : 'hsl(var(--warning))'
                                        }}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button className="btn-ghost" style={{ padding: '0.5rem', color: 'hsl(var(--primary))' }}>Approve</button>
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
