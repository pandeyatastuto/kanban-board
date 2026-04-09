import type { Label } from '../types/issue';

const LATENCY = 150;

function fakeRequest<T>(data: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), LATENCY));
}

// In-memory label store (labels are shared across issues in a real app)
const LABELS: Label[] = [
  { id: 'l1', name: 'devops',      color: '#4A90D9' },
  { id: 'l2', name: 'testing',     color: '#57D9A3' },
  { id: 'l3', name: 'design',      color: '#FF8B00' },
  { id: 'l4', name: 'security',    color: '#DE350B' },
  { id: 'l5', name: 'performance', color: '#6554C0' },
  { id: 'l6', name: 'frontend',    color: '#00B8D9' },
  { id: 'l7', name: 'backend',     color: '#36B37E' },
];

export async function getLabels(): Promise<Label[]> {
  return fakeRequest([...LABELS]);
}

export async function createLabel(name: string, color: string): Promise<Label> {
  const label: Label = { id: `l-${Date.now()}`, name, color };
  LABELS.push(label);
  return fakeRequest(label);
}
