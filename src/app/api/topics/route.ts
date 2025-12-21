import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data - in a real app this would query a database
    const topics = [
        { id: 'math-101', title: 'Calculus I' },
        { id: 'phys-202', title: 'Physics: Mechanics' },
    ];

    return NextResponse.json(topics);
}

export async function POST(request: Request) {
    const body = await request.json();

    // Validate body
    if (!body.title || !body.description) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save to database (mocked)
    const newTopic = {
        id: `topic-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString()
    };

    return NextResponse.json(newTopic, { status: 201 });
}
