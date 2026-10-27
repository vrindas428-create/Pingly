import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// One modal for the whole app: Esc and overlay click close it, focus moves in
// on open and returns to the trigger on close, and it's announced as a dialog.
export function Modal({ title, onClose, children }) {
  const boxRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    const first = boxRef.current.querySelector("input, textarea, select");
    (first || boxRef.current).focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      previous && previous.focus && previous.focus();
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={boxRef} onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <p className="eyebrow">PINGLY //</p>
        <h2 className="modal__title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
