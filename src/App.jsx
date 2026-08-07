import { useState } from "react";
import testConfig from "./config/testConfig.js";
import Sidebar from "./components/Sidebar.jsx";
import StepDots from "./components/StepDots.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import InstructionsPage from "./pages/InstructionsPage.jsx";
import DetailsFormPage from "./pages/DetailsFormPage.jsx";
import PermissionsPage, { CompletionModal } from "./pages/PermissionsPage.jsx";
import useCamera from "./hooks/useCamera.js";
import useFullscreen from "./hooks/useFullscreen.js";
import { isDetailsFormValid } from "./utils/validators.js";

const STEPS = ["instructions", "details", "permissions"];

const initialFormData = {
  fullName: "",
  workExperience: "",
  agreeIntegrity: false,
  agreeTos: false,
};

export default function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [theme, setTheme] = useState("dark");
  const [showCompletion, setShowCompletion] = useState(false);

  // Lifted up (rather than living inside PermissionsPage) so the page-level
  // footer's "Start Test" button can read their status too.
  const camera = useCamera();
  const fullscreen = useFullscreen();

  const goTo = (index) => setStepIndex(Math.max(0, Math.min(STEPS.length - 1, index)));

  const restartDemo = () => {
    setShowCompletion(false);
    setFormData(initialFormData);
    setStepIndex(0);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const canContinueDetails = isDetailsFormValid(formData);
  const canStartTest = camera.status === "granted" && fullscreen.isFullscreen;

  return (
    <div className={`app app--${theme}`} data-theme={theme}>
      <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />

      <div className="app-shell">
        <Sidebar />

        <div className="content-column">
          <main className="panel">
            <div className="panel-scroll">
              {STEPS[stepIndex] === "instructions" && <InstructionsPage />}
              {STEPS[stepIndex] === "details" && (
                <DetailsFormPage formData={formData} setFormData={setFormData} />
              )}
              {STEPS[stepIndex] === "permissions" && (
                <PermissionsPage camera={camera} fullscreen={fullscreen} />
              )}
            </div>
          </main>

          <div className="content-footer">
            <StepDots total={STEPS.length} current={stepIndex} />

            <div className="nav-buttons">
              {stepIndex > 0 && (
                <button className="btn btn-outline" onClick={() => goTo(stepIndex - 1)}>
                  {testConfig.backLabel}
                </button>
              )}

              {stepIndex === 0 && (
                <button className="btn btn-primary" onClick={() => goTo(1)}>
                  {testConfig.continueLabel}
                </button>
              )}

              {stepIndex === 1 && (
                <button className="btn btn-primary" disabled={!canContinueDetails} onClick={() => goTo(2)}>
                  {testConfig.continueLabel}
                </button>
              )}

              {stepIndex === 2 && (
                <button
                  className="btn btn-primary"
                  disabled={!canStartTest}
                  onClick={() => setShowCompletion(true)}
                >
                  {testConfig.startTestLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCompletion && <CompletionModal onClose={restartDemo} />}
    </div>
  );
}
