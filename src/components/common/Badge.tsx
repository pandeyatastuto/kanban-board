/** Badge — renders priority, type, or status labels with consistent color coding */
import type { IssuePriority, IssueStatus, IssueType } from '../../types/issue';

// ── Priority icons (plain unicode to avoid icon library dep) ───────────────
const PRIORITY_ICON: Record<IssuePriority, string> = {
  critical: '▲▲',
  high:     '▲',
  medium:   '–',
  low:      '▼',
};

const TYPE_ICON: Record<IssueType, string> = {
  bug:     '🐛',
  task:    '✓',
  story:   '◆',
  epic:    '⚡',
  subtask: '↳',
};

interface PriorityBadgeProps { priority: IssuePriority }
interface TypeBadgeProps     { type: IssueType }
interface StatusBadgeProps   { status: IssueStatus; displayName?: string }

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`badge badge--priority-${priority}`} title={priority}>
      <span aria-hidden="true">{PRIORITY_ICON[priority]}</span>
      {priority}
    </span>
  );
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span className={`badge badge--type-${type}`} title={type}>
      <span aria-hidden="true">{TYPE_ICON[type]}</span>
      {type}
    </span>
  );
}

export function StatusBadge({ status, displayName }: StatusBadgeProps) {
  const label = displayName ?? status.replace('_', ' ');
  return (
    <span className={`badge badge--status-${status}`}>
      {label}
    </span>
  );
}
