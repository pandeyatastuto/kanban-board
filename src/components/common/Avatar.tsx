/** Avatar — shows user photo or initials fallback with a color derived from the name */
import type { Assignee } from '../../types/user';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  user:      Assignee | null;
  size?:     Size;
  className?: string;
}

/** Deterministic color from a display name so initials always have the same bg */
function colorFromName(name: string): string {
  const COLORS = ['#0065FF', '#00875A', '#FF8B00', '#6554C0', '#DE350B', '#00B8D9', '#36B37E'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

export default function Avatar({ user, size = 'md', className = '' }: Props) {
  if (!user) {
    return (
      <div
        className={`avatar avatar--${size} ${className}`}
        style={{ background: 'var(--border-strong)' }}
        title="Unassigned"
      >
        ?
      </div>
    );
  }

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.display_name}
        className={`avatar avatar--${size} ${className}`}
        title={user.display_name}
      />
    );
  }

  return (
    <div
      className={`avatar avatar--${size} ${className}`}
      style={{ background: colorFromName(user.display_name) }}
      title={user.display_name}
    >
      {initials(user.display_name)}
    </div>
  );
}
