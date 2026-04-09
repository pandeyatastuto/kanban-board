/** ActivityTimeline — chronological list of all changes to an issue */
import type { ActivityEntry } from '../../types/issue';
import Avatar from '../common/Avatar';

interface Props {
  entries: ActivityEntry[];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ActivityTimeline({ entries }: Props) {
  if (entries.length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No activity yet.</p>;
  }

  return (
    <div className="activity-timeline">
      <p className="activity-timeline__title">Activity</p>
      {[...entries].reverse().map(entry => (
        <div key={entry.id} className="activity-item">
          <Avatar user={entry.user} size="sm" />
          <div className="activity-item__content">
            <p
              className="activity-item__action"
              /* Bold **text** patterns for action strings like "changed status from **todo** to **in_progress**" */
              dangerouslySetInnerHTML={{
                __html: `<strong>${entry.user.display_name}</strong> ${entry.action.replace(
                  /\*\*(.*?)\*\*/g, '<strong>$1</strong>'
                )}`,
              }}
            />
            <p className="activity-item__time">{relativeTime(entry.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
