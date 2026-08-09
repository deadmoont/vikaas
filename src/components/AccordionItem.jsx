import Chevron from "./Chevron.jsx";

// Controlled (not self-managed) — PermissionsPage owns which single item is
// open so it can enforce "only one at a time" and auto-advance between them.
export default function AccordionItem({ icon, title, status, open, onToggle, children }) {
  return (
    <div className="accordion-item">
      <button className="accordion-header" onClick={onToggle}>
        <span className="accordion-title">
          <span className="accordion-icon">{icon}</span>
          {title}
          {status === "done" && <span className="status-check" aria-label="Completed">✓</span>}
        </span>
        <Chevron open={open} />
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}
