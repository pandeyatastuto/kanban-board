import type { Comment } from '../types/issue';
import { getStoredBoard, saveStoredBoard } from './mockData';
import { CURRENT_USER } from './mockData';

const LATENCY = 250;

function fakeRequest<T>(data: T): Promise<T> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (Math.random() < 0.05) reject(new Error('Simulated network error'));
      else resolve(data);
    }, LATENCY)
  );
}

export async function addComment(issueId: string, body: string): Promise<Comment> {
  const board  = getStoredBoard();
  const now    = new Date().toISOString();
  const comment: Comment = {
    id:         `c-${Date.now()}`,
    author:     { user_id: CURRENT_USER.user_id, display_name: CURRENT_USER.display_name, avatar_url: CURRENT_USER.avatar_url },
    body,
    created_at: now,
  };

  for (const col of board.columns) {
    const issue = col.issues.find(i => i.issue_id === issueId);
    if (issue) {
      issue.comments.push(comment);
      issue.comment_count = issue.comments.length;
    }
  }

  saveStoredBoard(board);
  return fakeRequest(comment);
}

export async function deleteComment(issueId: string, commentId: string): Promise<void> {
  const board = getStoredBoard();
  for (const col of board.columns) {
    const issue = col.issues.find(i => i.issue_id === issueId);
    if (issue) {
      issue.comments = issue.comments.filter(c => c.id !== commentId);
      issue.comment_count = issue.comments.length;
    }
  }
  saveStoredBoard(board);
  return fakeRequest(undefined);
}
