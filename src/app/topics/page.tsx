import { Shell } from "@/components/layout/Shell";
import { TopicCard } from "@/components/collab/TopicCard";

export default function TopicsPage() {
    const topics = [
        { id: 'math-101', title: 'Calculus I', description: 'Limits, derivatives, and integrals. Join for homework help!', activeUsers: 12, tags: ['Math', 'Calculus'] },
        { id: 'phys-202', title: 'Physics: Mechanics', description: 'Newtonian mechanics, work, energy, and power.', activeUsers: 8, tags: ['Physics', 'Science'] },
        { id: 'cs-101', title: 'Intro to CS', description: 'Algorithms, data structures, and Python basics.', activeUsers: 25, tags: ['CS', 'Programming'] },
        { id: 'chem-303', title: 'Organic Chemistry', description: 'Structure, properties, and reactions of organic compounds.', activeUsers: 5, tags: ['Chemistry', 'Science'] },
    ];

    return (
        <Shell>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Study Topics</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>Join a room to start collaborating with your peers.</p>
            </div>

            <div className="grid grid-cols-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {topics.map(topic => (
                    <TopicCard key={topic.id} {...topic} />
                ))}
            </div>
        </Shell>
    );
}
