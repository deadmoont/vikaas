import { createPortal } from "react-dom";

// Rendered via a portal straight into <body> — not just nested where it's
// used in JSX — so it always centers on the true viewport and can never get
// trapped inside an ancestor's containing block (e.g. an element mid-CSS
// animation, which computes a non-`none` transform for its duration/fill).
export default function Modal({ title, onClose, children, footer }) {
  return createPortal(
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
