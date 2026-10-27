import { NavLink } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { NAV_ITEMS } from "../data/navItems.js";

export function Sidebar({ page, route, navigate, goBack, menuOpen, setMenuOpen }) {
  return (
    <aside className={"sidebar" + (menuOpen ? " sidebar--open" : "")}>
      <p className="sidebar__label">YOUR CAMPUS</p>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.key}
            to={"/" + item.key}
            className={({ isActive }) => "side-link" + (isActive ? " side-link--active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            <Icon size={16} /> {item.label}
          </NavLink>
        );
      })}

      <div className="side-card">
        <p className="side-card__title">Chitkara community</p>
        <p className="muted">Students and alumni can share, learn and connect.</p>
      </div>

      {route !== "home" && (
        <button className="side-link" onClick={goBack}>
          <ChevronLeft size={16} /> Back
        </button>
      )}
    </aside>
  );
}
