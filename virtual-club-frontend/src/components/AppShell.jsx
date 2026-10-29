import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileClock,
  Gauge,
  LogOut,
  Medal,
  Menu,
  MoreHorizontal,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import Brand from "./Brand";
import SceneBackdrop from "./SceneBackdrop";
import { initials, titleCase } from "../lib/format";

const coreItems = [
  { to: "/workspace", label: "Overview", icon: Gauge, end: true },
  { to: "/workspace/tasks", label: "Tasks", icon: BookOpenCheck },
  { to: "/workspace/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/workspace/notifications", label: "Notifications", icon: Bell },
];

const managementItems = [
  { to: "/workspace/reviews", label: "Review queue", icon: ClipboardCheck, roles: ["lead", "hr", "department_head"] },
  { to: "/workspace/applications", label: "Applications", icon: FileClock, roles: ["lead", "hr"] },
  { to: "/workspace/events", label: "Events", icon: CalendarDays, roles: ["lead", "hr"] },
  { to: "/workspace/departments", label: "Departments", icon: Building2, roles: ["lead", "hr"] },
  { to: "/workspace/leaders", label: "Leaders", icon: Users, roles: ["lead", "hr"] },
  { to: "/workspace/achievements", label: "Achievements", icon: Medal, roles: ["lead", "hr"] },
  { to: "/workspace/members", label: "Members", icon: Users, roles: ["lead", "hr"] },
  { to: "/workspace/audit", label: "Audit trail", icon: ScrollText, roles: ["lead", "hr"] },
];

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) => `shell-nav-link ${isActive ? "active" : ""}`}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={19} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

function MobileTab({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => `mobile-tab ${isActive ? "active" : ""}`}
    >
      <span className="mobile-tab-icon"><Icon size={20} strokeWidth={1.9} /></span>
      <small>{item.label === "Leaderboard" ? "Leaders" : item.label}</small>
    </NavLink>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const visibleManagement = useMemo(
    () => managementItems.filter((item) => item.roles.some((role) => user.roles.includes(role))),
    [user.roles]
  );
  const primaryRole = user.roles.includes("lead")
    ? "Club lead"
    : user.roles.includes("hr")
      ? "HR administrator"
      : user.roles.includes("department_head")
        ? "Department head"
        : "Club member";
  const currentLabel = [...coreItems, ...managementItems].find((item) => (
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  ))?.label || "Workspace";

  const sidebar = (
    <>
      <div className="shell-brand-row">
        <Brand compact={collapsed} to="/workspace" />
        <button
          className="icon-button sidebar-collapse"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
        <button className="icon-button mobile-sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X size={19} />
        </button>
      </div>
      <nav className="shell-nav" aria-label="Workspace navigation">
        {!collapsed && <span className="nav-group-label">Club space</span>}
        {coreItems.map((item) => <NavItem item={item} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} key={item.to} />)}
        {visibleManagement.length > 0 && (
          <>
            {!collapsed && <span className="nav-group-label nav-group-spaced">Manage</span>}
            {visibleManagement.map((item) => <NavItem item={item} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} key={item.to} />)}
          </>
        )}
      </nav>
      <div className="sidebar-foot">
        {!collapsed && (
          <div className="sidebar-signal">
            <span><i /> Club systems</span>
            <strong>Connected</strong>
          </div>
        )}
        <button className="shell-nav-link logout-link" onClick={logout} title={collapsed ? "Log out" : undefined}>
          <LogOut size={19} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className={`app-shell ${collapsed ? "sidebar-is-collapsed" : ""}`}>
      <SceneBackdrop subtle />
      <aside className="desktop-sidebar">{sidebar}</aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button className="mobile-shell-backdrop" aria-label="Close menu" onClick={() => setMobileOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="mobile-shell-sidebar" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 260 }}>
              <span className="mobile-sheet-handle" aria-hidden="true" />
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="shell-main">
        <header className="shell-topbar">
          <div className="topbar-title">
            <button className="icon-button shell-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open workspace menu"><Menu size={20} /></button>
            <div><span>SuperNova workspace</span><strong>{currentLabel}</strong></div>
          </div>
          <div className="topbar-side">
            <span className="term-chip"><Sparkles size={14} /> 2026 season</span>
            <NavLink className="topbar-notification" to="/workspace/notifications" aria-label="Open notifications"><Bell size={19} /></NavLink>
            <div className="user-summary">
              <span className="avatar">{initials(user.fullName)}</span>
              <span><strong>{user.fullName}</strong><small>{primaryRole}</small></span>
              {user.roles.includes("lead") || user.roles.includes("hr") ? <ShieldCheck className="admin-mark" size={16} /> : null}
            </div>
          </div>
        </header>
        <main className="workspace-content">
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>SuperNova Scientific Club</span>
          <NavLink to="/privacy">Privacy Policy</NavLink>
          <span>{titleCase(primaryRole)} · University of Boumerdes</span>
        </footer>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Primary workspace navigation">
        {coreItems.map((item) => <MobileTab item={item} key={item.to} />)}
        <button className={`mobile-tab mobile-more-tab ${mobileOpen ? "active" : ""}`} onClick={() => setMobileOpen(true)} aria-label="Open all workspace tools" aria-expanded={mobileOpen}>
          <span className="mobile-tab-icon"><MoreHorizontal size={21} strokeWidth={1.9} /></span>
          <small>More</small>
        </button>
      </nav>
    </div>
  );
}
