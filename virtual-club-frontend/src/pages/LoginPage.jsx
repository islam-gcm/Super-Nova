import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import SceneBackdrop from "../components/SceneBackdrop";
import { useAuth } from "../state/AuthContext";
import { errorMessage } from "../lib/format";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/workspace" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form);
      navigate(location.state?.from || "/workspace", { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <SceneBackdrop />
      <motion.div className="auth-planet-wrap" initial={{ opacity: 0, scale: 0.8, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.1 }}><img src="/assets/rocket.svg" alt="" /></motion.div>
      <main className="auth-layout">
        <motion.section className="auth-message" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <Brand />
          <span className="eyebrow">Member observatory</span>
          <h1>Welcome back to the club.</h1>
          <p>Check your tasks, join a project, review submissions, or prepare the next event.</p>
          <div className="auth-signal"><span className="live-dot" /> Secure connection to SuperNova</div>
        </motion.section>
        <motion.section className="auth-form-panel" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <span className="eyebrow">Sign in</span>
          <h2>Enter your workspace</h2>
          <p>Use the account created from your acceptance invitation.</p>
          <form onSubmit={submit} className="stacked-form">
            <label className="field"><span>Email address</span><div className="input-with-icon"><Mail size={17} /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required placeholder="member@supernova.dz" /></div></label>
            <label className="field"><span>Password</span><div className="input-with-icon"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" required placeholder="Your password" /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {error && <div className="inline-error" role="alert">{error}</div>}
            <button className="button button-primary button-wide" disabled={busy}>{busy ? "Checking credentials..." : "Log in"}<ArrowRight size={17} /></button>
          </form>
          <div className="auth-help"><span>Not a member yet?</span><Link to="/join">Send an application</Link></div>
          <div className="auth-privacy-link"><Link to="/privacy">Privacy Policy</Link></div>
        </motion.section>
      </main>
    </div>
  );
}
