import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, X, Undo2, Trash2, Plus, RotateCcw, ShieldCheck, AlertTriangle, Siren } from "lucide-react";
import { Field } from "../../components/Field.jsx";
import { useForm } from "../../hooks/useForm.js";
import { useConfirm, useToast } from "../../context/AppProviders.jsx";
import { required, minLen, maxLen } from "../../utils/validators.js";
import { addSubject, removeSubject, markClass, undoLastClass, setTarget, resetAttendance, percent, classesCanSkip, classesToRecover } from "../../store/attendanceSlice.js";

const zone = (pct, target) => (pct >= target ? "safe" : pct >= target - 10 ? "warn" : "danger");
const ZONE_UI = {
  safe: { icon: ShieldCheck, label: "Safe zone" },
  warn: { icon: AlertTriangle, label: "Getting risky" },
  danger: { icon: Siren, label: "Danger zone" },
};

const wholeNumber = (label) => (v) => (/^\d+$/.test(String(v).trim()) ? "" : `${label} must be a whole number`);
const notMoreThanTotal = (v, all) => (Number(v) <= Number(all.total) ? "" : "Attended can't be more than total classes");
const atLeastOne = (v) => (Number(v) >= 1 ? "" : "Total classes must be at least 1");

export function AttendanceTracker() {
  const subjects = useSelector((st) => st.attendance.subjects);
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const toast = useToast();
  const [skipPlan, setSkipPlan] = useState({}); // { [subjectId]: classes you plan to miss }

  const form = useForm(
    { name: "", attended: "", total: "", target: "75" },
    {
      name: [required("Subject"), minLen("Subject", 2), maxLen("Subject", 40)],
      attended: [required("Attended"), wholeNumber("Attended"), notMoreThanTotal],
      total: [required("Total classes"), wholeNumber("Total classes"), atLeastOne],
    },
    (v, reset) => { dispatch(addSubject(v)); reset(); toast(`${v.name.trim()} added to your tracker.`, "success"); }
  );

  const totals = subjects.reduce((a, s) => ({ attended: a.attended + s.attended, total: a.total + s.total }), { attended: 0, total: 0 });
  const overall = percent(totals.attended, totals.total);
  const atRisk = subjects.filter((s) => percent(s.attended, s.total) < s.target);

  return (
    <div>
      <section className="card tl-overview">
        <div className="tl-ring" style={{ "--pct": Math.min(100, overall) }}>
          <div><strong>{subjects.length ? overall.toFixed(1) : "—"}%</strong><small>overall</small></div>
        </div>
        <div className="tl-overview__text">
          <p className="eyebrow">ATTENDANCE PANIC METER 2.0 //</p>
          <h2>{subjects.length === 0 ? "Add a subject to begin" : atRisk.length === 0 ? "You're safe everywhere 😎" : `${atRisk.length} subject${atRisk.length > 1 ? "s" : ""} below target`}</h2>
          <p className="muted">{totals.attended} attended out of {totals.total} classes across {subjects.length} subject{subjects.length === 1 ? "" : "s"}.</p>
          {atRisk.length > 0 && <p className="tl-risk-list">Needs attention: {atRisk.map((s) => s.name).join(", ")}</p>}
        </div>
        <button className="btn btn--outline" onClick={async () => { if (await confirm({ title: "Reset to demo data?", message: "This replaces all your tracked subjects.", confirmLabel: "Reset" })) { dispatch(resetAttendance()); toast("Attendance reset.", "info"); } }}>
          <RotateCcw size={15} /> Reset
        </button>
      </section>

      <form className="form card tl-add" onSubmit={form.handleSubmit} noValidate>
        <p className="eyebrow">ADD A SUBJECT //</p>
        <div className="tl-add__grid">
          <Field label="Subject" placeholder="e.g. Operating Systems" {...form.field("name")} />
          <Field label="Classes attended" inputMode="numeric" placeholder="e.g. 14" {...form.field("attended")} />
          <Field label="Total classes so far" inputMode="numeric" placeholder="e.g. 18" {...form.field("total")} />
          <Field label="Target %" as="select" {...form.field("target")}>{[65, 70, 75, 80, 85].map((t) => <option key={t} value={t}>{t}%</option>)}</Field>
        </div>
        <button type="submit" className="btn btn--primary"><Plus size={16} /> Add subject</button>
      </form>

      <div className="tl-subjects">
        {subjects.map((s) => {
          const pct = percent(s.attended, s.total);
          const z = zone(pct, s.target);
          const Z = ZONE_UI[z].icon;
          const skip = classesCanSkip(s.attended, s.total, s.target);
          const need = classesToRecover(s.attended, s.total, s.target);
          const plan = skipPlan[s.id] || 0;
          const predicted = percent(s.attended, s.total + plan);
          return (
            <article key={s.id} className={`card tl-subject tl-subject--${z}`}>
              <div className="tl-subject__head">
                <div><h3>{s.name}</h3><span className={`tl-badge tl-badge--${z}`}><Z size={13} /> {ZONE_UI[z].label}</span></div>
                <div className="tl-subject__pct">{pct.toFixed(1)}%</div>
              </div>
              <div className="tl-bar" role="img" aria-label={`${pct.toFixed(1)} percent attended, target ${s.target} percent`}>
                <span className={`tl-bar__fill tl-bar__fill--${z}`} style={{ width: `${Math.min(100, pct)}%` }} />
                <i className="tl-bar__target" style={{ left: `${s.target}%` }} title={`Target ${s.target}%`} />
              </div>
              <p className="tl-subject__line"><b>{s.attended}/{s.total}</b> classes · target {s.target}%</p>
              <p className="tl-advice">
                {z === "safe"
                  ? (skip === Infinity ? "No minimum set — skip away." : skip > 0 ? `You can safely skip ${skip} more class${skip > 1 ? "es" : ""}.` : "Right on the line — don't skip the next one.")
                  : need === Infinity ? "Only perfect attendance can fix this now." : `Attend the next ${need} class${need > 1 ? "es" : ""} in a row to get back to ${s.target}%.`}
              </p>

              <label className="tl-whatif">
                What if I skip the next <b>{plan}</b> class{plan === 1 ? "" : "es"}?
                <input type="range" min="0" max="10" value={plan} onChange={(e) => setSkipPlan((p) => ({ ...p, [s.id]: Number(e.target.value) }))} />
                {plan > 0 && <span className={predicted >= s.target ? "tl-ok" : "tl-bad"}>You'd drop to {predicted.toFixed(1)}% {predicted >= s.target ? "— still safe" : "— below target"}</span>}
              </label>

              <div className="tl-log" aria-label="Recent classes">{s.log.length === 0 ? <small className="muted">Mark today's class to start a streak log.</small> : s.log.map((l, i) => <span key={i} className={l === "P" ? "tl-dot tl-dot--p" : "tl-dot tl-dot--a"}>{l}</span>)}</div>

              <div className="tl-subject__actions">
                <button className="btn btn--primary" onClick={() => dispatch(markClass({ id: s.id, present: true }))}><Check size={15} /> Present</button>
                <button className="btn btn--outline" onClick={() => dispatch(markClass({ id: s.id, present: false }))}><X size={15} /> Absent</button>
                <button className="icon-btn" disabled={s.log.length === 0} onClick={() => dispatch(undoLastClass(s.id))} aria-label="Undo last mark" title="Undo last mark"><Undo2 size={16} /></button>
                <select value={s.target} onChange={(e) => dispatch(setTarget({ id: s.id, target: e.target.value }))} aria-label="Target percentage">{[65, 70, 75, 80, 85].map((t) => <option key={t} value={t}>{t}% target</option>)}</select>
                <button className="icon-btn" aria-label={`Delete ${s.name}`} title="Delete subject" onClick={async () => { if (await confirm({ title: `Delete ${s.name}?`, message: "Its attendance record will be removed.", confirmLabel: "Delete" })) dispatch(removeSubject(s.id)); }}><Trash2 size={16} /></button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="muted">Check your university's actual attendance rules — 75% is the common minimum, but yours may differ.</p>
    </div>
  );
}
