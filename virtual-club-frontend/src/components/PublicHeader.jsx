import { LogIn } from "lucide-react";
import { NavLink } from "react-router-dom";
import Brand from "./Brand";

export default function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-nav">
        <Brand />
        <div className="public-nav-actions">
          <NavLink className="button button-ghost login-link" to="/login"><LogIn size={17} /> Log in</NavLink>
        </div>
      </div>
    </header>
  );
}
