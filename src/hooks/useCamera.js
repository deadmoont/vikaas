import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Wraps navigator.mediaDevices.getUserMedia for a webcam preview.
 * status: "idle" | "requesting" | "granted" | "denied" | "unsupported"
 */
export default function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const requestAccess = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      setError("This browser does not support camera access.");
      return;
    }

    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStatus("granted");
    } catch (err) {
      setStatus("denied");
      setError(
        err?.name === "NotAllowedError"
          ? "Camera access was denied. Please allow camera permission in your browser and try again."
          : err?.message || "Could not access the camera."
      );
    }
  }, []);

  useEffect(() => stop, [stop]);

  return { videoRef, status, error, requestAccess, stop };
}
