'use client';

import { Shell } from "@/components/layout/Shell";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        setIsLoading(true);
        setErrors({});
        
        try {
            const success = await login(email, password);
            
            if (success) {
                showToast('Login successful! Welcome back.', 'success');
                router.push('/topics');
            } else {
                setErrors({ general: 'Invalid email or password' });
                showToast('Invalid credentials. Please try again.', 'error');
            }
        } catch (error) {
            setErrors({ general: 'An error occurred. Please try again.' });
            showToast('Login failed. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Shell>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 'calc(100vh - 200px)',
                padding: '2rem 0'
            }}>
                <div className="glass-panel animate-fadeIn" style={{ 
                    padding: '3rem', 
                    width: '100%', 
                    maxWidth: '420px' 
                }}>
                    <h2 style={{ 
                        marginBottom: '0.5rem', 
                        textAlign: 'center',
                        fontSize: '2rem'
                    }}>
                        Welcome Back
                    </h2>
                    <p style={{ 
                        textAlign: 'center', 
                        color: 'hsl(var(--muted-foreground))',
                        marginBottom: '2rem'
                    }}>
                        Sign in to continue your learning journey
                    </p>
                    
                    {/* Test Credentials Info */}
                    <div style={{
                        padding: '1rem',
                        background: 'hsl(var(--primary) / 0.1)',
                        border: '1px solid hsl(var(--primary) / 0.3)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem'
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--primary))' }}>
                            🧪 Test Credentials:
                        </div>
                        <div style={{ color: 'hsl(var(--muted-foreground))', lineHeight: '1.6' }}>
                            <div>Email: <strong>test@studycollab.com</strong></div>
                            <div>Password: <strong>test123</strong></div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                                Or use any email with password: <strong>demo123</strong>
                            </div>
                        </div>
                    </div>
                    
                    {errors.general && (
                        <div style={{
                            padding: '0.75rem',
                            background: 'hsl(var(--destructive) / 0.1)',
                            border: '1px solid hsl(var(--destructive))',
                            borderRadius: 'var(--radius-md)',
                            color: 'hsl(var(--destructive))',
                            fontSize: '0.9rem',
                            marginBottom: '1rem'
                        }}>
                            {errors.general}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <Input
                            id="email"
                            type="email"
                            label="Email"
                            placeholder="you@school.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            required
                        />
                        <PasswordInput
                            id="password"
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            required
                        />
                        <Button 
                            type="submit" 
                            isLoading={isLoading}
                            style={{ marginTop: '0.5rem', width: '100%' }}
                        >
                            Sign In
                        </Button>
                    </form>
                    <p style={{ 
                        marginTop: '2rem', 
                        textAlign: 'center', 
                        fontSize: '0.9rem', 
                        color: 'hsl(var(--muted-foreground))' 
                    }}>
                        Don't have an account?{' '}
                        <Link href="/signup" style={{ 
                            color: 'hsl(var(--primary))', 
                            textDecoration: 'none',
                            fontWeight: 500
                        }}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </Shell>
    );
}
