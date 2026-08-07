import { useCallback, useEffect, useState } from "react";

/**
 * Wraps the browser Fullscreen API.
 * Tracks whether the document is currently fullscreen (including exits
 * triggered by the user pressing Esc, not just our own button).
 */
export default function useFullscreen(targetRef) {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const enter = useCallback(async () => {
    setError(null);
    try {
      const el = targetRef?.current || document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        // Safari
        el.webkitRequestFullscreen();
      } else {
        throw new Error("Fullscreen API is not supported in this browser.");
      }
    } catch (err) {
      setError(err.message || "Could not enter fullscreen mode.");
    }
  }, [targetRef]);

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  }, []);

  return { isFullscreen, enter, exit, error };
}
