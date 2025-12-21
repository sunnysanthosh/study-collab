'use client';

import { Shell } from "@/components/layout/Shell";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        
        // TODO: Implement actual login logic
        console.log('Login:', { email, password });
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
