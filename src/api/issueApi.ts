import type { Issue } from '../types/issue';
import { getStoredBoard, saveStoredBoard } from './mockData';

const LATENCY = 280;

function fakeRequest<T>(data: T): Promise<T> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (Math.random() < 0.05) reject(new Error('Simulated network error'));
      else resolve(data);
    }, LATENCY)
  );
}

/** Find an issue across all columns and return it */
function findIssue(issueId: string): Issue | undefined {
  const board = getStoredBoard();
  for (const col of board.columns) {
    const found = col.issues.find(i => i.issue_id === issueId);
    if (found) return found;
  }
  return undefined;
}

export async function getIssue(issueId: string): Promise<Issue | null> {
  const issue = findIssue(issueId);
  return fakeRequest(issue ?? null);
}

export async function createIssue(payload: Omit<Issue, 'issue_id' | 'created_at' | 'updated_at' | 'activity'>): Promise<Issue> {
  const board = getStoredBoard();
  const now = new Date().toISOString();
  const newIssue: Issue = {
    ...payload,
    issue_id:  `PROJ-${Date.now().toString().slice(-5)}`,
    created_at: now,
    updated_at: now,
    activity: [
      {
        id:        `a-${Date.now()}`,
        user:      payload.assignee ?? { user_id: 'user_1', display_name: 'Jane Smith', avatar_url: '' },
        action:    'created this issue',
        timestamp: now,
      },
    ],
  };

  const col = board.columns.find(c => c.status === payload.status);
  if (col) col.issues.unshift(newIssue);
  saveStoredBoard(board);
  return fakeRequest(newIssue);
}

export async function updateIssue(issueId: string, changes: Partial<Issue>): Promise<Issue> {
  const board = getStoredBoard();
  let updated!: Issue;

  for (const col of board.columns) {
    const idx = col.issues.findIndex(i => i.issue_id === issueId);
    if (idx !== -1) {
      col.issues[idx] = { ...col.issues[idx], ...changes, updated_at: new Date().toISOString() };
      updated = col.issues[idx];
    }
  }

  saveStoredBoard(board);
  return fakeRequest(updated);
}

export async function deleteIssue(issueId: string): Promise<void> {
  const board = getStoredBoard();
  for (const col of board.columns) {
    col.issues = col.issues.filter(i => i.issue_id !== issueId);
  }
  saveStoredBoard(board);
  return fakeRequest(undefined);
}

/** Move an issue from one column to another at a given position */
export async function moveIssue(
  issueId: string,
  toColumn: string,
  position: number,
): Promise<void> {
  const board = getStoredBoard();
  let movedIssue: Issue | undefined;

  // Remove from source column
  for (const col of board.columns) {
    const idx = col.issues.findIndex(i => i.issue_id === issueId);
    if (idx !== -1) {
      [movedIssue] = col.issues.splice(idx, 1);
      break;
    }
  }

  if (!movedIssue) return fakeRequest(undefined);

  // Insert into destination column at position
  const dest = board.columns.find(c => c.status === toColumn);
  if (dest) {
    movedIssue.status = toColumn as Issue['status'];
    movedIssue.position = position;
    dest.issues.splice(position, 0, movedIssue);
  }

  saveStoredBoard(board);
  return fakeRequest(undefined);
}
