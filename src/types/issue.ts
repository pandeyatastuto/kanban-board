import type { Assignee } from './user';

export type IssueType     = 'task' | 'bug' | 'story' | 'epic' | 'subtask';
export type IssuePriority = 'critical' | 'high' | 'medium' | 'low';
// Kept as string so any statuses returned by the board API work without code changes
export type IssueStatus   = string;

export interface Label {
  id:    string;
  name:  string;
  color: string; // hex string e.g. "#4A90D9"
}

export interface ActivityEntry {
  id:        string;
  user:      Assignee;
  action:    string; // human-readable e.g. "changed status from To Do to In Progress"
  timestamp: string; // ISO
}

export interface Comment {
  id:         string;
  author:     Assignee;
  body:       string;           // plain text with @mention support
  created_at: string;
  /** true while the comment is queued offline and not yet confirmed by server */
  is_pending?: boolean;
}

export interface Issue {
  issue_id:      string;
  title:         string;
  description:   string;        // plain text / lightweight markdown
  type:          IssueType;
  priority:      IssuePriority;
  status:        IssueStatus;
  assignee:      Assignee | null;
  story_points:  number | null;
  labels:        Label[];
  comment_count: number;
  comments:      Comment[];
  epic:          string | null;
  sprint_id:     string | null; // null = backlog
  position:      number;        // ordering within column
  created_at:    string;
  updated_at:    string;
  activity:      ActivityEntry[];
}
