import { useState } from "react";
import testConfig from "../config/testConfig.js";
import AccordionItem from "../components/AccordionItem.jsx";
import Modal from "../components/Modal.jsx";

// Nav buttons (Back/Start Test) live in the page-level footer (see App.jsx),
// since they need to be enabled/disabled based on camera + fullscreen state.
// `camera` and `fullscreen` are the hook instances, lifted up to App so the
// footer button can read them too.
export default function PermissionsPage({ camera, fullscreen }) {
  const { integrityGuidelinesIntro, integrityGuidelines, permissionsIntro, webcamPermission, monitorPermission, fullscreenPermission } =
    testConfig;

  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showWebcamPreCheck, setShowWebcamPreCheck] = useState(false);
  const [monitorStatus, setMonitorStatus] = useState("idle"); // idle | checking | single | multiple | unsupported

  const monitorChecked = monitorStatus !== "idle" && monitorStatus !== "checking";
  const cameraGranted = camera.status === "granted";

  const checkMonitors = async () => {
    setMonitorStatus("checking");
    try {
      if (typeof window.getScreenDetails === "function") {
        const details = await window.getScreenDetails();
        setMonitorStatus(details.screens.length > 1 ? "multiple" : "single");
      } else if (window.screen && typeof window.screen.isExtended === "boolean") {
        setMonitorStatus(window.screen.isExtended ? "multiple" : "single");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMonitorStatus("unsupported");
      }
    } catch {
      setMonitorStatus("unsupported");
    }
  };

  return (
    <div className="panel-content">
      <h2 className="panel-heading">Integrity Guidelines</h2>
      <p className="muted-text">
        Please review these{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowGuidelines(true);
          }}
        >
          Integrity Guidelines
        </a>{" "}
        to ensure compliance and avoid unintended violations. Any suspicious activity may be flagged
        and reported to the hiring team.
      </p>

      <h2 className="panel-subheading">Permissions</h2>
      <p className="muted-text">{permissionsIntro}</p>

      <div className="accordion">
        <AccordionItem
          icon="🎥"
          title={webcamPermission.title}
          status={cameraGranted ? "done" : undefined}
          defaultOpen
        >
          <p className="muted-text">{webcamPermission.description}</p>

          {camera.status !== "granted" && (
            <button
              className="btn btn-primary"
              disabled={camera.status === "requesting"}
              onClick={() => setShowWebcamPreCheck(true)}
            >
              {camera.status === "requesting" ? "Requesting..." : webcamPermission.grantLabel}
            </button>
          )}

          {camera.status === "denied" && <p className="error-text">{camera.error}</p>}

          {camera.status === "granted" && (
            <div className="webcam-preview">
              <video ref={camera.videoRef} autoPlay playsInline muted />
              <span className="status-pill status-pill--success">Camera active</span>
            </div>
          )}
        </AccordionItem>

        <AccordionItem
          icon="🖥️"
          title={monitorPermission.title}
          status={monitorChecked ? "done" : undefined}
        >
          <p className="muted-text">{monitorPermission.description}</p>
          <button
            className="btn btn-primary"
            disabled={monitorStatus === "checking"}
            onClick={checkMonitors}
          >
            {monitorStatus === "checking" ? "Checking..." : monitorPermission.checkLabel}
          </button>

          {monitorStatus === "single" && (
            <p className="success-text">✓ Single monitor detected. You're good to go.</p>
          )}
          {monitorStatus === "multiple" && (
            <p className="error-text">⚠ Multiple monitors detected. Please disconnect additional displays.</p>
          )}
          {monitorStatus === "unsupported" && (
            <p className="muted-text">
              Your browser doesn't support automatic multi-monitor detection — proceeding on trust.
            </p>
          )}
        </AccordionItem>

        <AccordionItem
          icon="⛶"
          title={fullscreenPermission.title}
          status={fullscreen.isFullscreen ? "done" : undefined}
        >
          <p className="muted-text">{fullscreenPermission.description}</p>
          <button className="btn btn-primary" onClick={fullscreen.enter}>
            {fullscreen.isFullscreen ? "Fullscreen active" : fullscreenPermission.enterLabel}
          </button>
          {fullscreen.error && <p className="error-text">{fullscreen.error}</p>}
        </AccordionItem>
      </div>

      {showGuidelines && (
        <Modal title="Integrity Guidelines" onClose={() => setShowGuidelines(false)}>
          <p className="muted-text">{integrityGuidelinesIntro}</p>
          <ul className="guidelines-list">
            {integrityGuidelines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </Modal>
      )}

      {showWebcamPreCheck && (
        <Modal
          title={webcamPermission.modalTitle}
          onClose={() => setShowWebcamPreCheck(false)}
          footer={
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowWebcamPreCheck(false);
                camera.requestAccess();
              }}
            >
              Continue
            </button>
          }
        >
          <ul className="checklist">
            {webcamPermission.modalChecklist.map((line) => (
              <li key={line}>
                <span className="check-icon">✓</span>
                {line}
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}

export function CompletionModal({ onClose }) {
  const { completionTitle, completionMessage } = testConfig;
  return (
    <Modal title={completionTitle} onClose={onClose} footer={<button className="btn btn-primary" onClick={onClose}>Close</button>}>
      <p className="muted-text">{completionMessage}</p>
    </Modal>
  );
}
