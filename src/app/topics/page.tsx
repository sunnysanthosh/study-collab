'use client';

import { Shell } from "@/components/layout/Shell";
import { TopicCard } from "@/components/collab/TopicCard";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { topicApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface Topic {
    id: string;
    title: string;
    description?: string;
    subject?: string;
    difficulty?: string;
    tags?: string[];
    created_by?: string;
    created_at?: string;
}

export default function TopicsPage() {
    const { showToast } = useToast();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = async () => {
        setIsLoading(true);
        try {
            const response = await topicApi.getTopics();
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

    const filteredTopics = useMemo(() => {
        return topics.filter(topic => {
            const matchesSearch = !searchQuery || 
                topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (topic.description && topic.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesTag = !selectedTag || (topic.tags && topic.tags.includes(selectedTag));
            const matchesSubject = !selectedSubject || topic.subject === selectedSubject;
            return matchesSearch && matchesTag && matchesSubject;
        });
    }, [topics, searchQuery, selectedTag, selectedSubject]);

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
            ) : filteredTopics.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                    {topics.length === 0 ? 'No topics available. Be the first to create one!' : 'No topics match your filters.'}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredTopics.map(topic => (
                        <TopicCard
                            key={topic.id}
                            id={topic.id}
                            title={topic.title}
                            description={topic.description || ''}
                            tags={topic.tags || []}
                        />
                    ))}
                </div>
            )}
        </Shell>
    );
}
