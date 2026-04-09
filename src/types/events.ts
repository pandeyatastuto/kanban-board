import type { Issue } from './issue';

export type WSEventType =
  | 'issue_moved'
  | 'issue_updated'
  | 'issue_created'
  | 'issue_deleted'
  | 'user_joined'
  | 'user_left'
  | 'comment_added';

export interface IssueMovePayload {
  issue_id:    string;
  from_column: string;
  to_column:   string;
  position:    number;
  moved_by:    string; // display_name
  timestamp:   string;
}

export interface IssueUpdatePayload {
  issue_id:  string;
  changes:   Partial<Issue>;
  updated_by: string;
  timestamp:  string;
}

export interface UserPresencePayload {
  user_id:      string;
  display_name: string;
  avatar_url:   string;
  timestamp:    string;
}

export interface WSEvent {
  event_type: WSEventType;
  payload:    IssueMovePayload | IssueUpdatePayload | UserPresencePayload | Record<string, unknown>;
}
