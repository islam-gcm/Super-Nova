import { ArrowLeft, Home, RadioTower } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SceneBackdrop from "../components/SceneBackdrop";
import { useAuth } from "../state/AuthContext";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const destination = user ? "/workspace" : "/login";

  return (
    <main className="not-found-page">
      <SceneBackdrop />
      <img className="not-found-planet" src="/assets/rocket.svg" alt="" aria-hidden="true" />
      <Link className="not-found-brand" to={destination}>
        <img src="/assets/logo-nova.svg" alt="" />
        <span><strong>SUPERNOVA</strong><small>Scientific Club</small></span>
      </Link>
      <section className="not-found-content" aria-labelledby="not-found-title">
        <div className="not-found-signal"><RadioTower size={15} /><span>Navigation signal lost</span></div>
        <div className="not-found-code" aria-hidden="true">404</div>
        <h1 id="not-found-title">This coordinate is outside our map.</h1>
        <p>The page may have moved, or this link points beyond the current SuperNova orbit.</p>
        <div className="not-found-actions">
          <Link className="button button-primary" to={destination}><Home size={17} /> {user ? "Return to workspace" : "Log in"}</Link>
          <button className="button button-ghost" type="button" onClick={() => navigate(-1)}><ArrowLeft size={17} /> Go back</button>
        </div>
      </section>
      <div className="not-found-readout" aria-hidden="true"><span>SN / NAV</span><i /><span>NO SIGNAL</span></div>
    </main>
  );
}
