import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { endpoints } from "../api/client";
import PageIntro from "../components/PageIntro";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import { useToast } from "../state/ToastContext";
import { errorMessage, formatDateTime, titleCase } from "../lib/format";

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try { const response = await endpoints.notifications.list({ limit: 100 }); setData(response.data); }
    catch (requestError) { setError(errorMessage(requestError)); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function read(notification) {
    if (notification.readAt) return;
    try { await endpoints.notifications.read(notification._id); setData((current) => ({ ...current, unread: Math.max(0, current.unread - 1), notifications: current.notifications.map((item) => item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item) })); }
    catch (requestError) { showToast(errorMessage(requestError), "error"); }
  }

  return (
    <div className="workspace-page">
      <PageIntro eyebrow="Signal inbox" title="Notifications" description="Task submissions, decisions, and review results arrive here." actions={data && <span className="unread-summary"><Bell size={16} />{data.unread} unread</span>} />
      {error ? <ErrorState message={error} onRetry={load} /> : !data ? <LoadingState rows={6} /> : data.notifications.length ? (
        <section className="notification-list">
          {data.notifications.map((notification) => <article className={`notification-row ${notification.readAt ? "" : "unread"}`} key={notification._id} onClick={() => read(notification)}><span className="notification-icon"><Bell size={18} /></span><div><span className="notification-type">{titleCase(notification.type)}</span><h3>{notification.title}</h3><p>{notification.message}</p><small>{formatDateTime(notification.createdAt)}</small></div>{notification.readAt ? <CheckCheck className="read-mark" size={18} /> : <span className="new-mark">New</span>}{notification.link && <Link to="/workspace/tasks" className="icon-button" onClick={(event) => event.stopPropagation()} aria-label="Open related tasks"><ExternalLink size={16} /></Link>}</article>)}
        </section>
      ) : <EmptyState icon={Bell} title="No signals yet" description="Your task and club notifications will collect here." />}
    </div>
  );
}
