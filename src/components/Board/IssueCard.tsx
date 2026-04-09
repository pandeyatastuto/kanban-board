/**
 * IssueCard — draggable Kanban card.
 * Shows title, type icon, priority badge, assignee avatar, story points, labels.
 * Clicking the title opens the issue detail panel.
 */
import { useSortable } from '@dnd-kit/sortable';
import { CSS }         from '@dnd-kit/utilities';
import type { Issue }  from '../../types/issue';
import { useBoard }    from '../../context/BoardContext';
import Avatar          from '../common/Avatar';
import { PriorityBadge, TypeBadge } from '../common/Badge';

interface Props {
  issue:      Issue;
  isDragging?: boolean;
}

export default function IssueCard({ issue, isDragging = false }: Props) {
  const { selectIssue } = useBoard();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: issue.issue_id });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
  };

  const classes = [
    'issue-card',
    isSortableDragging ? 'issue-card--dragging' : '',
    isDragging         ? 'drag-overlay'         : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classes}
      {...attributes}
      {...listeners}
    >
      {/* Top row: type badge + title */}
      <div className="issue-card__top">
        <TypeBadge type={issue.type} />
        <span
          className="issue-card__title"
          onClick={() => selectIssue(issue.issue_id)}
          // Prevent drag from triggering click
          onPointerDown={e => e.stopPropagation()}
        >
          {issue.title}
        </span>
      </div>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="issue-card__labels">
          {issue.labels.map(label => (
            <span
              key={label.id}
              className="label-pill"
              style={{ background: `${label.color}22`, color: label.color }}
            >
              <span className="label-pill__dot" style={{ background: label.color }} />
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row: issue id, priority, points, assignee */}
      <div className="issue-card__bottom">
        <div className="issue-card__meta">
          <span className="issue-card__id">{issue.issue_id}</span>
          <PriorityBadge priority={issue.priority} />
          {issue.comment_count > 0 && (
            <span className="issue-card__id" title="Comments">
              💬 {issue.comment_count}
            </span>
          )}
        </div>
        <div className="issue-card__meta">
          {issue.story_points !== null && (
            <span className="issue-card__points">{issue.story_points} pts</span>
          )}
          <Avatar user={issue.assignee} size="sm" />
        </div>
      </div>
    </div>
  );
}
