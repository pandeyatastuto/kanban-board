import type { User } from '../types/user';
import { USERS, CURRENT_USER } from './mockData';

const LATENCY = 150;

function fakeRequest<T>(data: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), LATENCY));
}

export async function getUsers(): Promise<User[]> {
  return fakeRequest([...USERS]);
}

export async function getCurrentUser(): Promise<User> {
  return fakeRequest({ ...CURRENT_USER });
}

export async function searchUsers(query: string): Promise<User[]> {
  const q = query.toLowerCase();
  const results = USERS.filter(
    u => u.display_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );
  return fakeRequest(results);
}
