/**
 * KanbanBoard — root drag-and-drop context.
 *
 * Scenario 2 (WIP limit) is handled here in handleDragEnd:
 * if the destination column is at its WIP limit, a confirm dialog is shown.
 * The override is allowed if confirmed and logged via toast.
 */
import { useState, useCallback }    from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useBoard }   from '../../context/BoardContext';
import { useToast }   from '../../context/ToastContext';
import { useFilter }  from '../../context/FilterContext';
import KanbanColumn   from './KanbanColumn';
import IssueCard      from './IssueCard';
import type { Issue } from '../../types/issue';

export default function KanbanBoard() {
  const { state, dispatchMove, dispatchReorder } = useBoard();
  const { addToast } = useToast();
  const { filters } = useFilter();

  // When status filters are active, hide non-matching columns entirely
  const visibleColumns = filters.status.length
    ? state.columns.filter(col => filters.status.includes(col.status))
    : state.columns;
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  // Require 8px movement before drag starts — prevents accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findIssueAndColumn = useCallback((issueId: string) => {
    for (const col of state.columns) {
      const issue = col.issues.find(i => i.issue_id === issueId);
      if (issue) return { issue, column: col };
    }
    return null;
  }, [state.columns]);

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    const result = findIssueAndColumn(String(active.id));
    if (result) setActiveIssue(result.issue);
  }, [findIssueAndColumn]);

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    setActiveIssue(null);
    if (!over) return;

    const issueId    = String(active.id);
    const overId     = String(over.id);
    const srcResult  = findIssueAndColumn(issueId);
    if (!srcResult) return;

    const { column: srcCol } = srcResult;

    // Determine if dropping onto a column (by status id) or onto another issue
    const destCol = state.columns.find(c => c.status === overId)
      ?? state.columns.find(c => c.issues.some(i => i.issue_id === overId));

    if (!destCol) return;

    const isSameColumn = srcCol.status === destCol.status;

    if (isSameColumn) {
      // Reorder within the same column
      const fromIndex = srcCol.issues.findIndex(i => i.issue_id === issueId);
      const toIndex   = destCol.issues.findIndex(i => i.issue_id === overId);
      if (fromIndex !== toIndex && toIndex !== -1) {
        dispatchReorder(srcCol.status, fromIndex, toIndex);
      }
      return;
    }

    // Scenario 2: WIP limit check before cross-column move
    const atLimit = destCol.wip_limit < 999 && destCol.issues.length >= destCol.wip_limit;
    if (atLimit) {
      const confirmed = window.confirm(
        `"${destCol.display_name}" has reached its WIP limit of ${destCol.wip_limit}.\n\nMove anyway?`
      );
      if (!confirmed) return;
      addToast(`WIP override: moved ${issueId} to ${destCol.display_name} (limit ${destCol.wip_limit})`, 'warning');
    }

    // Insert at the position of the hovered issue, or at end of column
    const position = destCol.issues.findIndex(i => i.issue_id === overId);
    dispatchMove(issueId, srcCol.status, destCol.status, position >= 0 ? position : destCol.issues.length);
  }, [findIssueAndColumn, state.columns, dispatchMove, dispatchReorder, addToast]);

  if (state.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="spinner spinner--lg" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{ padding: '40px', color: 'var(--color-error)', textAlign: 'center' }}>
        Failed to load board: {state.error}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {visibleColumns.map(col => (
          <KanbanColumn key={col.status} column={col} />
        ))}
      </div>

      {/* Ghost card rendered outside the column during drag */}
      <DragOverlay>
        {activeIssue && <IssueCard issue={activeIssue} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
