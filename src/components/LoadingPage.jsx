// Brief transitional screen shown between a submit action and the page it
// leads to — e.g. Setup -> Instructions, or Start Test -> Test Dashboard.
// Sits on the same bare wrapper as FeedbackPage/SetupPage (no background
// override), so the usual dark gradient glow shows through behind it,
// matching the reference platform's own "Fetching test details" loader:
// four dots orbiting continuously, each pulsing between dim grey (at the
// back of the orbit) and bright green (at the front) as it swings through —
// see .loading-orbit-dot / @keyframes loading-orbit-move in index.css.
export default function LoadingPage({ message }) {
  return (
    <div className="loading-page">
      <div className="loading-orbit">
        <span className="loading-orbit-dot" />
        <span className="loading-orbit-dot" />
        <span className="loading-orbit-dot" />
        <span className="loading-orbit-dot" />
      </div>
      <p className="loading-page-message">{message}</p>
    </div>
  );
}
