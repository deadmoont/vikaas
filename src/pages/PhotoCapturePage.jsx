import { useEffect, useRef, useState } from "react";

const CAPTURE_COUNTDOWN = 20; // seconds before auto-capture
const SUBMIT_COUNTDOWN = 3; // seconds the "Looking good" review screen holds before advancing

// Renders as a blurred overlay ON TOP OF the already-loaded TestDashboardPage
// (see App.jsx) — not a separate page before it — matching the reference,
// where the dashboard is visible-but-blurred behind the capture prompt.
// A live-camera identity-verification step that auto-captures a photo after
// a countdown (or on manual click), then briefly "submits" it before
// dismissing itself to reveal the dashboard underneath.
export default function PhotoCapturePage({ camera, onComplete }) {
  const videoRef = useRef(null);
  const [phase, setPhase] = useState("capturing"); // capturing | reviewing
  const [secondsLeft, setSecondsLeft] = useState(CAPTURE_COUNTDOWN);
  const [submitSecondsLeft, setSubmitSecondsLeft] = useState(SUBMIT_COUNTDOWN);
  const [photo, setPhoto] = useState(null);

  // Own local video element (not the shared VideoPreview) because capturing
  // a frame to canvas needs direct access to this exact DOM node.
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = camera.stream || null;
  }, [camera.stream]);

  const capture = () => {
    const video = videoRef.current;
    if (video && video.videoWidth) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      // Mirror it, matching the mirrored live preview the user was looking at.
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL("image/png"));
    }
    setPhase("reviewing");
    setSubmitSecondsLeft(SUBMIT_COUNTDOWN);
  };

  const retake = () => {
    setPhoto(null);
    setPhase("capturing");
    setSecondsLeft(CAPTURE_COUNTDOWN);
  };

  // Auto-capture countdown.
  useEffect(() => {
    if (phase !== "capturing") return;
    if (secondsLeft <= 0) {
      capture();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  // Auto-advance to the dashboard once "submitted".
  useEffect(() => {
    if (phase !== "reviewing") return;
    if (submitSecondsLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setSubmitSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, submitSecondsLeft, onComplete]);

  return (
    <div className="modal-overlay">
      <div className="photo-capture-card">
        <div className="photo-capture-frame">
          {phase === "capturing" ? (
            <video ref={videoRef} autoPlay playsInline muted className="photo-capture-video" />
          ) : (
            photo && <img src={photo} alt="Captured identity verification" />
          )}
        </div>

        {phase === "capturing" ? (
          <>
            <h2 className="panel-heading">Verify your identity</h2>
            <p className="muted-text">
              This photo will be used during your hiring process. We will take your photo
              automatically after <strong>{secondsLeft}</strong> second{secondsLeft === 1 ? "" : "s"}.
            </p>
            <button className="btn btn-secondary photo-capture-btn" onClick={capture}>
              📷 Capture photo
            </button>
          </>
        ) : (
          <>
            <h2 className="panel-heading">Looking good! ✨</h2>
            <p className="muted-text">Starting test automatically in {submitSecondsLeft} seconds.</p>
            <div className="photo-capture-actions">
              <button className="btn btn-primary" disabled>
                Submitting Image...
              </button>
              <button className="btn btn-outline" onClick={retake}>
                Retake
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
