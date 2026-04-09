/**
 * Seed data — mirrors the Board State API Response from the spec.
 * localStorage is used so the board persists across page refreshes.
 */
import type { Board } from "../types/board";
import type { Sprint } from "../types/sprint";
import type { User } from "../types/user";

const BOARD_KEY = "pm_board";
const SPRINT_KEY = "pm_sprints";

// ── Static users ───────────────────────────────────────────────────────────
export const USERS: User[] = [
  {
    user_id: "user_1",
    display_name: "Jane Smith",
    avatar_url: "",
    email: "jane@example.com",
  },
  {
    user_id: "user_2",
    display_name: "Alex Johnson",
    avatar_url: "",
    email: "alex@example.com",
  },
  {
    user_id: "user_3",
    display_name: "Maria Garcia",
    avatar_url: "",
    email: "maria@example.com",
  },
  {
    user_id: "user_4",
    display_name: "Sam Lee",
    avatar_url: "",
    email: "sam@example.com",
  },
  {
    user_id: "user_5",
    display_name: "Priya Nair",
    avatar_url: "",
    email: "priya@example.com",
  },
];

export const CURRENT_USER: User = USERS[0];

// ── Initial board seed ─────────────────────────────────────────────────────
const INITIAL_BOARD: Board = {
  board_id: "board_xyz",
  project_id: "proj_abc",
  view_type: "kanban",
  active_users: [],
  columns: [
    {
      status: "todo",
      display_name: "To Do",
      wip_limit: 10,
      issues: [
        {
          issue_id: "PROJ-101",
          title: "Set up CI/CD pipeline",
          description:
            "Configure GitHub Actions for automated testing and deployment.",
          type: "task",
          priority: "medium",
          status: "todo",
          assignee: {
            user_id: "user_1",
            display_name: "Jane Smith",
            avatar_url: "",
          },
          story_points: 3,
          labels: [{ id: "l1", name: "devops", color: "#4A90D9" }],
          comment_count: 2,
          comments: [],
          epic: "Infrastructure",
          sprint_id: "sprint_1",
          position: 0,
          created_at: "2024-01-10T09:00:00Z",
          updated_at: "2024-01-10T09:00:00Z",
          activity: [
            {
              id: "a1",
              user: {
                user_id: "user_1",
                display_name: "Jane Smith",
                avatar_url: "",
              },
              action: "created this issue",
              timestamp: "2024-01-10T09:00:00Z",
            },
          ],
        },
        {
          issue_id: "PROJ-102",
          title: "Write unit tests for auth module",
          description: "Cover login, logout, and token refresh flows.",
          type: "task",
          priority: "high",
          status: "todo",
          assignee: {
            user_id: "user_2",
            display_name: "Alex Johnson",
            avatar_url: "",
          },
          story_points: 5,
          labels: [{ id: "l2", name: "testing", color: "#57D9A3" }],
          comment_count: 0,
          comments: [],
          epic: "Auth",
          sprint_id: "sprint_1",
          position: 1,
          created_at: "2024-01-11T10:00:00Z",
          updated_at: "2024-01-11T10:00:00Z",
          activity: [],
        },
        {
          issue_id: "PROJ-103",
          title: "Design onboarding flow wireframes",
          description: "Create low-fidelity wireframes for the new user onboarding experience.",
          type: "story",
          priority: "low",
          status: "todo",
          assignee: null,
          story_points: 2,
          labels: [{ id: "l3", name: "design", color: "#FF8B00" }],
          comment_count: 1,
          comments: [],
          epic: null,
          sprint_id: null,
          position: 2,
          created_at: "2024-01-12T08:00:00Z",
          updated_at: "2024-01-12T08:00:00Z",
          activity: [],
        },
        {
          issue_id: "PROJ-107",
          title: "Add pagination to issues list API",
          description: "Implement cursor-based pagination so the API does not return all issues at once.",
          type: "task",
          priority: "medium",
          status: "todo",
          assignee: null,
          story_points: 3,
          labels: [{ id: "l7", name: "backend", color: "#36B37E" }],
          comment_count: 0,
          comments: [],
          epic: null,
          sprint_id: null,
          position: 3,
          created_at: "2024-01-13T08:00:00Z",
          updated_at: "2024-01-13T08:00:00Z",
          activity: [],
        },
      ],
    },
    {
      status: "in_progress",
      display_name: "In Progress",
      wip_limit: 5,
      issues: [
        {
          issue_id: "PROJ-104",
          title: "Implement JWT token refresh",
          description: "Add silent refresh logic in the auth interceptor.",
          type: "task",
          priority: "critical",
          status: "in_progress",
          assignee: {
            user_id: "user_3",
            display_name: "Maria Garcia",
            avatar_url: "",
          },
          story_points: 8,
          labels: [
            { id: "l2", name: "testing", color: "#57D9A3" },
            { id: "l4", name: "security", color: "#DE350B" },
          ],
          comment_count: 3,
          comments: [],
          epic: "Auth",
          sprint_id: "sprint_1",
          position: 0,
          created_at: "2024-01-08T14:00:00Z",
          updated_at: "2024-01-14T11:00:00Z",
          activity: [
            {
              id: "a2",
              user: {
                user_id: "user_3",
                display_name: "Maria Garcia",
                avatar_url: "",
              },
              action: "changed status from **To Do** to **In Progress**",
              timestamp: "2024-01-14T11:00:00Z",
            },
          ],
        },
        {
          issue_id: "PROJ-105",
          title: "Fix N+1 query on dashboard endpoint",
          description: "Use eager loading for user relations.",
          type: "bug",
          priority: "high",
          status: "in_progress",
          assignee: {
            user_id: "user_4",
            display_name: "Sam Lee",
            avatar_url: "",
          },
          story_points: 3,
          labels: [{ id: "l5", name: "performance", color: "#6554C0" }],
          comment_count: 1,
          comments: [],
          epic: null,
          sprint_id: "sprint_1",
          position: 1,
          created_at: "2024-01-13T09:00:00Z",
          updated_at: "2024-01-15T08:00:00Z",
          activity: [],
        },
      ],
    },
    {
      status: "in_review",
      display_name: "In Review",
      wip_limit: 3,
      issues: [
        {
          issue_id: "PROJ-106",
          title: "Add dark mode support",
          description: "Implement CSS custom properties for theming.",
          type: "story",
          priority: "medium",
          status: "in_review",
          assignee: {
            user_id: "user_5",
            display_name: "Priya Nair",
            avatar_url: "",
          },
          story_points: 5,
          labels: [{ id: "l3", name: "design", color: "#FF8B00" }],
          comment_count: 4,
          comments: [],
          epic: "UI Polish",
          sprint_id: "sprint_1",
          position: 0,
          created_at: "2024-01-09T11:00:00Z",
          updated_at: "2024-01-16T09:00:00Z",
          activity: [],
        },
      ],
    },
    {
      status: "done",
      display_name: "Done",
      wip_limit: 999,
      issues: [
        {
          issue_id: "PROJ-100",
          title: "Initial project scaffolding",
          description: "Set up React + TypeScript with CRA.",
          type: "task",
          priority: "medium",
          status: "done",
          assignee: {
            user_id: "user_1",
            display_name: "Jane Smith",
            avatar_url: "",
          },
          story_points: 2,
          labels: [],
          comment_count: 0,
          comments: [],
          epic: "Infrastructure",
          sprint_id: "sprint_1",
          position: 0,
          created_at: "2024-01-05T10:00:00Z",
          updated_at: "2024-01-07T16:00:00Z",
          activity: [],
        },
      ],
    },
  ],
};

