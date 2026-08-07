import { useState } from "react";

export default function AccordionItem({ icon, title, status, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="accordion-item">
      <button className="accordion-header" onClick={() => setOpen((o) => !o)}>
        <span className="accordion-title">
          <span className="accordion-icon">{icon}</span>
          {title}
          {status === "done" && <span className="status-check" aria-label="Completed">✓</span>}
        </span>
        <span className={`accordion-chevron ${open ? "accordion-chevron--open" : ""}`}>⌄</span>
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}
