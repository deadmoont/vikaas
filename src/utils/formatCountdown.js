// Shared by TestDashboardPage and SolvePage — both render the same
// .dashboard-timer pill off the same useCountdown(testStartTime,
// durationMinutes) value, so the display format and urgency thresholds
// live here once instead of duplicated per page.

const TEN_MINUTES = 10 * 60;
const TWO_MINUTES = 2 * 60;

// Seconds are hidden above 10 minutes remaining (just "H hr M min") and
// only appear once the countdown gets close enough that they're actually
// worth watching tick down.
export function formatCountdown(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  const showSeconds = clamped < TEN_MINUTES;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");

  if (h > 0) {
    return showSeconds ? `${h} hr ${mm} min ${ss} sec` : `${h} hr ${mm} min`;
  }
  return showSeconds ? `${mm} min ${ss} sec` : `${mm} min`;
}

// "normal" (green, the default) -> "warning" (amber, <10 min) -> "critical"
// (red, <2 min), matching formatCountdown's own seconds-visibility cutoff.
export function countdownUrgency(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  if (clamped < TWO_MINUTES) return "critical";
  if (clamped < TEN_MINUTES) return "warning";
  return "normal";
}
