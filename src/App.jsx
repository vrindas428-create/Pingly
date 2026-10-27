import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, Navigate, Outlet, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { usePosts } from "./hooks/usePosts.js";
import { useRouter } from "./hooks/useRouter.js";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { useAuth, useTheme } from "./context/AppProviders.jsx";

import { INITIAL_NOTES } from "./data/notes.js";
import { INITIAL_EVENTS } from "./data/events.js";
import { INITIAL_PLACEMENTS } from "./data/placements.js";
import { INITIAL_LOSTFOUND } from "./data/lostFound.js";

import { Navbar } from "./components/Navbar.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { CreatePostModal } from "./components/CreatePostModal.jsx";

import { HomePage } from "./pages/HomePage.jsx";
import { CommunitiesPage } from "./pages/CommunitiesPage.jsx";
import { NotesPage } from "./pages/NotesPage.jsx";
import { EventsPage } from "./pages/EventsPage.jsx";
import { MemesPage } from "./pages/MemesPage.jsx";
import { InternshipsPage } from "./pages/InternshipsPage.jsx";
import { LostFoundPage } from "./pages/LostFoundPage.jsx";
import { SavedPage } from "./pages/SavedPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { CampusPlusPage } from "./pages/CampusPlusPage.jsx";
import { ToolsLayout } from "./pages/tools/ToolsLayout.jsx";
import { AttendanceTracker } from "./pages/tools/AttendanceTracker.jsx";
import { FocusTimer } from "./pages/tools/FocusTimer.jsx";
import { CampusPulse } from "./pages/tools/CampusPulse.jsx";
import { BookFinder } from "./pages/tools/BookFinder.jsx";
import { toggleUpvote, toggleSaveMeme as toggleSaveMemeAction } from "./store/memesSlice.js";

// Layout route: the Navbar + Sidebar stay mounted while <Outlet /> swaps pages.
function AppLayout({ navbar, sidebar }) {
  return (
    <>
      <Navbar {...navbar} />
      <div className="shell">
        <Sidebar {...sidebar} />
        <main className="main"><Outlet /></main>
      </div>
    </>
  );
}

// Route wrappers read URL params (/home/:category, /profile/:username/:tab)
function HomeRoute(props) {
  const { category } = useParams();
  return <HomePage {...props} initialCategory={category} />;
}
function ProfileRoute(props) {
  const { username, tab } = useParams();
  return <ProfilePage key={username || "me"} param={username} sub={tab} {...props} />;
}

