import { useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader.jsx";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { useToast } from "../context/AppProviders.jsx";
import { Users, BookOpen, CalendarDays, Bell, ShoppingBag, BriefcaseBusiness, UserRound, Trophy, Sparkles, Search, Plus, Check, Trash2 } from "lucide-react";

const sections = [
  { id: "people", label: "Find Your People", icon: Users, desc: "Connect through shared interests." },
  { id: "buddy", label: "Study Buddy", icon: BookOpen, desc: "Find a partner for a subject." },
  { id: "campus-events", label: "Campus Events Hub", icon: CalendarDays, desc: "Collect events and track RSVPs." },
  { id: "notes-exchange", label: "Notes Exchange", icon: BookOpen, desc: "Organize resources by subject." },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Keep a simple activity inbox." },
  { id: "marketplace", label: "Student Marketplace", icon: ShoppingBag, desc: "List books and hostel essentials." },
  { id: "placement-tracker", label: "Placement Tracker", icon: BriefcaseBusiness, desc: "Track skills and preparation." },
  { id: "portfolio", label: "Student Portfolio", icon: UserRound, desc: "Showcase projects and links." },
  { id: "rewards", label: "XP & Rewards", icon: Trophy, desc: "Earn demo points and badges." },
  { id: "ai-assistant", label: "Pingly AI Assistant", icon: Sparkles, desc: "Make study summaries and questions." },
];
const initialPeople = [
  { id: 1, name: "Aarav", branch: "CSE AIML", semester: "3rd semester", interests: ["AI/ML", "Coding"] },
  { id: 2, name: "Meher", branch: "CSE", semester: "3rd semester", interests: ["Photography", "Gaming"] },
  { id: 3, name: "Kabir", branch: "CSE AIML", semester: "2nd semester", interests: ["Java", "AI/ML"] },
];
const seedEvents = [
  { id: 1, title: "Campus Hackathon", date: "2026-11-10", type: "Hackathon", place: "Innovation Lab", saved: false },
  { id: 2, title: "AI/ML Workshop", date: "2026-11-14", type: "Workshop", place: "Seminar Hall", saved: false },
];
const seedNotes = [
  { id: 1, title: "Java OOP Revision", subject: "Java", semester: "3", kind: "Revision notes" },
  { id: 2, title: "Statistics Formula Sheet", subject: "Statistics", semester: "3", kind: "Formula sheet" },
];

export function CampusPlusPage() {
  const [active, setActive] = useState("people");
  const [people, setPeople] = useLocalStorage("pingly:plus:people", initialPeople);
  const [buddies, setBuddies] = useLocalStorage("pingly:plus:buddies", []);
  const [events, setEvents] = useLocalStorage("pingly:plus:events", seedEvents);
  const [notes, setNotes] = useLocalStorage("pingly:plus:notes", seedNotes);
  const [notifications, setNotifications] = useLocalStorage("pingly:plus:notifications", [{ id: 1, text: "Welcome to the new Pingly features!", read: false }]);
  const [listings, setListings] = useLocalStorage("pingly:plus:market", []);
  const [tasks, setTasks] = useLocalStorage("pingly:plus:placement", [{ id: 1, text: "Practice arrays and strings", done: false }, { id: 2, text: "Update resume", done: false }]);
  const [portfolio, setPortfolio] = useLocalStorage("pingly:plus:portfolio", { skills: "Java, Python, React", project: "Pingly Student Community", github: "", linkedin: "" });
  const [xp, setXp] = useLocalStorage("pingly:plus:xp", 0);
  const [interests, setInterests] = useLocalStorage("pingly:plus:interests", ["AI/ML", "Coding"]);
  const [buddySubject, setBuddySubject] = useState("Java");
  const [buddySemester, setBuddySemester] = useState("3");
  const [noteQuery, setNoteQuery] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState("Java");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventPlace, setEventPlace] = useState("");
  const [listingTitle, setListingTitle] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [taskText, setTaskText] = useState("");
  const [studyText, setStudyText] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const toast = useToast();
  const visibleNotes = useMemo(() => notes.filter(n => `${n.title} ${n.subject} ${n.kind}`.toLowerCase().includes(noteQuery.toLowerCase())), [notes, noteQuery]);
  const current = sections.find(s => s.id === active) || sections[0];
  const addXp = (amount = 10) => setXp(v => v + amount);
  const addNotification = (text) => setNotifications(v => [{ id: Date.now(), text, read: false }, ...v]);

  function joinBuddy() {
    setBuddies(v => [{ id: Date.now(), subject: buddySubject, semester: buddySemester, status: "Looking for partner" }, ...v]);
    addNotification(`Study buddy request created for ${buddySubject}.`); addXp(5); toast("Study buddy request added", "success");
  }
  function addEvent(e) {
    e.preventDefault(); if (!eventTitle.trim() || !eventDate) return;
    setEvents(v => [{ id: Date.now(), title: eventTitle.trim(), date: eventDate, type: "Student event", place: eventPlace || "Campus", saved: false }, ...v]);
    setEventTitle(""); setEventDate(""); setEventPlace(""); addNotification("Your campus event was added."); addXp(10);
  }
  function addNote(e) {
    e.preventDefault(); if (!noteTitle.trim()) return;
    setNotes(v => [{ id: Date.now(), title: noteTitle.trim(), subject: noteSubject, semester: "3", kind: "Student shared" }, ...v]); setNoteTitle(""); addXp(10); addNotification("A new study resource was shared.");
  }
  function addListing(e) {
    e.preventDefault(); if (!listingTitle.trim()) return;
    setListings(v => [{ id: Date.now(), title: listingTitle.trim(), price: listingPrice || "Negotiable" }, ...v]); setListingTitle(""); setListingPrice(""); addXp(5);
  }
  function addTask(e) { e.preventDefault(); if (!taskText.trim()) return; setTasks(v => [...v, { id: Date.now(), text: taskText.trim(), done: false }]); setTaskText(""); }
  function generateStudyHelp() {
    const text = studyText.trim(); if (!text) { setAiOutput("Paste your notes first, then select Generate."); return; }
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    const summary = sentences.slice(0, 4).join(" ");
    const keywords = [...new Set((text.match(/\b[A-Za-z][A-Za-z0-9-]{4,}\b/g) || []).map(w => w.toLowerCase()))].slice(0, 8);
    setAiOutput(`QUICK SUMMARY\n${summary}\n\nPRACTICE QUESTIONS\n${keywords.slice(0, 3).map((w, i) => `${i + 1}. Explain ${w}.`).join("\n") || "1. What is the main idea?\n2. Give one example."}\n\nNote: This is a local demo helper, not a connected AI service.`);
  }

  return <div>
    <PageHeader eyebrow="PINGLY PLUS // NEW FEATURES" title="Campus Hub" sub="Ten extra student tools in one place. Existing Pingly sections are still available in the sidebar." />
    <div className="plus-layout">
      <aside className="plus-menu card">
        {sections.map(s => { const Icon = s.icon; return <button key={s.id} className={`plus-menu__item ${active === s.id ? "is-active" : ""}`} onClick={() => setActive(s.id)}><Icon size={17}/><span>{s.label}</span></button>; })}
      </aside>
      <section className="plus-content card">
        <div className="plus-heading"><div><p className="eyebrow">CAMPUS TOOLS //</p><h2>{current.label}</h2><p className="muted">{current.desc}</p></div><span className="plus-pill">✨ Pingly Plus</span></div>
        {active === "people" && <div>
          <p className="muted">Choose your interests to see sample students with similar interests. Profiles are demo data until connected to a backend.</p>
          <div className="plus-chips">{["Coding", "AI/ML", "Gaming", "Music", "Photography", "Design", "Java"].map(i => <button key={i} className={`chip ${interests.includes(i) ? "chip--active" : ""}`} onClick={() => setInterests(v => v.includes(i) ? v.filter(x => x !== i) : [...v, i])}>{interests.includes(i) ? "✓ " : "+ "}{i}</button>)}</div>
          <div className="plus-list">{people.filter(p => p.interests.some(i => interests.includes(i))).map(p => <article className="plus-row" key={p.id}><div className="avatar">{p.name[0]}</div><div className="plus-row__body"><strong>{p.name}</strong><p className="muted">{p.branch} · {p.semester}</p><div className="plus-chips">{p.interests.map(i => <span className="plus-tag" key={i}>{i}</span>)}</div></div><button className="btn btn--outline" onClick={() => { addNotification(`You connected with ${p.name} (demo).`); addXp(5); toast("Connection saved locally", "success"); }}>Connect</button></article>)}</div>
        </div>}
        {active === "buddy" && <div><p className="muted">Create a study-buddy request by subject and semester.</p><div className="plus-form"><label>Subject<select value={buddySubject} onChange={e => setBuddySubject(e.target.value)}><option>Java</option><option>Python</option><option>DBMS</option><option>Statistics</option><option>Data Structures</option><option>Web Development</option></select></label><label>Semester<select value={buddySemester} onChange={e => setBuddySemester(e.target.value)}>{[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}</select></label><button className="btn btn--primary" onClick={joinBuddy}><Plus size={15}/> Find partner</button></div><div className="plus-list">{buddies.map(b => <article className="plus-row" key={b.id}><div className="plus-row__body"><strong>{b.subject} · Semester {b.semester}</strong><p className="muted">{b.status}</p></div><button className="icon-btn" aria-label="Remove request" onClick={() => setBuddies(v => v.filter(x => x.id !== b.id))}><Trash2 size={16}/></button></article>)}</div></div>}
        {active === "campus-events" && <div><form className="plus-form" onSubmit={addEvent}><label>Event name<input value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Hackathon / workshop" required /></label><label>Date<input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required /></label><label>Venue<input value={eventPlace} onChange={e => setEventPlace(e.target.value)} placeholder="Campus venue" /></label><button className="btn btn--primary">Add event</button></form><div className="plus-list">{events.map(ev => <article className="plus-row" key={ev.id}><div className="plus-row__body"><strong>{ev.title}</strong><p className="muted">{ev.date} · {ev.place}</p></div><button className={`btn ${ev.saved ? "btn--primary" : "btn--outline"}`} onClick={() => setEvents(v => v.map(x => x.id === ev.id ? {...x, saved: !x.saved} : x))}>{ev.saved ? "Saved ✓" : "Save event"}</button></article>)}</div></div>}
        {active === "notes-exchange" && <div><form className="plus-form" onSubmit={addNote}><label>Resource title<input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="e.g. Java strings notes" required /></label><label>Subject<select value={noteSubject} onChange={e => setNoteSubject(e.target.value)}><option>Java</option><option>Python</option><option>DBMS</option><option>Statistics</option><option>Web Development</option></select></label><button className="btn btn--primary">Share resource</button></form><label className="plus-search"><Search size={16}/><input value={noteQuery} onChange={e => setNoteQuery(e.target.value)} placeholder="Search resources by title or subject" /></label><div className="plus-list">{visibleNotes.map(n => <article className="plus-row" key={n.id}><div className="plus-row__body"><strong>{n.title}</strong><p className="muted">{n.subject} · Semester {n.semester} · {n.kind}</p></div><span className="plus-tag">Resource</span></article>)}</div></div>}
        {active === "notifications" && <div><div className="plus-actions"><button className="btn btn--outline" onClick={() => setNotifications(v => v.map(n => ({...n, read: true})))}>Mark all as read</button><button className="btn btn--outline" onClick={() => setNotifications([])}>Clear inbox</button></div><div className="plus-list">{notifications.length ? notifications.map(n => <article className={`plus-row ${n.read ? "" : "plus-row--unread"}`} key={n.id}><Bell size={17}/><div className="plus-row__body"><strong>{n.text}</strong><p className="muted">{n.read ? "Read" : "Unread"}</p></div><button className="btn btn--outline" onClick={() => setNotifications(v => v.map(x => x.id === n.id ? {...x, read: !x.read} : x))}>{n.read ? "Mark unread" : "Mark read"}</button></article>) : <p className="muted">You're all caught up.</p>}</div></div>}
        {active === "marketplace" && <div><p className="muted">Demo listings only. Arrange safe, in-person exchanges and verify items before paying.</p><form className="plus-form" onSubmit={addListing}><label>Item name<input value={listingTitle} onChange={e => setListingTitle(e.target.value)} placeholder="Used textbook, calculator..." required /></label><label>Price (₹)<input value={listingPrice} onChange={e => setListingPrice(e.target.value)} placeholder="e.g. 300 or Negotiable" /></label><button className="btn btn--primary">Post listing</button></form><div className="plus-list">{listings.map(l => <article className="plus-row" key={l.id}><ShoppingBag size={18}/><div className="plus-row__body"><strong>{l.title}</strong><p className="muted">₹{l.price}</p></div><button className="icon-btn" aria-label="Delete listing" onClick={() => setListings(v => v.filter(x => x.id !== l.id))}><Trash2 size={16}/></button></article>)}</div></div>}
        {active === "placement-tracker" && <div><div className="plus-progress"><span>Preparation progress</span><strong>{tasks.length ? Math.round(tasks.filter(t => t.done).length / tasks.length * 100) : 0}%</strong><div className="plus-progress__track"><div style={{width: `${tasks.length ? tasks.filter(t => t.done).length / tasks.length * 100 : 0}%`}}/></div></div><form className="plus-form" onSubmit={addTask}><label>New preparation task<input value={taskText} onChange={e => setTaskText(e.target.value)} placeholder="Add DSA / resume / mock interview task" required /></label><button className="btn btn--primary">Add task</button></form><div className="plus-list">{tasks.map(t => <article className="plus-row" key={t.id}><button className={`plus-check ${t.done ? "is-done" : ""}`} onClick={() => setTasks(v => v.map(x => x.id === t.id ? {...x, done: !x.done} : x))}>{t.done && <Check size={15}/>}</button><div className="plus-row__body"><strong className={t.done ? "plus-done" : ""}>{t.text}</strong></div><button className="icon-btn" aria-label="Delete task" onClick={() => setTasks(v => v.filter(x => x.id !== t.id))}><Trash2 size={16}/></button></article>)}</div></div>}
        {active === "portfolio" && <form className="plus-form plus-form--stack" onSubmit={e => {e.preventDefault(); addNotification("Portfolio details saved."); toast("Portfolio saved locally", "success");}}><p className="muted">Create a simple student profile. Add only links you are comfortable sharing.</p><label>Skills<input value={portfolio.skills} onChange={e => setPortfolio(v => ({...v, skills: e.target.value}))} placeholder="Java, Python, React" /></label><label>Featured project<input value={portfolio.project} onChange={e => setPortfolio(v => ({...v, project: e.target.value}))} placeholder="Project name" /></label><label>GitHub URL<input value={portfolio.github} onChange={e => setPortfolio(v => ({...v, github: e.target.value}))} placeholder="https://github.com/username" /></label><label>LinkedIn URL<input value={portfolio.linkedin} onChange={e => setPortfolio(v => ({...v, linkedin: e.target.value}))} placeholder="https://linkedin.com/in/username" /></label><button className="btn btn--primary">Save portfolio</button><div className="plus-preview"><p className="eyebrow">PORTFOLIO PREVIEW //</p><h3>{portfolio.project || "Your featured project"}</h3><p>{portfolio.skills}</p><p className="muted">{portfolio.github || "GitHub link not added"} · {portfolio.linkedin || "LinkedIn link not added"}</p></div></form>}
        {active === "rewards" && <div className="plus-reward"><div className="plus-xp"><Trophy size={28}/><div><strong>{xp} XP</strong><p className="muted">Demo points saved on this device</p></div></div><div className="plus-badges"><div className={xp >= 10 ? "earned" : ""}>📚<strong>Notes Ninja</strong><span>Share a resource</span></div><div className={xp >= 20 ? "earned" : ""}>🤝<strong>Helpful Human</strong><span>Connect or find a buddy</span></div><div className={xp >= 30 ? "earned" : ""}>🎓<strong>Campus Explorer</strong><span>Join campus activity</span></div></div><button className="btn btn--primary" onClick={() => {addXp(5); toast("5 demo XP added", "success");}}>Try a demo reward +5 XP</button><p className="muted">In this prototype, points are local demo data and are not verified against real activity.</p></div>}
        {active === "ai-assistant" && <div><p className="muted">Paste your own notes to create a quick local summary and starter practice prompts. This prototype does not call an external AI service.</p><label>Study notes<textarea className="plus-textarea" rows="7" value={studyText} onChange={e => setStudyText(e.target.value)} placeholder="Paste your class notes here..." /></label><button className="btn btn--primary" style={{marginTop:12}} onClick={generateStudyHelp}><Sparkles size={16}/> Generate summary & questions</button>{aiOutput && <pre className="plus-output">{aiOutput}</pre>}</div>}
      </section>
    </div>
  </div>;
}
