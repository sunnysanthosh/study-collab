import { Shell } from "@/components/layout/Shell";
import { ChatInterface } from "@/components/collab/ChatInterface";
import { ProblemBoard } from "@/components/collab/ProblemBoard";

export default function TopicRoom({ params }: { params: { id: string } }) {
    return (
        <Shell>
            <div style={{ height: 'calc(100vh - 120px)', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
                <div style={{ height: '100%' }}>
                    <ProblemBoard />
                </div>
                <div style={{ height: '100%' }}>
                    <ChatInterface />
                </div>
            </div>
        </Shell>
    );
}
