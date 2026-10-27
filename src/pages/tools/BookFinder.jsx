import { useEffect, useState } from "react";
import { Search, ExternalLink, BookOpen } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce.js";
import { searchBooks } from "../../services/api.js";
import { EmptyState } from "../../components/EmptyState.jsx";

const PRESETS = ["Data Structures", "Operating Systems", "Machine Learning", "Java Programming", "Database Systems"];

export function BookFinder() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 500);
  const [state, setState] = useState({ status: "idle", results: [], error: "" });

  // Debounced search: waits 500 ms after typing stops, and ignores stale responses.
  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 3) { setState({ status: "idle", results: [], error: "" }); return; }
    let cancelled = false;
    setState((s) => ({ ...s, status: "loading", error: "" }));
    searchBooks(q)
      .then((results) => { if (!cancelled) setState({ status: "success", results, error: "" }); })
      .catch((e) => { if (!cancelled) setState({ status: "error", results: [], error: e.message }); });
    return () => { cancelled = true; };
  }, [debounced]);

  return (
    <div>
      <div className="card">
        <p className="eyebrow">TEXTBOOK FINDER //</p>
        <label className="tl-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a subject, title or author…" aria-label="Search books" /></label>
        <div className="plus-chips">{PRESETS.map((p) => <button key={p} className="chip" onClick={() => setQuery(p)}>{p}</button>)}</div>
        <p className="muted">Powered by the Open Library API. Type at least 3 characters.</p>
      </div>

      {state.status === "loading" && <EmptyState title="Searching the library…" hint="Fetching books from Open Library." />}
      {state.status === "error" && <div className="empty"><p className="empty__title">Search failed</p><p className="form-error">{state.error}</p><button className="btn btn--primary" onClick={() => setQuery((q) => q + " ")}>Try again</button></div>}
      {state.status === "success" && state.results.length === 0 && <EmptyState title="No books found" hint="Try a broader search term." />}
      <div className="tl-books">
        {state.results.map((b) => (
          <a className="card tl-book" key={b.id} href={b.url} target="_blank" rel="noopener noreferrer">
            {b.cover ? <img src={b.cover} alt={`Cover of ${b.title}`} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <div className="tl-book__nocover"><BookOpen size={26} /></div>}
            <div><strong>{b.title}</strong><small className="muted">{b.authors}</small><small className="muted">{b.year ? `First published ${b.year}` : "Year unknown"}{b.editions ? ` · ${b.editions} editions` : ""}</small><span className="tl-book__link">Open Library <ExternalLink size={12} /></span></div>
          </a>
        ))}
      </div>
    </div>
  );
}
