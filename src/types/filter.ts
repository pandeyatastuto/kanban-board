import type { IssuePriority, IssueType } from './issue';

export interface FilterState {
  search:   string;
  status:   string[]; // dynamic — whatever statuses the board API returns
  priority: IssuePriority[];
  type:     IssueType[];
  assignee: string[];   // user_ids
  label:    string[];   // label names
  sprint:   string[];   // sprint_ids
}

export interface FilterPreset {
  id:      string;
  name:    string;
  filters: FilterState;
}

export const EMPTY_FILTERS: FilterState = {
  search:   '',
  status:   [],
  priority: [],
  type:     [],
  assignee: [],
  label:    [],
  sprint:   [],
};
