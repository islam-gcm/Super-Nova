import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, KeyRound, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { endpoints } from "../api/client";
import Brand from "../components/Brand";
import SceneBackdrop from "../components/SceneBackdrop";
import { errorMessage } from "../lib/format";
import { useAuth } from "../state/AuthContext";

export default function ActivatePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const token = params.get("token") || "";
  const checks = useMemo(() => [password.length >= 10, /[A-Z]/.test(password) && /[a-z]/.test(password), /\d/.test(password)], [password]);

  async function submit(event) {
    event.preventDefault();
    if (!token) return setError("This activation link is missing its invitation token.");
    if (!checks.every(Boolean)) return setError("Choose a password that meets all three requirements.");
    if (password !== confirm) return setError("The two passwords do not match.");
    setBusy(true);
    setError("");
    try {
      await endpoints.auth.activate({ token, password });
      await refresh();
      navigate("/workspace", { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page activation-page">
      <SceneBackdrop />
      <main className="activation-shell">
        <motion.div className="activation-brand" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}><Brand /></motion.div>
        <motion.section className="activation-panel" initial={{ opacity: 0, scale: 0.97, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
          <span className="activation-icon"><KeyRound size={27} /></span>
          <span className="eyebrow">Invitation accepted</span>
          <h1>Create your member access</h1>
          <p>Set the password you will use for your SuperNova workspace.</p>
          {!token && <div className="inline-error">Open the complete link from your acceptance email.</div>}
          <form onSubmit={submit} className="stacked-form">
            <label className="field"><span>New password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required /></label>
            <label className="field"><span>Confirm password</span><input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" required /></label>
            <div className="password-rules">
              {["10 or more characters", "Uppercase and lowercase letters", "At least one number"].map((label, index) => <span className={checks[index] ? "valid" : ""} key={label}><Check size={14} />{label}</span>)}
            </div>
            {error && <div className="inline-error" role="alert">{error}</div>}
            <button className="button button-primary button-wide" disabled={busy || !token}>{busy ? "Activating..." : "Activate account"}<ShieldCheck size={17} /></button>
          </form>
          <Link className="text-link" to="/login">Already activated? Log in <ArrowRight size={14} /></Link>
          <Link className="activation-privacy-link" to="/privacy">Privacy Policy</Link>
        </motion.section>
      </main>
    </div>
  );
}
