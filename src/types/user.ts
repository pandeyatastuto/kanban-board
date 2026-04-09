export interface User {
  user_id: string;
  display_name: string;
  avatar_url: string;
  email: string;
}

/** Lightweight reference used inside issues and comments */
export interface Assignee {
  user_id: string;
  display_name: string;
  avatar_url: string;
}

/** Tracks who is currently viewing the board */
export interface PresenceUser {
  user_id: string;
  display_name: string;
  avatar_url: string;
  cursor_position: string; // issue_id they are looking at
  last_seen: string;       // ISO timestamp
}
