import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowUp, Bookmark, Flame, Plus, Trophy, Swords, Sparkles, MessageCircle,
  Laugh, Skull, Heart, Share2, Flag, CalendarDays, Gauge, Send, X, ImagePlus, Trash2, RefreshCw, Globe,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Field } from "../components/Field.jsx";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { useForm } from "../hooks/useForm.js";
import { useAuth, useConfirm, useToast } from "../context/AppProviders.jsx";
import { required, minLen, maxLen } from "../utils/validators.js";
import { addMeme, deleteMeme, addMemeComment, deleteMemeComment, loadLiveMemes, clearLiveMemes } from "../store/memesSlice.js";

const LIVE_SOURCES = [
  { value: "memes", label: "r/memes — general" },
  { value: "ProgrammerHumor", label: "r/ProgrammerHumor — coding" },
  { value: "wholesomememes", label: "r/wholesomememes — feel-good" },
];
const isImageUrl = (v, all) => (all.imageData || /^https?:\/\/\S+$/i.test((v || "").trim()) ? "" : "Add an image URL (https://…) or upload a picture");

const CATEGORIES = ["All", "Exams", "Attendance", "Hostel", "Placements", "Campus Life", "Assignments"];
const PROMPTS = [
  "POV: teacher says ‘this will be easy’ before a surprise test.",
  "Show us your face when attendance is 74.9%.",
  "Hostel mess menu: expectation vs reality.",
  "When the placement aptitude test has other plans.",
  "That one friend who starts the assignment at 11:58 PM.",
  "When the professor says ‘submit before midnight’ and Wi-Fi disappears.",
  "First day of college vs end-semester version of you.",
];
const POLL_OPTIONS = ["8 AM class", "8 PM assignment", "Surprise test", "Group project"];
const REACTIONS = [
  { key: "laugh", label: "Funny", icon: Laugh },
  { key: "relatable", label: "Too real", icon: Skull },
  { key: "love", label: "Love it", icon: Heart },
  { key: "fire", label: "Fire", icon: Flame },
];
const SEED_CONFESSIONS = [
  { id: "conf-1", text: "I have opened the same lecture slide 12 times and learned absolutely nothing.", date: "Campus confession", reactions: 18 },
  { id: "conf-2", text: "My ‘quick 20-minute nap’ has its own academic calendar.", date: "Campus confession", reactions: 12 },
];

