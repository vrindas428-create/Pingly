# Pingly — Your Campus. Your Community.

## Features

- Home feed with category filters, search, upvotes, comments, and save
- Create Post with an optional attached image (read client-side with `FileReader`)
- Notes Hub with an upload form
- Events with a register toggle
- Memes wall
- Placements board
- Lost & Found with a report form
- Saved (protected — requires logging in)
- Profile with a dynamic route param (`/profile/:username`)
- Light/dark theme toggle
- Sign in restricted to `@chitkara.edu.in` email addresses (checked with a regex — no backend/auth service, this is UI-only)

## Project structure

```
src/
  main.jsx              entry point
  App.jsx                top-level component, wires routing + state together
  index.css               all styling (box model, flexbox, grid, media queries)
  data/                   mock "database" objects (posts, notes, events, memes...)
  hooks/                  custom hooks (usePosts, useRouter, useAuth)
  components/             shared/reusable UI pieces (Navbar, Sidebar, PostCard, modals...)
  pages/                  one file per route/page
public/
  memes/                  meme images used on the Memes page
```

There's no router library available in this environment, so `useRouter.js`
hand-rolls a tiny version (navigate, back stack, `/:param` parsing) that
covers the same ideas — nested/dynamic routes, route params, protected
routes, and a 404 page.

## API integration

Pingly uses a real third-party REST API in the Profile → **GitHub API** tab.

- API: GitHub REST API (`api.github.com`)
- Profile endpoint: `/users/{username}`
- Repositories endpoint: `/users/{username}/repos?sort=updated&per_page=6`
- React uses `fetch()` to send GET requests.
- The response is converted to JSON and displayed in the UI.
- The screen handles loading, success, error, and retry states.
- No API key is required for these public GitHub endpoints.

This is a live API integration, while the rest of the demo content remains local prototype data.

## Run it locally

```
npm install
npm run dev
```

Then open the printed `localhost` URL (Vite defaults to `http://localhost:5173`).

## Evaluation II upgrades (lectures 43–72)

| Concept | Where |
|---|---|
| URL-aware routing, nested + dynamic + protected routes, 404 | `hooks/useRouter.js` (hash router), `#/profile/:username/(about\|github)`, login-gated actions |
| Context API, global vs local state | `context/AppProviders.jsx` (Theme, Toast, Auth) |
| Async state: loading / error / retry | `hooks/usePosts.js`, `components/GithubTab.jsx` |
| Form handling, validation, reusable inputs | `hooks/useForm.js`, `utils/validators.js`, `components/Field.jsx` |
| Modal, tabs, toast | `components/Modal.jsx`, `Tabs.jsx`, `ToastProvider` |
| Search, filter, sort | `pages/HomePage.jsx` |
| REST fetch, debounce, infinite scroll | `services/api.js`, `hooks/useDebounce.js`, `IntersectionObserver` in `HomePage` |
| Third-party API | GitHub tab on Profile (`api.github.com`) |
| CRUD | create / read / delete your own posts |

## Pingly Plus — 10 additive features
The new **Campus Hub +10** sidebar page adds a local prototype for: Find Your People, Study Buddy Finder, Campus Event Hub, Notes Exchange, Notifications Center, Student Marketplace, Placement Prep Tracker, Student Portfolio, XP & Rewards, and Pingly AI Study Assistant.

Most demo content is saved in browser `localStorage`. The AI assistant currently generates a simple local summary and starter questions; it is not connected to an AI API. People, marketplace, and notifications are prototype interactions and do not sync between students without a backend. Existing pages and components are retained.


---

## Evaluation Component 2 — what was added

| Rubric topic | Where it lives |
| --- | --- |
| **React Navigation layout & page structure** | `react-router-dom` (HashRouter). `src/App.jsx` defines a layout route (`AppLayout` = Navbar + Sidebar + `<Outlet/>`), param routes (`home/:category?`, `profile/:username?/:tab?`), a nested route group (`tools/attendance`, `tools/focus`, `tools/pulse`, `tools/books` rendered through `ToolsLayout`), an index redirect and a `*` 404 route. Links use `NavLink` for active styling. `hooks/useRouter.js` is a thin adapter so older pages keep working. |
| **Context API & state architecture** | Context = app-wide UI concerns: theme, toasts, auth and the new promise-based `useConfirm()` dialog (`context/AppProviders.jsx`). Redux = shared domain data. Local `useState` = form fields / open-closed UI. |
| **Redux Toolkit** | `src/store/`: `memesSlice` (upvote toggle, save, comments add/delete, create/delete meme, async `loadLiveMemes`), `attendanceSlice`, `focusSlice` (XP, reacts to meme actions through `extraReducers`), `pulseSlice` (weather / quote / joke / jobs via `createAsyncThunk`). State is persisted to localStorage in `store/index.js`. |
| **Form handling** | Every form uses the shared `useForm` hook + validators + `Field` component: meme creator (URL *or* file upload), attendance subject, signup with optional LinkedIn. |
| **API usage** | `services/api.js`: meme-api.com, Open-Meteo, DummyJSON quotes, Official Joke API, Remotive jobs, Open Library, GitHub (existing). All share one `getJson` helper with timeout, error and retry handling. |

### New user-facing features
- **Cancel an upvote** on posts, memes and the Saved page (click again).
- **Delete your own comments** on posts and memes (confirm dialog); delete your own memes too.
- **Study Tools** (`#/tools`): Attendance tracker with "can I skip?" calculator and what-if slider, Pomodoro focus timer with XP, levels and badges, Campus Pulse (live weather/quote/joke), textbook finder.
- **Live memes** button on the Memes page, **live job openings** on Placements, **XP chip** in the navbar.
