import { useEffect, useState } from "react";
import { ScrollText, Search } from "lucide-react";
import { endpoints } from "../api/client";
import PageIntro from "../components/PageIntro";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import { errorMessage, formatDateTime, titleCase } from "../lib/format";

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => { endpoints.audit({ limit: 100 }).then((response) => setLogs(response.data.logs)).catch((requestError) => setError(errorMessage(requestError))).finally(() => setLoading(false)); }, []);
  const visible = logs.filter((log) => `${log.action} ${log.actor?.fullName || "system"} ${log.targetModel}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="workspace-page">
      <PageIntro eyebrow="Accountability" title="Audit trail" description="A read-only history of security-sensitive club actions and state changes." />
      <div className="filter-bar"><label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search actions or people" /></label><span className="result-count">Latest {visible.length}</span></div>
      {error ? <ErrorState message={error} /> : loading ? <LoadingState rows={8} /> : visible.length ? (
        <section className="audit-timeline">{visible.map((log) => <article className="audit-entry" key={log._id}><span className="audit-node" /><div className="audit-time"><strong>{formatDateTime(log.createdAt)}</strong><small>{log.ip || "Unknown IP"}</small></div><div><span className="audit-action">{titleCase(log.action.replaceAll(".", " "))}</span><h3>{log.actor?.fullName || "System process"}</h3><p>{log.targetModel} · {String(log.targetId || "No target").slice(-8)}</p></div>{log.changes && <details><summary>Changes</summary><pre>{JSON.stringify(log.changes, null, 2)}</pre></details>}</article>)}</section>
      ) : <EmptyState icon={ScrollText} title="No audit entries" description="Sensitive actions will create a trace here." />}
    </div>
  );
}
