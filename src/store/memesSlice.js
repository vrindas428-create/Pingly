import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { INITIAL_MEMES } from "../data/memes.js";
import { fetchLiveMemes } from "../services/api.js";

// Async thunk: pulls fresh memes from a public API. RTK generates the
// pending / fulfilled / rejected actions that the reducers below handle.
export const loadLiveMemes = createAsyncThunk("memes/loadLive", async (subreddit = "memes", { rejectWithValue }) => {
  try {
    return await fetchLiveMemes(subreddit, 8);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const initialState = {
  items: INITIAL_MEMES,
  upvoted: [], // ids the current device has upvoted (toggle = cancel upvote)
  comments: {}, // { [memeId]: [{ id, text, author, authorEmail }] }
  liveStatus: "idle", // idle | loading | success | error
  liveError: "",
};

const memesSlice = createSlice({
  name: "memes",
  initialState,
  reducers: {
    // Click once to upvote, click again to cancel it.
    toggleUpvote(state, { payload: id }) {
      const meme = state.items.find((m) => m.id === id);
      if (!meme) return;
      if (state.upvoted.includes(id)) {
        state.upvoted = state.upvoted.filter((x) => x !== id);
        meme.upvotes = Math.max(0, meme.upvotes - 1);
      } else {
        state.upvoted.push(id);
        meme.upvotes += 1;
      }
    },
    toggleSaveMeme(state, { payload: id }) {
      const meme = state.items.find((m) => m.id === id);
      if (meme) meme.saved = !meme.saved;
    },
    addMeme(state, { payload }) {
      state.items.unshift(payload);
    },
    deleteMeme(state, { payload: id }) {
      state.items = state.items.filter((m) => m.id !== id);
      state.upvoted = state.upvoted.filter((x) => x !== id);
      delete state.comments[id];
    },
    addMemeComment(state, { payload: { memeId, comment } }) {
      (state.comments[memeId] ||= []).push(comment);
    },
    deleteMemeComment(state, { payload: { memeId, commentId } }) {
      state.comments[memeId] = (state.comments[memeId] || []).filter((c) => c.id !== commentId);
    },
    clearLiveMemes(state) {
      const liveIds = state.items.filter((m) => m.live).map((m) => m.id);
      state.items = state.items.filter((m) => !m.live);
      state.upvoted = state.upvoted.filter((id) => !liveIds.includes(id));
      liveIds.forEach((id) => delete state.comments[id]);
      state.liveStatus = "idle";
      state.liveError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLiveMemes.pending, (state) => {
        state.liveStatus = "loading";
        state.liveError = "";
      })
      .addCase(loadLiveMemes.fulfilled, (state, { payload }) => {
        const known = new Set(state.items.map((m) => m.id));
        const fresh = payload.filter((m) => !known.has(m.id));
        state.items.unshift(...fresh);
        state.liveStatus = fresh.length ? "success" : "error";
        state.liveError = fresh.length ? "" : "No new memes right now — try again in a moment.";
      })
      .addCase(loadLiveMemes.rejected, (state, { payload, error }) => {
        state.liveStatus = "error";
        state.liveError = payload || error.message || "Couldn’t load memes.";
      });
  },
});

export const { toggleUpvote, toggleSaveMeme, addMeme, deleteMeme, addMemeComment, deleteMemeComment, clearLiveMemes } = memesSlice.actions;
export default memesSlice.reducer;
