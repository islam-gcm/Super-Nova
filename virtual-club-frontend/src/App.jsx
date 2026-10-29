import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppShell from "./components/AppShell";
import { PageLoader } from "./components/Feedback";
import { useAuth } from "./state/AuthContext";
import JoinPage from "./pages/JoinPage";
import LoginPage from "./pages/LoginPage";
import ActivatePage from "./pages/ActivatePage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReviewsPage from "./pages/ReviewsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import EventsPage from "./pages/EventsPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import SiteContentPage from "./pages/SiteContentPage";
import MembersPage from "./pages/MembersPage";
import AuditPage from "./pages/AuditPage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPage from "./pages/PrivacyPage";

function ScrollManager() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);
  return null;
}

function ProtectedRoute() {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <AppShell />;
}

function RoleRoute({ roles, children }) {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? children : <Navigate to="/workspace" replace />;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate" element={<ActivatePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/workspace" element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="home" element={<Navigate to="/workspace" replace />} />
          <Route path="tasks/*" element={<TasksPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reviews" element={<RoleRoute roles={["lead", "hr", "department_head"]}><ReviewsPage /></RoleRoute>} />
          <Route path="applications" element={<RoleRoute roles={["lead", "hr"]}><ApplicationsPage /></RoleRoute>} />
          <Route path="events" element={<RoleRoute roles={["lead", "hr"]}><EventsPage /></RoleRoute>} />
          <Route path="departments" element={<RoleRoute roles={["lead", "hr"]}><DepartmentsPage /></RoleRoute>} />
          <Route path="leaders" element={<RoleRoute roles={["lead", "hr"]}><SiteContentPage kind="leader" title="Leaders" eyebrow="Public identity" description="Keep the leadership crew shown on the official site aligned with the club." /></RoleRoute>} />
          <Route path="achievements" element={<RoleRoute roles={["lead", "hr"]}><SiteContentPage kind="achievement" title="Achievements" eyebrow="Public identity" description="Publish the milestones and outcomes that represent SuperNova." /></RoleRoute>} />
          <Route path="members" element={<RoleRoute roles={["lead", "hr"]}><MembersPage /></RoleRoute>} />
          <Route path="audit" element={<RoleRoute roles={["lead", "hr"]}><AuditPage /></RoleRoute>} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
