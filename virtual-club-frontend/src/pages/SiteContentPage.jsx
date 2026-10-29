import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, Edit3, ExternalLink, Plus, Trash2, UsersRound } from "lucide-react";
import { endpoints } from "../api/client";
import Modal from "../components/Modal";
import ImageUpload from "../components/ImageUpload";
import PageIntro from "../components/PageIntro";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import { useToast } from "../state/ToastContext";
import { errorMessage, titleCase } from "../lib/format";

const CONTENT_CONFIG = {
  leader: {
    icon: UsersRound,
    singular: "leader",
    fields: [
      { name: "roleTag", label: "Role label", placeholder: "President" },
      { name: "fullName", label: "Full name", required: true, minLength: 2, placeholder: "Full name" },
      { name: "subtitleRole", label: "Short role description", placeholder: "Club direction and scientific vision" },
      { name: "description", label: "Description", required: true, minLength: 10, full: true, multiline: true, placeholder: "What does this leader guide?" },
      { name: "imageUrl", label: "Photo from your computer", type: "image" },
      { name: "sortOrder", label: "Display order", type: "number", min: 0 },
    ],
    title: (item) => item.fullName,
    secondary: (item) => item.roleTag || item.subtitleRole || "Leadership profile",
  },
  achievement: {
    icon: Award,
    singular: "achievement",
    fields: [
      { name: "title", label: "Title", required: true, minLength: 2, placeholder: "Achievement title" },
      { name: "subtitle", label: "Subtitle", placeholder: "Competition, project, or milestone" },
      { name: "link", label: "Reference link", type: "url", placeholder: "https://..." },
      { name: "description", label: "Description", required: true, minLength: 10, full: true, multiline: true, placeholder: "Describe what the club accomplished." },
      { name: "imageUrl", label: "Image from your computer", type: "image" },
      { name: "sortOrder", label: "Display order", type: "number", min: 0 },
    ],
    title: (item) => item.title,
    secondary: (item) => item.subtitle || "Club milestone",
  },
};

function emptyForm(kind) {
  return CONTENT_CONFIG[kind].fields.reduce((form, field) => ({ ...form, [field.name]: field.type === "number" ? 0 : "" }), {});
}

function formFromItem(kind, item) {
  return CONTENT_CONFIG[kind].fields.reduce((form, field) => ({
    ...form,
    [field.name]: item[field.name] ?? (field.type === "number" ? 0 : ""),
  }), {});
}

function requestBody(kind, form) {
  const body = {};
  CONTENT_CONFIG[kind].fields.forEach((field) => {
    const value = form[field.name];
    if (field.name === "sortOrder") {
      body.sortOrder = Number.isFinite(Number(value)) ? Number(value) : 0;
    } else if (field.type === "image") {
      body[field.name] = value;
    } else if (typeof value === "string" && value.trim()) {
      body[field.name] = value.trim();
    }
  });
  return body;
}

export default function SiteContentPage({ kind, title, eyebrow, description }) {
  const config = CONTENT_CONFIG[kind];
  const Icon = config.icon;
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await endpoints.content.adminList(kind);
      setItems(response.data.items || []);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => { load(); }, [load]);

  const modalTitle = useMemo(
    () => `${editing ? "Edit" : "Add"} ${titleCase(config.singular)}`,
    [config.singular, editing]
  );

  function open(item = null) {
    setEditing(item);
    setForm(item ? formFromItem(kind, item) : emptyForm(kind));
  }

  function close() {
    setEditing(null);
    setForm(null);
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const body = requestBody(kind, form);
      if (editing) await endpoints.content.update(kind, editing._id, body);
      else await endpoints.content.create(kind, body);
      showToast(editing ? `${titleCase(config.singular)} updated.` : `${titleCase(config.singular)} added.`);
      close();
      await load();
    } catch (requestError) {
      showToast(errorMessage(requestError), "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await endpoints.content.remove(kind, removing._id);
      showToast(`${titleCase(config.singular)} removed.`);
      setRemoving(null);
      await load();
    } catch (requestError) {
      showToast(errorMessage(requestError), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="workspace-page">
      <PageIntro
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={<button className="button button-primary" onClick={() => open()}><Plus size={17} /> Add {config.singular}</button>}
      />

      {error ? <ErrorState message={error} onRetry={load} /> : loading ? <LoadingState rows={4} /> : items.length ? (
        <section className="content-admin-grid">
          {items.map((item, index) => (
            <article className="content-admin-card" key={item._id}>
              <div className="content-admin-visual">
                <img
                  src={item.imageUrl || "/assets/rocket.svg"}
                  alt=""
                  onError={(event) => { event.currentTarget.src = "/assets/rocket.svg"; }}
                />
                <span className="content-admin-order">0{index + 1}</span>
              </div>
              <div className="content-admin-copy">
                <span className="event-type">{config.secondary(item)}</span>
                <h3>{config.title(item)}</h3>
                <p>{item.description}</p>
                <div className="content-admin-meta">
                  <span>Display order: {item.sortOrder ?? 0}</span>
                  {item.link && <a href={item.link} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Reference</a>}
                </div>
                <div className="content-admin-actions">
                  <button className="button button-quiet button-small" onClick={() => open(item)}><Edit3 size={15} /> Edit {config.singular}</button>
                  <button className="icon-button content-delete-button" type="button" onClick={() => setRemoving(item)} aria-label={`Delete ${config.title(item)}`} title={`Delete ${config.singular}`}><Trash2 size={16} /></button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Icon}
          title={`No ${config.singular}s have been added`}
          description={`Add the first ${config.singular} to publish it on the official website.`}
          action={<button className="button button-primary" onClick={() => open()}><Plus size={16} /> Add {config.singular}</button>}
        />
      )}

      <Modal open={Boolean(form)} onClose={close} title={modalTitle} eyebrow={eyebrow} size="large">
        {form && (
          <form className="form-grid" onSubmit={save}>
            {config.fields.map((field) => (
              field.type === "image" ? <ImageUpload key={field.name} label={field.label} value={form[field.name]} onChange={(imageUrl) => setForm((current) => ({ ...current, [field.name]: imageUrl }))} /> : <label className={`field ${field.full ? "full-field" : ""}`} key={field.name}>
                <span>{field.label}</span>
                {field.multiline ? (
                  <textarea
                    required={field.required}
                    minLength={field.minLength}
                    rows="5"
                    value={form[field.name]}
                    onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    required={field.required}
                    minLength={field.minLength}
                    min={field.min}
                    type={field.type || "text"}
                    value={form[field.name]}
                    onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                    placeholder={field.placeholder}
                  />
                )}
              </label>
            ))}
            <div className="modal-actions full-field">
              <button type="button" className="button button-ghost" onClick={close}>Cancel</button>
              <button className="button button-primary" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : `Add ${config.singular}`}</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={Boolean(removing)} onClose={() => { if (!busy) setRemoving(null); }} title={`Delete ${titleCase(config.singular)}`} eyebrow="Confirm removal" size="small">
        {removing && (
          <div className="delete-confirmation">
            <p>Remove <strong>{config.title(removing)}</strong> from the official website? This cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" className="button button-ghost" onClick={() => setRemoving(null)} disabled={busy}>Cancel</button>
              <button type="button" className="button button-danger" onClick={remove} disabled={busy}><Trash2 size={16} /> {busy ? "Removing..." : "Delete"}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
