'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsDay {
  date: string;
  users: number;
  topics: number;
  messages: number;
}

export function AdminAnalyticsChart({ data }: { data: AnalyticsDay[] }) {
  if (data.length === 0) return null;

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius-md)',
            }}
          />
          <Legend />
          <Bar dataKey="users" fill="hsl(var(--primary))" name="New users" radius={[4, 4, 0, 0]} />
          <Bar dataKey="topics" fill="hsl(var(--success))" name="New topics" radius={[4, 4, 0, 0]} />
          <Bar dataKey="messages" fill="hsl(var(--secondary))" name="Messages" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
