import { useState, useEffect } from "react";
import { Star, Users, GitFork } from "lucide-react";
import { Field } from "./Field.jsx";
import { useForm } from "../hooks/useForm.js";
import { required, githubName } from "../utils/validators.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { fetchGithub } from "../services/api.js";

// Live third-party API (api.github.com): fetch a GitHub profile and its repositories.
// The UI shows loading, success, error and retry states while the request is running.
export function GithubTab({ slug }) {
  const [username, setUsername] = useLocalStorage(`pingly:v2:gh:${slug}`, "");
  const [state, setState] = useState({ status: username ? "loading" : "idle", data: null, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setState({ status: "loading", data: null, error: "" });
    fetchGithub(username)
      .then((data) => !cancelled && setState({ status: "success", data, error: "" }))
      .catch((e) => !cancelled && setState({ status: "error", data: null, error: e.message }));
    return () => { cancelled = true; };
  }, [username, attempt]);

  const form = useForm({ name: username }, { name: [required("Username"), githubName] }, (v) => setUsername(v.name.trim()));
  const { status, data, error } = state;

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="eyebrow">LIVE API //</p>
        <h3 style={{ margin: "4px 0 6px" }}>GitHub profile data</h3>
        <p className="muted">This section fetches live data from the GitHub REST API.</p>
      </div>
      <form className="form card" onSubmit={form.handleSubmit} noValidate style={{ marginBottom: 16 }}>
        <Field label="GitHub username" placeholder="e.g. octocat" {...form.field("name")} />
        <button className="btn btn--primary btn--block" type="submit">{username ? "Update" : "Link GitHub"}</button>
      </form>
      {status === "loading" && <p className="muted">Loading GitHub profile…</p>}
      {status === "error" && (
        <div className="card">
          <p className="form-error">{error}</p>
          <button className="btn btn--outline" onClick={() => setAttempt((a) => a + 1)}>Retry</button>
        </div>
      )}
      {status === "success" && (
        <div className="card">
          <div className="gh-head">
            <img className="gh-avatar" src={data.user.avatar_url} alt={`${data.user.login} avatar`} />
            <div>
              <h3>{data.user.name || data.user.login}</h3>
              <p className="muted"><Users size={14} /> {data.user.followers} followers · {data.user.public_repos} public repos</p>
              {data.user.bio && <p className="muted">{data.user.bio}</p>}
            </div>
          </div>
          <div className="gh-repos">
            {data.repos.length === 0 && <p className="muted">No public repositories yet.</p>}
            {data.repos.map((r) => (
              <a key={r.id} className="gh-repo" href={r.html_url} target="_blank" rel="noreferrer">
                <strong>{r.name}</strong>
                <span className="muted">{r.language || "—"} · <Star size={12} /> {r.stargazers_count} · <GitFork size={12} /> {r.forks_count}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