export function MemesPage({ memes = [], upvote, hasUpvoted = () => false, toggleSave }) {
  const [reactions, setReactions] = useLocalStorage("pingly:memes:reactions-v1", {});
  // Memes, comments and live-API status live in the Redux store (src/store/memesSlice.js).
  const dispatch = useDispatch();
  const comments = useSelector((st) => st.memes.comments);
  const { liveStatus, liveError } = useSelector((st) => st.memes);
  const { user, requireLogin } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [liveSource, setLiveSource] = useState("memes");
  const [fileKey, setFileKey] = useState(0);
  const [confessions, setConfessions] = useLocalStorage("pingly:memes:confessions-v1", SEED_CONFESSIONS);
  const [pollVotes, setPollVotes] = useLocalStorage("pingly:memes:poll-votes-v1", {});
  const [reported, setReported] = useLocalStorage("pingly:memes:reported-v1", []);
  const [departmentVotes, setDepartmentVotes] = useLocalStorage("pingly:memes:department-votes-v1", {});
  const [activeTab, setActiveTab] = useState("Trending");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showCreator, setShowCreator] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [confessionDraft, setConfessionDraft] = useState("");
  const [confessionAnon, setConfessionAnon] = useState(true);
  const [attendance, setAttendance] = useState({ attended: "", total: "" });
  const [examDate, setExamDate] = useState("");
  const [notice, setNotice] = useState("");
  const [battleWinner, setBattleWinner] = useState("");

  const allMemes = useMemo(() => memes.map((m) => ({ ...m, caption: m.caption || "Campus life, unfiltered.", category: m.topic || "Campus Life", createdAt: m.createdAt || (m.live ? "Live from the internet" : "Community classic") })), [memes]);
  const filteredMemes = useMemo(() => {
    let list = allMemes.filter((m) => (category === "All" || m.category === category || m.topic === category));
    if (search.trim()) list = list.filter((m) => `${m.caption || ""} ${m.author || ""} ${m.category || m.topic || ""}`.toLowerCase().includes(search.toLowerCase()));
    if (activeTab === "Latest") list = [...list].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    if (activeTab === "Trending" || activeTab === "Following") list = [...list].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    if (activeTab === "Saved") list = list.filter((m) => m.saved);
    return list;
  }, [allMemes, category, search, activeTab]);

  const challenge = PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length];
  const topMemes = [...allMemes].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 3);
  const battleCandidates = [...allMemes].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, Math.min(4, allMemes.length));
  const battleA = battleCandidates[0];
  const battleB = battleCandidates.find((m) => m.id !== battleA?.id) || battleCandidates[0];
  const attendancePercent = attendance.total && Number(attendance.total) > 0 && Number(attendance.attended) >= 0
    ? Math.min(100, (Number(attendance.attended) / Number(attendance.total)) * 100) : null;
  const daysToExam = examDate ? Math.ceil((new Date(`${examDate}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000) : null;

  // Form handling: useForm + validators (same pattern as the other pages).
  const memeForm = useForm(
    { author: "You", caption: "", category: "Campus Life", image: "", imageData: "" },
    { caption: [required("Caption"), minLen("Caption", 3), maxLen("Caption", 220)], image: [isImageUrl] },
    (v, reset) => {
      const entry = { id: `user-${Date.now()}`, author: v.author.trim() || "You", authorEmail: user?.email, topic: v.category, category: v.category, image: v.imageData || v.image.trim(), caption: v.caption.trim(), upvotes: 0, saved: false, createdAt: new Date().toISOString(), custom: true };
      dispatch(addMeme(entry));
      reset(); setFileKey((k) => k + 1);
      setShowCreator(false); setActiveTab("Latest"); setCategory("All");
      toast("Your meme is live — +10 XP!", "success");
    }
  );
  const openCreator = (caption) => {
    if (!requireLogin("create a meme")) return;
    memeForm.set("author", user?.name || "You");
    if (typeof caption === "string") memeForm.set("caption", caption);
    setShowCreator(true);
  };
  const handleMemeFile = (e) => {
    const file = e.target.files[0];
    if (!file) return memeForm.set("imageData", "");
    if (file.size > 500 * 1024) { e.target.value = ""; memeForm.set("imageData", ""); return toast("Picture must be under 500 KB.", "error"); }
    const reader = new FileReader();
    reader.onload = () => memeForm.set("imageData", reader.result);
    reader.readAsDataURL(file);
  };
  const isMine = (m) => !!user && (m.authorEmail === user.email);

  const reactToMeme = (memeId, reactionKey) => {
    setReactions((current) => {
      const existing = current[memeId] || {};
      const wasSelected = existing.selected === reactionKey;
      const counts = { ...(existing.counts || {}) };
      if (existing.selected) counts[existing.selected] = Math.max(0, (counts[existing.selected] || 0) - 1);
      if (!wasSelected) counts[reactionKey] = (counts[reactionKey] || 0) + 1;
      return { ...current, [memeId]: { selected: wasSelected ? null : reactionKey, counts } };
    });
  };
  const submitComment = (e, memeId) => {
    e.preventDefault();
    const text = (commentDrafts[memeId] || "").trim();
    if (!text) return;
    if (!requireLogin("comment")) return;
    dispatch(addMemeComment({ memeId, comment: { id: Date.now(), text, author: user.name, authorEmail: user.email } }));
    setCommentDrafts((current) => ({ ...current, [memeId]: "" }));
  };
  const removeComment = async (memeId, commentId) => {
    if (await confirm({ title: "Delete your comment?", message: "This removes it from the meme.", confirmLabel: "Delete" })) {
      dispatch(deleteMemeComment({ memeId, commentId }));
      toast("Comment deleted.", "info");
    }
  };
  const removeMeme = async (id) => {
    if (await confirm({ title: "Delete your meme?", message: "It will be removed for everyone.", confirmLabel: "Delete" })) {
      dispatch(deleteMeme(id));
      toast("Meme deleted.", "info");
    }
  };
  const submitConfession = (e) => {
    e.preventDefault();
    if (confessionDraft.trim().length < 8) return setNotice("Make your confession at least 8 characters long.");
    setConfessions((current) => [{ id: `conf-${Date.now()}`, text: confessionDraft.trim(), author: confessionAnon ? "Anonymous student" : "You", date: new Date().toLocaleDateString(), reactions: 0 }, ...current]);
    setConfessionDraft(""); setNotice("Confession added locally. Keep it kind and respectful!");
  };
  const votePoll = (option) => setPollVotes((current) => ({ ...current, ["campus-poll"]: option }));
  const reportMeme = (id) => { setReported((current) => current.includes(id) ? current : [...current, id]); setNotice("Thanks for helping keep Pingly respectful. Report saved on this device."); };
  const shareMeme = async (meme) => {
    const shareText = `${meme.caption || "Pingly meme"} — Pingly`;
    try {
      if (navigator.share) await navigator.share({ title: "Pingly meme", text: shareText, url: window.location.href });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(shareText); setNotice("Meme caption copied to clipboard."); }
      else setNotice(shareText);
    } catch { /* share sheet was dismissed */ }
  };

  return (
    <div className="memes-page">
      <PageHeader eyebrow="PINGLY MEMES //" title="Memes & Chill" sub="Campus chaos, inside jokes, and the memes that are a little too real." />

      <section className="meme-hero card">
        <div className="meme-hero__copy"><span className="meme-kicker"><Sparkles size={14} /> YOUR DAILY DOSE OF CAMPUS CHAOS</span><h2>One campus. <em>Infinite</em> inside jokes.</h2><p>Make a meme, enter a battle, react to the most relatable moments, and find your people.</p>
          <button className="btn btn--primary" onClick={() => openCreator()}><Plus size={17} /> Create a meme</button>
        </div>
        <div className="meme-hero__sticker" aria-hidden="true"><span>SEM</span><strong>LOL</strong><span>LOADING...</span><b>😭</b></div>
      </section>

      {notice && <div className="meme-notice" role="status">{notice}<button aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={15} /></button></div>}

      <section className="meme-challenge-grid">
        <article className="card meme-feature-card meme-challenge"><div className="meme-feature-head"><span><Sparkles size={17} /> DAILY MEME CHALLENGE</span><span className="meme-pill">TODAY'S PROMPT</span></div><h3>{challenge}</h3><p className="muted">Create your version and make the batch laugh.</p><button className="btn btn--outline" onClick={() => openCreator(challenge)}>Take the challenge <ArrowUp size={15} /></button></article>
        <article className="card meme-feature-card meme-attendance"><div className="meme-feature-head"><span><Gauge size={17} /> ATTENDANCE PANIC METER</span><span className="meme-emoji">💀</span></div><div className="meme-attendance-fields"><label>Classes attended<input type="number" min="0" value={attendance.attended} onChange={(e) => setAttendance({ ...attendance, attended: e.target.value })} placeholder="e.g. 18" /></label><label>Total classes<input type="number" min="1" value={attendance.total} onChange={(e) => setAttendance({ ...attendance, total: e.target.value })} placeholder="e.g. 24" /></label></div>{attendancePercent !== null ? <><div className="meme-progress"><span style={{ width: `${attendancePercent}%` }} /></div><strong className="meme-attendance-result">{attendancePercent.toFixed(1)}% — {attendancePercent >= 75 ? "Safe zone 😎" : attendancePercent >= 65 ? "Attendance arc loading… 😬" : "Academic comeback needed 🚨"}</strong><p className="muted">Check your university's actual attendance rules too.</p></> : <p className="muted">Enter your numbers to check your current percentage.</p>}</article>
      </section>

      <section className="card meme-poll"><div><span className="meme-kicker"><Sparkles size={14} /> QUICK CAMPUS POLL</span><h3>What's the real final boss?</h3><p className="muted">Vote once on this device. No wrong answers, only suffering.</p></div><div className="meme-poll-options">{POLL_OPTIONS.map((option) => { const selected = pollVotes["campus-poll"] === option; const count = Object.values(pollVotes).filter((v) => v === option).length; return <button key={option} className={`meme-poll-option${selected ? " is-selected" : ""}`} onClick={() => votePoll(option)}><span>{option}</span>{selected && <span>✓ Your vote</span>}</button>; })}</div></section>

      <section className="card meme-department-war">
        <div className="meme-feature-head"><span><Trophy size={17} /> DEPARTMENT WARS</span><span className="meme-pill">FRIENDLY COMPETITION</span></div>
        <div className="meme-department-copy"><h3>Which branch brings the funniest energy?</h3><p className="muted">Vote for your department and help build the campus meme scoreboard.</p></div>
        <div className="meme-department-options">{["CSE", "CSE-AIML", "CSE-DS", "Mechanical", "Civil", "Electronics"].map((dept) => {
          const count = Object.values(departmentVotes).filter((value) => value === dept).length;
          return <button key={dept} className={`meme-department-option${departmentVotes["your-vote"] === dept ? " is-selected" : ""}`} onClick={() => setDepartmentVotes((current) => ({ ...current, "your-vote": dept }))}><span>{dept}</span><b>{count} {count === 1 ? "vote" : "votes"}</b></button>;
        })}</div><p className="muted">Votes are saved locally in this browser for the demo.</p>
      </section>

      <section className="card meme-live">
        <div className="meme-feature-head"><span><Globe size={17} /> LIVE FROM THE INTERNET</span><span className="meme-pill">PUBLIC MEME API</span></div>
        <h3>Fresh memes, fetched right now.</h3>
        <p className="muted">Pulls trending posts from a public meme API (NSFW and spoilers filtered out) and drops them into your feed.</p>
        <div className="meme-live__controls">
          <select value={liveSource} onChange={(e) => setLiveSource(e.target.value)} aria-label="Meme source">{LIVE_SOURCES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <button className="btn btn--primary" disabled={liveStatus === "loading"} onClick={() => { dispatch(loadLiveMemes(liveSource)); setActiveTab("Latest"); }}><RefreshCw size={15} className={liveStatus === "loading" ? "spin" : ""} /> {liveStatus === "loading" ? "Fetching…" : "Fetch fresh memes"}</button>
          {memes.some((m) => m.live) && <button className="btn btn--outline" onClick={() => dispatch(clearLiveMemes())}><Trash2 size={15} /> Clear live memes</button>}
        </div>
        {liveStatus === "error" && <p className="form-error" role="alert" style={{ margin: "10px 0 0" }}>{liveError} <button className="link-btn" onClick={() => dispatch(loadLiveMemes(liveSource))}>Try again</button></p>}
        {liveStatus === "success" && <p className="meme-success" style={{ margin: "10px 0 0" }}>Fresh memes added to the top of your feed ✨</p>}
      </section>

      <div className="meme-section-heading"><div><span className="meme-kicker"><Flame size={14} /> THE MEME FEED</span><h2>Find your next <em>favourite</em></h2></div><button className="btn btn--primary" onClick={() => openCreator()}><ImagePlus size={16} /> Create meme</button></div>
      <div className="meme-controls"><div className="meme-tabs" role="tablist" aria-label="Meme feed tabs">{["Trending", "Latest", "Following", "Saved", "Battles", "Confessions"].map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "meme-tab is-active" : "meme-tab"} onClick={() => setActiveTab(tab)}>{tab === "Trending" && <Flame size={14} />}{tab === "Battles" && <Swords size={14} />}{tab === "Confessions" && <MessageCircle size={14} />}{tab}</button>)}</div><input className="meme-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search memes, topics..." aria-label="Search memes" /></div>

      {activeTab === "Confessions" ? <section className="meme-confessions"><article className="card meme-feature-card"><span className="meme-kicker"><MessageCircle size={14} /> ANONYMOUS CAMPUS CONFESSIONS</span><h3>Confess the harmless chaos.</h3><p className="muted">No names or personal details. Be funny, not cruel.</p><form onSubmit={submitConfession} className="meme-confession-form"><textarea value={confessionDraft} onChange={(e) => setConfessionDraft(e.target.value)} maxLength={300} rows={3} placeholder="I once studied the wrong chapter for the entire night..." required /><label className="meme-check"><input type="checkbox" checked={confessionAnon} onChange={(e) => setConfessionAnon(e.target.checked)} /> Post as anonymous student</label><button className="btn btn--primary" type="submit"><Send size={15} /> Share confession</button></form></article><div className="meme-confession-list">{confessions.map((c) => <article className="card meme-confession" key={c.id}><span className="meme-pill">CAMPUS CONFESSION</span><p>{c.text}</p><div className="meme-card-meta"><span>{c.author || "Anonymous student"}</span><span>💬 {c.reactions || 0} relatable</span></div><button className="action" onClick={() => setConfessions((current) => current.map((item) => item.id === c.id ? { ...item, reactions: (item.reactions || 0) + 1 } : item))}>😭 Relatable</button></article>)}</div></section>
        : activeTab === "Battles" ? <section className="card meme-battle"><div className="meme-feature-head"><span><Swords size={17} /> MEME BATTLE ARENA</span><span className="meme-pill">PICK THE WINNER</span></div><h3>Which one is more painfully relatable?</h3><div className="meme-battle-grid">{[battleA, battleB].filter(Boolean).map((m) => <button className={`meme-battle-choice${battleWinner === String(m.id) ? " is-winner" : ""}`} key={m.id} onClick={() => setBattleWinner(String(m.id))}><MemeImage meme={m} /><strong>{m.caption || m.topic || "Campus classic"}</strong><span>{m.upvotes || 0} upvotes</span>{battleWinner === String(m.id) && <b>🏆 Your winner</b>}</button>)}</div>{battleWinner && <p className="meme-success">Vote locked in for this session. Your choice: {battleWinner === String(battleA?.id) ? battleA?.author : battleB?.author} 🎉</p>}<p className="muted">Battle is a local demo; votes are not sent to a server.</p></section>
        : <><div className="meme-category-row" aria-label="Filter by category">{CATEGORIES.map((item) => <button key={item} className={`meme-category${category === item ? " is-active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="meme-feed-grid">{filteredMemes.map((m) => <article className="card meme-post" key={m.id}><div className="meme-post__top"><div className="meme-avatar">{(m.author || "P").slice(0, 1).toUpperCase()}</div><div className="meme-author"><strong>{m.author || "Pingly student"}</strong><span>{m.category || m.topic || "Campus Life"} · {m.live ? `Live · r/${m.source}` : m.createdAt === "Community classic" ? "Community classic" : m.custom ? "Just now" : "On campus"}</span></div>{isMine(m) && <button className="meme-icon-button" aria-label="Delete your meme" title="Delete your meme" onClick={() => removeMeme(m.id)}><Trash2 size={16} /></button>}<button className="meme-icon-button" aria-label="Report meme" title="Report meme" disabled={reported.includes(m.id)} onClick={() => reportMeme(m.id)}><Flag size={16} /></button></div><MemeImage meme={m} /><div className="meme-post__body"><p>{m.caption || `${m.topic || "Campus Life"}: a certified campus classic.`}</p><div className="meme-reactions">{REACTIONS.map(({ key, label, icon: Icon }) => { const itemReaction = reactions[m.id] || {}; return <button key={key} className={`meme-reaction${itemReaction.selected === key ? " is-active" : ""}`} onClick={() => reactToMeme(m.id, key)} title={label}><Icon size={15} /><span>{(itemReaction.counts || {})[key] || 0}</span></button>; })}</div><div className="meme-post__actions"><button className={`action${hasUpvoted(m.id) ? " action--active" : ""}`} onClick={() => upvote(m.id)} aria-pressed={hasUpvoted(m.id)} title={hasUpvoted(m.id) ? "Click again to remove your upvote" : "Upvote meme"}><ArrowUp size={15} /> {m.upvotes || 0}</button><button className={`action${m.saved ? " action--active" : ""}`} onClick={() => toggleSave(m.id)}><Bookmark size={15} /> {m.saved ? "Saved" : "Save"}</button><button className="action" onClick={() => shareMeme(m)}><Share2 size={15} /> Share</button></div><div className="meme-comments"><strong><MessageCircle size={14} /> Comments ({(comments[m.id] || []).length})</strong>{(comments[m.id] || []).map((comment) => <p className="meme-comment" key={comment.id}><span><b>{comment.author}:</b> {comment.text}</span>{user && comment.authorEmail === user.email && <button type="button" className="comment__delete" aria-label="Delete your comment" title="Delete your comment" onClick={() => removeComment(m.id, comment.id)}><Trash2 size={12} /></button>}</p>)}<form onSubmit={(e) => submitComment(e, m.id)}><input value={commentDrafts[m.id] || ""} onChange={(e) => setCommentDrafts((current) => ({ ...current, [m.id]: e.target.value }))} placeholder="Add a kind comment..." maxLength={180} aria-label="Add a comment" /><button type="submit" aria-label="Send comment"><Send size={15} /></button></form></div></div></article>)}{filteredMemes.length === 0 && <div className="card meme-empty"><Sparkles size={24} /><h3>Nothing in this feed yet</h3><p className="muted">Try another category or create the first meme.</p><button className="btn btn--primary" onClick={() => openCreator()}>Create a meme</button></div>}</div></>}

      <section className="meme-lower-grid"><article className="card meme-feature-card"><div className="meme-feature-head"><span><Trophy size={17} /> MEME LORDS OF THE WEEK</span><span className="meme-pill">TOP 3</span></div>{topMemes.map((m, index) => <div className="meme-leader-row" key={m.id}><span className={`meme-rank meme-rank--${index + 1}`}>{index + 1}</span><span className="meme-leader-avatar">{(m.author || "P").slice(0, 1).toUpperCase()}</span><span className="meme-leader-name"><strong>{m.author || "Pingly student"}</strong><small>{m.caption || m.topic || "Campus classic"}</small><small className="meme-badge-label">{(m.upvotes || 0) >= 500 ? "👑 Meme Legend" : (m.upvotes || 0) >= 400 ? "🔥 Crowd Favourite" : (m.upvotes || 0) >= 100 ? "⚡ Rising Meme" : "🌱 New Creator"}</small></span><b><ArrowUp size={14} /> {m.upvotes || 0}</b></div>)}<p className="muted">Top memes by upvotes. Keep it fun and give credit to creators.</p></article><article className="card meme-feature-card meme-countdown"><div className="meme-feature-head"><span><CalendarDays size={17} /> EXAM COUNTDOWN</span><span className="meme-emoji">📚</span></div><label>Next exam date<input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} /></label>{daysToExam !== null && <div className="meme-countdown-number">{daysToExam < 0 ? "🎉" : daysToExam === 0 ? "TODAY" : daysToExam}<small>{daysToExam < 0 ? "Date passed" : daysToExam === 0 ? "Good luck, you've got this!" : daysToExam === 1 ? "day to go" : "days to go"}</small></div>}<p className="muted">A little planning, a little panic, a lot of memes.</p></article></section>

      {showCreator && <div className="meme-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCreator(false); }}><section className="card meme-creator" role="dialog" aria-modal="true" aria-labelledby="meme-creator-title"><div className="meme-creator__head"><div><span className="meme-kicker"><ImagePlus size={14} /> CREATOR STUDIO</span><h2 id="meme-creator-title">Make the batch laugh.</h2></div><button className="meme-icon-button" onClick={() => setShowCreator(false)} aria-label="Close creator"><X size={18} /></button></div><form className="meme-creator-form" onSubmit={memeForm.handleSubmit} noValidate>
          <Field label="Your display name" maxLength={32} {...memeForm.field("author")} />
          <Field label="Caption / punchline" as="textarea" rows={3} maxLength={220} placeholder="When you say ‘I will start studying tomorrow’..." {...memeForm.field("caption")} />
          <Field label="Image URL" type="url" placeholder="https://.../your-meme.jpg" {...memeForm.field("image")} />
          <label>…or upload a picture (under 500 KB)<input key={fileKey} type="file" accept="image/*" onChange={handleMemeFile} /></label>
          {(memeForm.values.imageData || memeForm.values.image) && <img className="image-preview" src={memeForm.values.imageData || memeForm.values.image} alt="Meme preview" onError={(e) => { e.currentTarget.style.display = "none"; }} onLoad={(e) => { e.currentTarget.style.display = "block"; }} />}
          <p className="muted">This demo stores posts in this browser only; don't upload private or copyrighted content you don't have permission to use.</p>
          <Field label="Category" as="select" {...memeForm.field("category")}>{CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}</Field>
          <button className="btn btn--primary btn--block" type="submit"><Plus size={16} /> Publish meme</button>
        </form></section></div>}
    </div>
  );
}

function MemeImage({ meme }) {
  const [failed, setFailed] = useState(false);
  if (!meme.image || failed) return <div className="meme-image-fallback"><span>😭</span><small>{meme.caption || "campus moment loading..."}</small></div>;
  return <img className="meme-post__image" src={meme.image} alt={meme.caption || `Meme by ${meme.author || "student"}`} onError={() => setFailed(true)} loading="lazy" />;
}
