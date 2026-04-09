# ProjectFlow — Kanban Board

Swiggy SDE-1 frontend take-home. A Jira-like board with drag-and-drop, real-time collaboration simulation, sprints, and a backlog.

## Setup

```bash
npm install
npm start        # http://localhost:3000
npm run build
```

No env vars needed. Everything is mocked in `src/api/`.

---

## Context Tree

```
ThemeProvider        — color tokens, light/dark
  ToastProvider      — notification queue
    AuthProvider     — current user, presence
      FilterProvider — search + filter state (synced to URL)
        BoardProvider  — columns, issues, optimistic mutations
          SprintProvider — active sprint, backlog
            AppRoot  — BrowserRouter, routes, WebSocket
```

## Data Flow

```
tokens.json       →  ThemeContext  →  CSS custom properties on <html>
mockData.ts       →  localStorage  →  *Api.ts (~300ms latency, 5% random fail)
*Api.ts           →  context actions  →  reducer  →  UI
mockWebSocket.ts  →  BoardContext  →  toast + reducer
```

Heavy components are lazy-loaded via Suspense — `IssueDetail`, `BurndownChart`, `BacklogView`, `SprintCompletionModal` — so they're excluded from the initial bundle.

---

## Board (`/board`)

Four columns: To Do, In Progress, In Review, Done. Drag cards between columns or reorder within a column. Click `+` on a column to create an issue pre-filled with that status.

**WIP limit:** each column has a progress bar. Dragging into a full column shows a confirm dialog before proceeding (Scenario 2 coverage). Bar goes orange at 80%, red at 100%.

**Swimlane grouping:** Header → Group dropdown → group by Assignee, Priority, or Epic.

## Issue Detail Panel

Slides in from the right. Everything is inline-editable — click a field, edit, blur/Enter to save. Comments support `Ctrl+Enter` to submit and `@mention` autocomplete. All changes are logged in the activity timeline below the comments.

## Search & Filters

Search bar does typeahead across titles and descriptions. Filter chips (Status, Priority, Type, Assignee) are combinable. All active filters are reflected in the URL so you can share a filtered board as a link. Navigating to a different route clears the filters.

## Sprint (`/sprint`)

Burndown chart drawn with plain SVG — no charting library. "Complete Sprint" opens a modal to select which issues carry over to the next sprint.

## Backlog (`/backlog`)

All issues without a sprint. Sortable by priority, title, or points. "→ Sprint" button moves an issue into the active sprint.

---

## Design Tokens

Colors live in `src/tokens.json`, split by theme. `ThemeContext` writes each one as a CSS custom property on `<html>`. Components use `var(--token)`. Theme switching is a single `setProperty` loop — no flash, no reload.

- Light mode: Jira-inspired (white surfaces, `#0065FF` blue)
- Dark mode: high-contrast (near-black surfaces, `#58A6FF` sky blue)

---

## API Layer

All API functions in `src/api/` read/write `localStorage` so the board survives a refresh. They return `Promise<T>` with ~300ms simulated latency.

> **Note: You may occasionally see a "failed" toast when moving cards or saving changes — this is intentional.** Write operations (move, create, update, delete) randomly fail ~5% of the time to demonstrate the optimistic rollback system. When a failure occurs, the UI automatically reverts to its previous state. Read operations (loading the board) never fail.

To swap in a real backend: replace the function bodies in `src/api/*.ts`. The contexts and components don't need to change.

## Mock WebSocket

A singleton in `src/api/mockWebSocket.ts` fires two timer-based events on connect:

- **3s:** `user_joined` — Alex Johnson appears in presence indicators
- **15s:** `issue_moved` — PROJ-105 moves to In Review, triggering a toast

That's why you see the "Alex moved..." toast after 15 seconds — it's intentional to demo real-time collaboration. To wire a real WebSocket, replace `connect()` with `new WebSocket(url)` and forward `onmessage` to `emit()`.

---

## Scenario Coverage

**Scenario 1 — Concurrent updates:** `BoardContext` subscribes to the WebSocket. Incoming `issue_moved` events patch column state without a reload and fire a toast naming the mover.

**Scenario 2 — WIP limit drag:** In `KanbanBoard.handleDragEnd`, dragging to a column at its limit shows a `window.confirm`. If dismissed, the drag is cancelled. If confirmed, the move goes through with a warning toast.

**Scenario 3 — Offline resilience:** `CommentSection` adds an optimistic comment with `is_pending: true` immediately. If the API call fails, the comment is removed and an error toast fires.

---

## Why Context + useReducer and not Redux/Zustand

Redux/Zustand is overkill for this scope and adds a dependency. Plain `useState` gives no audit trail and makes rollback awkward. `useReducer` per domain gives a predictable state machine, easy snapshot-based rollback, and zero extra dependencies. Each context is independently testable.

---

## What I'd Add With More Time

- Real WebSocket server (Socket.io) instead of the mock
- Drag issues from backlog directly into a sprint column on the board
- Label manager with a color picker
- Keyboard navigation on the board (arrow keys between cards)
- Unit tests for all reducers and hooks
- Virtualized column lists for boards with 100+ issues
