import { NavLink, Outlet } from "react-router-dom";
import { Gauge, Timer, CloudSun, BookOpen } from "lucide-react";
import { PageHeader } from "../../components/PageHeader.jsx";

const TABS = [
  { to: "attendance", label: "Attendance", icon: Gauge },
  { to: "focus", label: "Focus Timer", icon: Timer },
  { to: "pulse", label: "Campus Pulse", icon: CloudSun },
  { to: "books", label: "Book Finder", icon: BookOpen },
];

// Layout route: this component stays mounted while the nested child route
// (rendered by <Outlet />) changes — /tools/attendance, /tools/focus, ...
export function ToolsLayout() {
  return (
    <div>
      <PageHeader eyebrow="STUDY TOOLS //" title="Study Tools" sub="Track attendance, focus with a timer and pull live campus data." />
      <nav className="tl-tabs" aria-label="Study tools">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={`/tools/${to}`} className={({ isActive }) => "tl-tab" + (isActive ? " tl-tab--active" : "")}>
            <Icon size={15} /> {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
