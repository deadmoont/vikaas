// Brief transitional screen shown between a submit action and the page it
// leads to — e.g. Setup -> Instructions, or Start Test -> Test Dashboard.
// Sits on the same bare wrapper as FeedbackPage/SetupPage (no background
// override), so the usual dark gradient glow shows through behind it,
// matching the reference platform's own "Fetching test details" loader.
export default function LoadingPage({ message }) {
  return (
    <div className="loading-page">
      <div className="loading-dots">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
      <p className="loading-page-message">{message}</p>
    </div>
  );
}
