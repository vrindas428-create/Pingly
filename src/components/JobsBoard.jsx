import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, ExternalLink, MapPin } from "lucide-react";
import { loadJobs } from "../store/pulseSlice.js";

// Live openings from a public jobs API, fetched through a Redux Toolkit thunk.
export function JobsBoard() {
  const dispatch = useDispatch();
  const jobs = useSelector((st) => st.pulse.jobs);
  useEffect(() => { if (jobs.status === "idle") dispatch(loadJobs()); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section style={{ marginTop: 30 }}>
      <div className="meme-section-heading" style={{ marginTop: 0 }}>
        <div><p className="eyebrow">LIVE OPENINGS //</p><h2 className="section-title">Internship & entry-level openings</h2><p className="muted">Fetched live from the Remotive jobs API (software category). Always verify a company before sharing personal details.</p></div>
        <button className="btn btn--outline" onClick={() => dispatch(loadJobs())} disabled={jobs.status === "loading"}><RefreshCw size={15} className={jobs.status === "loading" ? "spin" : ""} /> Refresh</button>
      </div>
      {(jobs.status === "loading" || jobs.status === "idle") && <p className="muted tl-loading"><RefreshCw size={14} className="spin" /> Loading openings…</p>}
      {jobs.status === "error" && <div className="empty"><p className="empty__title">Couldn’t load openings</p><p className="form-error">{jobs.error}</p><button className="btn btn--primary" onClick={() => dispatch(loadJobs())}>Try again</button></div>}
      {jobs.status === "success" && (
        <div className="grid-cards">
          {jobs.data.map((j) => (
            <article className="card" key={j.id}>
              <p className="eyebrow">{j.type || "Job"} //</p>
              <h3 style={{ fontSize: 17 }}>{j.title}</h3>
              <p className="muted">{j.company}</p>
              <p className="muted"><MapPin size={13} /> {j.location}</p>
              <div className="tag-row">{j.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
              <a className="btn btn--outline" href={j.url} target="_blank" rel="noopener noreferrer">View posting <ExternalLink size={13} /></a>
            </article>
          ))}
          {jobs.data.length === 0 && <p className="muted">No openings returned right now.</p>}
        </div>
      )}
    </section>
  );
}
