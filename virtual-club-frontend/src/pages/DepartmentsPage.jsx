import { useCallback, useEffect, useState } from "react";
import { Building2, Edit3, Plus, Trash2, UserRoundCog, Users } from "lucide-react";
import { endpoints } from "../api/client";
import Modal from "../components/Modal";
import ImageUpload from "../components/ImageUpload";
import PageIntro from "../components/PageIntro";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "../components/Feedback";
import { useToast } from "../state/ToastContext";
import { errorMessage, initials } from "../lib/format";

const emptyDepartment = { name: "", slug: "", description: "", imageUrl: "", isActive: true };

export default function DepartmentsPage() {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [headsTarget, setHeadsTarget] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [form, setForm] = useState(null);
  const [headIds, setHeadIds] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [departmentResponse, userResponse] = await Promise.all([endpoints.departments.adminList(), endpoints.users.list({ limit: 100 })]);
      setDepartments(departmentResponse.data.departments);
      setUsers(userResponse.data.users.filter((user) => user.status === "active"));
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  function openEdit(department = null) {
    setEditing(department);
    setForm(department ? { name: department.name, slug: department.slug, description: department.description || "", imageUrl: department.imageUrl || "", isActive: department.isActive } : { ...emptyDepartment });
  }

  async function save(event) {
    event.preventDefault(); setBusy(true);
    try {
      if (editing) await endpoints.departments.update(editing._id, form); else await endpoints.departments.create({ name: form.name, slug: form.slug, description: form.description, imageUrl: form.imageUrl });
      showToast(editing ? "Department updated." : "Department created."); setEditing(null); setForm(null); await load();
    } catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusy(false); }
  }

  function openHeads(department) {
    setHeadsTarget(department);
    setHeadIds(department.heads?.map((head) => head._id) || []);
  }

  async function saveHeads() {
    setBusy(true);
    try { await endpoints.departments.heads(headsTarget._id, headIds); showToast("Department heads updated."); setHeadsTarget(null); await load(); }
    catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true);
    try { await endpoints.departments.remove(removing._id); showToast("Department removed."); setRemoving(null); await load(); }
    catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusy(false); }
  }

  return (
    <div className="workspace-page">
      <PageIntro eyebrow="Club structure" title="Departments" description="Keep departments active, clearly described, and assigned to accountable heads." actions={<button className="button button-primary" onClick={() => openEdit()}><Plus size={17} /> New department</button>} />
      {error ? <ErrorState message={error} onRetry={load} /> : loading ? <LoadingState rows={4} /> : departments.length ? (
        <section className="department-admin-grid">
          {departments.map((department, index) => <article className="department-admin-card" key={department._id}><div className="department-card-index">0{index + 1}</div><span className="department-admin-icon">{department.imageUrl ? <img className="department-admin-photo" src={department.imageUrl} alt="" /> : <Building2 size={21} />}</span><div><div className="department-title-line"><h3>{department.name}</h3><StatusBadge status={department.isActive ? "active" : "inactive"} /></div><p>{department.description || "No description added yet."}</p><span className="department-heads"><Users size={15} />{department.heads?.length ? department.heads.map((head) => head.fullName).join(", ") : "No department head"}</span></div><div className="department-card-actions"><button className="icon-button" title="Edit department" aria-label={`Edit ${department.name}`} onClick={() => openEdit(department)}><Edit3 size={17} /></button><button className="icon-button" title="Assign department heads" aria-label={`Assign heads for ${department.name}`} onClick={() => openHeads(department)}><UserRoundCog size={17} /></button><button className="icon-button content-delete-button" title="Delete department" aria-label={`Delete ${department.name}`} onClick={() => setRemoving(department)}><Trash2 size={17} /></button></div></article>)}
        </section>
      ) : <EmptyState icon={Building2} title="No departments yet" description="Create the first department to organize members and tasks." />}

      <Modal open={Boolean(form)} onClose={() => { setForm(null); setEditing(null); }} title={editing ? "Edit department" : "Create department"} eyebrow="Club structure">
        {form && <form className="stacked-form" onSubmit={save}><label className="field"><span>Name</span><input required minLength="2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, ...(!editing ? { slug: event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") } : {}) })} /></label><label className="field"><span>Slug</span><input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label><label className="field"><span>Description</span><textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><ImageUpload label="Department image from your computer" value={form.imageUrl} onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))} />{editing && <label className="toggle-field"><span><strong>Active department</strong><small>Inactive departments disappear from public and task forms.</small></span><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /></label>}<div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setForm(null)}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Saving..." : "Save department"}</button></div></form>}
      </Modal>
      <Modal open={Boolean(removing)} onClose={() => { if (!busy) setRemoving(null); }} title="Delete department" eyebrow="Confirm removal" size="small">
        {removing && <div className="delete-confirmation"><p>Delete <strong>{removing.name}</strong>? Departments with members, tasks, or applications must be set inactive instead.</p><div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setRemoving(null)} disabled={busy}>Cancel</button><button type="button" className="button button-danger" onClick={remove} disabled={busy}><Trash2 size={16} /> {busy ? "Removing..." : "Delete"}</button></div></div>}
      </Modal>

      <Modal open={Boolean(headsTarget)} onClose={() => setHeadsTarget(null)} title="Assign department heads" eyebrow={headsTarget?.name}>
        <div className="selection-list">{users.map((user) => <label className="selection-row" key={user._id}><input type="checkbox" checked={headIds.includes(user._id)} onChange={(event) => setHeadIds((current) => event.target.checked ? [...current, user._id] : current.filter((id) => id !== user._id))} /><span className="avatar">{initials(user.fullName)}</span><span><strong>{user.fullName}</strong><small>{user.email}</small></span></label>)}</div>
        <div className="modal-actions"><button className="button button-ghost" onClick={() => setHeadsTarget(null)}>Cancel</button><button className="button button-primary" disabled={busy} onClick={saveHeads}>Save heads</button></div>
      </Modal>
    </div>
  );
}
