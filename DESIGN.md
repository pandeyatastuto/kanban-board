# Design Documentation

## Component Architecture

// Organized by feature, not by type — Board/, Issue/, Sprint/, Layout/, Search/
// Keeps related pieces together rather than splitting into containers/ and presentational/

// Heavy components lazy-loaded with React.lazy + Suspense (IssueDetail, BurndownChart,
// BacklogView, SprintCompletionModal) — keeps initial bundle small, first paint fast

// Layout wraps all routes — sidebar and header render once, only <main> swaps per route
// Avoids re-mounting navigation on every page change


## State Management

// Six React contexts, each owning a distinct slice:
//   BoardContext   — columns, issues, selected issue, swimlane grouping
//   FilterContext  — search text, filter values, saved presets
//   SprintContext  — active sprint, backlog, sprint lifecycle
//   ToastContext   — transient notifications
//   ThemeContext   — light/dark mode
//   AuthContext    — current user

// Context over Redux/Zustand — slices are independent, no shared store overhead needed
// Components only subscribe to what they use

// BoardContext uses useReducer internally — all mutations go through typed actions,
// making state changes explicit and easy to trace


## Trade-offs

// Optimistic updates over safe mutations
// Every write updates the UI immediately and rolls back on API failure
// Makes the board feel instant — trade-off is every mutation needs a rollback snapshot
// Mock API randomly fails ~5% to keep the rollback path exercised

// URL-synced filters
// Filter state syncs to URL search params via useUrlFilters hook
// Shareable and survives refresh — trade-off is careful two-way sync sequencing
// to avoid overwriting params on mount

// Mock API with localStorage persistence
// No backend — data lives in localStorage, API calls simulated with artificial latency
// Fast to build, self-contained demo — no real conflict resolution on the WebSocket side

// @dnd-kit over react-beautiful-dnd
// More flexible, actively maintained — gave full control over drag behavior
// including keyboard accessibility and WIP limit checks on drop
// Trade-off: more setup (sensors, collision detection, overlay) vs rbd's simpler API
