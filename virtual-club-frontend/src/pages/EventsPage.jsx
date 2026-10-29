import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Edit3, MapPin, Plus, Trash2 } from "lucide-react";
import { endpoints } from "../api/client";
import Modal from "../components/Modal";
import ImageUpload from "../components/ImageUpload";
import PageIntro from "../components/PageIntro";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "../components/Feedback";
import { useToast } from "../state/ToastContext";
import { errorMessage, formatDateTime, titleCase, toLocalInput } from "../lib/format";

const emptyEvent = { title: "", slug: "", description: "", type: "workshop", startsAt: "", endsAt: "", location: "", status: "draft", coverImage: "" };

export default function EventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await endpoints.events.list(); setEvents(response.data.events); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  function open(event = null) {
    setEditing(event);
    setForm(event ? Object.fromEntries(Object.keys(emptyEvent).map((key) => [key, key === "startsAt" || key === "endsAt" ? toLocalInput(event[key]) : event[key] || ""])) : { ...emptyEvent });
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    const body = { ...form, startsAt: new Date(form.startsAt).toISOString(), ...(form.endsAt ? { endsAt: new Date(form.endsAt).toISOString() } : { endsAt: undefined }) };
    try {
      if (editing) await endpoints.events.update(editing._id, body); else await endpoints.events.create(body);
      showToast(editing ? "Event updated." : "Event added to the club calendar.");
      setEditing(null); setForm(null); await load();
    } catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusy(false); }
  }

  function titleChanged(value) {
    setForm((current) => ({ ...current, title: value, ...(!editing ? { slug: value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") } : {}) }));
  }

  async function remove() {
    setBusy(true);
    try {
      await endpoints.events.remove(removing._id);
      showToast("Event removed.");
      setRemoving(null);
      await load();
    } catch (requestError) { showToast(errorMessage(requestError), "error"); }
    finally { setBusy(false); }
  }

  return (
    <div className="workspace-page">
      <PageIntro eyebrow="Public programming" title="Events & workshops" description="Publish once here and the public homepage updates automatically." actions={<button className="button button-primary" onClick={() => open()}><Plus size={17} /> New event</button>} />
      {error ? <ErrorState message={error} onRetry={load} /> : loading ? <LoadingState rows={5} /> : events.length ? (
        <section className="admin-event-grid">
          {events.map((event) => <article className="admin-event-card" key={event._id}><div className="admin-event-visual"><img src={event.coverImage || "/assets/rocket.svg"} alt="" /><StatusBadge status={event.status} /></div><div><span className="event-type">{titleCase(event.type)}</span><h3>{event.title}</h3><p>{event.description}</p><div className="event-meta"><span><CalendarDays size={14} />{formatDateTime(event.startsAt)}</span><span><MapPin size={14} />{event.location || "No venue yet"}</span></div><div className="content-admin-actions"><button className="button button-quiet button-small" onClick={() => open(event)}><Edit3 size={15} /> Edit event</button><button className="icon-button content-delete-button" type="button" onClick={() => setRemoving(event)} aria-label={`Delete ${event.title}`} title="Delete event"><Trash2 size={16} /></button></div></div></article>)}
        </section>
      ) : <EmptyState icon={CalendarDays} title="No events have been created" description="Create a draft, then publish it when the details are ready." action={<button className="button button-primary" onClick={() => open()}><Plus size={16} /> Create event</button>} />}

      <Modal open={Boolean(form)} onClose={() => { setEditing(null); setForm(null); }} title={editing ? "Edit event" : "Create event"} eyebrow="Public calendar" size="large">
        {form && <form className="form-grid" onSubmit={save}>
          <label className="field"><span>Title</span><input required minLength="3" value={form.title} onChange={(event) => titleChanged(event.target.value)} /></label>
          <label className="field"><span>Slug</span><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase() })} /></label>
          <label className="field full-field"><span>Description</span><textarea required minLength="10" rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label className="field"><span>Type</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="workshop">Workshop</option><option value="event">Event</option><option value="announcement">Announcement</option></select></label>
          <label className="field"><span>Visibility</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
          <label className="field"><span>Starts</span><input type="datetime-local" required value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></label>
          <label className="field"><span>Ends (optional)</span><input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></label>
          <label className="field"><span>Location</span><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
          <ImageUpload label="Cover image from your computer" value={form.coverImage} onChange={(coverImage) => setForm((current) => ({ ...current, coverImage }))} />
          <div className="modal-actions full-field"><button type="button" className="button button-ghost" onClick={() => { setEditing(null); setForm(null); }}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Create event"}</button></div>
        </form>}
      </Modal>
      <Modal open={Boolean(removing)} onClose={() => { if (!busy) setRemoving(null); }} title="Delete event" eyebrow="Confirm removal" size="small">
        {removing && <div className="delete-confirmation"><p>Remove <strong>{removing.title}</strong> from the calendar? This cannot be undone.</p><div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setRemoving(null)} disabled={busy}>Cancel</button><button type="button" className="button button-danger" onClick={remove} disabled={busy}><Trash2 size={16} /> {busy ? "Removing..." : "Delete"}</button></div></div>}
      </Modal>
    </div>
  );
}
