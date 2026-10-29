import { motion } from "motion/react";
import { Inbox, RefreshCw } from "lucide-react";
import SceneBackdrop from "./SceneBackdrop";

export function LoadingState({ rows = 3, label = "Loading" }) {
  return (
    <div className="loading-state" role="status">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-row" key={index} style={{ "--delay": `${index * 90}ms` }}>
          <span className="skeleton-block skeleton-icon" />
          <span className="skeleton-copy"><i /><i /></span>
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-busy="true">
      <span className="sr-only">Loading the SuperNova workspace</span>
      <SceneBackdrop subtle />
      <aside className="page-loader-sidebar" aria-hidden="true">
        <div className="page-loader-brand"><i /><span><b /><b /></span></div>
        <div className="page-loader-nav">
          {Array.from({ length: 7 }, (_, index) => <span key={index}><i /><b /></span>)}
        </div>
      </aside>
      <main className="page-loader-main" aria-hidden="true">
        <div className="page-loader-topbar"><i /><span /><span /></div>
        <div className="page-loader-content">
          <div className="page-loader-heading"><i /><b /><span /></div>
          <div className="page-loader-action" />
          <div className="page-loader-metrics">
            {Array.from({ length: 4 }, (_, index) => <span key={index}><i /><b /><small /></span>)}
          </div>
          <div className="page-loader-panel"><i /><b /><span /><span /></div>
        </div>
      </main>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <motion.div className="empty-state" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <span className="empty-icon"><Icon size={23} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </motion.div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <p>{message}</p>
      {onRetry && <button className="button button-secondary button-small" onClick={onRetry}><RefreshCw size={15} /> Retry</button>}
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{String(status).replaceAll("_", " ")}</span>;
}
