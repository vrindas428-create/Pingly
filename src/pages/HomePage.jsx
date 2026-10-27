import { useState, useMemo, useEffect, useRef } from "react";
import { CATEGORIES } from "../data/categories.js";
import { Chip } from "../components/Chip.jsx";
import { PostCard } from "../components/PostCard.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { useDebounce } from "../hooks/useDebounce.js";

const PAGE_SIZE = 5;
const SORTS = {
  newest: () => 0, // array order: newest posts are added to the front
  top: (a, b) => b.upvotes - a.upvotes,
  discussed: (a, b) => b.comments.length - a.comments.length,
};

export function HomePage({ posts, status, error, retry, upvote, hasUpvoted, toggleSave, addComment, deleteComment, deletePost, user, search, initialCategory }) {
  const [activeCat, setActiveCat] = useState("All");
  const [sort, setSort] = useState("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);
  const query = useDebounce(search, 300); // don't re-filter on every keystroke

  useEffect(() => {
    if (initialCategory && CATEGORIES.includes(initialCategory)) setActiveCat(initialCategory);
  }, [initialCategory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => {
        if (activeCat !== "All" && p.category !== activeCat) return false;
        if (!q) return true;
        return [p.title, p.desc, p.category, p.author, ...(p.tags || [])].filter(Boolean).join(" ").toLowerCase().includes(q);
      })
      .sort(SORTS[sort]);
  }, [posts, activeCat, query, sort]);

  useEffect(() => setVisible(PAGE_SIZE), [activeCat, query, sort]);

  // Infinite scroll: reveal 5 more posts whenever the sentinel scrolls into view.
  const hasMore = visible < filtered.length;
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const obs = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible((v) => v + PAGE_SIZE), { rootMargin: "200px" });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, visible]);

  const totalUpvotes = posts.reduce((n, p) => n + p.upvotes, 0);
  const totalComments = posts.reduce((n, p) => n + p.comments.length, 0);

  return (
    <div>
      <section className="hero">
        <p className="eyebrow">CHITKARA COMMUNITY FEED //</p>
        <h1 className="hero__title">Everything happening at Chitkara,<br /><em>in one place.</em></h1>
        <p className="hero__sub">Notes, communities, events, memes and everything student life.</p>
      </section>

      <div className="stats-bar">
        <div><strong>{posts.length}</strong> pings</div>
        <div><strong>{totalUpvotes}</strong> upvotes</div>
        <div><strong>{totalComments}</strong> comments</div>
      </div>

      <p className="eyebrow" style={{ marginTop: 28 }}>LATEST PINGS //</p>
      <h2 className="section-title">What’s happening</h2>

      <div className="chip-row">
        {CATEGORIES.map((c) => <Chip key={c} active={c === activeCat} onClick={() => setActiveCat(c)}>{c}</Chip>)}
      </div>
      <div className="sort-row">
        <label>Sort by{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="top">Most upvoted</option>
            <option value="discussed">Most discussed</option>
          </select>
        </label>
        <span className="muted">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
      </div>

      {status === "loading" ? (
        <EmptyState title="Loading pings…" hint="Fetching the latest posts." />
      ) : status === "error" ? (
        <div className="empty">
          <p className="empty__title">Couldn’t load the feed</p>
          <p className="form-error">{error}</p>
          <button className="btn btn--primary" onClick={retry}>Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nothing here yet" hint="Try a different category or search term." />
      ) : (
        <>
          {filtered.slice(0, visible).map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpvote={upvote}
              alreadyUpvoted={hasUpvoted(post.id)}
              onToggleSave={toggleSave}
              onAddComment={addComment}
              user={user}
              onDeleteComment={deleteComment}
              canDelete={!!user && post.author === user.name}
              onDelete={deletePost}
            />
          ))}
          {hasMore && <div ref={sentinelRef} className="sentinel muted">Loading more…</div>}
        </>
      )}
    </div>
  );
}
