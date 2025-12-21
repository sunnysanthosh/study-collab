import { Shell } from "@/components/layout/Shell";

export default function Home() {
  return (
    <Shell>
      <div style={{ minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '4rem', maxWidth: '800px' }}>
          <h1 style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            StudyCollab
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'hsl(var(--muted-foreground))', marginBottom: '2.5rem' }}>
            Collaborate with your classmates in real-time. Solve problems, share ideas, and learn together.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-ghost">Learn More</button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
