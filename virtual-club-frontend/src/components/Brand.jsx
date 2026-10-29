import { Link } from "react-router-dom";

export default function Brand({ compact = false, to = "/login" }) {
  return (
    <Link className={`brand ${compact ? "brand-compact" : ""}`} to={to} aria-label="SuperNova login">
      <img src="/assets/logo-nova.svg" alt="" />
      {!compact && (
        <span>
          <strong>SUPERNOVA</strong>
          <small>Scientific Club</small>
        </span>
      )}
    </Link>
  );
}
