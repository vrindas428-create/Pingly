import { useState } from "react";
import { MessageCircle, PlusCircle, CircleHelp, ArrowLeft, Users } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Modal } from "../components/Modal.jsx";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

const COMMUNITIES = [
  { id: 1, name: "Hostel Life", blurb: "Mess talk, roommates, hostel survival tips.", category: "Hostel" },
  { id: 2, name: "Lifestyle", blurb: "Hangout spots, budgeting, everyday campus life.", category: "Lifestyle" },
  { id: 3, name: "Know Your Peers", blurb: "Intros and meet-the-batch threads.", category: "Know your peers" },
  { id: 4, name: "Memes", blurb: "Campus humor, one meme at a time.", page: "memes" },
  { id: 5, name: "Notes", blurb: "Course-wise notes and PYQs from students.", page: "notes" },
  { id: 6, name: "Placement Prep", blurb: "Roadmaps, interview experiences, opportunities.", category: "Placement" },
  { id: 7, name: "Campus News", blurb: "Fests, drives, announcements from campus.", category: "Campus News" },
];

const STARTER_DISCUSSIONS = [
  { id: "starter-1", title: "Any tips for hostel beginners?", description: "Share your best tips for settling into hostel life.", topic: "Hostel Tips", kind: "Discussion", author: "Pingly Community", createdAt: "Community starter" },
  { id: "starter-2", title: "Best way to manage mess food?", description: "What do you do when you need a change from the mess menu?", topic: "Mess & Food", kind: "Question", author: "Pingly Community", createdAt: "Community starter" },
];

export function CommunitiesPage({ posts, navigate }) {
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [view, setView] = useState("menu");
  const [discussions, setDiscussions] = useLocalStorage("pingly:hostel-discussions", STARTER_DISCUSSIONS);
  const [form, setForm] = useState({ title: "", description: "", topic: "Hostel Tips", kind: "Discussion" });
  const [error, setError] = useState("");
  const hostelPosts = (posts || []).filter((post) => post.category === "Hostel");

  const openCommunity = (community) => {
    if (community.name === "Hostel Life") {
      setActiveCommunity(community);
      setView("menu");
      setError("");
    } else if (community.page) navigate(community.page);
    else navigate(`home/${community.category}`);
  };

  const openForm = (kind) => {
    setForm({ title: "", description: "", topic: "Hostel Tips", kind });
    setError("");
    setView("form");
  };

  const submitDiscussion = (event) => {
    event.preventDefault();
    if (form.title.trim().length < 4) return setError("Title must contain at least 4 characters.");
    if (form.description.trim().length < 10) return setError("Please add at least 10 characters in the description.");
    const entry = { ...form, id: crypto.randomUUID(), title: form.title.trim(), description: form.description.trim(), author: "You", createdAt: new Date().toLocaleDateString() };
    setDiscussions((current) => [entry, ...current]);
    setView("discussions");
    setError("");
  };

  return (
    <div>
      <PageHeader eyebrow="YOUR CAMPUS //" title="Communities" sub="Find your people — tap a topic to see what students are posting." />
      <div className="grid-cards">
        {COMMUNITIES.map((c) => {
          const count = c.category ? (posts || []).filter((p) => p.category === c.category).length : null;
          return (
            <button key={c.id} className="card community-card" onClick={() => openCommunity(c)}>
              <h3>{c.name}</h3>
              <p className="muted">{c.blurb}</p>
              <p className="muted">{count !== null ? `${count} posts` : "Browse →"}</p>
            </button>
          );
        })}
      </div>

      {activeCommunity && (
        <Modal title={activeCommunity.name} onClose={() => setActiveCommunity(null)}>
          {view !== "menu" && (
            <button className="link-btn community-back" type="button" onClick={() => { setView("menu"); setError(""); }}>
              <ArrowLeft size={14} /> Back to Hostel Life
            </button>
          )}

          {view === "menu" && <>
            <p className="muted community-intro">Your space for roommate stories, mess reviews, hostel hacks, and questions.</p>
            <div className="community-actions">
              <button className="card community-action" onClick={() => setView("discussions")}><MessageCircle size={20} /><span><strong>View Discussions</strong><small>Browse questions and conversations</small></span></button>
              <button className="card community-action" onClick={() => openForm("Discussion")}><PlusCircle size={20} /><span><strong>Start a Discussion</strong><small>Share a hostel tip or start a topic</small></span></button>
              <button className="card community-action" onClick={() => openForm("Question")}><CircleHelp size={20} /><span><strong>Ask a Question</strong><small>Get advice from fellow students</small></span></button>
            </div>
            <p className="muted community-count"><Users size={14} /> {discussions.length + hostelPosts.length} conversations in this community</p>
          </>}

          {view === "form" && <form className="form" onSubmit={submitDiscussion}>
            <p className="muted">{form.kind === "Question" ? "Ask the community for help or advice." : "Start a useful conversation with fellow hostel students."}</p>
            <label>Title<input value={form.title} maxLength={100} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={form.kind === "Question" ? "e.g. How do I change my room?" : "e.g. Best hostel survival tips"} required /></label>
            <label>Topic<select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}><option>Hostel Tips</option><option>Roommates</option><option>Mess & Food</option><option>Safety</option><option>Hostel Events</option><option>Other</option></select></label>
            <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add details so others can respond..." rows={4} maxLength={1000} required /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="btn btn--primary btn--block" type="submit">Publish {form.kind}</button>
          </form>}

          {view === "discussions" && <div className="community-discussions">
            <div className="community-discussions__head"><p className="muted">Recent Hostel Life conversations</p><button className="btn btn--primary" onClick={() => openForm("Discussion")}><PlusCircle size={15} /> New</button></div>
            {[...discussions, ...hostelPosts.map((p) => ({ id: `post-${p.id}`, title: p.title, description: p.content || p.description || "", topic: p.category || "Hostel", kind: p.type || "Discussion", author: p.author || "Student", createdAt: p.createdAt || "" }))].map((item) => (
              <article className="card community-discussion" key={item.id}>
                <div className="community-discussion__meta"><span className="badge">{item.kind}</span><span className="tag">{item.topic}</span></div>
                <h3>{item.title}</h3><p>{item.description}</p>
                <p className="muted">By {item.author}{item.createdAt ? ` · ${item.createdAt}` : ""}</p>
              </article>
            ))}
            {discussions.length === 0 && hostelPosts.length === 0 && <p className="muted">No discussions yet. Start the first one!</p>}
            <button className="btn btn--outline btn--block" onClick={() => openForm("Question")}><CircleHelp size={15} /> Ask a Question</button>
          </div>}
        </Modal>
      )}
    </div>
  );
}
