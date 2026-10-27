import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  subjects: [
    { id: "sub-1", name: "Data Structures", attended: 18, total: 22, target: 75, log: [] },
    { id: "sub-2", name: "DBMS", attended: 13, total: 20, target: 75, log: [] },
    { id: "sub-3", name: "Web Development", attended: 21, total: 22, target: 75, log: [] },
  ],
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    addSubject: {
      reducer(state, { payload }) {
        state.subjects.push(payload);
      },
      prepare({ name, attended, total, target }) {
        return { payload: { id: `sub-${Date.now()}`, name: name.trim(), attended: Number(attended), total: Number(total), target: Number(target), log: [] } };
      },
    },
    removeSubject(state, { payload: id }) {
      state.subjects = state.subjects.filter((s) => s.id !== id);
    },
    markClass(state, { payload: { id, present } }) {
      const s = state.subjects.find((x) => x.id === id);
      if (!s) return;
      s.total += 1;
      if (present) s.attended += 1;
      s.log = [...s.log, present ? "P" : "A"].slice(-12);
    },
    undoLastClass(state, { payload: id }) {
      const s = state.subjects.find((x) => x.id === id);
      if (!s || s.log.length === 0) return;
      const last = s.log[s.log.length - 1];
      s.total -= 1;
      if (last === "P") s.attended -= 1;
      s.log = s.log.slice(0, -1);
    },
    setTarget(state, { payload: { id, target } }) {
      const s = state.subjects.find((x) => x.id === id);
      if (s) s.target = Number(target);
    },
    resetAttendance() {
      return initialState;
    },
  },
});

export const { addSubject, removeSubject, markClass, undoLastClass, setTarget, resetAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;

// ---- pure helpers (also used by the UI) ----
export const percent = (attended, total) => (total > 0 ? (attended / total) * 100 : 0);

// How many more classes can be skipped while staying at/above the target.
export const classesCanSkip = (attended, total, target) => {
  if (target <= 0) return Infinity;
  return Math.max(0, Math.floor((attended * 100) / target - total));
};
// How many classes in a row must be attended to climb back to the target.
export const classesToRecover = (attended, total, target) => {
  if (percent(attended, total) >= target) return 0;
  if (target >= 100) return Infinity;
  return Math.ceil((target * total - 100 * attended) / (100 - target));
};
