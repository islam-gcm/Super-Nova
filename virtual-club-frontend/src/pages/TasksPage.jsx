import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, Orbit, Plus, Search, Send } from "lucide-react";
import { endpoints } from "../api/client";
import Modal from "../components/Modal";
import PageIntro from "../components/PageIntro";
import TaskCard from "../components/TaskCard";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";
import { errorMessage } from "../lib/format";

const initialTask = { title: "", description: "", type: "department", departmentId: "", deadline: "", maxAssignees: 1, points: 10, notes: "" };

export default function TasksPage() {
  const { user, hasRole } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState(new Map());
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ status: "", type: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitTarget, setSubmitTarget] = useState(null);
  const [submission, setSubmission] = useState({ note: "", url: "" });
  const [taskForm, setTaskForm] = useState(initialTask);
  const canCreate = hasRole("lead", "hr", "department_head");
  const isPrivileged = hasRole("lead", "hr");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [taskResponse, dashboardResponse, departmentResponse] = await Promise.all([
        endpoints.tasks.list({ limit: 100, status: filters.status, type: filters.type }),
        endpoints.dashboard(),
        endpoints.departments.list(),
      ]);
      setTasks(taskResponse.data.tasks);
      setAssignments(new Map(dashboardResponse.data.activeAssignments.map((assignment) => [String(assignment.task._id), assignment])));
      setDepartments(departmentResponse.data.departments);
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, [filters.status, filters.type]);

  useEffect(() => { load(); }, [load]);

  const visibleTasks = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return search ? tasks.filter((task) => `${task.title} ${task.description} ${task.department?.name || ""}`.toLowerCase().includes(search)) : tasks;
  }, [tasks, filters.search]);

  async function perform(task, action, success) {
    setBusyId(task._id);
    try { await action(); showToast(success); await load(); }
    catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusyId(""); }
  }

  async function createTask(event) {
    event.preventDefault();
    setBusyId("create");
    try {
      await endpoints.tasks.create({
        ...taskForm,
        maxAssignees: Number(taskForm.maxAssignees),
        points: Number(taskForm.points),
        deadline: new Date(taskForm.deadline).toISOString(),
        ...(taskForm.type === "global" ? { departmentId: undefined } : {}),
      });
      showToast("Task published to the club workspace.");
      setCreateOpen(false);
      setTaskForm(initialTask);
      await load();
    } catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusyId(""); }
  }

  async function submitWork(event) {
    event.preventDefault();
    await perform(submitTarget, () => endpoints.tasks.submit(submitTarget._id, { note: submission.note, ...(submission.url ? { url: submission.url } : {}) }), "Work submitted for review.");
    setSubmitTarget(null);
    setSubmission({ note: "", url: "" });
  }

  const availableDepartments = isPrivileged ? departments : departments.filter((department) => user.departments.some((id) => String(id._id || id) === String(department._id)));

  return (
    <div className="workspace-page">
      <PageIntro eyebrow="Task exchange" title="Club tasks" description="Choose work that fits your availability, then keep the team updated through submission and review." actions={canCreate && <button className="button button-primary" onClick={() => setCreateOpen(true)}><Plus size={17} /> Publish task</button>} />
      <div className="filter-bar">
        <label className="search-field"><Search size={17} /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search tasks" /></label>
        <label><Filter size={16} /><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option><option value="open">Open</option><option value="filled">Filled</option><option value="in_progress">In progress</option><option value="submitted">Submitted</option><option value="completed">Completed</option></select></label>
        <label><Orbit size={16} /><select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="">All scopes</option><option value="global">All club</option><option value="department">Department</option></select></label>
        <span className="result-count">{visibleTasks.length} task{visibleTasks.length === 1 ? "" : "s"}</span>
      </div>
      {error ? <ErrorState message={error} onRetry={load} /> : loading ? <LoadingState rows={6} /> : visibleTasks.length ? (
        <div className="task-grid">
          {visibleTasks.map((task) => <TaskCard key={task._id} task={task} assignment={assignments.get(String(task._id))} busy={busyId === task._id} onClaim={(selected) => perform(selected, () => endpoints.tasks.claim(selected._id), `You claimed “${selected.title}”.`)} onLeave={(selected) => window.confirm("Leave this task and reopen your place?") && perform(selected, () => endpoints.tasks.leave(selected._id), "The task place is open again.")} onSubmit={(selected) => setSubmitTarget(selected)} />)}
        </div>
      ) : <EmptyState icon={Orbit} title="No tasks match this view" description="Change the filters, or check again when a new task is published." />}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Publish a task" eyebrow="New club work" size="large">
        <form className="form-grid" onSubmit={createTask}>
          <label className="field full-field"><span>Task title</span><input required minLength="3" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} /></label>
          <label className="field full-field"><span>Description</span><textarea required minLength="10" rows="4" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} /></label>
          <label className="field"><span>Scope</span><select value={taskForm.type} disabled={!isPrivileged} onChange={(event) => setTaskForm({ ...taskForm, type: event.target.value, departmentId: "" })}>{isPrivileged && <option value="global">All club</option>}<option value="department">Department</option></select></label>
          {taskForm.type === "department" && <label className="field"><span>Department</span><select required value={taskForm.departmentId} onChange={(event) => setTaskForm({ ...taskForm, departmentId: event.target.value })}><option value="">Choose department</option>{availableDepartments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}</select></label>}
          <label className="field"><span>Deadline</span><input type="datetime-local" required value={taskForm.deadline} onChange={(event) => setTaskForm({ ...taskForm, deadline: event.target.value })} /></label>
          <label className="field"><span>People needed</span><input type="number" min="1" max="100" required value={taskForm.maxAssignees} onChange={(event) => setTaskForm({ ...taskForm, maxAssignees: event.target.value })} /></label>
          <label className="field"><span>Points</span><input type="number" min="0" max="10000" required value={taskForm.points} onChange={(event) => setTaskForm({ ...taskForm, points: event.target.value })} /></label>
          <label className="field full-field"><span>Internal notes</span><textarea rows="3" value={taskForm.notes} onChange={(event) => setTaskForm({ ...taskForm, notes: event.target.value })} /></label>
          <div className="modal-actions full-field"><button type="button" className="button button-ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button className="button button-primary" disabled={busyId === "create"}>{busyId === "create" ? "Publishing..." : "Publish task"}</button></div>
        </form>
      </Modal>

      <Modal open={Boolean(submitTarget)} onClose={() => setSubmitTarget(null)} title="Submit your work" eyebrow={submitTarget?.title}>
        <form className="stacked-form" onSubmit={submitWork}>
          <label className="field"><span>Completion note</span><textarea required minLength="3" rows="5" value={submission.note} onChange={(event) => setSubmission({ ...submission, note: event.target.value })} /></label>
          <label className="field"><span>Work link (optional)</span><input type="url" value={submission.url} onChange={(event) => setSubmission({ ...submission, url: event.target.value })} /></label>
          <div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setSubmitTarget(null)}>Cancel</button><button className="button button-primary"><Send size={16} /> Submit</button></div>
        </form>
      </Modal>
    </div>
  );
}
