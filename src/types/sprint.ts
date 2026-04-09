import type { Issue } from './issue';

export type SprintStatus = 'planning' | 'active' | 'completed';

export interface Sprint {
  sprint_id:    string;
  name:         string;
  status:       SprintStatus;
  start_date:   string; // ISO
  end_date:     string; // ISO
  goal:         string;
  issues:       Issue[];
  /** Points completed per day — used to draw the burndown chart */
  burndown:     BurndownPoint[];
}

export interface BurndownPoint {
  date:           string; // ISO date "2024-01-16"
  remaining:      number; // story points remaining
  ideal:          number; // ideal remaining on that day (linear interpolation)
}
