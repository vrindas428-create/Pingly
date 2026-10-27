import { useState, useMemo } from "react";
import { Search, BookOpen, ArrowUp, Plus, X, Download, FileText } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { COURSES, NOTES_CATALOG } from "../data/courses.js";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function NotesPage({ notes, addNote }) {
  const [courseId, setCourseId] = useState("");
  const [sem, setSem] = useState("");
  const [catalog, setCatalog] = useLocalStorage("pingly:v2:catalog", NOTES_CATALOG);
  // Same one-upvote-per-browser pattern used on posts/memes, just scoped to
  // the notes catalog with its own localStorage key.
  const [upvotedNoteIds, setUpvotedNoteIds] = useLocalStorage("pingly:v2:notes:upvoted", []);

  const [query, setQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", sem: 1 });

  const upvoteCatalogNote = (id) => {
    if (upvotedNoteIds.includes(id)) return; // already upvoted once — ignore
    setCatalog((prev) => prev.map((n) => (n.id === id ? { ...n, upvotes: n.upvotes + 1 } : n)));
    setUpvotedNoteIds((prev) => [...prev, id]);
  };

  // Notes for the picked course + semester, grouped by subject (2 notes each).
  const groupedBySubject = useMemo(() => {
    if (!courseId || !sem) return [];
    const relevant = catalog.filter((n) => n.courseId === courseId && n.sem === Number(sem));
    const bySubject = {};
    relevant.forEach((n) => {
      if (!bySubject[n.subject]) bySubject[n.subject] = [];
      bySubject[n.subject].push(n);
    });
    return Object.entries(bySubject);
  }, [catalog, courseId, sem]);

  const filteredUploads = notes.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));

  function handleUpload(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    addNote({ title: form.title.trim(), subject: form.subject.trim() || "General", sem: Number(form.sem), upvotes: 0 });
    setForm({ title: "", subject: "", sem: 1 });
    setShowUpload(false);
  }

  return (
    <div>
      <PageHeader eyebrow="STUDY SMARTER //" title="Notes Hub" sub="Pick your course and semester for ready notes, or upload your own for others.">
        <button className="btn btn--primary" onClick={() => setShowUpload(true)}>
          <Plus size={16} /> Upload Notes / PDF
        </button>
      </PageHeader>

      <div className="card">
        <p className="eyebrow" style={{ marginBottom: 10 }}>
          BROWSE BY COURSE //
        </p>
        <div className="course-select-row">
          <label>
            Course
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">Select your course</option>
              {COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Semester
            <select value={sem} onChange={(e) => setSem(e.target.value)}>
              <option value="">Select semester</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!courseId || !sem ? (
          <p className="muted" style={{ marginTop: 12 }}>
            Choose a course and semester above to see subject-wise notes.
          </p>
        ) : groupedBySubject.length === 0 ? (
          <p className="muted" style={{ marginTop: 12 }}>
            No notes catalogued for this combination yet.
          </p>
        ) : (
          groupedBySubject.map(([subject, subjectNotes]) => (
            <div key={subject} style={{ marginTop: 18 }}>
              <h3 style={{ marginBottom: 10 }}>{subject}</h3>
              <div className="grid-cards">
                {subjectNotes.map((n) => {
                  const upvoted = upvotedNoteIds.includes(n.id);
                  return (
                    <div className="card note-card" key={n.id}>
                      <div className="note-card__icon">
                        <FileText size={26} />
                      </div>
                      <p className="eyebrow">{n.kind.toUpperCase()} //</p>
                      <h3>{n.title}</h3>
                      <p className="muted">Sample PDF — demo content for this assessment</p>
                      <div className="row-between">
                        <button
                          className={"action" + (upvoted ? " action--active" : "")}
                          onClick={() => upvoteCatalogNote(n.id)}
                          disabled={upvoted}
                          title={upvoted ? "You've already upvoted this" : "Upvote"}
                        >
                          <ArrowUp size={14} /> {n.upvotes}
                        </button>
                        <a className="link-btn" href={n.pdf} target="_blank" rel="noreferrer" download>
                          <Download size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                          Download PDF
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="eyebrow" style={{ marginTop: 28, marginBottom: 4 }}>
        COMMUNITY UPLOADS //
      </p>
      <h2 className="section-title" style={{ marginBottom: 14 }}>
        Notes shared by students
      </h2>

      <div className="search-inline">
        <Search size={16} />
        <input placeholder="Search uploaded notes..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="grid-cards">
        {filteredUploads.map((n) => (
          <div className="card note-card" key={n.id}>
            <div className="note-card__icon">
              <BookOpen size={28} />
            </div>
            <p className="eyebrow">SEM {n.sem} //</p>
            <h3>{n.title}</h3>
            <p className="muted">{n.subject}</p>
            <div className="row-between">
              <span>
                <ArrowUp size={14} /> {n.upvotes}
              </span>
              <button className="link-btn">Save</button>
            </div>
          </div>
        ))}
        {filteredUploads.length === 0 && <EmptyState title="No uploaded notes match your search" />}
      </div>

      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setShowUpload(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="eyebrow">PINGLY //</p>
            <h2 className="modal__title">Upload Notes</h2>
            <form className="form" onSubmit={handleUpload}>
              <label>
                Notes title
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Data Structures — Unit 2"
                />
              </label>
              <label>
                Subject
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Data Structures"
                />
              </label>
              <label>
                Semester
                <select value={form.sem} onChange={(e) => setForm({ ...form, sem: e.target.value })}>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                PDF / document
                <input type="file" />
              </label>
              <button type="submit" className="btn btn--primary btn--block">
                Add to Notes Hub →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
