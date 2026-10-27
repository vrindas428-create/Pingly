import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, Moon, Sun, Plus, Menu, X, LogIn, LogOut, Zap } from "lucide-react";
import { NAV_ITEMS } from "../data/navItems.js";
import { useAuth, useTheme } from "../context/AppProviders.jsx";
import { levelOf } from "../store/focusSlice.js";

export function Navbar({ page, navigate, search, setSearch, searchRef, menuOpen, setMenuOpen, onCreateClick }) {
  const { theme, toggleTheme } = useTheme();
  const xp = useSelector((st) => st.focus.xp);
  const { user, isLoggedIn, openLogin: onLoginClick, logout: onLogout } = useAuth();
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__mark">P</span>
        <div>
          <div className="brand__name">PINGLY</div>
          <div className="brand__sub">STUDENT COMMUNITY</div>
        </div>
      </div>

      <div className="search-box">
        <Search size={16} />
        <input
          ref={searchRef}
          placeholder="Search your campus... (press /)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (page !== "home") navigate("home");
          }}
        />
      </div>

      <nav className="top-links">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <NavLink key={item.key} to={"/" + item.key} className={({ isActive }) => "top-link" + (isActive ? " top-link--active" : "")}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="topbar__actions">
        <button className="xp-chip" onClick={() => navigate("tools/focus")} title="Your study XP — earn more with the Focus Timer" aria-label={`Level ${levelOf(xp)}, ${xp} XP`}>
          <Zap size={13} /> Lv {levelOf(xp)} · {xp} XP
        </button>

        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className="btn btn--primary" onClick={onCreateClick}>
          <Plus size={16} /> Create
        </button>

        {isLoggedIn ? (
          <div className="user-chip">
            <span className="user-chip__avatar">{user.name.slice(0, 2).toUpperCase()}</span>
            <span>{user.name}</span>
            <button className="icon-btn" onClick={onLogout} aria-label="Log out">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button className="btn btn--outline" onClick={onLoginClick}>
            <LogIn size={16} /> Log in
          </button>
        )}

        <button className="icon-btn menu-btn" onClick={() => setMenuOpen((m) => !m)} aria-label="Toggle menu">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </header>
  );
}
