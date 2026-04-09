/** BacklogView — sortable/filterable list of unassigned-sprint issues */
import { useState, useMemo, useCallback } from 'react';
import type { Issue, IssuePriority } from '../../types/issue';
import { useSprint }  from '../../context/SprintContext';
import { useBoard }   from '../../context/BoardContext';
import Avatar         from '../common/Avatar';
import { PriorityBadge, TypeBadge } from '../common/Badge';

type SortKey = 'priority' | 'title' | 'story_points';

const PRIORITY_ORDER: Record<IssuePriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export default function BacklogView() {
  const { state, activeSprint, moveToSprint } = useSprint();
  const { dispatchUpdate } = useBoard();

  // Patch both SprintContext (removes from backlog list) and BoardContext
  // (updates sprint_id on the live in-memory issue so the board reflects it)
  const handleAddToSprint = useCallback(async (issueId: string, sprintId: string) => {
    await moveToSprint(issueId, sprintId);
    dispatchUpdate(issueId, { sprint_id: sprintId });
  }, [moveToSprint, dispatchUpdate]);
  const [sortKey, setSortKey]   = useState<SortKey>('priority');
  const [search,  setSearch]    = useState('');

  const sorted = useMemo(() => {
    let list = [...state.backlog];
    // Filter
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q));
    }
    // Sort
    list.sort((a, b) => {
      if (sortKey === 'priority')     return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sortKey === 'story_points') return (b.story_points ?? 0) - (a.story_points ?? 0);
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [state.backlog, sortKey, search]);

  if (state.loading) return <div className="spinner spinner--md" />;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          placeholder="Search backlog…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 240 }}
        />
        <select className="form-select" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)} style={{ width: 'auto' }}>
          <option value="priority">Sort: Priority</option>
          <option value="title">Sort: Title</option>
          <option value="story_points">Sort: Points</option>
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          {sorted.length} issue{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="backlog-view">
        {sorted.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
            No backlog issues.
          </p>
        )}
        {sorted.map(issue => (
          <BacklogItem
            key={issue.issue_id}
            issue={issue}
            sprintId={activeSprint?.sprint_id ?? null}
            onAddToSprint={handleAddToSprint}
          />
        ))}
      </div>
    </div>
  );
}

interface ItemProps {
  issue:        Issue;
  sprintId:     string | null;
  onAddToSprint: (issueId: string, sprintId: string) => void;
}

function BacklogItem({ issue, sprintId, onAddToSprint }: ItemProps) {
  return (
    <div className="backlog-item">
      <TypeBadge type={issue.type} />
      <span className="backlog-item__title">{issue.title}</span>
      <div className="backlog-item__meta">
        <PriorityBadge priority={issue.priority} />
        {issue.story_points !== null && (
          <span className="issue-card__points">{issue.story_points} pts</span>
        )}
        <Avatar user={issue.assignee} size="sm" />
        {sprintId && (
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => onAddToSprint(issue.issue_id, sprintId)}
            title="Add to active sprint"
          >
            → Sprint
          </button>
        )}
      </div>
    </div>
  );
}
