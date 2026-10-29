import { useCallback, useEffect, useState } from "react";
import { Check, FileClock, Mail, Phone, Search, X } from "lucide-react";
import { endpoints } from "../api/client";
import Modal from "../components/Modal";
import PageIntro from "../components/PageIntro";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "../components/Feedback";
import { useToast } from "../state/ToastContext";
import { errorMessage, formatDate } from "../lib/format";

export default function ApplicationsPage() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState({ decision: "accepted", departmentId: "", note: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [applicationResponse, departmentResponse] = await Promise.all([endpoints.applications.list({ status, limit: 100 }), endpoints.departments.list()]);
      setApplications(applicationResponse.data.applications);
      setDepartments(departmentResponse.data.departments);
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, [status]);
  useEffect(() => { load(); }, [load]);

  const visible = applications.filter((application) => `${application.fullName} ${application.email} ${application.fieldOfStudy}`.toLowerCase().includes(search.toLowerCase()));

  function openDecision(application, nextDecision) {
    setSelected(application);
    setDecision({ decision: nextDecision, departmentId: nextDecision === "accepted" ? application.preferredDepartment?._id || "" : "", note: "" });
  }

  async function submitDecision(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const body = {
        decision: decision.decision,
        ...(decision.note.trim() ? { note: decision.note.trim() } : {}),
        ...(decision.decision === "accepted" && decision.departmentId ? { departmentId: decision.departmentId } : {}),
      };
      const response = await endpoints.applications.decide(selected._id, body);
      showToast(`${selected.fullName}'s application was ${decision.decision}. ${response.data.emailDelivered ? "Email prepared." : "Email delivery needs attention."}`, response.data.emailDelivered ? "success" : "info");
      setSelected(null);
      await load();
    } catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusy(false); }
  }

  return (
    <div className="workspace-page">
      <PageIntro eyebrow="Membership intake" title="Applications" description="Review each applicant carefully, assign accepted members, and keep every decision traceable." />
      <div className="segmented-row">
        <div className="segmented-control">{["pending", "accepted", "rejected"].map((value) => <button className={status === value ? "active" : ""} onClick={() => setStatus(value)} key={value}>{value}</button>)}</div>
        <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applications" /></label>
      </div>
      {error ? <ErrorState message={error} onRetry={load} /> : loading ? <LoadingState rows={6} /> : visible.length ? (
        <section className="application-admin-list">
          {visible.map((application) => (
            <article className="application-row" key={application._id}>
              <div className="application-person"><span>{application.fullName.slice(0, 1)}</span><div><h3>{application.fullName}</h3><p>{application.fieldOfStudy} · {application.university || "University not supplied"}</p></div></div>
              <div className="application-contact"><span><Mail size={14} />{application.email}</span><span><Phone size={14} />{application.phone}</span></div>
              <div className="application-summary"><p>{application.motivation}</p><div>{application.interests?.map((interest) => <span key={interest}>{interest}</span>)}</div></div>
              <div className="application-meta"><StatusBadge status={application.status} /><span>Applied {formatDate(application.createdAt)}</span>{application.preferredDepartment && <strong>{application.preferredDepartment.name}</strong>}</div>
              {application.status === "pending" && <div className="application-actions"><button className="button button-danger button-small" onClick={() => openDecision(application, "rejected")}><X size={15} /> Reject</button><button className="button button-primary button-small" onClick={() => openDecision(application, "accepted")}><Check size={15} /> Accept</button></div>}
            </article>
          ))}
        </section>
      ) : <EmptyState icon={FileClock} title={`No ${status} applications`} description="Applications matching this decision state will appear here." />}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={`${decision.decision === "accepted" ? "Accept" : "Reject"} application`} eyebrow={selected?.fullName}>
        <form className="stacked-form" onSubmit={submitDecision}>
          {decision.decision === "accepted" && <label className="field"><span>Assign department</span><select required value={decision.departmentId} onChange={(event) => setDecision({ ...decision, departmentId: event.target.value })}><option value="">Choose a department</option>{departments.map((department) => <option value={department._id} key={department._id}>{department.name}</option>)}</select></label>}
          <label className="field"><span>Decision note (optional)</span><textarea rows="4" value={decision.note} onChange={(event) => setDecision({ ...decision, note: event.target.value })} placeholder="Internal context for this decision." /></label>
          <p className="decision-email-note">The applicant will receive the corresponding decision email after confirmation.</p>
          <div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setSelected(null)}>Cancel</button><button className={`button ${decision.decision === "accepted" ? "button-primary" : "button-danger"}`} disabled={busy}>{busy ? "Saving decision..." : `Confirm ${decision.decision}`}</button></div>
        </form>
      </Modal>
    </div>
  );
}
