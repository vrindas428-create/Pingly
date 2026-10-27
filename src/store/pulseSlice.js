import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWeather, fetchQuote, fetchJoke, fetchJobs } from "../services/api.js";

// A tiny factory so every API call gets the same pending/fulfilled/rejected handling.
const makeThunk = (name, fn) =>
  createAsyncThunk(`pulse/${name}`, async (_arg, { rejectWithValue }) => {
    try { return await fn(); } catch (e) { return rejectWithValue(e.message); }
  });

export const loadWeather = makeThunk("weather", fetchWeather);
export const loadQuote = makeThunk("quote", fetchQuote);
export const loadJoke = makeThunk("joke", fetchJoke);
export const loadJobs = makeThunk("jobs", fetchJobs);

const blank = { data: null, status: "idle", error: "" };
const initialState = { weather: blank, quote: blank, joke: blank, jobs: blank };

const slice = createSlice({
  name: "pulse",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    [["weather", loadWeather], ["quote", loadQuote], ["joke", loadJoke], ["jobs", loadJobs]].forEach(([key, thunk]) => {
      builder
        .addCase(thunk.pending, (s) => { s[key].status = "loading"; s[key].error = ""; })
        .addCase(thunk.fulfilled, (s, { payload }) => { s[key] = { data: payload, status: "success", error: "" }; })
        .addCase(thunk.rejected, (s, { payload, error }) => { s[key].status = "error"; s[key].error = payload || error.message; });
    });
  },
});

export default slice.reducer;
