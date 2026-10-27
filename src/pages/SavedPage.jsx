import { LogIn, ArrowUp, Bookmark, Clock, MapPin } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { PostCard } from "../components/PostCard.jsx";
import { EmptyState } from "../components/EmptyState.jsx";

export function SavedPage({
  posts,
  memes,
  events,
  isLoggedIn,
  onLoginClick,
  upvote,
  hasUpvoted,
  toggleSave,
  addComment,
  deleteComment,
  user,
  upvoteMeme,
  hasUpvotedMeme,
  toggleSaveMeme,
  toggleSaveEvent,
}) {
  if (!isLoggedIn) {
    // Protected route: only signed-in students can view their saved posts.
    return (
      <div className="protected">
        <p className="eyebrow">SIGN IN REQUIRED //</p>
        <h2>Log in to see your saved posts</h2>
        <p className="muted">Saved is a protected page — only verified students can access it.</p>
        <button className="btn btn--primary" onClick={onLoginClick}>
          <LogIn size={16} /> Log in with college email
        </button>
      </div>
    );
  }

  const savedPosts = posts.filter((p) => p.saved);
  const savedMemes = memes.filter((m) => m.saved);
  const savedEvents = events.filter((ev) => ev.saved);
  const nothingSaved = savedPosts.length === 0 && savedMemes.length === 0 && savedEvents.length === 0;

  return (
    <div>
      <PageHeader
        eyebrow="YOUR LIBRARY //"
        title="Saved"
        sub="Posts, memes and events you've bookmarked — stored right in your browser."
      />

      {nothingSaved && (
        <EmptyState title="You haven't saved anything yet" hint="Tap Save on any post, meme or event to bookmark it here." />
      )}

      {savedPosts.length > 0 && (
        <>
          <p className="eyebrow" style={{ marginTop: 10 }}>
            SAVED POSTS //
          </p>
          {savedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpvote={upvote}
              alreadyUpvoted={hasUpvoted(post.id)}
              onToggleSave={toggleSave}
              onAddComment={addComment}
              user={user}
              onDeleteComment={deleteComment}
            />
          ))}
        </>
      )}

      {savedMemes.length > 0 && (
        <>
          <p className="eyebrow" style={{ marginTop: 22 }}>
            SAVED MEMES //
          </p>
          <div className="grid-cards" style={{ marginBottom: 18 }}>
            {savedMemes.map((m) => (
              <div className="card meme-card" key={m.id}>
                <img className="meme-card__image" src={m.image} alt={m.caption || `Meme posted by ${m.author}`} />
                <div className="meme-card__footer">
                  <div>
                    <p className="eyebrow" style={{ marginBottom: 2 }}>
                      {m.topic} //
                    </p>
                    <p className="muted" style={{ marginBottom: 0 }}>
                      Posted by {m.author}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className={"action" + (hasUpvotedMeme(m.id) ? " action--active" : "")}
                      onClick={() => upvoteMeme(m.id)}
                      title={hasUpvotedMeme(m.id) ? "Click again to remove your upvote" : "Upvote"}
                    >
                      <ArrowUp size={16} /> {m.upvotes}
                    </button>
                    <button className="action action--active" onClick={() => toggleSaveMeme(m.id)}>
                      <Bookmark size={16} /> Saved
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {savedEvents.length > 0 && (
        <>
          <p className="eyebrow" style={{ marginTop: 22 }}>
            SAVED EVENTS //
          </p>
          <div className="grid-cards">
            {savedEvents.map((ev) => (
              <div className="card" key={ev.id}>
                {ev.image ? <img className="event-banner__image" src={ev.image} alt={ev.title} loading="lazy" /> : <div className="event-banner">{ev.tag}</div>}
                <p className="eyebrow">{ev.tag} //</p>
                <h3>{ev.title}</h3>
                <p className="muted">
                  <Clock size={14} /> {ev.date}
                </p>
                <p className="muted">
                  <MapPin size={14} /> {ev.place}
                </p>
                <button className="link-btn" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => toggleSaveEvent(ev.id)}>
                  <Bookmark size={14} /> Remove from Saved
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
