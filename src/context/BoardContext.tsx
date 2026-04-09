/**
 * BoardContext — the core Kanban state machine.
 *
 * All mutations are optimistic: the reducer applies changes immediately,
 * and the API call confirms or rolls back. WebSocket events from
 * mockWebSocket are applied here too (Scenario 1: concurrent updates).
 */
import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import type { Column, SwimlaneGroupBy } from '../types/board';
import type { Issue } from '../types/issue';
import { getBoard } from '../api/boardApi';
import { createIssue, updateIssue, deleteIssue, moveIssue } from '../api/issueApi';
import mockWebSocket from '../api/mockWebSocket';
import type { IssueMovePayload } from '../types/events';
import { useToast } from './ToastContext';
import { CURRENT_USER } from '../api/mockData';

// ── State shape ────────────────────────────────────────────────────────────
interface BoardState {
  columns:      Column[];
  loading:      boolean;
  error:        string | null;
  swimlaneGroupBy: SwimlaneGroupBy;
  selectedIssueId: string | null; // drives the detail panel
}

type BoardAction =
  | { type: 'LOADED';          payload: Column[] }
  | { type: 'ERROR';           payload: string }
  | { type: 'SELECT_ISSUE';    payload: string | null }
  | { type: 'SET_SWIMLANE';    payload: SwimlaneGroupBy }
  | { type: 'ISSUE_MOVED';     payload: { issueId: string; fromCol: string; toCol: string; position: number } }
  | { type: 'ISSUE_REORDERED'; payload: { colId: string; fromIndex: number; toIndex: number } }
  | { type: 'ISSUE_CREATED';   payload: Issue }
  | { type: 'ISSUE_UPDATED';   payload: { issueId: string; changes: Partial<Issue> } }
  | { type: 'ISSUE_DELETED';   payload: string }
  | { type: 'ROLLBACK';        payload: Column[] };

// ── Reducer ────────────────────────────────────────────────────────────────
function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'LOADED':
      return { ...state, loading: false, error: null, columns: action.payload };

    case 'ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'SELECT_ISSUE':
      return { ...state, selectedIssueId: action.payload };

    case 'SET_SWIMLANE':
      return { ...state, swimlaneGroupBy: action.payload };

    case 'ISSUE_MOVED': {
      const { issueId, fromCol, toCol, position } = action.payload;
      let moved: Issue | undefined;

      // Remove from source
      const after = state.columns.map(col => {
        if (col.status !== fromCol) return col;
        const idx = col.issues.findIndex(i => i.issue_id === issueId);
        if (idx === -1) return col;
        moved = { ...col.issues[idx], status: toCol as Issue['status'] };
        return { ...col, issues: col.issues.filter(i => i.issue_id !== issueId) };
      });

      if (!moved) return state;

      // Insert at destination
      const columns = after.map(col => {
        if (col.status !== toCol) return col;
        const issues = [...col.issues];
        issues.splice(position, 0, moved!);
        return { ...col, issues };
      });

      return { ...state, columns };
    }

    case 'ISSUE_REORDERED': {
      const { colId, fromIndex, toIndex } = action.payload;
      const columns = state.columns.map(col => {
        if (col.status !== colId) return col;
        const issues = [...col.issues];
        const [item] = issues.splice(fromIndex, 1);
        issues.splice(toIndex, 0, item);
        return { ...col, issues };
      });
      return { ...state, columns };
    }

    case 'ISSUE_CREATED': {
      const columns = state.columns.map(col =>
        col.status === action.payload.status
          ? { ...col, issues: [action.payload, ...col.issues] }
          : col
      );
      return { ...state, columns };
    }

    case 'ISSUE_UPDATED': {
      const { issueId, changes } = action.payload;

      // If status changed, move the issue to the destination column
      if (changes.status) {
        let movedIssue: Issue | undefined;

        // Remove from current column
        const withoutIssue = state.columns.map(col => {
          const idx = col.issues.findIndex(i => i.issue_id === issueId);
          if (idx === -1) return col;
          movedIssue = { ...col.issues[idx], ...changes };
          return { ...col, issues: col.issues.filter(i => i.issue_id !== issueId) };
        });

        if (!movedIssue) return state;

        // Prepend to destination column
        const columns = withoutIssue.map(col =>
          col.status === changes.status
            ? { ...col, issues: [movedIssue!, ...col.issues] }
            : col
        );
        return { ...state, columns };
      }

      // No status change — patch in-place
      const columns = state.columns.map(col => ({
        ...col,
        issues: col.issues.map(i =>
          i.issue_id === issueId ? { ...i, ...changes } : i
        ),
      }));
      return { ...state, columns };
    }

    case 'ISSUE_DELETED': {
      const columns = state.columns.map(col => ({
        ...col,
        issues: col.issues.filter(i => i.issue_id !== action.payload),
      }));
      return { ...state, columns };
    }

    case 'ROLLBACK':
      return { ...state, columns: action.payload };

    default:
      return state;
  }
}

