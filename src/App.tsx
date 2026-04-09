import { Suspense, lazy, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { FilterProvider } from "./context/FilterContext";
import { BoardProvider } from "./context/BoardContext";
import { SprintProvider } from "./context/SprintContext";

import AppLayout from "./components/Layout/AppLayout";
import KanbanBoard from "./components/Board/KanbanBoard";
import IssueModal from "./components/Issue/IssueModal";
import ToastContainer from "./components/common/Toast";
import Spinner from "./components/common/Spinner";
import { useBoard } from "./context/BoardContext";
import mockWebSocket from "./api/mockWebSocket";
import { useEffect } from "react";

// Lazy-loaded heavy panels
const IssueDetail = lazy(() => import("./components/Issue/IssueDetail"));
const BurndownChart = lazy(() => import("./components/Sprint/BurndownChart"));
const SprintCompletionModal = lazy(
  () => import("./components/Sprint/SprintCompletionModal"),
);
const BacklogView = lazy(() => import("./components/Sprint/BacklogView"));

// ── Board page
function BoardPage() {
  const { state, selectIssue } = useBoard();

  // Detect __new__<status> selection → open create modal
  const isCreating = state.selectedIssueId?.startsWith("__new__") ?? false;
  const defaultStatus = isCreating
    ? state.selectedIssueId!.replace("__new__", "")
    : "todo";

  return (
    <>
      <KanbanBoard />

      {/* Issue detail slide-in panel */}
      <Suspense fallback={null}>
        <IssueDetail />
      </Suspense>

      {/* Create issue modal */}
      {isCreating && (
        <IssueModal
          defaultStatus={defaultStatus}
          onClose={() => selectIssue(null)}
        />
      )}
    </>
  );
}

// ── Sprint page
function SprintPage() {
  const [showComplete, setShowComplete] = useState(false);
  // SprintContext is consumed inside BurndownChart and SprintHeader via useSprint
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
      }}
    >
      <Suspense fallback={<Spinner />}>
        <BurndownChart
          points={[
            { date: "2024-01-08", remaining: 26, ideal: 26 },
            { date: "2024-01-09", remaining: 24, ideal: 23.1 },
            { date: "2024-01-10", remaining: 22, ideal: 20.2 },
            { date: "2024-01-11", remaining: 21, ideal: 17.3 },
            { date: "2024-01-16", remaining: 15, ideal: 8.7 },
          ]}
        />
      </Suspense>
      {showComplete && (
        <Suspense fallback={null}>
          <SprintCompletionModal
            sprint={{
              sprint_id: "sprint_1",
              name: "Sprint 1",
              status: "active",
              start_date: "2024-01-08",
              end_date: "2024-01-22",
              goal: "",
              issues: [],
              burndown: [],
            }}
            onClose={() => setShowComplete(false)}
          />
        </Suspense>
      )}
      <button
        className="btn btn--secondary"
        style={{ alignSelf: "flex-start" }}
        onClick={() => setShowComplete(true)}
      >
        Complete Sprint…
      </button>
    </div>
  );
}

// ── Backlog page
function BacklogPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <BacklogView />
    </Suspense>
  );
}

// ── Redirect "/" → "/board" while keeping board content visible
function RootRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/board", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <BoardPage />;
}

// ── Root — connects WebSocket once
function AppRoot() {
  useEffect(() => {
    mockWebSocket.connect();
    return () => mockWebSocket.disconnect();
  }, []);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/backlog" element={<BacklogPage />} />
          <Route path="/sprint" element={<SprintPage />} />
        </Routes>
      </AppLayout>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FilterProvider>
            <BoardProvider>
              <SprintProvider>
                <AppRoot />
              </SprintProvider>
            </BoardProvider>
          </FilterProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
