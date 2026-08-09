import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Wraps navigator.mediaDevices.getUserMedia for a webcam preview.
 * status: "idle" | "requesting" | "granted" | "denied" | "unsupported"
 *
 * Exposes the raw MediaStream (not just a single video ref) because this
 * app shows the live feed in more than one place at different times (the
 * face-check modal, then the accordion's inline preview) — a stream can be
 * attached to any number of independent <video> elements via `.srcObject`,
 * but a single shared ref can only ever point at one DOM node at a time.
 * See `VideoPreview` for the consumer side of this.
 */
export default function useCamera() {
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = mediaStream;
      setStream(mediaStream);
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

  return { stream, status, error, requestAccess, stop };
}
