'use client';

import dynamic from 'next/dynamic';
import { Shell } from "@/components/layout/Shell";
import { ProblemBoard } from "@/components/collab/ProblemBoard";

const ChatInterface = dynamic(
  () => import('@/components/collab/ChatInterface').then((m) => ({ default: m.ChatInterface })),
  { ssr: false, loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Loading chat...</div> }
);

export default function TopicRoom({ params }: { params: { id: string } }) {
    return (
        <Shell>
            <div style={{ 
                height: 'calc(100vh - 140px)', 
                display: 'grid', 
                gridTemplateColumns: 'minmax(0, 1fr) 380px', 
                gap: '1.5rem',
                minHeight: '600px'
            }} className="topic-room-grid">
                <div style={{ height: '100%', minHeight: 0 }}>
                    <ProblemBoard />
                </div>
                <div style={{ height: '100%', minHeight: 0 }}>
                    <ChatInterface />
                </div>
            </div>
        </Shell>
    );
}
