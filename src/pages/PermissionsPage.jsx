import { useEffect, useState } from "react";
import AccordionItem from "../components/AccordionItem.jsx";
import Modal from "../components/Modal.jsx";
import VideoPreview from "../components/VideoPreview.jsx";
import {
  WebcamIcon,
  MonitorIcon,
  FullscreenIcon,
  AvoidVirtualBackgroundIcon,
  PrivatePlaceIcon,
  LightSourceIcon,
  FaceVisibleIcon,
} from "../components/icons.jsx";

// modalChecklist's text is config-driven (customizable), but it's always
// these 4 concepts in this order, so the illustrations are matched by index.
const CHECKLIST_ICONS = [AvoidVirtualBackgroundIcon, PrivatePlaceIcon, LightSourceIcon, FaceVisibleIcon];

// Nav buttons (Back/Start Test) live in the page-level footer (see App.jsx),
// since they need to be enabled/disabled based on camera + fullscreen state.
// `camera` and `fullscreen` are the hook instances, lifted up to App so the
// footer button can read them too.
export default function PermissionsPage({ config, camera, fullscreen }) {
  const { integrityGuidelinesIntro, integrityGuidelines, permissionsIntro, webcamPermission, monitorPermission, fullscreenPermission } =
    config;

  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showWebcamPreCheck, setShowWebcamPreCheck] = useState(false);
  // Shown right after the pre-check checklist: a brief "verifying your face
  // is visible" step with the live feed, auto-dismissing once done.
  const [showFaceCheck, setShowFaceCheck] = useState(false);
  const [monitorStatus, setMonitorStatus] = useState("idle"); // idle | checking | single | multiple | unsupported

  // Exclusive accordion: only one of the 3 permission rows is open at a
  // time (0 = webcam, 1 = monitor, 2 = fullscreen, -1 = all collapsed).
  // Starts on webcam; auto-advances to the next row as each one completes.
  const [openIndex, setOpenIndex] = useState(0);
  const toggleRow = (index) => setOpenIndex((prev) => (prev === index ? -1 : index));

  const monitorChecked = monitorStatus !== "idle" && monitorStatus !== "checking";
  const cameraGranted = camera.status === "granted";
  const fullscreenActive = fullscreen.isFullscreen;

  // Once the camera is actually granted (and the face-check modal is up),
  // hold it open for exactly 2s so the user can see the "checking" state,
  // then close it on its own — no button needed.
  useEffect(() => {
    if (!showFaceCheck || !cameraGranted) return;
    const timer = setTimeout(() => setShowFaceCheck(false), 2000);
    return () => clearTimeout(timer);
  }, [showFaceCheck, cameraGranted]);

  // If the browser permission prompt gets denied while this is up, don't
  // leave it hanging open forever.
  useEffect(() => {
    if (camera.status === "denied") setShowFaceCheck(false);
  }, [camera.status]);

  // Auto-advance: webcam done -> open monitor; monitor done -> open
  // fullscreen; fullscreen done -> collapse everything (nothing left).
  useEffect(() => {
    if (cameraGranted) setOpenIndex(1);
  }, [cameraGranted]);

  useEffect(() => {
    if (monitorChecked) setOpenIndex(2);
  }, [monitorChecked]);

  useEffect(() => {
    if (fullscreenActive) setOpenIndex(-1);
  }, [fullscreenActive]);

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
          icon={<WebcamIcon />}
          title={webcamPermission.title}
          status={cameraGranted ? "done" : undefined}
          open={openIndex === 0}
          onToggle={() => toggleRow(0)}
        >
          <p className="muted-text">{webcamPermission.description}</p>

          {/* Stays visible (disabled) once granted, rather than disappearing —
              a standing confirmation, not a one-shot action button. */}
          <button
            className="btn btn-primary"
            disabled={camera.status === "requesting" || cameraGranted}
            onClick={() => setShowWebcamPreCheck(true)}
          >
            {camera.status === "requesting" ? "Requesting..." : webcamPermission.grantLabel}
          </button>

          {camera.status === "denied" && <p className="error-text">{camera.error}</p>}
        </AccordionItem>

        <AccordionItem
          icon={<MonitorIcon />}
          title={monitorPermission.title}
          status={monitorChecked ? "done" : undefined}
          open={openIndex === 1}
          onToggle={() => toggleRow(1)}
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
          icon={<FullscreenIcon />}
          title={fullscreenPermission.title}
          status={fullscreenActive ? "done" : undefined}
          open={openIndex === 2}
          onToggle={() => toggleRow(2)}
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
                setShowFaceCheck(true);
                camera.requestAccess();
              }}
            >
              Continue
            </button>
          }
        >
          <ul className="checklist">
            {webcamPermission.modalChecklist.map((line, i) => {
              const Icon = CHECKLIST_ICONS[i];
              return (
                <li key={line}>
                  {Icon && (
                    <span className="checklist-illustration">
                      <Icon />
                    </span>
                  )}
                  <span className="checklist-label">
                    <span className="check-icon">✓</span>
                    {line}
                  </span>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}

      {showFaceCheck && (
        <Modal
          title="Please make sure your face is visible in the webcam"
          onClose={() => setShowFaceCheck(false)}
          footer={
            <button className="btn btn-primary" disabled>
              Checking...
            </button>
          }
        >
          <div className="face-check-preview">
            <VideoPreview stream={camera.stream} />
          </div>
        </Modal>
      )}
    </div>
  );
}
