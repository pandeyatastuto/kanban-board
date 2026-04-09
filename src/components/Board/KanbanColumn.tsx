/**
 * KanbanColumn — one status column with WIP indicator and sortable issue list.
 * Scenario 2 (WIP limit) is enforced in KanbanBoard.tsx at drop time.
 */
import { useDroppable }           from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column }            from '../../types/board';
import { useBoard }               from '../../context/BoardContext';
import { useFilter }              from '../../context/FilterContext';
import type { Issue }             from '../../types/issue';
import IssueCard                  from './IssueCard';
import WipIndicator               from './WipIndicator';
import SwimlaneGroup              from './SwimlaneGroup';

// Map status to the dot color shown in the column header
const STATUS_COLOR: Record<string, string> = {
  todo:        'var(--text-muted)',
  in_progress: 'var(--status-in-progress)',
  in_review:   'var(--status-in-review)',
  done:        'var(--status-done)',
};

interface Props {
  column: Column;
}

/** Filter issues based on active FilterContext state */
function applyFilters(issues: Issue[], filters: ReturnType<typeof useFilter>['filters']): Issue[] {
  return issues.filter(issue => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!issue.title.toLowerCase().includes(q) && !issue.description.toLowerCase().includes(q)) return false;
    }
    // status filtering is handled at column level in KanbanBoard — not here
    if (filters.priority.length && !filters.priority.includes(issue.priority)) return false;
    if (filters.type.length     && !filters.type.includes(issue.type))         return false;
    if (filters.assignee.length && (!issue.assignee || !filters.assignee.includes(issue.assignee.user_id))) return false;
    if (filters.label.length    && !issue.labels.some(l => filters.label.includes(l.name)))                return false;
    return true;
  });
}

export default function KanbanColumn({ column }: Props) {
  const { state, selectIssue } = useBoard();
  const { filters } = useFilter();

  const { setNodeRef, isOver } = useDroppable({ id: column.status });

  // Board only shows issues assigned to a sprint — backlog issues (sprint_id: null) live in /backlog
  const sprintIssues  = column.issues.filter(i => i.sprint_id !== null);
  const visibleIssues = applyFilters(sprintIssues, filters);
  const issueIds      = visibleIssues.map(i => i.issue_id);
  const isAtLimit     = column.wip_limit < 999 && sprintIssues.length >= column.wip_limit;

  return (
    <div className={`kanban-column${isOver ? ' kanban-column--drag-over' : ''}`}>
      {/* Column header */}
      <div className="kanban-column__header">
        <div className="kanban-column__title">
          <span
            className="kanban-column__title-dot"
            style={{ background: STATUS_COLOR[column.status] ?? 'var(--text-muted)' }}
          />
          {column.display_name}
          <span className="kanban-column__count">{column.issues.length}</span>
        </div>
        <button
          className="kanban-column__add-btn btn btn--ghost"
          title="Add issue"
          onClick={() => {
            /* Opens IssueModal pre-filled with this status via BoardContext.selectedIssueId=null */
            selectIssue('__new__' + column.status);
          }}
        >
          +
        </button>
      </div>

      {/* WIP progress bar — shown only when a limit exists */}
      {column.wip_limit < 999 && (
        <WipIndicator count={column.issues.length} limit={column.wip_limit} />
      )}

      {/* Issue cards */}
      <div ref={setNodeRef} className="kanban-column__body">
        <SortableContext items={issueIds} strategy={verticalListSortingStrategy}>
          {state.swimlaneGroupBy !== 'none' ? (
            <SwimlaneGroup issues={visibleIssues} groupBy={state.swimlaneGroupBy} />
          ) : (
            visibleIssues.map(issue => (
              <IssueCard key={issue.issue_id} issue={issue} />
            ))
          )}
          {visibleIssues.length === 0 && (
            <div style={{ padding: 'var(--space-3)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
              {isAtLimit ? '⛔ WIP limit reached' : 'No issues'}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