// ── Initial sprint seed ────────────────────────────────────────────────────
const INITIAL_SPRINTS: Sprint[] = [
  {
    sprint_id: "sprint_1",
    name: "Sprint 1",
    status: "active",
    start_date: "2024-01-08",
    end_date: "2024-01-22",
    goal: "Complete auth module and CI/CD setup",
    issues: [], // populated from board columns
    burndown: [
      { date: "2024-01-08", remaining: 26, ideal: 26 },
      { date: "2024-01-09", remaining: 24, ideal: 23.1 },
      { date: "2024-01-10", remaining: 22, ideal: 20.2 },
      { date: "2024-01-11", remaining: 21, ideal: 17.3 },
      { date: "2024-01-12", remaining: 19, ideal: 14.4 },
      { date: "2024-01-15", remaining: 17, ideal: 11.5 },
      { date: "2024-01-16", remaining: 15, ideal: 8.7 },
    ],
  },
  {
    sprint_id: "sprint_2",
    name: "Sprint 2",
    status: "planning",
    start_date: "2024-01-22",
    end_date: "2024-02-05",
    goal: "",
    issues: [],
    burndown: [],
  },
];

// ── localStorage helpers ───────────────────────────────────────────────────
export function getStoredBoard(): Board {
  try {
    const raw = localStorage.getItem(BOARD_KEY);
    return raw ? (JSON.parse(raw) as Board) : structuredClone(INITIAL_BOARD);
  } catch {
    return structuredClone(INITIAL_BOARD);
  }
}

export function saveStoredBoard(board: Board): void {
  localStorage.setItem(BOARD_KEY, JSON.stringify(board));
}

export function getStoredSprints(): Sprint[] {
  try {
    const raw = localStorage.getItem(SPRINT_KEY);
    return raw
      ? (JSON.parse(raw) as Sprint[])
      : structuredClone(INITIAL_SPRINTS);
  } catch {
    return structuredClone(INITIAL_SPRINTS);
  }
}

export function saveStoredSprints(sprints: Sprint[]): void {
  localStorage.setItem(SPRINT_KEY, JSON.stringify(sprints));
}

/** Reset to seed data — useful during development */
export function resetMockData(): void {
  localStorage.removeItem(BOARD_KEY);
  localStorage.removeItem(SPRINT_KEY);
}
