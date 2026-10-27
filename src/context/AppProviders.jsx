import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { LoginModal } from "../components/LoginModal.jsx";
import { Modal } from "../components/Modal.jsx";

// Global state that many components need lives in Context (theme, toasts,
// auth). State used by one component (form fields, open/closed) stays local.
const ThemeCtx = createContext(null);
const ToastCtx = createContext(null);
const AuthCtx = createContext(null);
const ConfirmCtx = createContext(null);
export const useTheme = () => useContext(ThemeCtx);
export const useToast = () => useContext(ToastCtx);
export const useAuth = () => useContext(AuthCtx);
export const useConfirm = () => useContext(ConfirmCtx);

export function ThemeProvider({ children }) {
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [theme, setTheme] = useLocalStorage("pingly:v2:theme", prefersDark ? "dark" : "light");
  const toggleTheme = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), [setTheme]);
  return <ThemeCtx.Provider value={{ theme, toggleTheme }}>{children}</ThemeCtx.Provider>;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, type = "info") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  useEffect(() => {
    const onFull = () => toast("Storage is full — that change may not survive a refresh. Try a smaller image.", "error");
    window.addEventListener("pingly:storage-error", onFull);
    return () => window.removeEventListener("pingly:storage-error", onFull);
  }, [toast]);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={"toast toast--" + t.type}>{t.message}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
function nameFromEmail(local) {
  const m = local.match(/^([^\d]+?)\d{4}/);
  return titleCase((m ? m[1] : local).replace(/[._]+/g, " ").trim() || local);
}

// UI-only auth: nothing is verified server-side, but the session now persists.
export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage("pingly:v2:user", null);
  const [showLogin, setShowLogin] = useState(false);
  const toast = useToast();

  const login = useCallback((email, name, linkedin = "") => {
    const e = email.trim();
    const u = { email: e, name: (name && name.trim()) || nameFromEmail(e.split("@")[0]), linkedin };
    setUser(u);
    toast(`Welcome, ${u.name}!`, "success");
  }, [setUser, toast]);
  const updateProfile = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), [setUser]);
  const logout = useCallback(() => { setUser(null); toast("Logged out."); }, [setUser, toast]);
  const openLogin = useCallback(() => setShowLogin(true), []);
  const requireLogin = useCallback((why = "do that") => {
    if (user) return true;
    toast(`Log in to ${why}.`);
    setShowLogin(true);
    return false;
  }, [user, toast]);

  const value = useMemo(() => ({ user, isLoggedIn: !!user, login, logout, updateProfile, openLogin, requireLogin }), [user, login, logout, updateProfile, openLogin, requireLogin]);
  return (
    <AuthCtx.Provider value={value}>
      {children}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={login} />}
    </AuthCtx.Provider>
  );
}

// Promise-based confirm dialog available anywhere via useConfirm():
//   if (await confirm({ title: "Delete comment?", message: "...", confirmLabel: "Delete" })) ...
// It replaces window.confirm so destructive actions look and behave like the rest of the app.
export function ConfirmProvider({ children }) {
  const [req, setReq] = useState(null);
  const confirm = useCallback((opts) => new Promise((resolve) => setReq({ ...opts, resolve })), []);
  const answer = (value) => { req.resolve(value); setReq(null); };
  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {req && (
        <Modal title={req.title || "Are you sure?"} onClose={() => answer(false)}>
          {req.message && <p className="muted" style={{ marginBottom: 16 }}>{req.message}</p>}
          <div className="confirm-actions">
            <button className="btn btn--outline" onClick={() => answer(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={() => answer(true)}>{req.confirmLabel || "Confirm"}</button>
          </div>
        </Modal>
      )}
    </ConfirmCtx.Provider>
  );
}
