import { useState } from "react";
import { ArrowUp, MessageCircle, Bookmark, Share2, Trash2 } from "lucide-react";
import { useToast, useConfirm } from "../context/AppProviders.jsx";

export function PostCard({ post, onUpvote, alreadyUpvoted, onToggleSave, onAddComment, canDelete, onDelete, user, onDeleteComment }) {
  const toast = useToast();
  const confirm = useConfirm();
  async function share() {
    try {
      await navigator.clipboard.writeText(`${post.title} — ${window.location.origin}/#/home`);
      toast("Link copied to clipboard.", "success");
    } catch {
      toast("Couldn’t copy the link on this browser.", "error");
    }
  }
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText("");
  }

  return (
    <article className="card post-card">
      <div className="post-card__head">
        <div className="avatar">{post.author.slice(0, 2).toUpperCase()}</div>
        <div>
          <div className="post-card__author">
            {post.author}
            {post.verified && <span className="badge">✓ Verified</span>}
          </div>
          <div className="post-card__meta">
            {post.authorInfo ? post.authorInfo + " · " : ""}
            {post.category} // Chitkara Community
          </div>
        </div>
      </div>

      {post.image && <img className="post-card__image" src={post.image} alt={post.title} />}

      <h3 className="post-card__title">{post.title}</h3>
      {post.desc && <p className="post-card__desc">{post.desc}</p>}

      {post.tags && post.tags.length > 0 && (
        <div className="tag-row">
          {post.tags.map((t) => (
            <span className="tag" key={t}>
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="post-card__actions">
        <button
          className={"action" + (alreadyUpvoted ? " action--active" : "")}
          onClick={() => onUpvote(post.id)}
          aria-pressed={alreadyUpvoted}
          aria-label={alreadyUpvoted ? "Remove your upvote" : "Upvote post"}
          title={alreadyUpvoted ? "Click again to remove your upvote" : "Upvote"}
        >
          <ArrowUp size={16} /> {post.upvotes}
        </button>
        <button className="action" onClick={() => setShowComments((s) => !s)} aria-label="Toggle comments">
          <MessageCircle size={16} /> Comment ({post.comments.length})
        </button>
        <button
          className={"action" + (post.saved ? " action--active" : "")}
          onClick={() => onToggleSave(post.id)}
          aria-label="Save post"
        >
          <Bookmark size={16} /> {post.saved ? "Saved" : "Save"}
        </button>
        <button className="action" aria-label="Share post" onClick={share}>
          <Share2 size={16} /> Share
        </button>
        {canDelete && (
          <button className="action" aria-label="Delete post" onClick={async () => (await confirm({ title: "Delete this post?", message: "This can't be undone.", confirmLabel: "Delete" })) && onDelete(post.id)}>
            <Trash2 size={16} /> Delete
          </button>
        )}
      </div>

      {showComments && (
        <div className="comments">
          {post.comments.map((c) => (
            <div className="comment" key={c.id}>
              <span><strong>{c.author}</strong> {c.text}</span>
              {user && onDeleteComment && c.authorEmail === user.email && (
                <button
                  className="comment__delete"
                  aria-label="Delete your comment"
                  title="Delete your comment"
                  onClick={async () => {
                    if (await confirm({ title: "Delete your comment?", message: "This will remove it for everyone.", confirmLabel: "Delete" })) {
                      onDeleteComment(post.id, c.id);
                      toast("Comment deleted.", "info");
                    }
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
          <form className="comment-form" onSubmit={submitComment}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              aria-label="Write a comment"
            />
            <button type="submit">Post</button>
          </form>
        </div>
      )}
    </article>
  );
}
