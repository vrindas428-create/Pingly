import { createSlice } from "@reduxjs/toolkit";
import { addMeme, addMemeComment, deleteMemeComment } from "./memesSlice.js";

const initialState = { xp: 0, sessions: [], dailyGoal: 4 };

// XP lives in Redux so *any* slice or page can reward the student. The
// extraReducers below listen to actions from the memes slice — that's how
// "post a meme -> +10 XP" works without the meme code knowing about XP.
const focusSlice = createSlice({
  name: "focus",
  initialState,
  reducers: {
    completeSession: {
      reducer(state, { payload }) {
        state.sessions.unshift(payload);
        state.sessions = state.sessions.slice(0, 50);
        state.xp += payload.xp;
      },
      prepare({ minutes, label }) {
        return { payload: { id: `ses-${Date.now()}`, minutes, label: label || "Focus session", xp: Math.max(5, Math.round(minutes * 0.4)), at: new Date().toISOString() } };
      },
    },
    setDailyGoal(state, { payload }) {
      state.dailyGoal = Math.min(12, Math.max(1, Number(payload) || 1));
    },
    resetFocus() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addMeme, (state) => { state.xp += 10; })
      .addCase(addMemeComment, (state) => { state.xp += 2; })
      .addCase(deleteMemeComment, (state) => { state.xp = Math.max(0, state.xp - 2); });
  },
});

export const { completeSession, setDailyGoal, resetFocus } = focusSlice.actions;
export default focusSlice.reducer;

export const XP_PER_LEVEL = 100;
export const levelOf = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const LEVEL_TITLES = ["Fresher", "Note Taker", "Library Regular", "Deadline Dodger", "Exam Slayer", "Campus Legend"];
export const titleOf = (xp) => LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, levelOf(xp) - 1)];
export const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();
