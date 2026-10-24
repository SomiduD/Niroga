import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/symptoms", label: "Symptom Checker" },
    { to: "/clinics", label: "Clinic Finder" },
    { to: "/firstaid", label: "First Aid & Guides" },
    { to: "/worker", label: "Health Worker" },
    { to: "/admin", label: "Dashboard" },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="Niroga Home">
          <img src="/niroga-logo.jpg" alt="Niroga Logo" className="brand-logo" />
          <span className="brand-name">Niroga</span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          id="nav-toggle-btn"
        >
          <span /><span /><span />
        </button>

        <ul className={`nav-links ${open ? "open" : ""}`} role="menubar">
          {links.map((l) => (
            <li key={l.to} role="none">
              <Link
                to={l.to}
                className={`nav-link ${loc.pathname === l.to ? "active" : ""}`}
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
