/** ActivityFeed — sidebar showing recent board-level activity from the WebSocket */
import { useState, useEffect } from 'react';
import mockWebSocket  from '../../api/mockWebSocket';
import type { WSEvent, IssueMovePayload } from '../../types/events';

interface FeedItem {
  id:        string;
  text:      string;
  timestamp: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    const unsub = mockWebSocket.subscribe((event: WSEvent) => {
      let text = '';
      if (event.event_type === 'issue_moved') {
        const p = event.payload as IssueMovePayload;
        text = `${p.moved_by} moved ${p.issue_id} → ${p.to_column.replace('_', ' ')}`;
      } else if (event.event_type === 'user_joined') {
        const p = event.payload as { display_name: string };
        text = `${p.display_name} joined the board`;
      }
      if (!text) return;
      const item: FeedItem = { id: `feed-${Date.now()}`, text, timestamp: new Date().toISOString() };
      setItems(prev => [item, ...prev].slice(0, 20)); // keep last 20
    });
    return unsub;
  }, []);

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Live Activity
      </p>
      {items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No recent activity.</p>
      ) : (
        items.map(item => (
          <div key={item.id} style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-default)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{item.text}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{relativeTime(item.timestamp)}</p>
          </div>
        ))
      )}
    </div>
  );
}
