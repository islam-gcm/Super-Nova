import { useCallback, useEffect, useState } from "react";
import { Search, ShieldCheck, UserRoundCog, Users } from "lucide-react";
import { endpoints } from "../api/client";
import Modal from "../components/Modal";
import PageIntro from "../components/PageIntro";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "../components/Feedback";
import { useToast } from "../state/ToastContext";
import { errorMessage, initials, titleCase } from "../lib/format";

export default function MembersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ roles: [], departmentIds: [], status: "active" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [userResponse, departmentResponse] = await Promise.all([endpoints.users.list({ limit: 100 }), endpoints.departments.adminList()]);
      setUsers(userResponse.data.users); setDepartments(departmentResponse.data.departments.filter((department) => department.isActive));
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const visible = users.filter((user) => `${user.fullName} ${user.email} ${user.roles.join(" ")}`.toLowerCase().includes(search.toLowerCase()));

  function open(user) {
    setEditing(user);
    setForm({ roles: user.roles.filter((role) => role !== "department_head"), departmentIds: user.departments.map((department) => department._id), status: user.status === "invited" ? "active" : user.status });
  }

  function toggleRole(role) {
    setForm((current) => ({ ...current, roles: current.roles.includes(role) ? current.roles.filter((item) => item !== role) : [...current.roles, role] }));
  }

  async function save(event) {
    event.preventDefault();
    if (!form.roles.length) return showToast("Choose at least one access role.", "error");
    setBusy(true);
    try {
      await endpoints.users.update(editing._id, form);
      showToast("Member access updated."); setEditing(null); await load();
    } catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusy(false); }
  }

  return (
    <div className="workspace-page">
      <PageIntro eyebrow="Club directory" title="Members" description="Manage access, departments, and account status without exposing private credentials." />
      <div className="filter-bar"><label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members" /></label><span className="result-count">{visible.length} member{visible.length === 1 ? "" : "s"}</span></div>
      {error ? <ErrorState message={error} onRetry={load} /> : loading ? <LoadingState rows={7} /> : visible.length ? (
        <section className="members-table">
          <div className="table-head"><span>Member</span><span>Access</span><span>Departments</span><span>Contribution</span><span>Status</span><span /></div>
          {visible.map((user) => <div className="member-row" key={user._id}><span className="member-identity"><i>{initials(user.fullName)}</i><span><strong>{user.fullName}</strong><small>{user.email}</small></span></span><span className="role-stack">{user.roles.map((role) => <em key={role}>{titleCase(role)}</em>)}</span><span>{user.departments.length ? user.departments.map((department) => department.name).join(", ") : "Unassigned"}</span><span><strong>{user.points} pts</strong><small>{user.completedTasksCount} completed</small></span><StatusBadge status={user.status} /><button className="icon-button" onClick={() => open(user)} aria-label={`Edit ${user.fullName}`}><UserRoundCog size={17} /></button></div>)}
        </section>
      ) : <EmptyState icon={Users} title="No members found" description="Change the search or accept a new membership application." />}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit member access" eyebrow={editing?.fullName}>
        {editing && <form className="stacked-form" onSubmit={save}>
          <fieldset className="choice-fieldset"><legend>Roles</legend>{["member", "hr", "lead"].map((role) => <label className={`choice-tile ${form.roles.includes(role) ? "selected" : ""}`} key={role}><input type="checkbox" checked={form.roles.includes(role)} onChange={() => toggleRole(role)} /><ShieldCheck size={17} /><span><strong>{titleCase(role)}</strong><small>{role === "member" ? "Tasks and club dashboard" : role === "hr" ? "Applications and administration" : "Full club leadership access"}</small></span></label>)}{editing.roles.includes("department_head") && <p className="locked-role">Department head access is managed from the Departments page.</p>}</fieldset>
          <fieldset className="choice-fieldset"><legend>Departments</legend><div className="compact-check-grid">{departments.map((department) => <label key={department._id}><input type="checkbox" checked={form.departmentIds.includes(department._id)} onChange={(event) => setForm((current) => ({ ...current, departmentIds: event.target.checked ? [...current.departmentIds, department._id] : current.departmentIds.filter((id) => id !== department._id) }))} />{department.name}</label>)}</div></fieldset>
          {editing.status !== "invited" ? <label className="field"><span>Account status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="active">Active</option><option value="suspended">Suspended</option></select></label> : <p className="decision-email-note">This member must activate their own invitation before the account can become active.</p>}
          <div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="button button-primary" disabled={busy}>Save access</button></div>
        </form>}
      </Modal>
    </div>
  );
}
