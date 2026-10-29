import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Bell, BookOpenCheck, CheckCircle2, DoorClosed, DoorOpen, Orbit, Sparkles, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { endpoints } from "../api/client";
import PageIntro from "../components/PageIntro";
import TaskCard from "../components/TaskCard";
import Modal from "../components/Modal";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";
import { errorMessage } from "../lib/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canManageRegistration = user.roles.includes("lead") || user.roles.includes("hr");
  const [data, setData] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [registrationError, setRegistrationError] = useState("");
  const [registrationBusy, setRegistrationBusy] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [submitTarget, setSubmitTarget] = useState(null);
  const [submission, setSubmission] = useState({ note: "", url: "" });

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await endpoints.dashboard();
      setData(response.data);
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadRegistration = useCallback(async () => {
    setRegistrationError("");
    try {
      const response = await endpoints.registration.status();
      setRegistration(response.data.registration);
    } catch (requestError) {
      setRegistrationError(errorMessage(requestError));
    }
  }, []);

  useEffect(() => {
    if (canManageRegistration) loadRegistration();
  }, [canManageRegistration, loadRegistration]);

  async function updateRegistration(nextIsOpen) {
    setRegistrationBusy(true);
    try {
      const response = await endpoints.registration.updateStatus(nextIsOpen);
      setRegistration(response.data.registration);
      showToast(nextIsOpen ? "Registrations are now open." : "Registrations are now closed.", nextIsOpen ? "success" : "info");
    } catch (requestError) {
      showToast(errorMessage(requestError), "error");
    } finally {
      setRegistrationBusy(false);
    }
  }

  const assignments = useMemo(() => new Map((data?.activeAssignments || []).map((item) => [String(item.task?._id), item])), [data]);
  const firstName = user.fullName.split(" ")[0];

  async function claim(task) {
    setBusyId(task._id);
    try {
      await endpoints.tasks.claim(task._id);
      showToast(`You claimed “${task.title}”.`);
      await load();
    } catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusyId(""); }
  }

  async function leave(task) {
    if (!window.confirm(`Leave “${task.title}” and reopen your place for another member?`)) return;
    setBusyId(task._id);
    try {
      await endpoints.tasks.leave(task._id);
      showToast("Your place is open for another member.", "info");
      await load();
    } catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusyId(""); }
  }

  async function submitWork(event) {
    event.preventDefault();
    setBusyId(submitTarget.task._id);
    try {
      await endpoints.tasks.submit(submitTarget.task._id, { note: submission.note, ...(submission.url ? { url: submission.url } : {}) });
      showToast("Work submitted to the review queue.");
      setSubmitTarget(null);
      setSubmission({ note: "", url: "" });
      await load();
    } catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusyId(""); }
  }

  const stats = [
    { label: "Total points", value: user.points || 0, icon: Trophy, tone: "gold" },
    { label: "Tasks completed", value: user.completedTasksCount || 0, icon: CheckCircle2, tone: "cyan" },
    { label: "In progress", value: data?.activeAssignments?.length || 0, icon: Target, tone: "pink" },
    { label: "Unread notices", value: data?.unreadNotifications || 0, icon: Bell, tone: "lavender" },
  ];

  return (
    <div className="workspace-page">
      <PageIntro eyebrow="Member observatory" title={`Good to see you, ${firstName}.`} description="Here is what is moving across your SuperNova orbit today." actions={<Link className="button button-primary" to="/workspace/tasks"><BookOpenCheck size={17} /> Browse all tasks</Link>} />
      {error ? <ErrorState message={error} onRetry={load} /> : !data ? <LoadingState rows={4} /> : (
        <>
          {canManageRegistration && (
            <section className="registration-control-card" aria-labelledby="registration-control-title">
              <div className="registration-control-copy">
                <div className="registration-control-heading">
                  <span className={`registration-control-status ${registration ? registration.isOpen ? "is-open" : "is-closed" : "is-loading"}`}>
                    <i /> {registration ? registration.isOpen ? "Open" : "Closed" : "Loading"}
                  </span>
                  {registration && <span className="registration-control-mode">{registration.mode === "manual" ? "Manual override" : "Schedule-controlled"}</span>}
                </div>
                <span className="eyebrow">Public intake</span>
                <h2 id="registration-control-title">Registration window</h2>
                <p>{registration ? registration.isOpen ? "New membership applications are being accepted from the official site." : "New membership applications are blocked until you open the window again." : "Checking the public registration status..."}</p>
                {registration && <small>{registration.mode === "manual" ? "An admin override is active until you change it here." : `Scheduled window: ${registration.windowText}`}</small>}
                {registrationError && <small className="registration-control-error">{registrationError}</small>}
              </div>
              <div className="registration-control-actions">
                <button className="button button-primary" onClick={() => updateRegistration(true)} disabled={registrationBusy || !registration || registration.isOpen === true}><DoorOpen size={17} /> Open registrations</button>
                <button className="button button-danger" onClick={() => updateRegistration(false)} disabled={registrationBusy || !registration || registration.isOpen === false}><DoorClosed size={17} /> Close registrations</button>
              </div>
            </section>
          )}
          <section className="metric-grid">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return <motion.article className={`metric-block metric-${stat.tone}`} key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}><span><Icon size={19} /></span><strong>{stat.value}</strong><small>{stat.label}</small></motion.article>;
            })}
          </section>

          {data.activeAssignments.length > 0 && (
            <section className="workspace-section">
              <div className="workspace-section-head"><div><span className="eyebrow">Your commitments</span><h2>Active assignments</h2></div><span className="section-count">{data.activeAssignments.length}</span></div>
              <div className="task-grid">
                {data.activeAssignments.map((assignment) => <TaskCard key={assignment._id} task={assignment.task} assignment={assignment} onLeave={leave} onSubmit={(task) => setSubmitTarget({ task, assignment })} busy={busyId === assignment.task._id} />)}
              </div>
            </section>
          )}

          <section className="workspace-section">
            <div className="workspace-section-head"><div><span className="eyebrow"><Sparkles size={13} /> Open now</span><h2>Tasks in your orbit</h2></div><Link to="/workspace/tasks">View all</Link></div>
            {data.availableTasks.length ? (
              <div className="task-grid">
                {data.availableTasks.slice(0, 6).map((task) => <TaskCard key={task._id} task={task} assignment={assignments.get(String(task._id))} onClaim={claim} onLeave={leave} onSubmit={(selectedTask, assignment) => setSubmitTarget({ task: selectedTask, assignment })} busy={busyId === task._id} />)}
              </div>
            ) : <EmptyState icon={Orbit} title="Your task orbit is clear" description="New global and department tasks will appear here when they are published." />}
          </section>
        </>
      )}

      <Modal open={Boolean(submitTarget)} onClose={() => setSubmitTarget(null)} title="Submit your work" eyebrow={submitTarget?.task.title}>
        <form className="stacked-form" onSubmit={submitWork}>
          <label className="field"><span>Completion note</span><textarea required minLength="3" rows="5" value={submission.note} onChange={(event) => setSubmission({ ...submission, note: event.target.value })} placeholder="Describe what you completed and anything the reviewer should know." /></label>
          <label className="field"><span>Work link (optional)</span><input type="url" value={submission.url} onChange={(event) => setSubmission({ ...submission, url: event.target.value })} placeholder="https://..." /></label>
          <div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setSubmitTarget(null)}>Cancel</button><button className="button button-primary" disabled={Boolean(busyId)}>Submit for review</button></div>
        </form>
      </Modal>
    </div>
  );
}
