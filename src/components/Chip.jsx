export function Chip({ active, children, onClick }) {
  return (
    <button className={"chip" + (active ? " chip--active" : "")} onClick={onClick} type="button">
      {children}
    </button>
  );
}
