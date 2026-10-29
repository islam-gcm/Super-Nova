import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CircleCheck, Send, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { endpoints } from "../api/client";
import PublicHeader from "../components/PublicHeader";
import SceneBackdrop from "../components/SceneBackdrop";
import { errorMessage } from "../lib/format";

const steps = ["Your coordinates", "Your interests", "Your story"];
const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  fieldOfStudy: "",
  university: "University of Boumerdes",
  preferredDepartment: "",
  skills: "",
  interests: "",
  motivation: "",
};

export default function JoinPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([endpoints.registration.status(), endpoints.public.departments()])
      .then(([statusResponse, departmentResponse]) => {
        if (!active) return;
        setRegistration(statusResponse.data.registration);
        setDepartments(departmentResponse.data.departments);
      })
      .catch((requestError) => {
        if (active) setLoadError(errorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  function nextStep() {
    const required = step === 0
      ? ["fullName", "email", "phone", "fieldOfStudy"]
      : step === 1 ? ["preferredDepartment", "interests"] : ["motivation"];
    if (required.some((field) => !form[field].trim())) {
      setError("Complete the required fields before continuing.");
      return;
    }
    setError("");
    setStep((current) => Math.min(steps.length - 1, current + 1));
  }

  async function submit(event) {
    event.preventDefault();
    if (form.motivation.trim().length < 20) {
      setError("Tell us a little more. Your motivation should be at least 20 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await endpoints.public.apply({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        fieldOfStudy: form.fieldOfStudy.trim(),
        university: form.university.trim(),
        preferredDepartment: form.preferredDepartment,
        skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
        interests: form.interests.split(",").map((item) => item.trim()).filter(Boolean),
        motivation: form.motivation.trim(),
      });
      setSubmitted(true);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || loadError || !registration?.isOpen) {
    const title = loading
      ? "Preparing the application form."
      : loadError ? "Registration is temporarily unavailable." : "Registrations are currently closed.";
    const description = loading
      ? "Checking the current membership window and available departments."
      : loadError || `The next registration window opens ${registration.nextOpeningDate}.`;
    return (
      <div className="form-page">
        <SceneBackdrop />
        <PublicHeader />
        <motion.main className="success-panel" initial={{ opacity: 0, scale: 0.98, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
          <span className="success-orbit"><Sparkles size={34} /></span>
          <span className="eyebrow">SuperNova membership</span>
          <h1>{title}</h1>
          <p>{description}</p>
          {loadError
            ? <button className="button button-primary" type="button" onClick={() => window.location.reload()}>Try again</button>
            : !loading && <Link className="button button-primary" to="/login">Member login <ArrowRight size={17} /></Link>}
        </motion.main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="form-page">
        <SceneBackdrop />
        <PublicHeader />
        <motion.main className="success-panel" initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
          <span className="success-orbit"><CircleCheck size={34} /></span>
          <span className="eyebrow">Transmission received</span>
          <h1>Your application is now with the crew.</h1>
          <p>Lead and HR will review it. You will receive an email whether the decision is accepted or rejected.</p>
          <div className="success-reference"><span>Applicant</span><strong>{form.fullName}</strong><span>Email</span><strong>{form.email}</strong></div>
          <Link className="button button-primary" to="/login">Member login <ArrowRight size={17} /></Link>
        </motion.main>
      </div>
    );
  }

  return (
    <div className="form-page join-page">
      <SceneBackdrop />
      <PublicHeader />
      <main className="application-layout">
        <motion.aside className="application-aside" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <span className="eyebrow"><Sparkles size={14} /> Membership 2026</span>
          <h1>Find your place in our orbit.</h1>
          <p>We care about curiosity, reliability, and the energy you bring to a team. Tell us where you want to grow.</p>
          <ol className="application-steps">
            {steps.map((label, index) => (
              <li className={index === step ? "active" : index < step ? "complete" : ""} key={label}>
                <span>{index < step ? <Check size={15} /> : `0${index + 1}`}</span>
                <div><strong>{label}</strong><small>{index === 0 ? "Basics and contact" : index === 1 ? "Department and skills" : "Why SuperNova"}</small></div>
              </li>
            ))}
          </ol>
          <div className="privacy-note">Your application is visible only to authorized Lead and HR members. <Link to="/privacy">Read our Privacy Policy.</Link></div>
        </motion.aside>

        <motion.section className="application-form-shell" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="form-progress"><span style={{ width: `${progress}%` }} /></div>
          <div className="application-form-head"><span>Step {step + 1} of {steps.length}</span><h2>{steps[step]}</h2></div>
          <form onSubmit={submit}>
            <AnimatePresence mode="wait">
              <motion.div className="form-step" key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                {step === 0 && (
                  <div className="form-grid">
                    <label className="field full-field"><span>Full name *</span><input name="fullName" value={form.fullName} onChange={update} autoComplete="name" placeholder="Your first and last name" /></label>
                    <label className="field"><span>Email address *</span><input type="email" name="email" value={form.email} onChange={update} autoComplete="email" placeholder="you@example.com" /></label>
                    <label className="field"><span>Phone number *</span><input name="phone" value={form.phone} onChange={update} autoComplete="tel" placeholder="+213 ..." /></label>
                    <label className="field"><span>Field of study *</span><input name="fieldOfStudy" value={form.fieldOfStudy} onChange={update} placeholder="Physics, Biology, Computer Science..." /></label>
                    <label className="field"><span>University</span><input name="university" value={form.university} onChange={update} /></label>
                  </div>
                )}
                {step === 1 && (
                  <div className="form-grid">
                    <label className="field full-field"><span>Preferred department *</span><select name="preferredDepartment" value={form.preferredDepartment} onChange={update}><option value="">{departments.length ? "Choose a department" : "No departments are available"}</option>{departments.map((department) => <option value={department._id} key={department._id}>{department.name}</option>)}</select><small>HR can adjust the assignment during review.</small></label>
                    <label className="field full-field"><span>Scientific interests *</span><input name="interests" value={form.interests} onChange={update} placeholder="Astronomy, robotics, outreach" /><small>Separate several interests with commas.</small></label>
                    <label className="field full-field"><span>Skills you can share</span><input name="skills" value={form.skills} onChange={update} placeholder="Design, writing, Python, public speaking" /><small>Beginners are welcome. This helps us understand the team.</small></label>
                  </div>
                )}
                {step === 2 && (
                  <div className="form-grid">
                    <label className="field full-field"><span>Why do you want to join SuperNova? *</span><textarea name="motivation" value={form.motivation} onChange={update} rows="8" maxLength="3000" placeholder="Tell us what you want to learn, contribute, or explore with the club." /><small>{form.motivation.length}/3000 characters</small></label>
                    <div className="application-review full-field"><span>Application summary</span><strong>{form.fullName}</strong><p>{form.fieldOfStudy} · {departments.find((department) => department._id === form.preferredDepartment)?.name || "Department not selected"}</p></div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            {error && <div className="inline-error" role="alert">{error}</div>}
            <div className="form-navigation">
              {step > 0 ? <button type="button" className="button button-ghost" onClick={() => { setError(""); setStep((current) => current - 1); }}><ArrowLeft size={17} /> Back</button> : <span />}
              {step < steps.length - 1
                ? <button type="button" className="button button-primary" onClick={nextStep}>Continue <ArrowRight size={17} /></button>
                : <button className="button button-primary" disabled={submitting}>{submitting ? "Sending..." : "Send application"}<Send size={17} /></button>}
            </div>
          </form>
        </motion.section>
      </main>
    </div>
  );
}
