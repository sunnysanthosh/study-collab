'use client';

import { Shell } from "@/components/layout/Shell";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('john.doe@school.edu');
    const [bio, setBio] = useState('Computer Science student passionate about collaborative learning.');
    const [avatar, setAvatar] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const stats = [
        { label: 'Topics Joined', value: '12' },
        { label: 'Messages Sent', value: '234' },
        { label: 'Problems Solved', value: '45' },
        { label: 'Study Hours', value: '128' },
    ];

    const handleSave = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        setIsEditing(false);
        // TODO: Save to API
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Shell>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Profile Header */}
                <div className="glass-panel animate-fadeIn" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: avatar || 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                fontWeight: 'bold',
                                color: 'white',
                                backgroundImage: avatar ? `url(${avatar})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '4px solid hsl(var(--glass-border))',
                                cursor: isEditing ? 'pointer' : 'default'
                            }}>
                                {!avatar && name.charAt(0).toUpperCase()}
                            </div>
                            {isEditing && (
                                <label style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    background: 'hsl(var(--primary))',
                                    color: 'white',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '3px solid hsl(var(--background))'
                                }}>
                                    📷
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            {isEditing ? (
                                <>
                                    <Input
                                        label="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        style={{ marginBottom: '1rem' }}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ marginBottom: '1rem' }}
                                    />
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                        <Button onClick={handleSave} isLoading={isLoading}>
                                            Save Changes
                                        </Button>
                                        <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isLoading}>
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{name}</h1>
                                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
                                        {email}
                                    </p>
                                    <p style={{ color: 'hsl(var(--foreground))', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                        {bio}
                                    </p>
                                    <Button onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1" style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {stats.map((stat) => (
                        <div key={stat.label} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--primary))', marginBottom: '0.5rem' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bio Section */}
                {isEditing && (
                    <div className="glass-panel animate-fadeIn" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                placeholder="Tell us about yourself..."
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid hsl(var(--input))',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'inherit',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Shell>
    );
}

