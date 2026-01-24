'use client';

import { Shell } from "@/components/layout/Shell";
import { TopicCard } from "@/components/collab/TopicCard";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { topicApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

interface Topic {
    id: string;
    title: string;
    description?: string;
    category?: string;
    subject?: string;
    difficulty?: string;
    tags?: string[];
    created_by?: string;
    created_at?: string;
}

export default function TopicsPage() {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        loadTopics();
    }, [debouncedSearch, selectedTag, selectedSubject, selectedCategory]);

    useEffect(() => {
        if (user) {
            loadFavorites();
        } else {
            setFavoriteIds(new Set());
        }
    }, [user]);

    const loadTopics = async () => {
        setIsLoading(true);
        try {
            const response = await topicApi.getTopics({
                search: debouncedSearch || undefined,
                category: selectedCategory || undefined,
                subject: selectedSubject || undefined,
                tags: selectedTag ? [selectedTag] : undefined,
                limit: 100,
                sort: 'created_at',
                order: 'desc',
            });
            if (response.error) {
                showToast(response.error, 'error');
            } else if (response.data) {
                setTopics(response.data.topics || []);
            }
        } catch (error) {
            console.error('Error loading topics:', error);
            showToast('Failed to load topics', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const loadFavorites = async () => {
        try {
            const response = await topicApi.getFavorites();
            if (response.data?.favorites) {
                setFavoriteIds(new Set(response.data.favorites));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const toggleFavorite = async (topicId: string) => {
        if (!user) {
            showToast('Please log in to save favorites.', 'error');
            return;
        }

        const isFavorite = favoriteIds.has(topicId);
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (isFavorite) {
                next.delete(topicId);
            } else {
                next.add(topicId);
            }
            return next;
        });

        const response = isFavorite
            ? await topicApi.removeFavorite(topicId)
            : await topicApi.addFavorite(topicId);

        if (response.error) {
            showToast(response.error, 'error');
            setFavoriteIds((prev) => {
                const next = new Set(prev);
                if (isFavorite) {
                    next.add(topicId);
                } else {
                    next.delete(topicId);
                }
                return next;
            });
        }
    };

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        topics.forEach(topic => {
            if (topic.tags) {
                topic.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet);
    }, [topics]);

    const allSubjects = useMemo(() => {
        const subjectSet = new Set<string>();
        topics.forEach(topic => {
            if (topic.subject) {
                subjectSet.add(topic.subject);
            }
        });
        return Array.from(subjectSet);
    }, [topics]);

    const allCategories = useMemo(() => {
        const categorySet = new Set<string>();
        topics.forEach(topic => {
            if (topic.category) {
                categorySet.add(topic.category);
            }
        });
        return Array.from(categorySet);
    }, [topics]);

    const hasFilters = !!debouncedSearch || !!selectedTag || !!selectedSubject || !!selectedCategory;

    return (
        <Shell>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Study Topics</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Join a room to start collaborating with your peers.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <Input
                        type="search"
                        placeholder="Search topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {allCategories.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Category:</span>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${selectedCategory === null ? 'hsl(var(--primary))' : 'hsl(var(--input))'}`,
                                    background: selectedCategory === null ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                    color: selectedCategory === null ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                }}
                            >
                                All
                            </button>
                            {allCategories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${selectedCategory === category ? 'hsl(var(--primary))' : 'hsl(var(--input))'}`,
                                        background: selectedCategory === category ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                        color: selectedCategory === category ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    )}

                    {allSubjects.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Subject:</span>
                            <button
                                onClick={() => setSelectedSubject(null)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${selectedSubject === null ? 'hsl(var(--primary))' : 'hsl(var(--input))'}`,
                                    background: selectedSubject === null ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                    color: selectedSubject === null ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                }}
                            >
                                All
                            </button>
                            {allSubjects.map(subject => (
                                <button
                                    key={subject}
                                    onClick={() => setSelectedSubject(subject)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${selectedSubject === subject ? 'hsl(var(--primary))' : 'hsl(var(--input))'}`,
                                        background: selectedSubject === subject ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                        color: selectedSubject === subject ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {allTags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Tags:</span>
                            <button
                                onClick={() => setSelectedTag(null)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${selectedTag === null ? 'hsl(var(--primary))' : 'hsl(var(--input))'}`,
                                    background: selectedTag === null ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                    color: selectedTag === null ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                }}
                            >
                                All
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${selectedTag === tag ? 'hsl(var(--primary))' : 'hsl(var(--input))'}`,
                                        background: selectedTag === tag ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                        color: selectedTag === tag ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Topics Grid */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                    Loading topics...
                </div>
            ) : topics.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                    {hasFilters ? 'No topics match your filters.' : 'No topics available. Be the first to create one!'}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {topics.map(topic => (
                        <TopicCard
                            key={topic.id}
                            id={topic.id}
                            title={topic.title}
                            description={topic.description || ''}
                            tags={topic.tags || []}
                            isFavorite={favoriteIds.has(topic.id)}
                            onToggleFavorite={user ? toggleFavorite : undefined}
                        />
                    ))}
                </div>
            )}
        </Shell>
    );
}
