import { useEffect, useMemo, useRef, useState } from "react";
import defaultConfig from "./config/testConfig.js";
import Sidebar from "./components/Sidebar.jsx";
import StepDots from "./components/StepDots.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import SetupPage from "./pages/SetupPage.jsx";
import InstructionsPage from "./pages/InstructionsPage.jsx";
import DetailsFormPage from "./pages/DetailsFormPage.jsx";
import PermissionsPage, { CompletionModal } from "./pages/PermissionsPage.jsx";
import PhotoCapturePage from "./pages/PhotoCapturePage.jsx";
import TestDashboardPage from "./pages/TestDashboardPage.jsx";
import useCamera from "./hooks/useCamera.js";
import useFullscreen from "./hooks/useFullscreen.js";
import { isDetailsFormValid } from "./utils/validators.js";
import { buildConfigFromSetup } from "./utils/buildConfigFromSetup.js";

const STEPS = ["instructions", "details", "permissions"];

const initialFormData = {
  fullName: "",
  workExperience: "",
  agreeIntegrity: false,
  agreeTos: false,
};

export default function App() {
  // In-memory only, deliberately — no localStorage. Setup is a one-time
  // step per page load: once submitted there's no in-app way back to it,
  // and the only way to redo it is a real browser refresh (which remounts
  // this component from scratch and resets setupFields to null again).
  // stage flow: setup -> onboarding (3 steps) -> photoCapture -> testDashboard
  const [setupFields, setSetupFields] = useState(null);
  const [stage, setStage] = useState("setup");

  const [stepIndex, setStepIndex] = useState(0);
  // Tracks which way we just navigated so the incoming step's slide
  // direction matches: Continue slides in from the right, Back from the left.
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [theme, setTheme] = useState("dark");
  const [showCompletion, setShowCompletion] = useState(false);
  const scrollRef = useRef(null);

  // Lifted up (rather than living inside PermissionsPage) so the page-level
  // footer's "Start Test" button — and later PhotoCapturePage — can read
  // camera/fullscreen state too.
  const camera = useCamera();
  const fullscreen = useFullscreen();

  const config = useMemo(
    () => (setupFields ? buildConfigFromSetup(setupFields) : defaultConfig),
    [setupFields]
  );

  const handleSetupComplete = (fields) => {
    setSetupFields(fields);
    setStepIndex(0);
    setDirection(1);
    setStage("onboarding");
  };

  const goTo = (index) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, index));
    setDirection(clamped >= stepIndex ? 1 : -1);
    setStepIndex(clamped);
  };

  // Each step change should land scrolled to the top, not wherever the
  // previous step's scroll position happened to be.
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [stepIndex]);

  const restartDemo = () => {
    setShowCompletion(false);
    setFormData(initialFormData);
    setDirection(-1);
    setStepIndex(0);
    setStage("onboarding");
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const canContinueDetails = isDetailsFormValid(formData);
  const canStartTest = camera.status === "granted" && fullscreen.isFullscreen;

  if (stage === "setup") {
    return (
      <div className={`app app--${theme}`} data-theme={theme}>
        <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
        <SetupPage onComplete={handleSetupComplete} />
      </div>
    );
  }

  if (stage === "photoCapture") {
    return (
      <div className={`app app--${theme}`} data-theme={theme}>
        <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
        <PhotoCapturePage camera={camera} onComplete={() => setStage("testDashboard")} />
      </div>
    );
  }

  if (stage === "testDashboard") {
    return (
      <div className={`app app--${theme}`} data-theme={theme}>
        <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
        <TestDashboardPage config={config} onSubmit={() => setShowCompletion(true)} />
        {showCompletion && <CompletionModal config={config} onClose={restartDemo} />}
      </div>
    );
  }

  return (
    <div className={`app app--${theme}`} data-theme={theme}>
      <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />

      <div className="app-shell">
        <Sidebar config={config} />

        <div className="content-column">
          <main className="panel">
            <div className="panel-scroll" ref={scrollRef}>
              {/* key={stepIndex} forces a remount on every step change, which
                  restarts the CSS slide-in animation from scratch each time. */}
              <div
                key={stepIndex}
                className={direction === 1 ? "step-slide-right" : "step-slide-left"}
              >
                {STEPS[stepIndex] === "instructions" && <InstructionsPage config={config} />}
                {STEPS[stepIndex] === "details" && (
                  <DetailsFormPage config={config} formData={formData} setFormData={setFormData} />
                )}
                {STEPS[stepIndex] === "permissions" && (
                  <PermissionsPage config={config} camera={camera} fullscreen={fullscreen} />
                )}
              </div>
            </div>
          </main>

          <div className="content-footer">
            <StepDots total={STEPS.length} current={stepIndex} />

            <div className="nav-buttons">
              {stepIndex > 0 && (
                <button className="btn btn-outline" onClick={() => goTo(stepIndex - 1)}>
                  {config.backLabel}
                </button>
              )}

              {stepIndex === 0 && (
                <button className="btn btn-primary" onClick={() => goTo(1)}>
                  {config.continueLabel}
                </button>
              )}

              {stepIndex === 1 && (
                <button className="btn btn-primary" disabled={!canContinueDetails} onClick={() => goTo(2)}>
                  {config.continueLabel}
                </button>
              )}

              {stepIndex === 2 && (
                <button
                  className="btn btn-primary"
                  disabled={!canStartTest}
                  onClick={() => setStage("photoCapture")}
                >
                  {config.startTestLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
