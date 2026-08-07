// Shared collapsible-toggle chevron. A plain SVG (not a Unicode glyph like
// "⌄"/"⌃") so it renders crisply and consistently across fonts/browsers,
// and respects `currentColor` for theming. Points down by default; callers
// rotate it via the .accordion-chevron--open class when expanded.
export default function Chevron({ open, className = "" }) {
  return (
    <svg
      className={`accordion-chevron ${open ? "accordion-chevron--open" : ""} ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
