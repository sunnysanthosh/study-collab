import { Shell } from "@/components/layout/Shell";
import Link from "next/link";

export default function SignupPage() {
    return (
        <Shell>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
                <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Create Account</h2>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="name" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Full Name</label>
                            <input
                                type="text"
                                id="name"
                                placeholder="John Doe"
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--input)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'inherit',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="you@school.edu"
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--input)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'inherit',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--input)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'inherit',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Sign Up
                        </button>
                    </form>
                    <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
                        Already have an account? <Link href="/login" style={{ color: 'hsl(var(--primary))', textDecoration: 'none' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </Shell>
    );
}
