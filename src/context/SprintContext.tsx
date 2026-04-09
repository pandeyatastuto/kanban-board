/**
 * SprintContext — active sprint, backlog list, sprint operations.
 */
import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import type { Sprint } from '../types/sprint';
import type { Issue } from '../types/issue';
import {
  getSprints,
  getBacklog,
  addIssueToSprint,
  removeIssueFromSprint,
  completeSprint,
} from '../api/sprintApi';
import { useToast } from './ToastContext';

interface SprintState {
  sprints:  Sprint[];
  backlog:  Issue[];
  loading:  boolean;
}

type Action =
  | { type: 'LOADED';            sprints: Sprint[]; backlog: Issue[] }
  | { type: 'ISSUE_TO_SPRINT';   issueId: string; sprintId: string }
  | { type: 'ISSUE_TO_BACKLOG';  issueId: string }
  | { type: 'SPRINT_COMPLETED';  sprintId: string };

function reducer(state: SprintState, action: Action): SprintState {
  switch (action.type) {
    case 'LOADED':
      return { ...state, loading: false, sprints: action.sprints, backlog: action.backlog };

    case 'ISSUE_TO_SPRINT':
      return {
        ...state,
        backlog: state.backlog.filter(i => i.issue_id !== action.issueId),
      };

    case 'ISSUE_TO_BACKLOG':
      return {
        ...state,
        sprints: state.sprints.map(s => ({
          ...s,
          issues: s.issues.filter(i => i.issue_id !== action.issueId),
        })),
      };

    case 'SPRINT_COMPLETED':
      return {
        ...state,
        sprints: state.sprints.map(s =>
          s.sprint_id === action.sprintId ? { ...s, status: 'completed' } : s
        ),
      };

    default:
      return state;
  }
}

interface SprintContextValue {
  state:                SprintState;
  activeSprint:         Sprint | null;
  moveToSprint:         (issueId: string, sprintId: string) => Promise<void>;
  moveToBacklog:        (issueId: string) => Promise<void>;
  finishSprint:         (sprintId: string, carryOver: string[], nextSprintId: string | null) => Promise<void>;
}

const SprintContext = createContext<SprintContextValue | null>(null);

export function SprintProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast();
  const [state, dispatch] = useReducer(reducer, { sprints: [], backlog: [], loading: true });

  useEffect(() => {
    Promise.all([getSprints(), getBacklog()])
      .then(([sprints, backlog]) => dispatch({ type: 'LOADED', sprints, backlog }))
      .catch(() => addToast('Failed to load sprint data', 'error'));
  }, [addToast]);

  const activeSprint = state.sprints.find(s => s.status === 'active') ?? null;

  const moveToSprint = useCallback(async (issueId: string, sprintId: string) => {
    dispatch({ type: 'ISSUE_TO_SPRINT', issueId, sprintId });
    try {
      await addIssueToSprint(issueId, sprintId);
    } catch {
      addToast('Failed to add issue to sprint', 'error');
    }
  }, [addToast]);

  const moveToBacklog = useCallback(async (issueId: string) => {
    dispatch({ type: 'ISSUE_TO_BACKLOG', issueId });
    try {
      await removeIssueFromSprint(issueId);
    } catch {
      addToast('Failed to move issue to backlog', 'error');
    }
  }, [addToast]);

  const finishSprint = useCallback(async (
    sprintId: string,
    carryOver: string[],
    nextSprintId: string | null,
  ) => {
    dispatch({ type: 'SPRINT_COMPLETED', sprintId });
    try {
      await completeSprint(sprintId, carryOver, nextSprintId);
      addToast('Sprint completed!', 'success');
    } catch {
      addToast('Failed to complete sprint', 'error');
    }
  }, [addToast]);

  return (
    <SprintContext.Provider value={{ state, activeSprint, moveToSprint, moveToBacklog, finishSprint }}>
      {children}
    </SprintContext.Provider>
  );
}

export function useSprint(): SprintContextValue {
  const ctx = useContext(SprintContext);
  if (!ctx) throw new Error('useSprint must be used inside <SprintProvider>');
  return ctx;
}
