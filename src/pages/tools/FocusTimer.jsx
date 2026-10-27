import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Play, Pause, RotateCcw, SkipForward, Trophy, Flame } from "lucide-react";
import { useToast } from "../../context/AppProviders.jsx";
import { completeSession, setDailyGoal, resetFocus, levelOf, titleOf, isToday, XP_PER_LEVEL } from "../../store/focusSlice.js";

const BREAK_MIN = 5;
const fmt = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
const RADIUS = 88;
const CIRC = 2 * Math.PI * RADIUS;

export function FocusTimer() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { xp, sessions, dailyGoal } = useSelector((st) => st.focus);
  const subjects = useSelector((st) => st.attendance.subjects);

  const [focusMin, setFocusMin] = useState(25);
  const [mode, setMode] = useState("focus"); // focus | break
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState("");

  const total = (mode === "focus" ? focusMin : BREAK_MIN) * 60;
  const latest = useRef({});
  latest.current = { mode, focusMin, label };
  const endAt = useRef(0);

  // Wall-clock based, so the countdown stays correct even if the tab is throttled.
  useEffect(() => {
    if (!running) return;
    endAt.current = Date.now() + left * 1000;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(id);
        setRunning(false);
        const { mode: m, focusMin: f, label: l } = latest.current;
        if (m === "focus") {
          dispatch(completeSession({ minutes: f, label: l.trim() }));
          toast(`Session complete! +${Math.max(5, Math.round(f * 0.4))} XP 🎉`, "success");
          setMode("break"); setLeft(BREAK_MIN * 60);
        } else {
          toast("Break over — ready for another round?", "info");
          setMode("focus"); setLeft(f * 60);
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show the countdown in the browser tab; restore the original title when it stops.
  useEffect(() => {
    if (!running) return;
    const original = document.title;
    return () => { document.title = original; };
  }, [running]);
  useEffect(() => {
    if (running) document.title = `${fmt(left)} · ${mode === "focus" ? "Focus" : "Break"} — Pingly`;
  }, [left, running, mode]);

  const chooseLength = (m) => { setFocusMin(m); if (mode === "focus") setLeft(m * 60); };
  const reset = () => { setRunning(false); setLeft(total); };
  const skip = () => { setRunning(false); const next = mode === "focus" ? "break" : "focus"; setMode(next); setLeft((next === "focus" ? focusMin : BREAK_MIN) * 60); };

  const todays = sessions.filter((s) => isToday(s.at));
  const todayMinutes = todays.reduce((n, s) => n + s.minutes, 0);
  const level = levelOf(xp);
  const intoLevel = xp % XP_PER_LEVEL;
  const dashOffset = CIRC * (left / total);

  const badges = [
    { icon: "🌱", name: "First Focus", ok: sessions.length >= 1, hint: "Finish 1 session" },
    { icon: "🔥", name: "Daily Goal", ok: todays.length >= dailyGoal, hint: `${dailyGoal} sessions in a day` },
    { icon: "📚", name: "Bookworm", ok: sessions.reduce((n, s) => n + s.minutes, 0) >= 150, hint: "150 total minutes" },
    { icon: "🏆", name: "Level 3", ok: level >= 3, hint: "Reach level 3" },
  ];

  return (
    <div className="tl-focus-grid">
      <section className="card tl-timer">
        <p className="eyebrow">{mode === "focus" ? "FOCUS TIME //" : "BREAK TIME //"}</p>
        <div className="tl-timer__ring">
          <svg viewBox="0 0 200 200" role="img" aria-label={`${fmt(left)} remaining`}>
            <circle cx="100" cy="100" r={RADIUS} className="tl-timer__track" />
            <circle cx="100" cy="100" r={RADIUS} className={"tl-timer__progress" + (mode === "break" ? " tl-timer__progress--break" : "")} strokeDasharray={CIRC} strokeDashoffset={CIRC - dashOffset} />
          </svg>
          <div className="tl-timer__time"><strong>{fmt(left)}</strong><small>{mode === "focus" ? "stay with it" : "stretch & breathe"}</small></div>
        </div>

        {mode === "focus" && (
          <div className="tl-lengths" role="group" aria-label="Session length">
            {[15, 25, 45].map((m) => <button key={m} disabled={running} className={"chip" + (focusMin === m ? " chip--active" : "")} onClick={() => chooseLength(m)}>{m} min</button>)}
          </div>
        )}
        <input className="tl-label" list="focus-subjects" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What are you studying? (optional)" maxLength={40} aria-label="What are you studying" />
        <datalist id="focus-subjects">{subjects.map((s) => <option key={s.id} value={s.name} />)}</datalist>

        <div className="tl-timer__buttons">
          <button className="btn btn--primary" onClick={() => setRunning((r) => !r)}>{running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> {left === total ? "Start" : "Resume"}</>}</button>
          <button className="btn btn--outline" onClick={reset}><RotateCcw size={15} /> Reset</button>
          <button className="btn btn--outline" onClick={skip}><SkipForward size={15} /> Skip</button>
        </div>
      </section>

      <section className="card tl-xp">
        <div className="tl-xp__head"><Trophy size={22} /><div><strong>Level {level} · {titleOf(xp)}</strong><small className="muted">{xp} XP total</small></div></div>
        <div className="tl-bar"><span className="tl-bar__fill tl-bar__fill--safe" style={{ width: `${intoLevel}%` }} /></div>
        <p className="muted">{XP_PER_LEVEL - intoLevel} XP to level {level + 1}. Earn XP from focus sessions (+10 per 25 min), posting memes (+10) and commenting (+2).</p>

        <p className="eyebrow" style={{ marginTop: 14 }}>TODAY //</p>
        <div className="tl-goal">
          {Array.from({ length: dailyGoal }).map((_, i) => <span key={i} className={"tl-goal__dot" + (i < todays.length ? " is-done" : "")}><Flame size={14} /></span>)}
        </div>
        <label className="tl-goal-input">Daily goal (sessions)<input type="number" min="1" max="12" value={dailyGoal} onChange={(e) => dispatch(setDailyGoal(e.target.value))} /></label>
        <p className="muted">{todays.length}/{dailyGoal} sessions · {todayMinutes} min focused today</p>

        <p className="eyebrow" style={{ marginTop: 14 }}>BADGES //</p>
        <div className="tl-badges">{badges.map((b) => <div key={b.name} className={b.ok ? "earned" : ""} title={b.hint}><span>{b.icon}</span><b>{b.name}</b></div>)}</div>

        {sessions.length > 0 && <>
          <p className="eyebrow" style={{ marginTop: 14 }}>RECENT SESSIONS //</p>
          <ul className="tl-sessions">{sessions.slice(0, 4).map((s) => <li key={s.id}><span>{s.label}</span><small>{s.minutes} min · +{s.xp} XP</small></li>)}</ul>
          <button className="link-btn" onClick={() => dispatch(resetFocus())}>Reset XP & history</button>
        </>}
      </section>
    </div>
  );
}
