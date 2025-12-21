import { Shell } from "@/components/layout/Shell";

export default function AddTopicPage() {
    return (
        <Shell>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '600px' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Add New Topic</h2>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="title" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Topic Title</label>
                            <input
                                type="text"
                                id="title"
                                placeholder="e.g. Advanced Calculus"
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--input)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'inherit',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="description" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Description</label>
                            <textarea
                                id="description"
                                rows={4}
                                placeholder="Brief description of the topic..."
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--input)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'inherit',
                                    outline: 'none',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="tags" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Tags (comma separated)</label>
                            <input
                                type="text"
                                id="tags"
                                placeholder="Math, Science, Engineering"
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--input)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'inherit',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary">Create Topic</button>
                            <button type="button" className="btn btn-ghost">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </Shell>
    );
}
