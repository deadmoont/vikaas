export default function Sidebar({ config }) {
  const { testTitle, poweredBy, footerLinks, durationMinutes, loginWindow } = config;

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">{testTitle}</h1>

      <div className="sidebar-footer">
        <div className="duration-card">
          <div className="duration-card-row">
            <span className="clock-icon" aria-hidden="true">
              {/* Raw emoji glyphs ignore CSS `color` and render in their own
                  fixed tone — same issue the theme-toggle icon had. */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15.5 13.5" />
              </svg>
            </span>
            <strong>Test duration: {durationMinutes} minutes</strong>
          </div>
          <p className="duration-card-text">
            You may log in any time between {loginWindow.start} {loginWindow.timezone} and{" "}
            {loginWindow.end} {loginWindow.timezone}.
          </p>
        </div>

        <div className="sidebar-brand">
          <span className="brand-powered">Powered by</span>{" "}
          <span className="brand-wordmark">
            {poweredBy}
            <span className="brand-mark" aria-hidden="true" />
          </span>
        </div>

        <nav className="sidebar-links">
          {footerLinks.map((link) => (
            <a key={link.label} href={link.href} onClick={(e) => e.preventDefault()}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
