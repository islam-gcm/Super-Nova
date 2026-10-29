import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, ExternalLink, Search, XCircle } from "lucide-react";
import { endpoints } from "../api/client";
import Modal from "../components/Modal";
import PageIntro from "../components/PageIntro";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "../components/Feedback";
import { useToast } from "../state/ToastContext";
import { errorMessage, formatDateTime } from "../lib/format";

export default function ReviewsPage() {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [review, setReview] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { const response = await endpoints.assignments.list({ status: "submitted", limit: 100 }); setAssignments(response.data.assignments); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const visible = assignments.filter((assignment) => `${assignment.member?.fullName} ${assignment.task?.title}`.toLowerCase().includes(search.toLowerCase()));

  async function decide(decision) {
    setBusy(true);
    try {
      await endpoints.assignments.review(review._id, { decision, ...(note ? { note } : {}) });
      showToast(decision === "approved" ? "Submission approved and points awarded." : "Submission rejected and the task reopened.", decision === "approved" ? "success" : "info");
      setReview(null);
      setNote("");
      await load();
    } catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusy(false); }
  }

  return (
    <div className="workspace-page">
      <PageIntro eyebrow="Department operations" title="Review queue" description="Verify submitted work before points are awarded and tasks are completed." />
      <div className="filter-bar"><label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search member or task" /></label><span className="result-count">{visible.length} awaiting review</span></div>
      {error ? <ErrorState message={error} onRetry={load} /> : loading ? <LoadingState rows={5} /> : visible.length ? (
        <section className="review-list">
          {visible.map((assignment) => (
            <article className="review-row" key={assignment._id}>
              <div className="review-main"><StatusBadge status={assignment.status} /><h3>{assignment.task?.title}</h3><p>{assignment.submissionNote}</p><span>{assignment.member?.fullName} · {assignment.task?.department?.name || "All club"} · {formatDateTime(assignment.submittedAt)}</span></div>
              <div className="review-side"><strong>+{assignment.task?.points || 0} pts</strong>{assignment.submissionUrl && <a className="button button-quiet button-small" href={assignment.submissionUrl} target="_blank" rel="noreferrer">Open work <ExternalLink size={15} /></a>}<button className="button button-primary button-small" onClick={() => setReview(assignment)}>Review <ClipboardCheck size={15} /></button></div>
            </article>
          ))}
        </section>
      ) : <EmptyState icon={ClipboardCheck} title="The review queue is clear" description="New member submissions will appear here automatically." />}

      <Modal open={Boolean(review)} onClose={() => setReview(null)} title="Review submission" eyebrow={review?.task?.title}>
        {review && <div className="review-modal-copy"><span>Submitted by</span><strong>{review.member?.fullName}</strong><p>{review.submissionNote}</p>{review.submissionUrl && <a href={review.submissionUrl} target="_blank" rel="noreferrer">Open submitted work <ExternalLink size={15} /></a>}</div>}
        <label className="field"><span>Reviewer note (optional)</span><textarea rows="4" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add useful context for the member." /></label>
        <div className="modal-actions split-actions"><button className="button button-danger" disabled={busy} onClick={() => decide("rejected")}><XCircle size={16} /> Reject</button><button className="button button-primary" disabled={busy} onClick={() => decide("approved")}><CheckCircle2 size={16} /> Approve work</button></div>
      </Modal>
    </div>
  );
}
