import { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Thin adapter over React Router (HashRouter). The rest of the app keeps using
// navigate("profile/vrinda/github") and { page, param, sub }, but the URL, Back
// button, active links and nested routes are all handled by React Router now.
export function useRouter() {
  const { pathname } = useLocation();
  const rrNavigate = useNavigate();
  const route = decodeURIComponent(pathname.replace(/^\/+/, "")) || "home";
  const [page, param, sub] = route.split("/");

  const navigate = useCallback((path) => { rrNavigate("/" + path); window.scrollTo(0, 0); }, [rrNavigate]);
  const goBack = useCallback(() => rrNavigate(-1), [rrNavigate]);

  useEffect(() => { document.title = "Pingly — " + page; }, [page]);
  return { route, page, param, sub, navigate, goBack };
}
