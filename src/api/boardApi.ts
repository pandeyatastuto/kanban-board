import type { Board } from '../types/board';
import { getStoredBoard, saveStoredBoard } from './mockData';

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

export async function getBoard(_boardId: string): Promise<Board> {
  const board = getStoredBoard();
  return fakeRead(board);
}

export async function saveBoard(board: Board): Promise<Board> {
  saveStoredBoard(board);
  return fakeRequest(board);
}
