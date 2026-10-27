export function NotFoundPage({ navigate }) {
  return (
    <div className="protected">
      <p className="eyebrow">404 //</p>
      <h2>This ping doesn't exist</h2>
      <p className="muted">The page you're looking for wandered off campus.</p>
      <button className="btn btn--primary" onClick={() => navigate("home")}>
        Back to Home
      </button>
    </div>
  );
}
