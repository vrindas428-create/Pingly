export function PageHeader({ eyebrow, title, sub, children }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="section-title section-title--lg">{title}</h1>
        <p className="hero__sub">{sub}</p>
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
