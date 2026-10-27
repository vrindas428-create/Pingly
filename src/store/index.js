import { configureStore } from "@reduxjs/toolkit";
import memes from "./memesSlice.js";
import attendance from "./attendanceSlice.js";
import focus from "./focusSlice.js";
import pulse from "./pulseSlice.js";

// Redux Toolkit store. Domain data (memes, attendance, focus/XP) is persisted
// to localStorage; API results (pulse) are always re-fetched fresh.
const KEY = "pingly:v3:redux";

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return undefined;
    const saved = JSON.parse(raw);
    if (saved.memes) saved.memes = { ...saved.memes, liveStatus: "idle", liveError: "" };
    return saved;
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: { memes, attendance, focus, pulse },
  preloadedState: load(),
});

let timer;
store.subscribe(() => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const { memes, attendance, focus } = store.getState();
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ memes, attendance, focus }));
    } catch {
      window.dispatchEvent(new Event("pingly:storage-error"));
    }
  }, 200);
});
