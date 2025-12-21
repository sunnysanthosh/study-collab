'use client';

import { Shell } from "@/components/layout/Shell";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AddTopicPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [errors, setErrors] = useState<{ title?: string; description?: string; tags?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors: typeof errors = {};
        
        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }
        
        if (!description.trim()) {
            newErrors.description = 'Description is required';
        } else if (description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }
        
        if (!tags.trim()) {
            newErrors.tags = 'At least one tag is required';
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
        
        // TODO: Implement actual API call
        console.log('Creating topic:', { title, description, tags: tags.split(',').map(t => t.trim()) });
        
        // Redirect to topics page
        router.push('/topics');
    };

    return (
        <Shell>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                <div className="glass-panel animate-fadeIn" style={{ padding: '2.5rem', width: '100%', maxWidth: '600px' }}>
                    <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Add New Topic</h2>
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>
                        Create a new study topic for students to collaborate on
                    </p>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <Input
                            id="title"
                            type="text"
                            label="Topic Title"
                            placeholder="e.g. Advanced Calculus"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            error={errors.title}
                            required
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="description" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={5}
                                placeholder="Brief description of the topic..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${errors.description ? 'hsl(var(--destructive))' : 'hsl(var(--input))'}`,
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'inherit',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    resize: 'vertical',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = errors.description ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
                                    e.currentTarget.style.boxShadow = `0 0 0 3px ${errors.description ? 'hsl(var(--destructive) / 0.1)' : 'hsl(var(--primary) / 0.1)'}`;
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = errors.description ? 'hsl(var(--destructive))' : 'hsl(var(--input))';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                required
                            />
                            {errors.description && (
                                <span style={{ fontSize: '0.85rem', color: 'hsl(var(--destructive))' }}>
                                    {errors.description}
                                </span>
                            )}
                            {!errors.description && description.length > 0 && (
                                <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                                    {description.length} characters
                                </span>
                            )}
                        </div>

                        <Input
                            id="tags"
                            type="text"
                            label="Tags (comma separated)"
                            placeholder="Math, Science, Engineering"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            error={errors.tags}
                            helperText="Separate multiple tags with commas"
                            required
                        />

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <Button type="submit" isLoading={isLoading} style={{ flex: 1 }}>
                                Create Topic
                            </Button>
                            <Button 
                                type="button" 
                                variant="ghost"
                                onClick={() => router.back()}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Shell>
    );
}
