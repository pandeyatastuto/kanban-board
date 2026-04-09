import type { Sprint } from '../types/sprint';
import type { Issue } from '../types/issue';
import { getStoredSprints, saveStoredSprints, getStoredBoard, saveStoredBoard } from './mockData';

const LATENCY = 300;

// Used for mutations — randomly fails ~5% to exercise optimistic rollback
function fakeRequest<T>(data: T): Promise<T> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (Math.random() < 0.05) reject(new Error('Simulated network error'));
      else resolve(data);
    }, LATENCY)
  );
}

// Used for initial reads — never fails so the app always loads cleanly
function fakeRead<T>(data: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), LATENCY));
}

export async function getSprints(): Promise<Sprint[]> {
  return fakeRead(getStoredSprints());
}

export async function getActiveSprint(): Promise<Sprint | null> {
  const sprints = getStoredSprints();
  return fakeRead(sprints.find(s => s.status === 'active') ?? null);
}

/** Move an issue from the backlog into a sprint */
export async function addIssueToSprint(issueId: string, sprintId: string): Promise<void> {
  const board = getStoredBoard();
  for (const col of board.columns) {
    const issue = col.issues.find(i => i.issue_id === issueId);
    if (issue) issue.sprint_id = sprintId;
  }
  saveStoredBoard(board);
  return fakeRequest(undefined);
}

/** Move an issue back to backlog */
export async function removeIssueFromSprint(issueId: string): Promise<void> {
  const board = getStoredBoard();
  for (const col of board.columns) {
    const issue = col.issues.find(i => i.issue_id === issueId);
    if (issue) issue.sprint_id = null;
  }
  saveStoredBoard(board);
  return fakeRequest(undefined);
}

/** Complete a sprint, optionally carrying unfinished issues to a new sprint */
export async function completeSprint(
  sprintId: string,
  carryOverIssueIds: string[],
  nextSprintId: string | null,
): Promise<void> {
  const sprints = getStoredSprints();
  const board   = getStoredBoard();

  const sprint = sprints.find(s => s.sprint_id === sprintId);
  if (sprint) sprint.status = 'completed';

  // Move carry-over issues to next sprint or backlog
  if (carryOverIssueIds.length > 0) {
    for (const col of board.columns) {
      for (const issue of col.issues) {
        if (carryOverIssueIds.includes(issue.issue_id)) {
          issue.sprint_id = nextSprintId;
          // Reset to todo if it wasn't done
          if (issue.status !== 'done') issue.status = 'todo';
        }
      }
    }
  }

  saveStoredSprints(sprints);
  saveStoredBoard(board);
  return fakeRequest(undefined);
}

/** Return all backlog issues (sprint_id === null) */
export async function getBacklog(): Promise<Issue[]> {
  const board = getStoredBoard();
  const backlogIssues = board.columns
    .flatMap(c => c.issues)
    .filter(i => i.sprint_id === null);
  return fakeRequest(backlogIssues);
}