// ── Context value interface ────────────────────────────────────────────────
interface BoardContextValue {
  state:         BoardState;
  selectIssue:   (id: string | null) => void;
  setSwimlane:   (g: SwimlaneGroupBy) => void;
  dispatchMove:  (issueId: string, fromCol: string, toCol: string, position: number) => Promise<void>;
  dispatchReorder: (colId: string, fromIndex: number, toIndex: number) => Promise<void>;
  dispatchCreate:  (payload: Omit<Issue, 'issue_id' | 'created_at' | 'updated_at' | 'activity'>) => Promise<void>;
  dispatchUpdate:  (issueId: string, changes: Partial<Issue>) => Promise<void>;
  dispatchDelete:  (issueId: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────
export function BoardProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast();

  const [state, dispatch] = useReducer(boardReducer, {
    columns:         [],
    loading:         true,
    error:           null,
    swimlaneGroupBy: 'none',
    selectedIssueId: null,
  });

  // Load board data on mount
  useEffect(() => {
    getBoard('board_xyz')
      .then(board => dispatch({ type: 'LOADED', payload: board.columns }))
      .catch(err  => dispatch({ type: 'ERROR',  payload: String(err) }));
  }, []);

  // Scenario 1: apply real-time moves from other users via WebSocket
  useEffect(() => {
    const unsub = mockWebSocket.subscribe(event => {
      if (event.event_type === 'issue_moved') {
        const p = event.payload as IssueMovePayload;
        dispatch({ type: 'ISSUE_MOVED', payload: {
          issueId:  p.issue_id,
          fromCol:  p.from_column,
          toCol:    p.to_column,
          position: p.position,
        }});
        addToast(`${p.moved_by} moved ${p.issue_id} → ${p.to_column.replace('_', ' ')}`, 'info');
      }
    });
    return unsub;
  }, [addToast]);

  const selectIssue  = useCallback((id: string | null) => dispatch({ type: 'SELECT_ISSUE', payload: id }), []);
  const setSwimlane  = useCallback((g: SwimlaneGroupBy)  => dispatch({ type: 'SET_SWIMLANE', payload: g }), []);

  // Optimistic move with rollback on failure
  const dispatchMove = useCallback(async (
    issueId: string, fromCol: string, toCol: string, position: number
  ) => {
    const snapshot = state.columns;
    // Apply optimistically and toast immediately — no waiting for the API response
    dispatch({ type: 'ISSUE_MOVED', payload: { issueId, fromCol, toCol, position } });
    addToast(`${issueId} moved to ${toCol.replace(/_/g, ' ')}`, 'success');
    try {
      await moveIssue(issueId, toCol, position);
      // After persistence, tell every other open tab so they animate the card move
      mockWebSocket.broadcast({
        event_type: 'issue_moved',
        payload: {
          issue_id:    issueId,
          from_column: fromCol,
          to_column:   toCol,
          position,
          moved_by:    CURRENT_USER.display_name,
          timestamp:   new Date().toISOString(),
        },
      });
    } catch {
      dispatch({ type: 'ROLLBACK', payload: snapshot });
      addToast('Failed to move issue — change reverted.', 'error');
    }
  }, [state.columns, addToast]);

  // Optimistic reorder within a column
  const dispatchReorder = useCallback(async (colId: string, fromIndex: number, toIndex: number) => {
    const snapshot = state.columns;
    dispatch({ type: 'ISSUE_REORDERED', payload: { colId, fromIndex, toIndex } });
    try {
      // Find the issue at fromIndex and persist its new position
      const col   = state.columns.find(c => c.status === colId);
      const issue = col?.issues[fromIndex];
      if (issue) await updateIssue(issue.issue_id, { position: toIndex });
    } catch {
      dispatch({ type: 'ROLLBACK', payload: snapshot });
      addToast('Failed to reorder — change reverted.', 'error');
    }
  }, [state.columns, addToast]);

  // Optimistic create — show the card immediately with a temp id, replace on confirmation
  const dispatchCreate = useCallback(async (
    payload: Omit<Issue, 'issue_id' | 'created_at' | 'updated_at' | 'activity'>
  ) => {
    const now    = new Date().toISOString();
    const tempId = `TEMP-${Date.now()}`;
    const optimistic: Issue = {
      ...payload,
      issue_id:   tempId,
      created_at: now,
      updated_at: now,
      activity:   [],
    };
    // Show instantly
    dispatch({ type: 'ISSUE_CREATED', payload: optimistic });
    try {
      const confirmed = await createIssue(payload);
      // Swap temp card with the server-confirmed one
      dispatch({ type: 'ISSUE_DELETED', payload: tempId });
      dispatch({ type: 'ISSUE_CREATED', payload: confirmed });
      addToast(`Issue ${confirmed.issue_id} created`, 'success');
    } catch {
      dispatch({ type: 'ISSUE_DELETED', payload: tempId });
      addToast('Failed to create issue.', 'error');
    }
  }, [addToast]);

  // Optimistic update
  const dispatchUpdate = useCallback(async (issueId: string, changes: Partial<Issue>) => {
    const snapshot = state.columns;
    dispatch({ type: 'ISSUE_UPDATED', payload: { issueId, changes } });
    try {
      await updateIssue(issueId, changes);
    } catch {
      dispatch({ type: 'ROLLBACK', payload: snapshot });
      addToast('Failed to update issue — change reverted.', 'error');
    }
  }, [state.columns, addToast]);

  // Optimistic delete
  const dispatchDelete = useCallback(async (issueId: string) => {
    const snapshot = state.columns;
    dispatch({ type: 'ISSUE_DELETED', payload: issueId });
    try {
      await deleteIssue(issueId);
      addToast('Issue deleted', 'success');
    } catch {
      dispatch({ type: 'ROLLBACK', payload: snapshot });
      addToast('Failed to delete issue — change reverted.', 'error');
    }
  }, [state.columns, addToast]);

  return (
    <BoardContext.Provider value={{
      state,
      selectIssue,
      setSwimlane,
      dispatchMove,
      dispatchReorder,
      dispatchCreate,
      dispatchUpdate,
      dispatchDelete,
    }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard(): BoardContextValue {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used inside <BoardProvider>');
  return ctx;
}
