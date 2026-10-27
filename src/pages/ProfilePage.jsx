import { useState } from "react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Tabs } from "../components/Tabs.jsx";
import { GithubTab } from "../components/GithubTab.jsx";
import { Field } from "../components/Field.jsx";
import { useForm } from "../hooks/useForm.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { maxLen, required, linkedinUrl, normalizeLinkedin } from "../utils/validators.js";
import { useAuth } from "../context/AppProviders.jsx";
import { Linkedin } from "lucide-react";

const DEMO = { vrinda: "CSE Core, Semester 3 · loves front-end dev and campus events." };

// Nested route: #/profile/:username/(about|github). The active tab is read
// from the URL, so each tab is linkable and survives a refresh.
export function ProfilePage({ param, sub, navigate, isLoggedIn, user, posts }) {
  const slug = param || (isLoggedIn ? user.name.toLowerCase().replace(/\s+/g, "-") : "guest");
  const displayName = param ? param.replace(/-/g, " ") : isLoggedIn ? user.name : "Guest";
  const isMe = isLoggedIn && !param;
  const tab = sub === "github" ? "github" : "about";

  const [bio, setBio] = useLocalStorage(`pingly:v2:bio:${slug}`, DEMO[slug] || "CSE student · loves DSA and bad puns.");
  const [editing, setEditing] = useState(false);
  const { updateProfile } = useAuth();
  const form = useForm({ bio, linkedin: (isMe && user.linkedin) || "" }, { bio: [required("Bio"), maxLen("Bio", 200)], linkedin: [linkedinUrl] }, (v) => { setBio(v.bio.trim()); if (isMe) updateProfile({ linkedin: normalizeLinkedin(v.linkedin) }); setEditing(false); });
  const myPosts = posts.filter((p) => p.author.toLowerCase() === displayName.toLowerCase());

  return (
    <div>
      <PageHeader eyebrow="PROFILE //" title={displayName} sub={isMe ? `Signed in as ${user.email}` : "Student on Pingly"} />
      <Tabs tabs={[{ key: "about", label: "About" }, { key: "github", label: "GitHub API" }]} active={tab} onChange={(k) => navigate(`profile/${slug}/${k}`)} />
      {tab === "github" ? (
        <GithubTab slug={slug} />
      ) : !editing ? (
        <div className="card">
          <p>{bio}</p>
          {isMe && (user.linkedin ? <p><a className="linkedin-link" href={user.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={15} /> LinkedIn profile</a></p> : <p className="muted">No LinkedIn added yet — use Edit bio to add one.</p>)}
          <p className="muted">{myPosts.length} post{myPosts.length === 1 ? "" : "s"} · {myPosts.reduce((n, p) => n + p.upvotes, 0)} upvotes received</p>
          {(isMe || slug === "vrinda") && <button className="btn btn--outline" onClick={() => setEditing(true)}>Edit bio</button>}
        </div>
      ) : (
        <form className="form card" onSubmit={form.handleSubmit} noValidate>
          <Field label="Bio" as="textarea" rows={3} {...form.field("bio")} />
          {isMe && <Field label="LinkedIn profile (optional)" type="url" placeholder="linkedin.com/in/your-name" {...form.field("linkedin")} />}
          <button type="submit" className="btn btn--primary btn--block">Save</button>
        </form>
      )}
    </div>
  );
}
