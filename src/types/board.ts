import type { Issue, IssueStatus } from './issue';
import type { PresenceUser } from './user';

export interface Column {
  status:       IssueStatus;
  display_name: string;
  wip_limit:    number;
  issues:       Issue[];
}

export type SwimlaneGroupBy = 'none' | 'assignee' | 'priority' | 'epic';

export interface Board {
  board_id:     string;
  project_id:   string;
  view_type:    'kanban';
  columns:      Column[];
  active_users: PresenceUser[];
}
