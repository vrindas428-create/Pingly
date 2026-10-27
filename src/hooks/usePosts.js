import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage.js";
import { fetchPosts } from "../services/api.js";

// Posts are fetched once from /data/posts.json (real fetch, with loading,
// error and retry states), then cached in localStorage. Saves and upvotes
// are stored per logged-in user instead of on the post itself.
export function usePosts(user) {
  const [raw, setRaw] = useLocalStorage("pingly:v2:posts", null);
  const [savedMap, setSavedMap] = useLocalStorage("pingly:v2:saved", {});
  const [votedMap, setVotedMap] = useLocalStorage("pingly:v2:voted", {});
  const [status, setStatus] = useState(raw ? "success" : "loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const me = user ? user.email : "guest";

  useEffect(() => {
    if (raw) return;
    let cancelled = false;
    setStatus("loading");
    fetchPosts()
      .then((data) => { if (!cancelled) { setRaw(data); setStatus("success"); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setStatus("error"); } });
    return () => { cancelled = true; };
  }, [attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const mySaved = savedMap[me] || [];
  const myVoted = votedMap[me] || [];
  const posts = useMemo(() => (raw || []).map((p) => ({ ...p, saved: mySaved.includes(p.id) })), [raw, mySaved]);

  const toggleIn = (setter, id) =>
    setter((prev) => {
      const list = prev[me] || [];
      return { ...prev, [me]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] };
    });

  const hasUpvoted = useCallback((id) => myVoted.includes(id), [myVoted]);
  // Click once to upvote, click again to cancel it.
  const upvote = (id) => {
    const had = myVoted.includes(id);
    setRaw((prev) => prev.map((p) => (p.id === id ? { ...p, upvotes: Math.max(0, p.upvotes + (had ? -1 : 1)) } : p)));
    toggleIn(setVotedMap, id);
  };
  const toggleSave = (id) => toggleIn(setSavedMap, id);
  const addComment = (id, text) =>
    setRaw((prev) => prev.map((p) => (p.id === id ? { ...p, comments: [...p.comments, { id: crypto.randomUUID(), author: user.name, authorEmail: user.email, text }] } : p)));
  const deleteComment = (postId, commentId) =>
    setRaw((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p)));
  const addPost = (post) => setRaw((prev) => [{ ...post, id: crypto.randomUUID(), upvotes: 0, comments: [] }, ...prev]);
  const deletePost = (id) => setRaw((prev) => prev.filter((p) => p.id !== id));
  const retry = () => { setError(""); setAttempt((a) => a + 1); };

  return { posts, status, error, retry, upvote, hasUpvoted, toggleSave, addComment, deleteComment, addPost, deletePost };
}