export default function App() {
  const { page, navigate, goBack, route } = useRouter();
  const { theme } = useTheme();
  const { user, isLoggedIn, openLogin, requireLogin } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);

  const postsApi = usePosts(user);
  const [notes, setNotes] = useLocalStorage("pingly:v2:notes", INITIAL_NOTES);
  const [events, setEvents] = useLocalStorage("pingly:v3:events", INITIAL_EVENTS);
  // Memes (+ upvotes, comments, live API) live in the Redux store; see src/store/memesSlice.js.
  const dispatch = useDispatch();
  const memes = useSelector((st) => st.memes.items);
  const upvotedMemeIds = useSelector((st) => st.memes.upvoted);
  const [placements, setPlacements] = useLocalStorage("pingly:v3:placements", INITIAL_PLACEMENTS);
  const [lostFoundItems, setLostFoundItems] = useLocalStorage("pingly:v3:lostfound", INITIAL_LOSTFOUND);

  // Actions that change shared content need a logged-in student.
  const guard = (why, fn) => (...args) => {
    if (requireLogin(why)) return fn(...args);
  };

  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        e.preventDefault();
        searchRef.current && searchRef.current.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const addNote = useCallback((note) => setNotes((prev) => [{ ...note, id: crypto.randomUUID() }, ...prev]), [setNotes]);
  const toggleEventRegister = (id) => setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, registered: !ev.registered } : ev)));
  const toggleSaveEvent = (id) => setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, saved: !ev.saved } : ev)));
  // Click once to upvote, click again to cancel the upvote.
  const upvoteMeme = (id) => dispatch(toggleUpvote(id));
  const hasUpvotedMeme = (id) => upvotedMemeIds.includes(id);
  const toggleSaveMeme = (id) => dispatch(toggleSaveMemeAction(id));
  const toggleInterest = (id) => setPlacements((prev) => prev.map((p) => (p.id === id ? { ...p, interested: !p.interested } : p)));
  const addLostFoundItem = (item) => setLostFoundItems((prev) => [{ ...item, id: crypto.randomUUID() }, ...prev]);

  const upvote = guard("upvote", postsApi.upvote);
  const toggleSave = guard("save posts", postsApi.toggleSave);
  const addComment = guard("comment", postsApi.addComment);
  const deleteComment = guard("delete a comment", postsApi.deleteComment);

  const protectedSaved = (
    <SavedPage
      posts={postsApi.posts}
      memes={memes}
      events={events}
      isLoggedIn={isLoggedIn}
      onLoginClick={openLogin}
      upvote={upvote}
      hasUpvoted={postsApi.hasUpvoted}
      toggleSave={toggleSave}
      addComment={addComment}
      deleteComment={deleteComment}
      user={user}
      upvoteMeme={guard("upvote", upvoteMeme)}
      hasUpvotedMeme={hasUpvotedMeme}
      toggleSaveMeme={toggleSaveMeme}
      toggleSaveEvent={toggleSaveEvent}
    />
  );

  return (
    <div className={"app app--" + theme}>
      <Routes>
        <Route
          element={
            <AppLayout
              navbar={{ page, navigate, search, setSearch, searchRef, menuOpen, setMenuOpen, onCreateClick: () => requireLogin("create a post") && setShowCreate(true) }}
              sidebar={{ page, route, navigate, goBack, menuOpen, setMenuOpen }}
            />
          }
        >
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home/:category?" element={<HomeRoute {...postsApi} upvote={upvote} toggleSave={toggleSave} addComment={addComment} deleteComment={deleteComment} user={user} search={search} />} />
          <Route path="communities" element={<CommunitiesPage posts={postsApi.posts} navigate={navigate} />} />
          <Route path="notes" element={<NotesPage notes={notes} addNote={guard("upload notes", addNote)} />} />
          <Route path="events" element={<EventsPage events={events} toggleRegister={guard("register", toggleEventRegister)} toggleSave={guard("save events", toggleSaveEvent)} requireLogin={requireLogin} />} />
          <Route path="memes" element={<MemesPage memes={memes} upvote={guard("upvote", upvoteMeme)} hasUpvoted={hasUpvotedMeme} toggleSave={guard("save memes", toggleSaveMeme)} />} />
          <Route path="placements" element={<Navigate to="/internships" replace />} />
          <Route path="internships" element={<InternshipsPage placements={placements} toggleInterest={guard("mark interest", toggleInterest)} requireLogin={requireLogin} />} />
          <Route path="lostfound" element={<LostFoundPage items={lostFoundItems} addItem={addLostFoundItem} requireLogin={requireLogin} />} />
          <Route path="saved" element={protectedSaved} />
          <Route path="tools" element={<ToolsLayout />}>
            <Route index element={<Navigate to="attendance" replace />} />
            <Route path="attendance" element={<AttendanceTracker />} />
            <Route path="focus" element={<FocusTimer />} />
            <Route path="pulse" element={<CampusPulse />} />
            <Route path="books" element={<BookFinder />} />
          </Route>
          <Route path="campus-hub" element={<CampusPlusPage />} />
          <Route path="profile/:username?/:tab?" element={<ProfileRoute navigate={navigate} isLoggedIn={isLoggedIn} user={user} posts={postsApi.posts} />} />
          <Route path="*" element={<NotFoundPage navigate={navigate} />} />
        </Route>
      </Routes>
      {showCreate && <CreatePostModal user={user} onClose={() => setShowCreate(false)} onSubmit={postsApi.addPost} />}
    </div>
  );
}
