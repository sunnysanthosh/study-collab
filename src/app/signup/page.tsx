'use client';

import { Shell } from "@/components/layout/Shell";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ 
        name?: string; 
        email?: string; 
        password?: string;
        confirmPassword?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors: typeof errors = {};
        
        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        
        // TODO: Implement actual signup logic
        console.log('Signup:', { name, email, password });
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
                        Create Account
                    </h2>
                    <p style={{ 
                        textAlign: 'center', 
                        color: 'hsl(var(--muted-foreground))',
                        marginBottom: '2rem'
                    }}>
                        Join StudyCollab and start learning together
                    </p>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <Input
                            id="name"
                            type="text"
                            label="Full Name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={errors.name}
                            required
                        />
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
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            helperText={!errors.password && password.length > 0 ? "Must be at least 8 characters" : undefined}
                            required
                        />
                        <PasswordInput
                            id="confirmPassword"
                            label="Confirm Password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={errors.confirmPassword}
                            required
                        />
                        <Button 
                            type="submit" 
                            isLoading={isLoading}
                            style={{ marginTop: '0.5rem', width: '100%' }}
                        >
                            Sign Up
                        </Button>
                    </form>
                    <p style={{ 
                        marginTop: '2rem', 
                        textAlign: 'center', 
                        fontSize: '0.9rem', 
                        color: 'hsl(var(--muted-foreground))' 
                    }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ 
                            color: 'hsl(var(--primary))', 
                            textDecoration: 'none',
                            fontWeight: 500
                        }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </Shell>
    );
}
