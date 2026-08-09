import { useEffect, useState } from "react";

/**
 * A countdown derived from a fixed start timestamp + duration, rather than
 * a per-page ticking counter — so the remaining time stays perfectly
 * consistent whether you're looking at it on the Test Dashboard or a Solve
 * page, and survives navigating between them (each just re-derives it from
 * the same `startTime`, instead of resetting).
 */
export default function useCountdown(startTime, durationMinutes) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSeconds = Math.round(durationMinutes * 60);
  const elapsed = Math.floor((now - startTime) / 1000);
  return Math.max(0, totalSeconds - elapsed);
}
