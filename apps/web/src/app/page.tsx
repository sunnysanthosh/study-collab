import { Shell } from "@/components/layout/Shell";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const features = [
    {
      icon: '💬',
      title: 'Real-time Chat',
      description: 'Communicate instantly with your study group members',
    },
    {
      icon: '📝',
      title: 'Problem Board',
      description: 'Work on problems together with collaborative editing',
    },
    {
      icon: '👥',
      title: 'Study Groups',
      description: 'Join or create study topics and connect with peers',
    },
    {
      icon: '⚡',
      title: 'Live Updates',
      description: 'See changes in real-time as your classmates work',
    },
  ];

  return (
    <Shell>
      {/* Hero Section */}
      <section style={{ 
        minHeight: 'calc(100vh - 200px)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center',
        padding: '4rem 0'
      }}>
        <div className="animate-fadeIn" style={{ maxWidth: '900px', width: '100%' }}>
          <h1 style={{ 
            marginBottom: '1.5rem', 
            background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)'
          }}>
            StudyCollab
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            color: 'hsl(var(--muted-foreground))', 
            marginBottom: '2.5rem',
            lineHeight: '1.6'
          }}>
            Collaborate with your classmates in real-time. Solve problems, share ideas, and learn together.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <Button>Get Started</Button>
            </Link>
            <Link href="/topics" style={{ textDecoration: 'none' }}>
              <Button variant="ghost">Explore Topics</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Why StudyCollab?</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.1rem' }}>
            Everything you need for effective group study sessions
          </p>
        </div>
        <div className="grid grid-cols-1" style={{ 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="glass-panel animate-fadeIn"
              style={{ 
                padding: '2rem',
                textAlign: 'center',
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{feature.title}</h3>
              <p style={{ color: 'hsl(var(--muted-foreground))' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to start studying together?</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Join StudyCollab today and transform how you learn with your peers.
          </p>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <Button>Create Free Account</Button>
          </Link>
        </div>
      </section>
    </Shell>
  );
}
