'use client';

import { Shell } from "@/components/layout/Shell";
import { TopicCard } from "@/components/collab/TopicCard";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/Input";

export default function TopicsPage() {
    const topics = [
        { id: 'math-101', title: 'Calculus I', description: 'Limits, derivatives, and integrals. Join for homework help!', activeUsers: 12, tags: ['Math', 'Calculus'] },
        { id: 'phys-202', title: 'Physics: Mechanics', description: 'Newtonian mechanics, work, energy, and power.', activeUsers: 8, tags: ['Physics', 'Science'] },
        { id: 'cs-101', title: 'Intro to CS', description: 'Algorithms, data structures, and Python basics.', activeUsers: 25, tags: ['CS', 'Programming'] },
        { id: 'chem-303', title: 'Organic Chemistry', description: 'Structure, properties, and reactions of organic compounds.', activeUsers: 5, tags: ['Chemistry', 'Science'] },
        { id: 'bio-201', title: 'Cell Biology', description: 'Cell structure, function, and molecular biology fundamentals.', activeUsers: 15, tags: ['Biology', 'Science'] },
        { id: 'stats-301', title: 'Statistics', description: 'Probability, distributions, and statistical inference.', activeUsers: 10, tags: ['Math', 'Statistics'] },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        topics.forEach(topic => topic.tags.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet);
    }, []);

    const filteredTopics = useMemo(() => {
        return topics.filter(topic => {
            const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 topic.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag = !selectedTag || topic.tags.includes(selectedTag);
            return matchesSearch && matchesTag;
        });
    }, [searchQuery, selectedTag]);

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
                        style={{ maxWidth: '500px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Filter by tag:</span>
                    <button
                        onClick={() => setSelectedTag(null)}
                        className="btn btn-ghost"
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            background: !selectedTag ? 'hsl(var(--primary) / 0.2)' : 'transparent',
                            border: !selectedTag ? '1px solid hsl(var(--primary))' : '1px solid transparent',
                        }}
                    >
                        All
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className="btn btn-ghost"
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.85rem',
                                background: selectedTag === tag ? 'hsl(var(--secondary) / 0.2)' : 'transparent',
                                border: selectedTag === tag ? '1px solid hsl(var(--secondary))' : '1px solid transparent',
                            }}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Topics Grid */}
            {filteredTopics.length > 0 ? (
                <div className="grid grid-cols-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredTopics.map(topic => (
                        <div key={topic.id} className="animate-fadeIn">
                            <TopicCard {...topic} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <h3 style={{ marginBottom: '0.5rem' }}>No topics found</h3>
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            )}
        </Shell>
    );
}
